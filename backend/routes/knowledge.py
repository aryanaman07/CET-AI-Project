import logging
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..models.schemas import HealthResponse, KnowledgeListResponse, KnowledgeDocumentSummary
from ..services.knowledge_base import knowledge_base_service
from ..services.llm_service import llm_service
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Institutional Knowledge & Health"])

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="System Health & Diagnostic Check",
    description="Returns operational health status, active LLM backend, total indexed verified documents, and prototype disclaimers."
)
async def health_check() -> HealthResponse:
    doc_count = len(knowledge_base_service.get_all_documents())
    
    if llm_service._gemini_client:
        llm_provider = "Google Gemini"
        llm_status = f"Online ({settings.GEMINI_MODEL})"
    elif settings.GEMINI_API_KEY:
        llm_provider = "Google Gemini"
        llm_status = "Configuration Error / Fallback Active"
    else:
        llm_provider = "Verified Grounded Fallback"
        llm_status = "Active (Zero-Hallucination Deterministic Grounding)"

    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        service=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        llm_provider=llm_provider,
        llm_status=llm_status,
        indexed_documents=doc_count,
        disclaimer=settings.DISCLAIMER
    )

@router.get(
    "/knowledge",
    response_model=KnowledgeListResponse,
    summary="List Indexed Verified Documents",
    description="Returns catalog of public IIT Patna CET documents currently indexed with source URLs and retrieval dates."
)
async def list_knowledge_documents() -> KnowledgeListResponse:
    docs = knowledge_base_service.get_all_documents()
    summaries = []
    
    for d in docs:
        summaries.append(KnowledgeDocumentSummary(
            id=d.get("id"),
            page_title=d.get("page_title"),
            source_url=d.get("source_url"),
            retrieval_date=d.get("retrieval_date"),
            category=d.get("category"),
            summary=d.get("summary", ""),
            chunk_count=len(d.get("chunks", []))
        ))
        
    return KnowledgeListResponse(
        total_documents=len(summaries),
        documents=summaries,
        reference_portal=settings.OFFICIAL_PORTAL,
        last_synced=knowledge_base_service.metadata.get("last_synced", "2026-10-15T09:16:00Z"),
        disclaimer=settings.DISCLAIMER
    )

@router.get(
    "/knowledge/{doc_id}",
    summary="Get Specific Document Details",
    description="Retrieves full content, source URL, and chunks for a specific indexed document."
)
async def get_knowledge_document(doc_id: str) -> Dict[str, Any]:
    doc = knowledge_base_service.get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document with ID '{doc_id}' not found.")
    return doc
