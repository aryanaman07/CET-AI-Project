# PROJECT PLAN: CET AI — Academic Learning & Research Assistant
**IIT Patna — Centre for Educational Technology (CET)**  
*Capstone Project Plan & Requirement Specification*

---

## 1. Executive Summary

### 1.1 Project Title
**CET AI — AI-Powered Academic Learning and Research Assistant for IIT Patna Centre for Educational Technology**

### 1.2 Institutional Context
The **Centre for Educational Technology (CET)** at the Indian Institute of Technology Patna (IIT Patna) serves as an academic hub delivering industry-aligned, NEP 2020-compliant degree programs (BS in Artificial Intelligence & Cyber Security [AICS], BS in Computer Science & Data Analytics [CSDA], BBA, MBA, MTech, and PhD), alongside hosting digital learning infrastructure like Moodle LMS, academic calendars, evaluation schemes, and admission notices

### 1.3 Problem Statement
The current live CET website (`https://cet.iitp.ac.in/`) is a content-driven informational portal built on the Joomla CMS. While it hosts valuable academic notices, course flyers, PDF brochures, and schedules:
1. **Passive Information Consumption:** Students and applicants must manually hunt through static web pages and download large multi-page PDF documents (e.g., `AICS.pdf`, `CSDA.pdf`, Academic Calendar) to find specific regulations, syllabus details, or credit schemes.
2. **Lack of Active Study Aids:** There is no mechanism for students to interact with lecture notes, course handouts, or research papers to test comprehension, generate revision cards, or listen to audio overviews.
3. **No Direct Integrated Assistant:** Prospective and current students have no 24/7 conversational agent to resolve questions about admissions, evaluation criteria, or course modules grounded in official IIT Patna CET documents.

### 1.4 Proposed Solution: "CET AI" (AI Academic Learning & Research Assistant for CET IIT Patna)
A standalone, demonstrable **AI Academic Learning & Research Companion**. CET AI acts as a dedicated study copilot and institutional advisor that:
- Answers academic and administrative questions grounded strictly in official CET website information and syllabi.
- Enables students to upload academic PDFs (syllabi, lecture notes, research papers) and chat with them in a split-screen study workspace.
- Generates source-grounded citations so students can verify exact source pages.
- Automatically compiles structured summaries, multi-tier self-assessment quizzes, and interactive flashcards.
- Synthesizes audio overviews (podcast/audio summary style) for accessible, on-the-go auditory learning.

---

## 2. Constraints & Project Principles

To ensure successful delivery and compliance with college project parameters:

1. **Team-Friendly Simplicity:** Designed specifically for undergraduate/postgraduate student teams with diverse programming backgrounds. Avoids over-engineered enterprise microservices, Kubernetes, or complex distributed databases.
2. **Zero Live Intrusion:** Operates as an independent companion prototype. It does **not** alter, scrape without authorization, or inject code into the live `cet.iitp.ac.in` server or its backend database.
3. **Transparent Prototype Identity:** Explicitly labeled as an academic capstone demonstration. Does not mislead users into believing it is an official administrative decision system.
4. **Deterministic Source Grounding:** Prevents hallucination by requiring the AI to cite specific document chunks or official CET pages for its answers.
5. **Cost-Effective & Free-Tier Friendly:** Utilizes high-performance free/low-cost LLM APIs (e.g., Google Gemini 1.5/2.5 Flash free tier or local offline fallbacks) and open-source TTS/libraries.
6. **No API Keys in Version Control:** Strict environment variable isolation (`.env` with template `.env.example`).

---

## 3. Comparative Analysis: Existing CET Website vs. CET AI

| Dimension | Existing CET Website (`cet.iitp.ac.in`) | CET AI Capstone Enhancement |
| :--- | :--- | :--- |
| **Platform Engine** | Joomla! 4/5 CMS with Astroid Framework & PHP | Modern React (Vite) + Python FastAPI companion portal |
| **User Interaction** | One-way broadcast (menus, static tables, links) | Two-way interactive AI conversational workspace |
| **Document Handling**| Static PDF download links (`CSDA.pdf`, `AICS.pdf`) | In-browser PDF reader + contextual RAG extraction |
| **Search Capability**| Keyword search / manual menu navigation | Semantic Q&A with direct paragraph/page citations |
| **Study Tools** | None (redirects to external Moodle LMS) | Built-in Learning Studio (Summaries, Quizzes, Flashcards) |
| **Accessibility** | Visual text and downloadable PDFs only | Text-to-Speech (TTS) Audio Overview synthesis |
| **Identity & Branding**| IIT Patna colors, logos, official program names | Exact visual homage (IIT Patna Navy & Gold, academic serif typography) |

### 3.1 Preserved Institutional Elements
To ensure brand continuity and authentic institutional context, CET AI preserves:
- **Official Branding & Color Palette:** Deep Navy (`#002147`), IIT Patna Gold/Amber (`#D4AF37`), slate gray background accents, and official font hierarchy.
- **Accurate Academic Catalog:** Faithful representation of CET's official programs:
  - BS in Artificial Intelligence & Cyber Security (AICS)
  - BS in Computer Science & Data Analytics (CSDA)
  - BBA & Integrated BBA-MBA
  - MBA & MBA in Generative AI & Project Management
  - MTech in AI & DSE / CSE
  - PhD Research Programs
- **Institutional Reference Data:** Pre-indexed official knowledge base containing the Academic Calendar, Evaluation Scheme, Grading Policy, Admission guidelines, and Contact points.

---

## 4. Core Feature Specifications

### Feature 1: Academic CET Institutional Chatbot
- **Description:** A conversational assistant primed with verified information from the official CET website.
- **Capabilities:**
  - Explains program eligibility, duration, exit options under NEP 2020.
  - Answers questions on grading policies, SPI/CPI calculations, and re-exam rules from the Evaluation Scheme.
  - Directs students to official registration URLs (`registrations.iitp-cep.in`) and Moodle.
  - Employs strict system prompting to state "I don't know based on CET public records" when information is absent.

### Feature 2: PDF Upload & Split-Screen Document Q&A
- **Description:** An interactive split-screen workspace where students can upload course syllabi, lecture slides, notes, or research papers (up to 15MB).
- **Capabilities:**
  - Left pane: Interactive PDF / Document preview with page selector.
  - Right pane: Chat interface linked to the active document.
  - Multi-document support: Students can switch or query across multiple uploaded files.

### Feature 3: Source-Grounded Responses with Verifiable Citations
- **Description:** Rigorous retrieval-augmented generation (RAG) that prevents academic hallucination.
- **Capabilities:**
  - Every answer includes clickable or highlighted citation badges (e.g., `[CSDA Syllabus, Page 4]`, `[Evaluation Scheme, Sec 2.1]`).
  - Clicking a citation highlights or navigates to the relevant text section in the previewer.

### Feature 4: Automatic Academic Summarizer
- **Description:** Generates structured study guides from uploaded documents with one click.
- **Output Formats:**
  - **Executive Summary:** 3-paragraph conceptual digest.
  - **Key Terms & Definitions:** Glossaries extracted directly from content.
  - **Core Formulas / Key Takeaways:** Bulleted memory anchors.

### Feature 5: AI-Powered Assessment & Quiz Generator
- **Description:** Creates customized diagnostic assessments to test student mastery.
- **Capabilities:**
  - Generates 5 to 10 Multiple Choice Questions (MCQs) and True/False questions.
  - Interactive test-taking interface with instant score calculation.
  - Per-question explanation citing the exact source sentence.

### Feature 6: Interactive Revision Flashcards
- **Description:** Digital flashcard deck generated from key concepts in uploaded notes.
- **Capabilities:**
  - 3D card flip animation (Front: Question / Concept; Back: Explanation / Answer).
  - "Mastered" vs. "Need Review" sorting for active recall practice.

### Feature 7: Audio Overview & Audio Learning (AI Spoken Overview)
- **Description:** Synthesizes an audio discussion or spoken lecture summary of the document.
- **Capabilities:**
  - Generates a natural conversational summary script.
  - Converts text to high-clarity speech using open-source Edge-TTS or Google TTS.
  - Clean in-browser audio player with play/pause, scrub bar, and 1x/1.25x/1.5x speed controls.

---

## 5. User Personas

| Persona | Role | Key Goal | How CET AI Solves It |
| :--- | :--- | :--- | :--- |
| **Arjun (Prospective Student)** | High School / Diploma Grad | Evaluating BS AICS vs. BS CSDA eligibility & curriculum | Chats with CET Bot to compare course credits, career paths, and eligibility without downloading multiple PDFs. |
| **Pooja (Enrolled CET Student)** | 2nd Year BS Student | Preparing for Mid-Term exam in Machine Learning | Uploads lecture slide PDFs, generates 10 MCQs and flashcards, and reviews difficult formulas before class. |
| **Rohan (Commuting Student)** | Working Professional / Online Learner | Revising coursework while traveling | Listens to a 3-minute Audio Overview of the week's study material on mobile. |
| **Prof. Sharma (Instructor / TA)** | Faculty / Evaluator | Assisting students with syllabus queries | Directs students to CET AI for routine syllabus policy and grading scheme questions. |

---

## 6. Project Scope Boundaries

### In-Scope (Demonstration Ready)
- Standalone responsive web client (desktop + mobile-friendly).
- Curated institutional knowledge base (BS AICS, BS CSDA, BBA, Calendar, Evaluation Scheme).
- PDF document parsing, text extraction, and vector chunking.
- RAG conversational engine with citation extraction.
- Automatic Summarizer, MCQ Quiz generator, and Flashcards deck.
- Text-to-Speech audio overview generation with web player.
- Local SQLite database for session history and quiz records.

### Out-of-Scope (Deferred to Future Administrative Releases)
- Direct write access to IIT Patna student databases, ERP systems, or live grades.
- Automatic scraping of private student portals behind CAPTCHA or SSO credentials.
- Financial transactions for fees or application payments (links redirected to official portal).
- Real-time video generation or multi-speaker voice synthesis clone.

---

## 7. Capstone Demonstration Plan

For the final college evaluation and faculty presentation:
1. **Scenario 1: Institutional Advisor Demo**
   - Query: *"What are the exit options and total credits required for the 4-year BS in AI and Cyber Security at CET IIT Patna?"*
   - Verification: Shows grounded response quoting NEP 2020 exit points with source citation to `AICS.pdf`.
2. **Scenario 2: Student Learning Workflow**
   - Upload: A sample 10-page computer science or mathematics lecture PDF.
   - Action: Ask 2 targeted conceptual questions; observe instant page citations.
3. **Scenario 3: Active Recall & Assessment**
   - Click "Generate Quiz" -> Complete a 5-question test -> View instant feedback and explanations.
   - Click "Generate Flashcards" -> Flip through 6 interactive study cards.
4. **Scenario 4: Audio Overview Playback**
   - Click "Listen to Overview" -> Stream a 90-second synthesized audio summary directly in the browser.
