# CET IITP AI — Academic Learning Assistant
### Indian Institute of Technology Patna • Centre for Educational Technology (CET).

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

**CET IITP AI** is an AI-powered academic learning, research, and institutional advisory companion built for the **Centre for Educational Technology (CET)** at the **Indian Institute of Technology Patna (IIT Patna)**.

The system empowers prospective applicants, enrolled undergraduates, postgraduates, and faculty by grounding queries strictly in verified public records from the official CET portal ([https://cet.iitp.ac.in/](https://cet.iitp.ac.in/)), while providing a dedicated interactive study workspace for syllabus navigation, lecture note revision, diagnostic quizzes, and audio learning overviews.

---

## 🏛️ Key Capabilities

### 1. Grounded Institutional Academic Assistant
- Answers academic and administrative questions grounded strictly in official CET publications, curricula, and evaluation regulations.
- Eliminates hallucinations: explicitly admits when public sources lack supporting information.
- Provides clickable source citation links pointing directly to official documents and pages.
- Built-in security guardrails preventing student credential collection or unauthorized access.

### 2. Interactive Study Workspace
- Ingests course syllabi, lecture slides, and academic PDFs.
- Split-screen workspace for simultaneous document review and grounded querying.
- Multi-document switching across curriculum modules.

### 3. Active Recall & Assessment Studio
- **Executive Summaries**: Synthesizes key takeaways, terminology glossaries, and core formulas.
- **Diagnostic Quizzes**: Generates multiple-choice assessments with instant feedback, scoring, and source citations.
- **3D Revision Flashcards**: Interactive active recall cards with flip animations and mastery tracking.
- **AI Spoken Audio Overview**: Synthesizes neural conversational summaries for revision on the go.

### 4. Resilient Multi-Provider LLM Pipeline
- **Primary Provider**: Google Gemini (`gemini-flash-latest` / `gemini-2.5-flash`) via asynchronous thread execution with strict timeout limits.
- **Secondary Provider**: OpenRouter (`openai/gpt-4o-mini`) automatic failover if primary provider reaches quota or encounters transient network errors.
- **Tertiary Safeguard**: Deterministic verified grounded engine guaranteeing zero crashes and 100% uptime even during complete offline/API outages.

---

## 📁 Repository Structure

```
CET IITP AI/
├── backend/
│   ├── data/
│   │   └── cet_knowledge.json       # Pre-indexed public CET records & syllabi
│   ├── middleware/
│   │   └── rate_limiter.py          # Sliding-window IP rate limiting (60 req/min)
│   ├── models/
│   │   └── schemas.py               # Pydantic request/response validation schemas
│   ├── routes/
│   │   ├── chat.py                  # POST /api/chat & GET /api/health endpoints
│   │   └── knowledge.py             # GET /api/knowledge catalog endpoint
│   ├── services/
│   │   ├── knowledge_base.py        # Knowledge base ingestion service
│   │   ├── retriever.py             # Semantic lexical retriever with token coverage scoring
│   │   └── llm_service.py           # Multi-provider LLM service with failover
│   ├── tests/
│   │   └── test_chatbot.py          # 18-suite comprehensive automated test suite
│   ├── config.py                    # Environment settings and application constants
│   ├── database.py                  # SQLite persistence layer (sessions, messages, docs)
│   ├── main.py                      # FastAPI application entrypoint with CORS
│   └── .env.example                 # Environment configuration template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── about/               # Architecture, WBS, and institutional specifications
│   │   │   ├── assistant/           # Grounded institutional chatbot UI with citations
│   │   │   ├── common/              # Navbar, Footer, and Modal components
│   │   │   ├── dashboard/           # Notebook workspace management
│   │   │   ├── landing/             # Official IIT Patna styled landing portal
│   │   │   └── workspace/           # Split-screen viewer, chat, quizzes, flashcards, audio
│   │   ├── data/
│   │   │   └── cetData.js           # Curricula, programs, and institutional metadata
│   │   ├── services/
│   │   │   ├── api.js               # Backend API integration client
│   │   │   └── storage.js           # Client-side persistence
│   │   ├── App.jsx                  # Main application orchestrator
│   │   └── App.css                  # Comprehensive design system with IIT Patna Navy & Gold
│   ├── index.html                   # HTML entry point with academic typography
│   └── vite.config.js               # Vite config with backend proxy (/api -> 8000)
├── ARCHITECTURE.md                  # Detailed architectural design and sequence diagrams
├── IMPLEMENTATION_ROADMAP.md        # 5-phase execution plan and acceptance criteria
├── PROJECT_PLAN.md                  # Formal Capstone requirements specification
├── TEAM_TASKS.md                    # Work breakdown structure and role assignments
├── LICENSE                          # Apache 2.0 License
├── package.json                     # Root workspace scripts
└── .gitignore                       # Strict security rules ignoring secrets & binaries
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Git

---

### Backend Setup

1. **Navigate to the backend directory and set up environment variables**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Configure your API keys in `backend/.env`**:
   ```ini
   # Primary Provider (Google Gemini)
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-flash-latest

   # Secondary Provider (OpenRouter - optional failover)
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_MODEL=openai/gpt-4o-mini
   ```
   *(Note: If no API keys are provided, the backend operates smoothly in deterministic verified-grounded mode using indexed public records).*

3. **Install Python dependencies**:
   ```bash
   pip install fastapi uvicorn pydantic requests google-generativeai pytest httpx
   ```

4. **Launch the backend server**:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - OpenAPI documentation will be accessible at: `http://127.0.0.1:8000/docs`
   - Healthcheck: `http://127.0.0.1:8000/api/health`

---

### Frontend Setup

1. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   - Access the application at: `http://localhost:5173/`

---

## 🧪 Automated Testing

The backend includes an automated test suite covering:
- Knowledge base query accuracy
- Unsupported / out-of-scope query rejection
- Input validation and length bounds
- Multi-provider failover switching (Gemini → OpenRouter → Grounded Fallback)
- Source attribution and citation integrity
- Security disclaimers and credential phishing prevention
- Sliding-window rate limiting (HTTP 429)

To run the test suite:
```bash
python -m pytest backend/tests/test_chatbot.py -v
```

---

## 🔒 Security & Disclaimers

- **Credential Safety**: The assistant will never prompt for or store student passwords, portal logins, or private credentials.
- **Institutional Identity**: CET IITP AI is an academic project prototype developed for demonstration and study aid purposes. It is not officially endorsed by IIT Patna. For official circulars and notices, always refer to the official [IIT Patna CET Portal](https://cet.iitp.ac.in/).
- **Secret Hygiene**: All environment files (`.env`), database binaries (`*.db`), and cache directories are excluded via `.gitignore` to prevent credential exposure.

---

## 📄 License

This project is licensed under the Apache 2.0 License. See [LICENSE](LICENSE) for details.
