# CET AI Academic Chatbot — Backend Documentation
**IIT Patna Centre for Educational Technology (CET)**  
*AI-Powered Academic Learning and Research Assistant*

---

## 1. Executive Summary & Objective

The **CET AI Backend** provides an asynchronous, source-grounded REST API that answers academic and institutional questions exclusively using verified, publicly available information from the **IIT Patna Centre for Educational Technology (CET)** website (`https://cet.iitp.ac.in/`) and official institutional ordinances.

### Core Safeguards & Operational Guardrails:
1. **Source Grounded & Hallucination-Free:** Every response is assembled strictly from verified public records. The chatbot never invents admissions details, cutoffs, deadlines, fees, or institutional policies.
2. **Missing Information Transparency:** When an answer cannot be found in the verified knowledge base, the bot explicitly admits lack of information rather than guessing.
3. **Clickable Source Attribution:** Every factual claim cites the official document title, verifiable source URL, and page/section number.
4. **Resilient LLM Availability:** If Google Gemini API is offline, quota-limited, or unconfigured, the system automatically falls back to a deterministic, grounded synthesis engine without crashing or returning 500 errors.
5. **Privacy & Security First:**
   - Does **not** crawl or access login-protected Moodle student data.
   - Does **not** ask for, accept, or process student passwords or login credentials.
   - Explicitly discloses that it is an **independent academic companion prototype** and is **not officially endorsed by IIT Patna**.
   - API keys are stored strictly in environment variables (`.env`).
   - In-memory sliding-window rate limiting prevents abuse (60 requests/minute per IP).

---

## 2. Architecture & File Structure

Following the approved project architecture (`ARCHITECTURE.md` and `PROJECT_PLAN.md`), the backend is built using **Python 3.11+ / FastAPI** and **SQLite**:

```
backend/
├── __init__.py
├── main.py                     # FastAPI application, CORS, lifespan, exception handlers
├── config.py                   # Environment settings, paths, and security limits
├── database.py                 # SQLite database layer (chat_messages, chat_sessions, documents)
├── .env.example                # Template for environment variables (no secrets committed)
├── .env                        # Local development environment configuration
│
├── data/
│   └── cet_knowledge.json      # Indexed verified public records with provenance metadata
│
├── middleware/
│   ├── __init__.py
│   └── rate_limiter.py         # Sliding-window IP-based rate limiting (HTTP 429)
│
├── models/
│   ├── __init__.py
│   └── schemas.py              # Pydantic models for validation and serialization
│
├── routes/
│   ├── __init__.py
│   ├── chat.py                 # POST /api/chat endpoint
│   └── knowledge.py            # GET /api/health and GET /api/knowledge endpoints
│
├── services/
│   ├── __init__.py
│   ├── knowledge_base.py       # Knowledge base loader and document store
│   ├── retriever.py            # Multi-tiered token coverage and lexical search engine
│   └── llm_service.py          # Gemini integration with grounded fallback engine
│
└── tests/
    ├── __init__.py
    └── test_chatbot.py         # Automated pytest suite covering all 17 test cases
```

---

## 3. Verified Knowledge Base Catalog

All documents in `backend/data/cet_knowledge.json` originate from lawfully accessible public pages and Senate-approved ordinances. Every record maintains strict provenance:

| Document ID | Official Title | Source URL | Retrieval Date | Category |
| :--- | :--- | :--- | :--- | :--- |
| `doc-about-cet` | About IIT Patna CET | `https://cet.iitp.ac.in/index.php/the-institute` | `2026-10-15T09:16:00Z` | About CET |
| `doc-academic-programs` | Academic Programs Catalog | `https://cet.iitp.ac.in/` | `2026-10-15T09:16:00Z` | Academic Programs |
| `doc-admission-eligibility`| Admission Eligibility & Entrance | `https://cet.iitp.ac.in/index.php/admissions/eligiblity` | `2026-10-15T09:16:00Z` | Admissions |
| `doc-admissions-portal` | Online Application Portal | `https://registrations.iitp-cep.in/` | `2026-10-15T09:16:00Z` | Admissions |
| `doc-evaluation-scheme` | Evaluation Scheme & Grading | `https://cet.iitp.ac.in/index.php/academics/evaluation-scheme` | `2026-10-15T09:16:00Z` | Academics & Evaluation |
| `doc-academic-calendar` | Academic Calendar & Schedules | `https://cet.iitp.ac.in/index.php/academics/academic-calendar` | `2026-10-15T09:16:00Z` | Academic Calendar |
| `doc-moodle-instructions` | Moodle LMS Student Instructions | `https://moodle.iitp.ac.in/` | `2026-10-15T09:16:00Z` | Moodle & LMS |
| `doc-public-announcements`| Tech Club & Placement Cell | `https://cet.iitp.ac.in/index.php/announcements/technology-club-internship-placement-cell` | `2026-10-15T09:16:00Z` | Public Announcements |
| `doc-aics-curriculum` | BS in AI & Cyber Security | `https://cet.iitp.ac.in/` | `2026-10-15T09:16:00Z` | Academic Programs |
| `doc-csda-curriculum` | BS in CS & Data Analytics | `https://cet.iitp.ac.in/` | `2026-10-15T09:16:00Z` | Academic Programs |

---

## 4. API Specification

Interactive Swagger UI documentation is automatically served at:  
`http://localhost:8000/docs`

### 4.1 `POST /api/chat`
Submits an academic or institutional question to the chatbot.

**Request Payload:**
```json
{
  "query": "What are the admission eligibility requirements for BS in CSDA?",
  "session_id": "optional-session-id-123",
  "document_id": null
}
```

**Response (HTTP 200 OK):**
```json
{
  "response": "Based on verified public records from the **IIT Patna Centre for Educational Technology (CET)**:\n\n### Verified Record: [CET Admission Eligibility & Entrance Test Regulations](https://cet.iitp.ac.in/index.php/admissions/eligiblity)\n**Section / Topic:** *BS AICS & BS CSDA Eligibility*\nFor B.Sc. (Hons.) / B.S. / B.S-M.S. in CSDA and AICS: Eligibility requires 10+2 in Science with minimum 60% cumulative aggregate marks. Applicants must hold a valid score/rank in JEE (Main/Advanced), NEET, CUET, BITSAT, KVPY/NTSE/INSPIRE, State Entrance Examinations, US SAT-I/SAT-II, UK BMAT, OR clear the IITP-SAT entrance test followed by virtual interview.\n\n---\n*Disclaimer: CET AI is an independent academic companion prototype and is not officially endorsed by IIT Patna.*",
  "citations": [
    {
      "doc_title": "CET Admission Eligibility & Entrance Test Regulations",
      "source_url": "https://cet.iitp.ac.in/index.php/admissions/eligiblity",
      "page": 1,
      "retrieval_date": "2026-10-15T09:16:00Z",
      "label": "CET Admission Eligibility & Entrance Test Regulations, Page 1",
      "snippet": "Eligibility requires 10+2 in Science with minimum 60% cumulative aggregate marks."
    }
  ],
  "session_id": "optional-session-id-123",
  "verified": true,
  "confidence": "high",
  "engine": "verified-grounded-engine",
  "retrieval_count": 2,
  "disclaimer": "CET AI is an independent academic companion prototype and is not officially endorsed by IIT Patna."
}
```

### 4.2 `GET /api/health`
System diagnostic and active LLM status check.

**Response (HTTP 200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "service": "CET AI Academic Chatbot",
  "environment": "development",
  "llm_provider": "Verified Grounded Fallback",
  "llm_status": "Active (Zero-Hallucination Deterministic Grounding)",
  "indexed_documents": 10,
  "disclaimer": "CET AI is an independent academic prototype and is not officially endorsed by IIT Patna. Information is grounded in verified public records. For official confirmation, please visit https://cet.iitp.ac.in/."
}
```

### 4.3 `GET /api/knowledge`
Returns the complete list of verified documents with URLs and retrieval timestamps.

### 4.4 `GET /api/knowledge/{doc_id}`
Returns full document content, page-level metadata, and indexed passages.

---

## 5. Setup & Execution Instructions

### 5.1 Prerequisites
- Python 3.11, 3.12, or 3.13 installed.
- Node.js 18+ (for frontend client).

### 5.2 Environment Configuration
Create a `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```

To enable Google Gemini LLM synthesis, add your API key:
```env
GEMINI_API_KEY=your_actual_key_here
GEMINI_MODEL=gemini-1.5-flash
PORT=8000
RATE_LIMIT_PER_MINUTE=60
```
*(Note: If `GEMINI_API_KEY` is omitted, the chatbot automatically operates in verified grounded synthesis mode without errors!)*

### 5.3 Running the Backend Server
From the repository root:
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The server will start at `http://localhost:8000`.

### 5.4 Running the Frontend Client
In a separate terminal:
```bash
npm --prefix frontend run dev
```
The client will open at `http://localhost:5173`, connecting automatically via proxy to the backend on port 8000.

---

## 6. Automated Test Suite Results

Automated unit, integration, and guardrail tests are implemented in `backend/tests/test_chatbot.py` using `pytest`.

To execute the test suite:
```bash
python -m pytest backend/tests/test_chatbot.py -v
```

### Test Results Summary:
```
============================= test session starts =============================
platform win32 -- Python 3.13.7, pytest-9.0.3, pluggy-1.6.0
collected 17 items

backend/tests/test_chatbot.py::TestQuestionsInKnowledgeBase::test_csda_eligibility_query PASSED   [  5%]
backend/tests/test_chatbot.py::TestQuestionsInKnowledgeBase::test_evaluation_scheme_query PASSED  [ 11%]
backend/tests/test_chatbot.py::TestQuestionsInKnowledgeBase::test_aics_exit_options_query PASSED  [ 17%]
backend/tests/test_chatbot.py::TestQuestionsInKnowledgeBase::test_moodle_instructions_query PASSED [ 23%]
backend/tests/test_chatbot.py::TestQuestionsWithNoSupportingInfo::test_off_topic_unsupported_query PASSED [ 29%]
backend/tests/test_chatbot.py::TestQuestionsWithNoSupportingInfo::test_unverified_fee_inquiry PASSED [ 35%]
backend/tests/test_chatbot.py::TestInvalidRequests::test_empty_query PASSED                     [ 41%]
backend/tests/test_chatbot.py::TestInvalidRequests::test_whitespace_only_query PASSED          [ 47%]
backend/tests/test_chatbot.py::TestInvalidRequests::test_query_too_long PASSED                  [ 52%]
backend/tests/test_chatbot.py::TestInvalidRequests::test_malformed_json_payload PASSED         [ 58%]
backend/tests/test_chatbot.py::TestAPIFailures::test_llm_api_failure_does_not_crash PASSED      [ 64%]
backend/tests/test_chatbot.py::TestAPIFailures::test_llm_unconfigured_operates_cleanly PASSED  [ 70%]
backend/tests/test_chatbot.py::TestSourceAttribution::test_verifiable_source_metadata PASSED    [ 76%]
backend/tests/test_chatbot.py::TestSourceAttribution::test_knowledge_catalog_endpoint PASSED    [ 82%]
backend/tests/test_chatbot.py::TestSecurityAndGuardrails::test_disclaimer_present_in_health_and_chat PASSED [ 88%]
backend/tests/test_chatbot.py::TestSecurityAndGuardrails::test_credential_phishing_rejection PASSED [ 94%]
backend/tests/test_chatbot.py::TestRateLimiting::test_rate_limiter_triggers_429 PASSED          [100%]

============================= 17 passed in 0.95s ==============================
```

---

## 7. Operational Limitations & Boundaries

1. **Static Synchronization Point:** The knowledge base is synced as of October 2026. Live updates posted on Joomla CMS after this date will be reflected upon running the catalog update script.
2. **No Autonomous Decision-Making:** The bot cannot make administrative exceptions, approve leaves, grant attendance condonations, or confirm fee refunds.
3. **No Private LMS Ingestion:** In strict compliance with institute privacy rules, the bot does not index student grades, quiz submissions, or private forum discussions on Moodle.
4. **Rate Limit Policy:** Standard threshold is set to 60 requests per minute per client IP to safeguard against server denial of service.
