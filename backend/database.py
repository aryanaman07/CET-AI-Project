"""
IITP CET AI — Database Layer (SQLite)
--------------------------------------
This module manages all persistent storage for the IITP CET AI application.
It provides SQLite helpers for:
  1. Notebooks        - Isolated study workspaces.
  2. Documents        - PDF metadata (file paths, page count, character count).
  3. Document Pages   - Full page text used for in-browser PDF reading and citation jumping.
  4. Document Chunks  - Segmented text chunks indexed in FAISS for RAG retrieval.
  5. Chat Messages    - Conversational history with citations and verification status.
  6. Study Artifacts  - Cached AI study tools (summaries, quizzes, flashcards, study guides).

Why SQLite?
  SQLite runs serverless in-process, requiring zero external database setup, making
  it fast, reliable, lightweight, and completely reproducible on any student laptop.
"""

import os
import logging
import sqlite3
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from .config import settings

logger = logging.getLogger(__name__)

def get_db_connection() -> sqlite3.Connection:
    """
    Creates and returns a connection to the SQLite database.
    Configured with 30-second busy timeout and WAL mode support to prevent
    'database is locked' concurrency errors.
    """
    conn = sqlite3.connect(settings.DATABASE_FILE, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA busy_timeout = 30000;")
    return conn

def init_db():
    """Initializes tables in the SQLite database matching ARCHITECTURE.md."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Enable WAL mode for high concurrency (readers do not block writers)
    cursor.execute("PRAGMA journal_mode = WAL;")
    cursor.execute("PRAGMA synchronous = NORMAL;")
    cursor.execute("PRAGMA busy_timeout = 30000;")
    
    # Notebooks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notebooks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        program_tag TEXT DEFAULT 'General',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Documents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        notebook_id TEXT NULL,
        title TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        page_count INTEGER NOT NULL,
        char_count INTEGER DEFAULT 0,
        is_institutional BOOLEAN DEFAULT 0,
        is_scanned BOOLEAN DEFAULT 0,
        source_url TEXT NULL,
        retrieval_date TEXT NULL,
        file_size_bytes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Run lightweight column migrations if documents table existed from earlier versions
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN notebook_id TEXT NULL;")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN char_count INTEGER DEFAULT 0;")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN is_scanned BOOLEAN DEFAULT 0;")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN file_size_bytes INTEGER DEFAULT 0;")
    except Exception:
        pass

    # Document Pages table for in-browser PDF reader
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_pages (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
    """)

    # Document Chunks table for RAG retrieval
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_chunks (
        id TEXT PRIMARY KEY,
        notebook_id TEXT NOT NULL,
        document_id TEXT NOT NULL,
        document_title TEXT NOT NULL,
        filename TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        chunk_index INTEGER NOT NULL,
        text TEXT NOT NULL,
        char_count INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
    """)
    
    # Indexes for fast lookup
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chunks_notebook ON document_chunks(notebook_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chunks_doc ON document_chunks(document_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pages_doc ON document_pages(document_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_docs_notebook ON documents(notebook_id);")

    # Chat sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        notebook_id TEXT NULL,
        document_id TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    try:
        cursor.execute("ALTER TABLE chat_sessions ADD COLUMN notebook_id TEXT NULL;")
    except Exception:
        pass
    
    # Chat messages
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        citations_json TEXT NULL,
        verified BOOLEAN DEFAULT 1,
        engine TEXT DEFAULT 'verified-grounded',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    );
    """)
    
    # Study artifacts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS study_artifacts (
        id TEXT PRIMARY KEY,
        notebook_id TEXT NULL,
        document_id TEXT NULL,
        artifact_type TEXT NOT NULL,
        content_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    try:
        cursor.execute("ALTER TABLE study_artifacts ADD COLUMN notebook_id TEXT NULL;")
    except Exception:
        pass
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_artifacts_nb ON study_artifacts(notebook_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_artifacts_doc ON study_artifacts(document_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_artifacts_type ON study_artifacts(artifact_type);")

    conn.commit()
    conn.close()

def log_chat_message(
    message_id: str,
    session_id: str,
    sender: str,
    content: str,
    citations: Optional[List[Dict[str, Any]]] = None,
    verified: bool = True,
    engine: str = "grounded"
):
    """Logs a user or assistant chat message to the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Ensure session exists
    cursor.execute("INSERT OR IGNORE INTO chat_sessions (id) VALUES (?)", (session_id,))
    
    citations_json = json.dumps(citations, ensure_ascii=False) if citations else None
    cursor.execute("""
        INSERT INTO chat_messages (id, session_id, sender, content, citations_json, verified, engine)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (message_id, session_id, sender, content, citations_json, 1 if verified else 0, engine))
    
    conn.commit()
    conn.close()

def get_session_messages(session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves previous chat messages for a given session."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, session_id, sender, content, citations_json, verified, engine, created_at
        FROM chat_messages
        WHERE session_id = ?
        ORDER BY created_at ASC
        LIMIT ?
    """, (session_id, limit))
    rows = cursor.fetchall()
    conn.close()
    
    messages = []
    for row in rows:
        citations = json.loads(row["citations_json"]) if row["citations_json"] else []
        messages.append({
            "id": row["id"],
            "session_id": row["session_id"],
            "sender": row["sender"],
            "content": row["content"],
            "citations": citations,
            "verified": bool(row["verified"]),
            "engine": row["engine"],
            "created_at": row["created_at"]
        })
    return messages

# Notebook Database Helpers
def create_or_update_notebook(
    notebook_id: str,
    title: str,
    description: str = "",
    program_tag: str = "General"
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO notebooks (id, title, description, program_tag, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            program_tag = excluded.program_tag,
            updated_at = CURRENT_TIMESTAMP
    """, (notebook_id, title, description, program_tag))
    conn.commit()
    conn.close()
    return get_notebook(notebook_id)

def get_notebook(notebook_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, description, program_tag, created_at, updated_at FROM notebooks WHERE id = ?", (notebook_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

def list_notebooks() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT n.id, n.title, n.description, n.program_tag, n.created_at, n.updated_at,
               COUNT(d.id) as document_count
        FROM notebooks n
        LEFT JOIN documents d ON d.notebook_id = n.id
        GROUP BY n.id
        ORDER BY n.updated_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def safely_delete_physical_file(file_path: Optional[str], excluding_doc_id: Optional[str] = None):
    """Safely unlinks physical PDF file from disk if not referenced by any other document record."""
    if not file_path:
        return
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        if excluding_doc_id:
            cursor.execute("SELECT COUNT(*) FROM documents WHERE file_path = ? AND id != ?", (file_path, excluding_doc_id))
        else:
            cursor.execute("SELECT COUNT(*) FROM documents WHERE file_path = ?", (file_path,))
        count = cursor.fetchone()[0]
        conn.close()

        if count == 0 and os.path.isfile(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up physical PDF file: {file_path}")
    except OSError as e:
        logger.warning(f"Error removing physical file {file_path}: {e}")

def delete_notebook_db(notebook_id: str) -> List[str]:
    """Purges all notebook data, returning list of removed file paths for cleanup."""
    docs = get_notebook_documents(notebook_id)
    file_paths = [d.get("file_path") for d in docs if d.get("file_path")]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM document_chunks WHERE notebook_id = ?", (notebook_id,))
    cursor.execute("""
        DELETE FROM document_pages WHERE document_id IN (
            SELECT id FROM documents WHERE notebook_id = ?
        )
    """, (notebook_id,))
    cursor.execute("DELETE FROM documents WHERE notebook_id = ?", (notebook_id,))
    cursor.execute("DELETE FROM notebooks WHERE id = ?", (notebook_id,))
    try:
        cursor.execute("DELETE FROM study_artifacts WHERE notebook_id = ?", (notebook_id,))
    except Exception:
        pass
    conn.commit()
    conn.close()

    for fp in file_paths:
        safely_delete_physical_file(fp)

    return file_paths

# Document Database Helpers
def insert_document(
    doc_id: str,
    notebook_id: str,
    title: str,
    filename: str,
    file_path: str,
    page_count: int,
    char_count: int = 0,
    is_scanned: bool = False,
    file_size_bytes: int = 0
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO documents (id, notebook_id, title, filename, file_path, page_count, char_count, is_scanned, file_size_bytes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (doc_id, notebook_id, title, filename, file_path, page_count, char_count, 1 if is_scanned else 0, file_size_bytes))
    conn.commit()
    conn.close()
    return get_document(doc_id)

def get_document(doc_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_notebook_documents(notebook_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, notebook_id, title, filename, file_path, page_count, char_count, is_scanned, file_size_bytes, created_at
        FROM documents
        WHERE notebook_id = ?
        ORDER BY created_at ASC
    """, (notebook_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_document_db(notebook_id: str, doc_id: str) -> Optional[str]:
    """
    Deletes a single document, its associated page reader entries, its RAG chunks,
    and removes the physical PDF file from disk if no other document references it.
    Returns the physical file path that was removed (or None).
    """
    doc = get_document(doc_id)
    file_path = doc.get("file_path") if doc else None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM document_chunks WHERE notebook_id = ? AND document_id = ?", (notebook_id, doc_id))
    cursor.execute("DELETE FROM document_pages WHERE document_id = ?", (doc_id,))
    cursor.execute("DELETE FROM documents WHERE notebook_id = ? AND id = ?", (notebook_id, doc_id))
    conn.commit()
    conn.close()

    if file_path:
        safely_delete_physical_file(file_path, excluding_doc_id=doc_id)

    return file_path

# Pages Database Helpers
def insert_document_pages(pages: List[Dict[str, Any]]):
    if not pages:
        return
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.executemany("""
        INSERT INTO document_pages (id, document_id, page_number, title, content)
        VALUES (?, ?, ?, ?, ?)
    """, [(p["id"], p["document_id"], p["page_number"], p["title"], p["content"]) for p in pages])
    conn.commit()
    conn.close()

def get_document_pages(doc_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, document_id, page_number, title, content
        FROM document_pages
        WHERE document_id = ?
        ORDER BY page_number ASC
    """, (doc_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Chunks Database Helpers
def insert_document_chunks(chunks: List[Dict[str, Any]]):
    if not chunks:
        return
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.executemany("""
        INSERT INTO document_chunks (id, notebook_id, document_id, document_title, filename, page_number, chunk_index, text, char_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, [(c["chunk_id"], c["notebook_id"], c["document_id"], c["document_title"], c["filename"], c["page_number"], c["chunk_index"], c["text"], len(c["text"])) for c in chunks])
    conn.commit()
    conn.close()

def get_notebook_chunks(notebook_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, notebook_id, document_id, document_title, filename, page_number, chunk_index, text, char_count
        FROM document_chunks
        WHERE notebook_id = ?
        ORDER BY document_id, page_number, chunk_index ASC
    """, (notebook_id,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "chunk_id": r["id"],
            "notebook_id": r["notebook_id"],
            "document_id": r["document_id"],
            "document_title": r["document_title"],
            "filename": r["filename"],
            "page_number": r["page_number"],
            "chunk_index": r["chunk_index"],
            "text": r["text"],
            "char_count": r["char_count"]
        }
        for r in rows
    ]

# Study Artifacts Database Helpers
def save_study_artifact(
    artifact_id: str,
    notebook_id: str,
    document_id: Optional[str],
    artifact_type: str,
    content_json: str
) -> Dict[str, Any]:
    """Persists or updates a study artifact (summary, quiz, flashcards, study_guide)."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO study_artifacts (id, notebook_id, document_id, artifact_type, content_json, created_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                content_json = excluded.content_json,
                document_id = excluded.document_id,
                created_at = CURRENT_TIMESTAMP
        """, (artifact_id, notebook_id, document_id, artifact_type, content_json))
        conn.commit()
    finally:
        conn.close()

    return {
        "id": artifact_id,
        "notebook_id": notebook_id,
        "document_id": document_id,
        "artifact_type": artifact_type,
        "content_json": content_json
    }

def get_study_artifacts(notebook_id: str, artifact_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves all study artifacts for a notebook, optionally filtered by artifact type."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if artifact_type:
        cursor.execute("""
            SELECT id, notebook_id, document_id, artifact_type, content_json, created_at
            FROM study_artifacts
            WHERE notebook_id = ? AND artifact_type = ?
            ORDER BY created_at DESC
        """, (notebook_id, artifact_type))
    else:
        cursor.execute("""
            SELECT id, notebook_id, document_id, artifact_type, content_json, created_at
            FROM study_artifacts
            WHERE notebook_id = ?
            ORDER BY created_at DESC
        """, (notebook_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_latest_study_artifact(
    notebook_id: str, 
    artifact_type: str, 
    document_id: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Retrieves the most recent study artifact for a notebook and type."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if document_id:
        cursor.execute("""
            SELECT id, notebook_id, document_id, artifact_type, content_json, created_at
            FROM study_artifacts
            WHERE notebook_id = ? AND artifact_type = ? AND document_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (notebook_id, artifact_type, document_id))
    else:
        cursor.execute("""
            SELECT id, notebook_id, document_id, artifact_type, content_json, created_at
            FROM study_artifacts
            WHERE notebook_id = ? AND artifact_type = ?
            ORDER BY created_at DESC
            LIMIT 1
        """, (notebook_id, artifact_type))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_study_artifact(artifact_id: str):
    """Deletes a study artifact by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM study_artifacts WHERE id = ?", (artifact_id,))
    conn.commit()
    conn.close()

