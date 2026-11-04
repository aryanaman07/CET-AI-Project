"""
IITP CET AI — Notebook & Document Processing API Router (/api/notebooks)
-----------------------------------------------------------------------
This router provides the core academic study workspace functionality:
  1. Notebook Management: CRUD operations for student workspaces with program tags.
  2. PDF Document Ingestion:
     - PyMuPDF text extraction preserving page boundaries.
     - Academic text cleanup (stitches broken lines, repairs symbols).
     - Overlapping sliding-window chunk generation (600 chars, 120 overlap).
     - Isolated FAISS vector indexing per notebook.
  3. Grounded Document Q&A:
     - Vector similarity search against only the current notebook's FAISS index.
     - Dual-provider LLM response generation with exact page number citations.
  4. AI Study Tools:
     - Document Summary (Executive summary, concept glossary, formulas).
     - Diagnostic Quizzes (MCQs with distractors, explanations, citations).
     - Active Recall Flashcards (Front cue, back answer, category tag).
     - Exam Study Guides (Units, weightage, competency checklists, problems).
  5. Artifact Caching: Persists generated study materials to SQLite so students
     do not have to regenerate tools every time they switch tabs.
"""

import uuid
import json
import logging
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from ..models.schemas import (
    NotebookCreateRequest,
    NotebookUpdateRequest,
    NotebookResponse,
    DocumentSummary,
    DocumentPageResponse,
    DocumentUploadResponse,
    NotebookChatRequest,
    NotebookChatResponse,
    ErrorResponse,
    GenerateSummaryRequest,
    SummaryResponse,
    GenerateQuizRequest,
    QuizResponse,
    GenerateFlashcardsRequest,
    FlashcardResponse,
    GenerateStudyGuideRequest,
    StudyGuideResponse,
    StudyArtifactResponse,
    SaveStudyArtifactRequest
)
from ..database import (
    create_or_update_notebook,
    get_notebook,
    list_notebooks,
    delete_notebook_db,
    insert_document,
    get_document,
    get_notebook_documents,
    delete_document_db,
    insert_document_pages,
    get_document_pages,
    insert_document_chunks,
    get_notebook_chunks,
    log_chat_message,
    save_study_artifact,
    get_study_artifacts,
    get_latest_study_artifact,
    delete_study_artifact
)
from ..services.document_processor import document_processor, DocumentProcessingError
from ..services.vector_store import vector_store
from ..services.llm_service import llm_service
from ..services.study_tools_service import study_tools_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/notebooks", tags=["Notebook Document Processing & QA"])

@router.get("", response_model=List[NotebookResponse], summary="List all academic notebooks")
async def get_all_notebooks():
    """Returns all active study notebooks along with their uploaded document counts."""
    rows = list_notebooks()
    return [
        NotebookResponse(
            id=r["id"],
            title=r["title"],
            description=r.get("description", "") or "",
            program_tag=r.get("program_tag", "General") or "General",
            created_at=str(r.get("created_at", "")),
            updated_at=str(r.get("updated_at", "")),
            document_count=r.get("document_count", 0)
        )
        for r in rows
    ]

@router.post("", response_model=NotebookResponse, status_code=status.HTTP_201_CREATED, summary="Create a new study notebook")
async def create_notebook(req: NotebookCreateRequest):
    """Creates a new isolated study notebook workspace for course materials."""
    title = req.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Notebook title cannot be empty.")
    
    nb_id = f"nb-{uuid.uuid4().hex[:10]}"
    nb = create_or_update_notebook(
        notebook_id=nb_id,
        title=title,
        description=req.description or "",
        program_tag=req.program_tag or "General"
    )
    return NotebookResponse(
        id=nb["id"],
        title=nb["title"],
        description=nb["description"],
        program_tag=nb["program_tag"],
        created_at=str(nb["created_at"]),
        updated_at=str(nb["updated_at"]),
        document_count=0
    )

@router.get("/{notebook_id}", response_model=NotebookResponse, summary="Get notebook details")
async def get_notebook_by_id(notebook_id: str):
    nb = get_notebook(notebook_id)
    if not nb:
        raise HTTPException(status_code=404, detail=f"Notebook '{notebook_id}' not found.")
    
    docs = get_notebook_documents(notebook_id)
    return NotebookResponse(
        id=nb["id"],
        title=nb["title"],
        description=nb["description"],
        program_tag=nb["program_tag"],
        created_at=str(nb["created_at"]),
        updated_at=str(nb["updated_at"]),
        document_count=len(docs)
    )

@router.patch("/{notebook_id}", response_model=NotebookResponse, summary="Rename or update notebook")
async def update_notebook(notebook_id: str, req: NotebookUpdateRequest):
    nb = get_notebook(notebook_id)
    if not nb:
        raise HTTPException(status_code=404, detail=f"Notebook '{notebook_id}' not found.")
    
    new_title = req.title.strip() if req.title is not None else nb["title"]
    new_desc = req.description if req.description is not None else nb["description"]
    new_tag = req.program_tag if req.program_tag is not None else nb["program_tag"]

    updated = create_or_update_notebook(
        notebook_id=notebook_id,
        title=new_title,
        description=new_desc,
        program_tag=new_tag
    )
    docs = get_notebook_documents(notebook_id)
    return NotebookResponse(
        id=updated["id"],
        title=updated["title"],
        description=updated["description"],
        program_tag=updated["program_tag"],
        created_at=str(updated["created_at"]),
        updated_at=str(updated["updated_at"]),
        document_count=len(docs)
    )

@router.delete("/{notebook_id}", status_code=status.HTTP_200_OK, summary="Delete notebook")
async def delete_notebook(notebook_id: str):
    """Deletes a notebook, all its documents, extracted chunks, and clears its FAISS index."""
    nb = get_notebook(notebook_id)
    if not nb:
        raise HTTPException(status_code=404, detail=f"Notebook '{notebook_id}' not found.")
    
    delete_notebook_db(notebook_id)
    vector_store.rebuild_notebook_index(notebook_id, chunks=[])
    return {"message": f"Notebook '{nb['title']}' and all its isolated indexes were deleted successfully."}

@router.get("/{notebook_id}/documents", response_model=List[DocumentSummary], summary="List documents in notebook")
async def list_documents_in_notebook(notebook_id: str):
    """Lists all uploaded PDF documents associated with this notebook."""
    nb = get_notebook(notebook_id)
    if not nb:
        # Auto-create notebook if accessed via frontend client
        create_or_update_notebook(notebook_id, title=f"Study Session ({notebook_id})")

    docs = get_notebook_documents(notebook_id)
    return [
        DocumentSummary(
            id=d["id"],
            notebook_id=d["notebook_id"],
            title=d["title"],
            filename=d["filename"],
            page_count=d["page_count"],
            char_count=d["char_count"],
            is_scanned=bool(d["is_scanned"]),
            file_size_bytes=d["file_size_bytes"],
            created_at=str(d["created_at"])
        )
        for d in docs
    ]

@router.post(
    "/{notebook_id}/documents/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload PDF to notebook, extract with PyMuPDF, chunk, and index in FAISS"
)
async def upload_document_to_notebook(
    notebook_id: str,
    file: UploadFile = File(...)
):
    """
    Validates PDF format and readability, extracts text page-by-page using PyMuPDF,
    constructs overlapping chunks, stores pages and chunks, and adds them to this
    notebook's isolated FAISS index.
    """
    # Ensure notebook exists
    nb = get_notebook(notebook_id)
    if not nb:
        create_or_update_notebook(notebook_id, title=f"Notebook {notebook_id}")

    # Check filename
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a valid filename.")

    # Check size early
    max_size = document_processor.MAX_FILE_SIZE_BYTES
    file_bytes = await file.read()
    
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")
    if len(file_bytes) > max_size:
        raise HTTPException(status_code=400, detail=f"File exceeds maximum allowed size of {max_size / (1024*1024):.0f} MB.")

    try:
        extracted = document_processor.extract_document(
            file_bytes=file_bytes,
            filename=file.filename,
            notebook_id=notebook_id
        )
    except DocumentProcessingError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        logger.error(f"Unexpected document processing error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process document due to an internal error.")

    doc_id = extracted["document_id"]
    
    # Persist in SQLite
    insert_document(
        doc_id=doc_id,
        notebook_id=notebook_id,
        title=extracted["title"],
        filename=extracted["filename"],
        file_path=extracted["file_path"],
        page_count=extracted["page_count"],
        char_count=extracted["char_count"],
        is_scanned=extracted["is_scanned"],
        file_size_bytes=extracted["file_size_bytes"]
    )

    insert_document_pages(extracted["pages"])
    insert_document_chunks(extracted["chunks"])

    # Index chunks in this notebook's isolated FAISS index
    indexed_count = 0
    if extracted["chunks"]:
        indexed_count = vector_store.add_chunks(notebook_id, extracted["chunks"])

    return DocumentUploadResponse(
        document_id=doc_id,
        notebook_id=notebook_id,
        title=extracted["title"],
        filename=extracted["filename"],
        page_count=extracted["page_count"],
        char_count=extracted["char_count"],
        file_size_bytes=extracted["file_size_bytes"],
        is_scanned=extracted["is_scanned"],
        scan_warning=extracted["scan_warning"],
        chunks_indexed=indexed_count,
        message=f"Successfully extracted {extracted['page_count']} pages and indexed {indexed_count} chunks into FAISS."
    )

@router.delete("/{notebook_id}/documents/{document_id}", summary="Remove document from notebook")
async def delete_document_from_notebook(notebook_id: str, document_id: str):
    """
    Removes a document from the notebook, purges its chunks from the database,
    and rebuilds the notebook's FAISS index so deleted content is immediately unretrievable.
    """
    doc = get_document(document_id)
    if not doc or doc.get("notebook_id") != notebook_id:
        raise HTTPException(status_code=404, detail="Document not found in this notebook.")

    delete_document_db(notebook_id, document_id)
    vector_store.remove_document(notebook_id, document_id)

    return {"message": f"Document '{doc['filename']}' deleted and notebook vector index rebuilt."}

@router.get("/{notebook_id}/documents/{document_id}/pages", response_model=List[DocumentPageResponse], summary="Get document pages")
async def get_document_page_contents(notebook_id: str, document_id: str):
    """Returns page text and titles for in-app document viewing and citation navigation."""
    doc = get_document(document_id)
    if not doc or doc.get("notebook_id") != notebook_id:
        raise HTTPException(status_code=404, detail="Document not found in this notebook.")

    pages = get_document_pages(document_id)
    return [
        DocumentPageResponse(
            id=p["id"],
            document_id=p["document_id"],
            page_number=p["page_number"],
            title=p["title"],
            content=p["content"]
        )
        for p in pages
    ]

@router.post("/{notebook_id}/chat", response_model=NotebookChatResponse, summary="Grounded QA against notebook documents")
async def chat_with_notebook(notebook_id: str, req: NotebookChatRequest):
    """
    Retrieves the most relevant chunks from the notebook's isolated FAISS index,
    sends them to the LLM with defensive prompt boundaries, and returns a strictly grounded
    answer with clickable source citations (document name, page number, snippet).
    """
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    if len(query) > 1000:
        raise HTTPException(status_code=400, detail="Query exceeds maximum allowed length of 1000 characters.")

    nb = get_notebook(notebook_id)
    nb_title = nb["title"] if nb else "Study Workspace"

    target_doc_title = nb_title
    if req.document_id:
        doc_record = get_document(req.document_id)
        if doc_record:
            target_doc_title = doc_record.get("filename") or doc_record.get("title") or nb_title

    session_id = req.session_id or f"sess-nb-{uuid.uuid4().hex[:10]}"

    # 1. Retrieve top-K relevant chunks exclusively from this notebook's FAISS index (filtered to document_id if provided)
    retrieved_chunks, has_sufficient_context = vector_store.search(
        notebook_id=notebook_id,
        query=query,
        top_k=4,
        document_id=req.document_id
    )

    # If vector similarity threshold was missed but document pages exist, feed top pages to LLM
    if not retrieved_chunks and req.document_id:
        doc_pages = get_document_pages(req.document_id)
        if doc_pages:
            for p in doc_pages[:3]:
                retrieved_chunks.append({
                    "chunk_id": f"pg-{p['id']}",
                    "document_id": req.document_id,
                    "filename": target_doc_title,
                    "document_title": target_doc_title,
                    "page_number": p["page_number"],
                    "text": p["content"][:1000],
                    "snippet": p["content"][:200],
                    "score": 0.85,
                    "label": f"{target_doc_title}, Page {p['page_number']}"
                })
            has_sufficient_context = True

    # Convert history models to dicts
    history_dicts = []
    if req.chat_history:
        for turn in req.chat_history:
            history_dicts.append({"sender": turn.sender, "text": turn.text})

    # 2. Synthesize answer with LLM or deterministic fallback
    answer_text, citations, confidence, engine_used = await llm_service.generate_notebook_answer(
        query=query,
        retrieved_chunks=retrieved_chunks,
        has_sufficient_context=has_sufficient_context,
        chat_history=history_dicts,
        notebook_title=target_doc_title
    )

    is_verified = (confidence != "none")

    # 3. Log to SQLite
    try:
        user_msg_id = f"msg-user-{uuid.uuid4().hex[:8]}"
        asst_msg_id = f"msg-asst-{uuid.uuid4().hex[:8]}"
        log_chat_message(
            message_id=user_msg_id,
            session_id=session_id,
            sender="user",
            content=query,
            citations=None,
            verified=True,
            engine="user"
        )
        log_chat_message(
            message_id=asst_msg_id,
            session_id=session_id,
            sender="assistant",
            content=answer_text,
            citations=[c.model_dump() for c in citations],
            verified=is_verified,
            engine=engine_used
        )
    except Exception as e:
        logger.warning(f"Failed to log notebook chat message: {e}")

    return NotebookChatResponse(
        response=answer_text,
        citations=citations,
        session_id=session_id,
        notebook_id=notebook_id,
        verified=is_verified,
        confidence=confidence,
        engine=engine_used,
        retrieval_count=len(retrieved_chunks)
    )

# =========================================================================
# Phase 4: AI Study Tools Endpoints
# =========================================================================

@router.post(
    "/{notebook_id}/study/summary",
    response_model=SummaryResponse,
    summary="Generate AI document summary with concept glossary and key formulas"
)
async def generate_document_summary(notebook_id: str, req: GenerateSummaryRequest):
    """
    Synthesizes a short, medium, or detailed executive summary with key concepts,
    formulas, and takeaways grounded strictly in the notebook's uploaded PDF(s).
    """
    nb = get_notebook(notebook_id)
    if not nb:
        create_or_update_notebook(notebook_id, title=f"Study Session ({notebook_id})")

    return await study_tools_service.generate_summary(
        notebook_id=notebook_id,
        document_id=req.document_id,
        length=req.length
    )

@router.post(
    "/{notebook_id}/study/quiz",
    response_model=QuizResponse,
    summary="Generate diagnostic MCQs from uploaded document text"
)
async def generate_diagnostic_quiz(notebook_id: str, req: GenerateQuizRequest):
    """
    Generates 5, 10, or 15 multiple-choice questions with 4 distinct options,
    one verified correct answer, explanation, and source citations.
    """
    nb = get_notebook(notebook_id)
    if not nb:
        create_or_update_notebook(notebook_id, title=f"Study Session ({notebook_id})")

    return await study_tools_service.generate_quiz(
        notebook_id=notebook_id,
        document_id=req.document_id,
        num_questions=req.num_questions
    )

@router.post(
    "/{notebook_id}/study/flashcards",
    response_model=FlashcardResponse,
    summary="Generate active recall 3D revision flashcards"
)
async def generate_revision_flashcards(notebook_id: str, req: GenerateFlashcardsRequest):
    """
    Generates non-trivial, concept-focused flashcards with front/back cues,
    category tags, and source page citations.
    """
    nb = get_notebook(notebook_id)
    if not nb:
        create_or_update_notebook(notebook_id, title=f"Study Session ({notebook_id})")

    return await study_tools_service.generate_flashcards(
        notebook_id=notebook_id,
        document_id=req.document_id,
        num_cards=req.num_cards
    )

@router.post(
    "/{notebook_id}/study/guide",
    response_model=StudyGuideResponse,
    summary="Generate comprehensive exam study guide"
)
async def generate_comprehensive_study_guide(notebook_id: str, req: GenerateStudyGuideRequest):
    """
    Generates an exam-oriented study guide with modular units, competency checklists,
    weightage targets, and must-solve analytical problems.
    """
    nb = get_notebook(notebook_id)
    if not nb:
        create_or_update_notebook(notebook_id, title=f"Study Session ({notebook_id})")

    return await study_tools_service.generate_study_guide(
        notebook_id=notebook_id,
        document_id=req.document_id,
        target_exam=req.target_exam
    )

@router.get(
    "/{notebook_id}/artifacts",
    response_model=List[StudyArtifactResponse],
    summary="List saved study materials for a notebook"
)
async def list_notebook_artifacts(notebook_id: str, artifact_type: Optional[str] = None):
    """Retrieves previously generated study artifacts (summaries, quizzes, flashcards, guides)."""
    rows = get_study_artifacts(notebook_id, artifact_type)
    results = []
    for r in rows:
        try:
            content_parsed = json.loads(r["content_json"])
        except Exception:
            content_parsed = r["content_json"]
        results.append(StudyArtifactResponse(
            id=r["id"],
            notebook_id=r["notebook_id"],
            document_id=r.get("document_id"),
            artifact_type=r["artifact_type"],
            content=content_parsed,
            created_at=str(r.get("created_at", ""))
        ))
    return results

@router.get(
    "/{notebook_id}/artifacts/{artifact_type}",
    summary="Get the latest saved artifact for a specific tool"
)
async def get_latest_notebook_artifact(
    notebook_id: str, 
    artifact_type: str, 
    document_id: Optional[str] = None
):
    """Returns the latest saved artifact for a given tool type (summary, quiz, flashcards, study_guide)."""
    row = get_latest_study_artifact(notebook_id, artifact_type, document_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"No {artifact_type} artifact found for notebook '{notebook_id}'.")
    
    try:
        content_parsed = json.loads(row["content_json"])
    except Exception:
        content_parsed = row["content_json"]

    return {
        "id": row["id"],
        "notebook_id": row["notebook_id"],
        "document_id": row.get("document_id"),
        "artifact_type": row["artifact_type"],
        "content": content_parsed,
        "created_at": str(row.get("created_at", ""))
    }

@router.post(
    "/{notebook_id}/artifacts",
    response_model=StudyArtifactResponse,
    summary="Manually save or sync a study artifact"
)
async def save_notebook_artifact(notebook_id: str, req: SaveStudyArtifactRequest):
    """Persists a study artifact to the notebook's database records."""
    nb = get_notebook(notebook_id)
    if not nb:
        create_or_update_notebook(notebook_id, title=f"Study Session ({notebook_id})")

    art_id = f"art-{req.artifact_type[:4]}-{uuid.uuid4().hex[:10]}"
    content_str = json.dumps(req.content) if not isinstance(req.content, str) else req.content
    saved = save_study_artifact(
        artifact_id=art_id,
        notebook_id=notebook_id,
        document_id=req.document_id,
        artifact_type=req.artifact_type,
        content_json=content_str
    )
    return StudyArtifactResponse(
        id=saved["id"],
        notebook_id=saved["notebook_id"],
        document_id=saved.get("document_id"),
        artifact_type=saved["artifact_type"],
        content=req.content,
        created_at=str(saved.get("created_at", ""))
    )
