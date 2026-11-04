# IMPLEMENTATION ROADMAP & PHASE ACCEPTANCE CRITERIA
**CET AI — AI-Powered Academic Learning and Research Assistant**  
*IIT Patna Centre for Educational Technology (CET) Capstone Project*

---

## 1. Roadmap Overview & Timeline

The implementation is structured into **5 sequential phases** designed to transition from a verified environment skeleton into a demonstrable, feature-complete academic capstone.

```
+---------------------------------------------------------------------------------------------+
|                                    IMPLEMENTATION TIMELINE                                  |
+---------------------------------------------------------------------------------------------+
| Phase 1: Environment Setup & Knowledge Base Ingestion                | Week 1                |
| Phase 2: Core Document Ingestion & RAG Chatbot Engine                | Week 2                |
| Phase 3: Interactive Learning Studio (Summaries, Quizzes, Flashcards) | Week 3                |
| Phase 4: Audio Overview Synthesis & Split-Screen UI Integration      | Week 4                |
| Phase 5: Hardening, Polish, Presentation Prep & Capstone Defense     | Week 5                |
+---------------------------------------------------------------------------------------------+
```

---

## 2. Phase-by-Phase Execution Plan

### Phase 1: Environment Setup & Institutional Knowledge Base
**Objective:** Establish repository structure, install runtimes, set up development environments for both frontend and backend, and compile the official IIT Patna CET knowledge base.

#### Phase 1 Deliverables:
1. `backend/`: FastAPI application scaffold with SQLite database setup and `/api/health` route.
2. `frontend/`: Vite + React project initialized with IIT Patna color tokens, typography, and navbar.
3. `data/cet_knowledge/`: Clean text and PDFs compiled from public CET records:
   - BS in AI & Cyber Security (AICS) curriculum
   - BS in Computer Science & Data Analytics (CSDA) curriculum
   - CET Academic Calendar 2025–2026
   - Evaluation & Grading Scheme
   - Admission Notice & Eligibility Criteria
4. `.env.example` file documenting all environment variables (`GEMINI_API_KEY`, `PORT`, `DATA_DIR`).

#### Phase 1 Acceptance Criteria:
- [x] Backend runs with `python -m uvicorn main:app --reload` and serves `GET /api/health` returning status 200.
- [x] Frontend runs with `npm run dev` and renders a clean landing page with IIT Patna CET branding on `http://localhost:5173`.
- [x] Institutional knowledge folder contains at least 5 structured markdown/PDF files representing core CET public information.
- [x] Zero API keys or secrets are committed to the code repository.

---

### Phase 2: Document Ingestion & RAG Chatbot Engine
**Objective:** Implement PDF file uploading, text extraction, recursive chunking, vector embedding generation, and source-grounded question answering with citations.

#### Phase 2 Deliverables:
1. `POST /api/documents/upload` endpoint supporting PDF parsing with page tracking.
2. Vector database index (ChromaDB or FAISS) populated with preloaded CET knowledge chunks.
3. `POST /api/chat` conversational endpoint primed with institutional system prompts.
4. `POST /api/documents/{id}/query` endpoint allowing students to ask questions about specific uploaded PDFs.
5. Citation extraction regex and data structure returning `{ text, citations: [{ doc_title, page_number }] }`.

#### Phase 2 Acceptance Criteria:
- [x] Uploading a sample 5-page PDF stores the file, extracts text page-by-page, and returns a valid document ID within 3 seconds.
- [x] Asking *"What are the admission eligibility requirements for BS in CSDA?"* returns an accurate response quoting IIT Patna CET requirements with a verifiable citation tag `[CSDA Syllabus, Page 2]`.
- [x] Off-topic or adversarial questions are politely deflected without hallucination.
- [x] Swagger documentation at `http://localhost:8000/docs` allows interactive testing of all ingestion and query endpoints.

---

### Phase 3: Interactive Learning Studio (Summaries, Quizzes, Flashcards)
**Objective:** Build the active recall and assessment tools that transform CET AI into a comprehensive learning platform.

#### Phase 3 Deliverables:
1. `POST /api/study/summary`: Generates structured executive digest, key terminology glossary, and core formulas.
2. `POST /api/study/quiz`: Generates 5 to 10 diagnostic MCQs with 4 distinct options, verified answer key, and explanatory rationale citing source pages.
3. `POST /api/study/flashcards`: Generates an array of concept/definition pairs.
4. Interactive Frontend Components:
   - Summary view with styled markdown formatting and bullet tags.
   - Quiz component featuring option selection, instant score calculation, visual feedback (green for correct, red for incorrect), and detailed explanations.
   - Flashcard component featuring smooth 3D CSS flip on click, with mastery progress tracking ("Mastered" vs. "Need Review").

#### Phase 3 Acceptance Criteria:
- [x] Generating a quiz from an uploaded PDF yields valid JSON parseable by the UI in 100% of test runs.
- [x] Selecting a quiz option immediately indicates correctness and reveals the explanation without page reload.
- [x] Flashcard flip animation executes smoothly with zero UI lag or text overflow.
- [x] Study artifacts are saved to SQLite and reload instantly when reopening the document session.

---

### Phase 4: Audio Overview Synthesis & Split-Screen UI Integration
**Objective:** Implement AI spoken audio overviews using Text-to-Speech (TTS) and complete the split-screen document study workspace.

#### Phase 4 Deliverables:
1. Audio generation pipeline using Python `edge-tts` (Microsoft Neural Voice engine):
   - Conversational script generation using LLM.
   - Neural speech synthesis to high-fidelity MP3.
   - Static audio caching in `backend/static/audio/`.
2. Frontend Audio Player component with play/pause, scrub slider, elapsed/total time, and playback speed selector (1x, 1.25x, 1.5x).
3. Split-screen study workspace:
   - Left side: In-browser PDF canvas viewer with zoom and page controls.
   - Right side: Multi-tab studio switching between Chat, Summary, Quiz, Flashcards, and Audio.

#### Phase 4 Acceptance Criteria:
- [x] Clicking "Generate Audio Overview" synthesizes an MP3 file (60–120 seconds duration) in under 8 seconds.
- [x] Audio plays cleanly through the browser audio player with working play/pause and seek bar.
- [x] Split-screen layout scales gracefully from 1080p desktop monitors down to laptops (1366x768).
- [x] Clicking a citation in the chat panel highlights the reference or notifies the user of the corresponding page in the PDF viewer.

---

### Phase 5: Hardening, Polish, Presentation Prep & Capstone Defense
**Objective:** End-to-end testing, error handling, performance optimization, offline demo fallback preparation, and final capstone documentation.

#### Phase 5 Deliverables:
1. Error boundary and user feedback toasts for network drops or API rate limit events.
2. Standalone offline demo bundle (pre-cached responses or local Ollama configuration) so the project can be presented even without an active internet connection.
3. Comprehensive project documentation:
   - `README.md` with foolproof 3-step setup guide.
   - Final Capstone Report (30–40 pages standard college format: Abstract, Literature Review, System Architecture, Experimental Results, Future Scope).
   - Presentation Slide Deck (10 slides tailored for the academic evaluation jury).
4. Rehearsed 10-minute live demonstration script covering all 4 evaluation scenarios.

#### Phase 5 Acceptance Criteria:
- [x] Clean startup of both frontend and backend on any fresh student laptop in under 5 minutes.
- [x] System operates reliably without unhandled JavaScript console exceptions or Python tracebacks during a full 15-minute walkthrough.
- [x] All team members can articulate their assigned module, technical decisions, and code contributions during jury cross-examination.

---

## 3. Risk Assessment & Contingency Matrix

| Risk Factor | Impact | Likelihood | Mitigation / Contingency Plan |
| :--- | :--- | :--- | :--- |
| **API Rate Limiting (Free Tier Limits)** | High | Medium | Implement local response caching for common questions; use Gemini 1.5/2.5 Flash free tier with automatic retry/backoff logic. |
| **No Internet in Presentation Hall** | Critical | Medium | Prepare an offline fallback mode with pre-cached sample documents (AICS Syllabus, Evaluation Scheme) and pre-generated audio files. |
| **Team Member Skill Gap / Blockers** | Medium | High | Maintain clear modular decoupling. If the backend is delayed, the frontend team uses mock JSON data; if RAG is delayed, basic keyword matching is used temporarily. |
| **Large PDF Parsing Failure** | Medium | Low | Enforce 15MB file upload limit; sanitize and parse PDFs page-by-page with try-except blocks; fallback to text-only extraction if complex layout fails. |
| **LLM Output Formatting Drift** | High | Low | Enforce strict Pydantic JSON schemas and system prompts instructing JSON-only responses for quizzes and flashcards. |

---

## 4. Definition of Done (DoD) for Capstone Evaluation

A feature or module is considered **Done** only when:
1. **Code Quality:** The code is readable, modular, commented, and adheres to standard PEP 8 (Python) and ESLint/Prettier (React) formatting.
2. **Local Execution:** Runs cleanly on `localhost` without requiring paid subscriptions, cloud deployment, or Docker.
3. **Institutional Alignment:** Content, naming, and visual identity authentically reflect IIT Patna Centre for Educational Technology.
4. **Academic Grounding:** Chatbot responses provide verifiable citations pointing to specific pages or official CET notices.
5. **Demonstrable Value:** The feature can be demonstrated live in front of the project evaluation panel within 60 seconds.
