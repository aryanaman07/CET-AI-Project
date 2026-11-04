from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Citation(BaseModel):
    doc_title: str = Field(..., description="Official title of the cited document or web page")
    source_url: str = Field(..., description="Verifiable public URL on cet.iitp.ac.in or official subdomains")
    page: Optional[int] = Field(None, description="Page or section number if applicable")
    retrieval_date: str = Field(..., description="ISO 8601 timestamp of when document was indexed")
    label: str = Field(..., description="User-friendly display label (e.g. 'Eligibility, Page 1')")
    snippet: Optional[str] = Field(None, description="Direct relevant quote from verified source")

class ChatRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="The student or applicant academic query to resolve against CET public records",
        examples=["What are the admission eligibility requirements for BS in CSDA?"]
    )
    session_id: Optional[str] = Field(
        None,
        description="Optional session ID for grouping conversational turns"
    )
    document_id: Optional[str] = Field(
        None,
        description="Optional specific document ID to restrict query scope"
    )

class ChatResponse(BaseModel):
    response: str = Field(..., description="Source-grounded answer or clear statement of missing info")
    citations: List[Citation] = Field(default_factory=list, description="Verifiable clickable citations")
    session_id: str = Field(..., description="Active session ID")
    verified: bool = Field(True, description="True if answer is directly corroborated by indexed CET documents")
    confidence: str = Field("high", description="Confidence tier: 'high', 'medium', or 'none'")
    engine: str = Field("verified-grounded", description="Engine used (e.g., 'gemini-1.5-flash' or 'grounded-fallback')")
    retrieval_count: int = Field(0, description="Number of supporting document passages retrieved")
    disclaimer: str = Field(
        "CET AI is an independent academic companion prototype and is not officially endorsed by IIT Patna.",
        description="Institutional prototype disclaimer"
    )

class KnowledgeDocumentSummary(BaseModel):
    id: str
    page_title: str
    source_url: str
    retrieval_date: str
    category: str
    summary: str
    chunk_count: int

class KnowledgeListResponse(BaseModel):
    total_documents: int
    documents: List[KnowledgeDocumentSummary]
    reference_portal: str
    last_synced: str
    disclaimer: str

class HealthResponse(BaseModel):
    status: str
    version: str
    service: str
    environment: str
    llm_provider: str
    llm_status: str
    indexed_documents: int
    disclaimer: str

class ErrorResponse(BaseModel):
    detail: str
    code: str

# Notebooks and Document QA Schemas
class NotebookCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = Field("", max_length=500)
    program_tag: Optional[str] = Field("General", max_length=50)

class NotebookUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=500)
    program_tag: Optional[str] = Field(None, max_length=50)

class NotebookResponse(BaseModel):
    id: str
    title: str
    description: str
    program_tag: str
    created_at: str
    updated_at: str
    document_count: int = 0

class DocumentSummary(BaseModel):
    id: str
    notebook_id: str
    title: str
    filename: str
    page_count: int
    char_count: int
    is_scanned: bool = False
    file_size_bytes: int = 0
    created_at: str

class DocumentPageResponse(BaseModel):
    id: str
    document_id: str
    page_number: int
    title: str
    content: str

class DocumentUploadResponse(BaseModel):
    document_id: str
    notebook_id: str
    title: str
    filename: str
    page_count: int
    char_count: int
    file_size_bytes: int
    is_scanned: bool
    scan_warning: Optional[str] = None
    chunks_indexed: int
    message: str

class NotebookChatTurn(BaseModel):
    sender: str  # 'user' | 'assistant'
    text: str

class NotebookChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = None
    chat_history: Optional[List[NotebookChatTurn]] = None
    document_id: Optional[str] = None

class NotebookChatResponse(BaseModel):
    response: str
    citations: List[Citation] = Field(default_factory=list)
    session_id: str
    notebook_id: str
    verified: bool
    confidence: str
    engine: str
    retrieval_count: int

# Phase 4: AI Study Tools Schemas
class KeyConcept(BaseModel):
    term: str
    definition: str
    page: Optional[int] = None

class CoreFormula(BaseModel):
    title: str
    formula: str

class GenerateSummaryRequest(BaseModel):
    document_id: Optional[str] = None
    length: str = Field("medium", description="Summary detail level: 'short', 'medium', or 'detailed'")

class SummaryResponse(BaseModel):
    executiveSummary: str
    keyConcepts: List[KeyConcept] = Field(default_factory=list)
    coreFormulas: List[CoreFormula] = Field(default_factory=list)
    examTakeaways: List[str] = Field(default_factory=list)
    documentTitle: Optional[str] = None
    documentId: Optional[str] = None
    length: str = "medium"
    engine: str = "grounded"
    pageCount: int = 0

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correctAnswer: int = Field(..., ge=0, le=3)
    explanation: str
    sourceCitation: str

class GenerateQuizRequest(BaseModel):
    document_id: Optional[str] = None
    num_questions: int = Field(5, ge=1, le=20)

class QuizResponse(BaseModel):
    quizzes: List[QuizQuestion]
    notebook_id: str
    document_id: Optional[str] = None
    documentTitle: Optional[str] = None
    engine: str = "grounded"
    totalQuestions: int

class FlashcardItem(BaseModel):
    id: str
    category: str
    front: str
    back: str
    source: str
    isMastered: bool = False

class GenerateFlashcardsRequest(BaseModel):
    document_id: Optional[str] = None
    num_cards: int = Field(8, ge=3, le=25)

class FlashcardResponse(BaseModel):
    flashcards: List[FlashcardItem]
    notebook_id: str
    document_id: Optional[str] = None
    documentTitle: Optional[str] = None
    engine: str = "grounded"
    totalCards: int

class StudyGuideUnit(BaseModel):
    unitNumber: int
    unitName: str
    weightage: str
    topics: List[str]
    mustSolveProblems: List[str] = Field(default_factory=list)
    sourceCitation: Optional[str] = None

class GenerateStudyGuideRequest(BaseModel):
    document_id: Optional[str] = None
    target_exam: Optional[str] = "Semester Examination / Capstone Defense"

class StudyGuideResponse(BaseModel):
    title: str
    targetExam: str
    overview: str
    units: List[StudyGuideUnit]
    notebook_id: str
    document_id: Optional[str] = None
    engine: str = "grounded"

class StudyArtifactResponse(BaseModel):
    id: str
    notebook_id: str
    document_id: Optional[str] = None
    artifact_type: str
    content: Any
    created_at: str

class SaveStudyArtifactRequest(BaseModel):
    document_id: Optional[str] = None
    artifact_type: str
    content: Any

