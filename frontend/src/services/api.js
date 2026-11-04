/**
 * IITP CET AI — Frontend API Client (services/api.js)
 * ---------------------------------------------------
 * This module connects the React frontend to the FastAPI backend (/api routes).
 *
 * Core Subsystems Covered:
 *   1. Institutional Chatbot (/api/chat): Sends student questions about CET policies to verified RAG backend.
 *   2. Notebook Lifecycle (/api/notebooks): Fetches, creates, renames, and deletes notebooks.
 *   3. Document Ingestion (/api/notebooks/{id}/documents):
 *      - Uploads multipart PDF files for PyMuPDF extraction and FAISS vector indexing.
 *      - Fetches extracted pages for in-app reading.
 *   4. Grounded Document QA (/api/notebooks/{id}/chat): Sends student questions grounded in notebook PDFs.
 *   5. AI Study Tools (/api/notebooks/{id}/study/*):
 *      - Summaries, diagnostic quizzes, 3D flashcards, and exam study guides.
 *   6. Artifact Persistence (/api/notebooks/{id}/artifacts): Saves generated study materials to SQLite.
 *   7. Offline Fallback: If backend is temporarily offline, provides verified local responses.
 */

import { CET_KNOWLEDGE_QA, CET_INSTITUTION_INFO } from '../data/cetData';

// Relative path uses Vite proxy; fallback to direct port 8000
const API_BASE_URL = '/api';

/**
 * Sends a query to the CET AI Chatbot backend.
 * @param {string} query The student or applicant question
 * @param {string} sessionId Active session ID
 * @param {string} documentId Optional specific document context
 * @returns {Promise<{text: string, citations: Array, verified: boolean, engine: string}>}
 */
export async function sendChatMessage(query, sessionId = null, documentId = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        session_id: sessionId,
        document_id: documentId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        text: data.response,
        citations: data.citations || [],
        verified: data.verified,
        confidence: data.confidence,
        engine: data.engine,
        sessionId: data.session_id,
        retrievalCount: data.retrieval_count,
        disclaimer: data.disclaimer
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      const errorMsg = errData.detail || `Server returned status ${res.status}`;
      return {
        success: false,
        error: errorMsg,
        ...localFallback(query)
      };
    }
  } catch (err) {
    console.warn("Backend API unreachable, using local fallback dataset:", err);
    return {
      success: false,
      isOfflineFallback: true,
      ...localFallback(query)
    };
  }
}

/**
 * Checks backend health status and active LLM configuration.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
    return { status: 'offline' };
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

/**
 * Fetches the indexed verified documents catalog.
 */
export async function fetchKnowledgeCatalog() {
  try {
    const res = await fetch(`${API_BASE_URL}/knowledge`);
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    console.warn("Could not fetch knowledge catalog:", err);
    return null;
  }
}

/**
 * Offline fallback generator using embedded verified knowledge dataset.
 */
function localFallback(query) {
  const qLower = query.toLowerCase();
  const matched = CET_KNOWLEDGE_QA.find(item => 
    item.keywords.some(k => qLower.includes(k))
  );

  if (matched) {
    return {
      text: matched.answer,
      citations: matched.citations.map(c => ({
        doc_title: c.docName,
        source_url: 'https://cet.iitp.ac.in/',
        page: c.page,
        label: c.label,
        retrieval_date: '2026-10-15'
      })),
      verified: true,
      engine: 'local-offline-dataset'
    };
  }

  return {
    text: `Based on verified public records at the **IIT Patna Centre for Educational Technology**:\n\nRegarding "${query}", please consult the official CET portal at [cet.iitp.ac.in](${CET_INSTITUTION_INFO.portalUrl}) or contact the office at \`${CET_INSTITUTION_INFO.email}\`.\n\n*Disclaimer: CET AI is an independent academic prototype and is not officially endorsed by IIT Patna.*`,
    citations: [
      {
        doc_title: "IIT Patna CET Portal",
        source_url: "https://cet.iitp.ac.in/",
        page: 1,
        label: "Official CET Portal",
        retrieval_date: "2026-10-15"
      }
    ],
    verified: false,
    engine: 'local-offline-dataset'
  };
}

/**
 * Uploads a PDF document to a notebook for PyMuPDF extraction & FAISS vectorization.
 */
export async function uploadNotebookDocument(notebookId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Upload failed with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Fetches all documents attached to a notebook.
 */
export async function fetchNotebookDocuments(notebookId) {
  try {
    const res = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/documents`);
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (err) {
    console.warn("Failed to fetch notebook documents from backend:", err);
    return [];
  }
}

/**
 * Fetches extracted pages for an active document to view in the DocumentPanel.
 */
export async function fetchNotebookDocumentPages(notebookId, documentId) {
  try {
    const res = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/documents/${documentId}/pages`);
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (err) {
    console.warn("Failed to fetch document pages from backend:", err);
    return [];
  }
}

/**
 * Deletes a document from a notebook and rebuilds its vector index.
 */
export async function deleteNotebookDocument(notebookId, documentId) {
  const res = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/documents/${documentId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Delete failed with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Sends a student query grounded in the notebook's uploaded study materials.
 */
export async function sendNotebookChatMessage(notebookId, query, sessionId = null, history = [], documentId = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        session_id: sessionId,
        chat_history: history.map(h => ({ sender: h.sender, text: h.text })),
        document_id: documentId
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        text: data.response,
        citations: data.citations || [],
        verified: data.verified,
        confidence: data.confidence,
        engine: data.engine,
        sessionId: data.session_id,
        retrievalCount: data.retrieval_count,
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.detail || `Server returned error ${res.status}`,
        text: errData.detail || "Error connecting to study copilot."
      };
    }
  } catch (err) {
    console.warn("Backend notebook chat unreachable:", err);
    return {
      success: false,
      error: err.message,
      text: "Unable to contact the backend QA service. Please check your server connection."
    };
  }
}

/**
 * Notebook CRUD
 */
export async function fetchAllNotebooks() {
  try {
    const res = await fetch(`${API_BASE_URL}/notebooks`);
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

export async function createBackendNotebook(title, description = '', programTag = 'General') {
  const res = await fetch(`${API_BASE_URL}/notebooks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, program_tag: programTag }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to create notebook (HTTP ${res.status})`);
  }
  return await res.json();
}

export async function updateBackendNotebookTitle(notebookId, newTitle) {
  try {
    const res = await fetch(`${API_BASE_URL}/notebooks/${notebookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not sync notebook title to backend:", err);
  }
  return null;
}

export async function deleteBackendNotebook(notebookId) {
  try {
    await fetch(`${API_BASE_URL}/notebooks/${notebookId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn("Could not sync notebook deletion to backend:", err);
  }
}

/**
 * Phase 4: AI Study Tools APIs
 */
export async function generateDocumentSummary(notebookId, documentId = null, length = 'medium') {
  const res = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/study/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, length }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Summary generation failed with status ${res.status}`);
  }

  return await res.json();
}

export async function generateDiagnosticQuiz(notebookId, documentId = null, numQuestions = 5) {
  const res = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/study/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, num_questions: numQuestions }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Quiz generation failed with status ${res.status}`);
  }

  return await res.json();
}

export async function generateRevisionFlashcards(notebookId, documentId = null, numCards = 8) {
  const res = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/study/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, num_cards: numCards }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Flashcard generation failed with status ${res.status}`);
  }

  return await res.json();
}

export async function generateComprehensiveStudyGuide(notebookId, documentId = null, targetExam = 'Semester Examination') {
  const res = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/study/guide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, target_exam: targetExam }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Study guide generation failed with status ${res.status}`);
  }

  return await res.json();
}

export async function fetchNotebookArtifacts(notebookId, artifactType = null) {
  try {
    const url = artifactType 
      ? `${API_BASE_URL}/notebooks/${notebookId}/artifacts?artifact_type=${artifactType}`
      : `${API_BASE_URL}/notebooks/${notebookId}/artifacts`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Failed to fetch notebook artifacts:", err);
  }
  return [];
}

export async function saveNotebookArtifact(notebookId, artifactType, content, documentId = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/notebooks/${notebookId}/artifacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artifact_type: artifactType,
        content: content,
        document_id: documentId
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Failed to save artifact to backend:", err);
  }
  return null;
}

