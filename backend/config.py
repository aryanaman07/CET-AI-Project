import os
from pathlib import Path
from typing import List

# Base paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = BASE_DIR / "uploads"
STATIC_DIR = BASE_DIR / "static"

# Ensure data and upload directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
STATIC_DIR.mkdir(parents=True, exist_ok=True)

def _load_env_file():
    env_path = BASE_DIR / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key and key not in os.environ:
                        os.environ[key] = val

_load_env_file()

class Settings:
    PROJECT_NAME: str = "CET AI Academic Chatbot"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = (
        "Academic learning and research assistant for IIT Patna Centre for Educational Technology (CET). "
        "Answers queries using strictly verified, publicly available CET information with clickable source citations."
    )
    
    # Host & Port
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # LLM Settings: Primary (Google Gemini)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    LLM_TIMEOUT_SECONDS: int = int(os.getenv("LLM_TIMEOUT_SECONDS", "12"))
    
    # LLM Settings: Secondary / Multi-provider (OpenRouter)
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
    
    # Rate Limiting: Max requests per client IP per window
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # Request validation constraints
    MAX_QUERY_LENGTH: int = 1000
    MIN_QUERY_LENGTH: int = 1
    
    # File locations
    DATA_DIR: Path = DATA_DIR
    UPLOADS_DIR: Path = UPLOADS_DIR
    STATIC_DIR: Path = STATIC_DIR
    KNOWLEDGE_BASE_FILE: Path = DATA_DIR / "cet_knowledge.json"
    DATABASE_FILE: Path = BASE_DIR / "cet_ai.db"
    
    # CORS - explicit origins (never wildcard '*' with allow_credentials=True)
    _default_cors = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    _env_cors = os.getenv("CORS_ORIGINS", "")
    CORS_ORIGINS: List[str] = (
        [origin.strip() for origin in _env_cors.split(",") if origin.strip() and origin.strip() != "*"]
        if _env_cors else _default_cors
    )
    
    # Institutional metadata & disclaimers
    INSTITUTE_NAME: str = "IIT Patna Centre for Educational Technology (CET)"
    OFFICIAL_PORTAL: str = "https://cet.iitp.ac.in/"
    DISCLAIMER: str = (
        "CET AI is an independent academic prototype and is not officially endorsed by IIT Patna. "
        "Information is grounded in verified public records. For official confirmation, please visit https://cet.iitp.ac.in/."
    )

settings = Settings()
