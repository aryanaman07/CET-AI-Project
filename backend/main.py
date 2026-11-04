"""
IITP CET AI — FastAPI Application Entry Point
----------------------------------------------
This is the root FastAPI application server for the CET AI Academic Learning Assistant.
It sets up:
  1. Application Lifespan: Automatically creates SQLite tables and loads institutional knowledge on boot.
  2. CORS Middleware: Enables secure cross-origin requests from the React/Vite development server.
  3. Rate Limiter Middleware: Protects expensive LLM generation endpoints from denial-of-service/burst calls.
  4. API Routers:
     - /api/chat      : Institutional chatbot (queries verified CET website circulars & programs).
     - /api/knowledge : Public verified documents catalog and institutional health check.
     - /api/notebooks : Isolated student workspaces, PDF uploads, FAISS document QA, and AI study tools.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from .config import settings
from .database import init_db
from .middleware.rate_limiter import RateLimiterMiddleware
from .routes.chat import router as chat_router
from .routes.knowledge import router as knowledge_router
from .routes.notebooks import router as notebooks_router
from .services.knowledge_base import knowledge_base_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: initializes SQLite database and verifies knowledge base."""
    logger.info("Initializing CET AI Academic Chatbot backend...")
    init_db()
    knowledge_base_service.load()
    doc_count = len(knowledge_base_service.get_all_documents())
    logger.info(f"Knowledge base ready with {doc_count} verified documents.")
    yield
    logger.info("CET AI backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory sliding-window rate limiting middleware
app.add_middleware(
    RateLimiterMiddleware,
    requests_per_minute=settings.RATE_LIMIT_PER_MINUTE
)

# Include API Routers
app.include_router(chat_router)
app.include_router(knowledge_router)
app.include_router(notebooks_router)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats validation errors cleanly."""
    errors = exc.errors()
    error_msg = errors[0].get("msg") if errors else "Invalid request payload"
    field = ".".join(str(loc) for loc in errors[0].get("loc", [])) if errors else "body"
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": f"Validation Error in '{field}': {error_msg}",
            "code": "INVALID_REQUEST",
            "errors": errors
        }
    )

@app.get("/", summary="API Root", tags=["Institutional Knowledge & Health"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "institution": settings.INSTITUTE_NAME,
        "official_reference": settings.OFFICIAL_PORTAL,
        "documentation": "/docs",
        "health_check": "/api/health",
        "knowledge_catalog": "/api/knowledge",
        "chat_endpoint": "/api/chat",
        "disclaimer": settings.DISCLAIMER
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
