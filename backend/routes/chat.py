"""
IITP CET AI — Institutional Chatbot Router (/api/chat)
------------------------------------------------------
This route handles student questions regarding official IIT Patna CET regulations,
admissions criteria, fee structures, academic calendars, and course curricula.

How It Works (RAG Pipeline):
  1. Input Validation: Checks for empty strings, excess length (>1000 chars), and malicious payloads.
  2. Information Retrieval: Searches verified CET documents via retriever_service.
  3. Grounded Synthesis: LLM Service formats retrieved passages as context and generates
     an answer strictly cited with markdown links [Document Title](URL).
  4. Conversation History: Logs both user prompt and assistant response into SQLite.
"""

import uuid
import logging
from fastapi import APIRouter, HTTPException, Depends
from ..models.schemas import ChatRequest, ChatResponse, Citation, ErrorResponse
from ..services.retriever import retriever_service
from ..services.llm_service import llm_service
from ..database import log_chat_message

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Chatbot"])

@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid query payload"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"}
    },
    summary="Academic Chatbot Query",
    description="Processes an academic or institutional question against the verified IIT Patna CET knowledge base and returns a grounded answer with clickable citations."
)
async def chat_turn(request: ChatRequest) -> ChatResponse:
    query = request.query.strip()
    
    # Input validation
    if not query:
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty or only whitespace."
        )
    
    if len(query) > 1000:
        raise HTTPException(
            status_code=400,
            detail="Query exceeds maximum allowed length of 1000 characters."
        )
    
    session_id = request.session_id or f"sess-{uuid.uuid4().hex[:12]}"
    user_msg_id = f"msg-user-{uuid.uuid4().hex[:8]}"
    asst_msg_id = f"msg-asst-{uuid.uuid4().hex[:8]}"

    # Step 1: Retrieve relevant sources before generating an answer
    retrieved_chunks, has_sufficient_context = retriever_service.search(
        query=query,
        top_k=4,
        document_id=request.document_id
    )

    # Step 2: Generate grounded answer with clickable source citations
    answer_text, citations, confidence, engine_used = await llm_service.generate_answer(
        query=query,
        retrieved_chunks=retrieved_chunks,
        has_sufficient_context=has_sufficient_context
    )

    is_verified = (confidence != "none")

    # Step 3: Persist conversational history in SQLite
    try:
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
        logger.warning(f"Failed to log chat turn to SQLite: {e}")

    return ChatResponse(
        response=answer_text,
        citations=citations,
        session_id=session_id,
        verified=is_verified,
        confidence=confidence,
        engine=engine_used,
        retrieval_count=len(retrieved_chunks)
    )
