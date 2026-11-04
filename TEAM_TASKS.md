# TEAM TASKS & WORK BREAKDOWN STRUCTURE
**CET AI — AI-Powered Academic Learning & Research Assistant**  
*IIT Patna Centre for Educational Technology (CET) Capstone Project*

---

## 1. Team Organization & Skill Calibration

To accommodate team members with varying levels of programming experience (beginners to advanced developers), the project is broken down into **5 standalone modules**. Each module has well-defined inputs, outputs, and an isolated local testing sandbox so no member gets blocked by another.

```
+-----------------------------------------------------------------------------------+
|                            PROJECT COORDINATOR / LEAD                             |
|              Overall Integration, Architecture, Testing & Presentation            |
+-----------------------------------------------------------------------------------+
           |                     |                      |                     |
           v                     v                      v                     v
     [ MODULE 1 ]          [ MODULE 2 ]           [ MODULE 3 ]          [ MODULE 4 ]
    Frontend & UX          Backend API &         RAG Engine &         Study Studio &
    Workspace Lead       Document Pipeline       Grounding Lead       Audio Overview
   (React / CSS)          (Python / FastAPI)     (Embeddings / LLM)     (Quiz, TTS)
```

---

## 2. Work Breakdown Structure (WBS) & Role Assignment

### Module 1: Frontend UI/UX & Interactive Study Workspace
**Target Role:** Frontend Developer (React, HTML, CSS, JavaScript)  
**Experience Level:** Beginner to Intermediate  
**Primary Responsibility:** Build a clean, responsive, aesthetic interface styled with IIT Patna CET's official navy-and-gold visual identity.

#### Assigned Tasks:
- [ ] **Task 1.1: Project Scaffolding & Design System**
  - Initialize React application with Vite.
  - Establish CSS design tokens in `index.css`:
    - `--iitp-navy: #002147` (primary brand color)
    - `--iitp-gold: #d4af37` (accent color)
    - `--surface-card: #ffffff`, `--bg-light: #f8fafc`, `--border-subtle: #e2e8f0`
    - Typography: Outfit or Inter from Google Fonts.
- [ ] **Task 1.2: Portal Shell & Navigation Header**
  - Create the top navbar featuring IIT Patna CET identity, project badge (`CET AI Companion`), and mode toggle (Institutional Guide vs. Interactive Study Workspace).
  - Add quick-access links to official CET pages (`Admissions`, `Academics`, `Moodle`, `Calendar`).
- [ ] **Task 1.3: Split-Screen Study Workspace Layout**
  - Implement a 2-column responsive layout:
    - Left column: Document viewer canvas with page navigation controls.
    - Right column: Tabbed workspace (Chat, Summary, Quiz, Flashcards, Audio).
- [ ] **Task 1.4: Interactive Study Components**
  - **Chat Box:** Message bubbles with avatar badges and clickable `[Citation]` tags.
  - **Quiz Card:** Multiple-choice card with interactive option buttons, instant green/red feedback on answer selection, and final score summary.
  - **Flashcard Deck:** Interactive card with 3D flip animation on click, "Next", "Previous", and "Mark Mastered" buttons.
  - **Audio Player:** Sleek custom audio control bar (Play/Pause, Seek bar, Time elapsed, 1x/1.5x speed).
- [ ] **Task 1.5: Mock Data Integration & API Hookup**
  - Create `src/services/api.js` using `fetch()` or `axios`.
  - Provide fallback mock data so frontend UI can be tested independently before the backend is finished.

#### Acceptance Criteria for Module 1:
- [x] Application loads on `http://localhost:5173` without console errors.
- [x] Responsive layout displays correctly on both laptop screens (1280px+) and tablet/mobile viewports.
- [x] Flashcards flip smoothly using CSS transform without UI stutter.
- [x] Citation chips render cleanly and show tooltip or preview text when hovered.

---

### Module 2: Backend API & Document Ingestion Service
**Target Role:** Backend / Python Engineer  
**Experience Level:** Beginner to Intermediate  
**Primary Responsibility:** Set up the FastAPI server, SQLite database, file upload endpoints, and PDF text extraction.

#### Assigned Tasks:
- [ ] **Task 2.1: FastAPI Setup & Server Skeleton**
  - Initialize Python virtual environment (`.venv`).
  - Install dependencies (`fastapi`, `uvicorn`, `pydantic`, `python-multipart`).
  - Configure CORS middleware to permit requests from `http://localhost:5173`.
  - Implement `/api/health` check endpoint.
- [ ] **Task 2.2: SQLite Database Schema & Helpers**
  - Implement lightweight database layer (`database.py`) using Python's standard `sqlite3`.
  - Create tables for `documents`, `chat_sessions`, `chat_messages`, and `study_artifacts`.
  - Add simple CRUD helper functions.
- [ ] **Task 2.3: Secure File Upload Endpoint**
  - Build `POST /api/documents/upload` receiving `multipart/form-data`.
  - Validate file extension (`.pdf`) and size limit (max 15MB).
  - Save file securely to `backend/uploads/` using UUID naming.
- [ ] **Task 2.4: PDF Text Parsing & Page-Level Extraction**
  - Integrate `pypdf` or `pdfplumber` to extract clean text while preserving page numbers.
  - Handle corrupt or empty PDF errors gracefully with informative HTTP 400 responses.
- [ ] **Task 2.5: Document Retrieval Endpoints**
  - Build `GET /api/documents` to list all uploaded files and preloaded CET institutional brochures.
  - Build `GET /api/documents/{id}/file` to serve the PDF binary to the frontend viewer.

#### Acceptance Criteria for Module 2:
- [x] FastAPI Swagger docs accessible at `http://localhost:8000/docs`.
- [x] Uploading a standard 5-page PDF returns `{ "doc_id": "...", "title": "...", "page_count": 5 }` within 2 seconds.
- [x] Uploading a non-PDF or a 20MB file is safely rejected with descriptive error messages.
- [x] Uploaded files and metadata persist correctly in `cet_ai.db`.

---

### Module 3: RAG Retrieval Engine & Citation Grounding
**Target Role:** AI / NLP / Data Engineer  
**Experience Level:** Intermediate to Advanced  
**Primary Responsibility:** Build the vector embeddings pipeline, semantic similarity search, and source-grounded prompt assembly with citation tags.

#### Assigned Tasks:
- [ ] **Task 3.1: Document Chunking & Vector Store Setup**
  - Install `chromadb` (or FAISS/in-memory vector store).
  - Implement a chunker splitting document text into 500-token windows with 100-token overlap.
  - Store metadata (`doc_id`, `doc_title`, `page_number`, `chunk_id`) with each chunk.
- [ ] **Task 3.2: Embeddings Pipeline**
  - Connect embedding generator (Google Gemini `text-embedding-004` or local sentence-transformers `all-MiniLM-L6-v2`).
  - Implement caching to avoid re-generating embeddings for existing documents.
- [ ] **Task 3.3: Pre-indexing Official CET IIT Patna Knowledge**
  - Ingest public CET brochures and institutional data into a permanent collection:
    - BS in AI and Cyber Security (AICS) Course Overview (`AICS.pdf`).
    - BS in Computer Science & Data Analytics (CSDA) Course Overview (`CSDA.pdf`).
    - CET Academic Calendar 2025–2026.
    - Evaluation Scheme, Grading Policy, and Attendance Rules.
    - Admissions, eligibility, and program fee structures.
- [ ] **Task 3.4: Grounded Prompt Engineering & Citation Extractor**
  - Formulate strict system prompts instructing the LLM to only respond using retrieved context.
  - Enforce citation format in the response: `[Source: <Doc Title>, Page <N>]`.
  - Write a regex/parser to extract citations into structured JSON objects for the frontend.
- [ ] **Task 3.5: Chatbot Query Endpoint**
  - Build `POST /api/chat` (general institutional queries against CET knowledge base).
  - Build `POST /api/documents/{id}/query` (specific queries against an uploaded student document).

#### Acceptance Criteria for Module 3:
- [x] Querying *"What is the CPI requirement for passing?"* returns answer citing the Evaluation Scheme document and section.
- [x] Querying an unrelated off-topic prompt (e.g. *"Who won the 2022 World Cup?"*) results in: *"This assistant is restricted to academic matters at IIT Patna CET. No relevant information was found."*
- [x] Every response includes at least one verifiable citation with document title and page number.

---

### Module 4: Learning Studio Generators (Summary, Quiz, Flashcards) & Audio Overview
**Target Role:** Full-Stack / Feature Developer  
**Experience Level:** Intermediate  
**Primary Responsibility:** Implement the automated study tool generation pipeline (summaries, quizzes, flashcards) and the Text-to-Speech audio synthesis engine.

#### Assigned Tasks:
- [ ] **Task 4.1: Structured Study Guide / Summary Generation**
  - Build `POST /api/study/summary`.
  - Prompt LLM with Pydantic schema / JSON mode to return:
    - `summary`: 3 concise paragraphs explaining core thesis.
    - `key_concepts`: List of 5–8 bullet points with definitions.
    - `study_questions`: 3 self-reflection questions.
- [ ] **Task 4.2: MCQ & Assessment Quiz Generator**
  - Build `POST /api/study/quiz`.
  - Prompt LLM to extract 5–10 multiple-choice questions from the document.
  - Output JSON schema:
    ```json
    {
      "questions": [
        {
          "id": 1,
          "question": "What is the primary objective of AICS curriculum?",
          "options": ["A", "B", "C", "D"],
          "answer_index": 0,
          "explanation": "According to page 2...",
          "source_page": 2
        }
      ]
    }
    ```
- [ ] **Task 4.3: Interactive Flashcard Deck Generator**
  - Build `POST /api/study/flashcards`.
  - Extract 6–10 concept pairs (Front: Concept/Prompt, Back: Concise Definition/Application).
- [ ] **Task 4.4: Audio Overview Generation (AI Spoken Audio Style)**
  - Build `POST /api/study/audio`.
  - Step 1: Prompt LLM to produce a 2-minute lively spoken script summarizing the document.
  - Step 2: Use Python `edge-tts` to convert the script into an `.mp3` file using natural neural voice (`en-IN-NeerjaNeural` or `en-US-ChristopherNeural`).
  - Step 3: Save MP3 to `backend/static/audio/` and return streaming URL.

#### Acceptance Criteria for Module 4:
- [x] Quiz endpoint returns valid JSON with 5 well-formed questions, options, and verifiable answer keys.
- [x] Flashcard endpoint returns 6+ concise concept pairs ready for UI flip rendering.
- [x] Audio synthesis generates a playable `.mp3` file within 5–8 seconds that streams cleanly in HTML5 `<audio>` player.

---

### Module 5: Project Lead, Integration, Quality Assurance & Capstone Deliverables
**Target Role:** Project Coordinator / Team Lead  
**Experience Level:** All-Rounder / Team Coordinator  
**Primary Responsibility:** Oversee inter-module integration, environment configurations, documentation, demo script, and final capstone presentation.

#### Assigned Tasks:
- [ ] **Task 5.1: Repository Setup & Coordination Guidelines**
  - Maintain `.gitignore`, `.env.example`, and directory structure.
  - Ensure zero credential leaks (API keys kept exclusively in `.env`).
- [ ] **Task 5.2: End-to-End System Integration**
  - Connect frontend service calls to backend FastAPI endpoints.
  - Verify seamless handling of network latency and loading states (spinners, skeletons).
- [ ] **Task 5.3: Offline Fallback & Reliability Verification**
  - Test application with Gemini API.
  - Prepare pre-cached mock responses or Ollama configuration for 100% offline defense in case college auditorium Wi-Fi is unreliable.
- [ ] **Task 5.4: Capstone Documentation & Demo Materials**
  - Complete `README.md` with step-by-step 3-command setup instructions.
  - Draft Capstone Project Report (Abstract, Architecture, Methodology, Results).
  - Prepare 10-slide PowerPoint presentation with live demo script.

#### Acceptance Criteria for Module 5:
- [x] Clean one-command startup for frontend (`npm run dev`) and backend (`uvicorn main:app --reload`).
- [x] Complete demonstration workflow functions end-to-end without unhandled exceptions.
- [x] Capstone presentation and live demo executed smoothly within the allotted 15-minute defense window.

---

## 3. Inter-Module Dependency & Communication Matrix

| Producer | Consumer | Artifact / Interface | Fallback if Producer is Delayed |
| :--- | :--- | :--- | :--- |
| **Module 2 (Backend)** | Module 1 (Frontend) | REST Endpoints (`/api/documents/upload`, `/api/chat`) | Frontend uses local mock JSON fixtures (`src/mock/data.json`) |
| **Module 3 (RAG)** | Module 2 (Backend) | RAG Query Function (`query_rag(doc_id, text)`) | Backend returns static search matches from SQLite |
| **Module 3 (RAG)** | Module 4 (Studio) | Retrieved Chunks & Clean Text | Module 4 reads raw text directly from PyPDF parser |
| **Module 4 (Studio)** | Module 1 (Frontend) | JSON Schemas for Quiz, Flashcards, Audio URL | Frontend renders hardcoded sample quiz for UI testing |
