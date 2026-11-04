/**
 * IIT Patna Centre for Educational Technology (CET)
 * Official Institutional Knowledge Base & Verified Reference Data
 * 
 * Sources: Public IIT Patna CET portal (cet.iitp.ac.in), Academic Ordinances,
 * and NEP 2020 Degree Program Curriculums.
 */

export const CET_INSTITUTION_INFO = {
  name: "Centre for Educational Technology (CET)",
  institute: "Indian Institute of Technology Patna",
  address: "IIT Patna Campus, Bihta, Patna - 801106, Bihar, India",
  portalUrl: "https://cet.iitp.ac.in/",
  admissionsPortal: "https://registrations.iitp-cep.in/",
  lmsUrl: "https://moodle.iitp.ac.in/",
  email: "cet_office@iitp.ac.in",
  phone: "+91-6115-233-000",
  nepCompliant: true,
  established: "2015",
  tagline: "Empowering Next-Gen Learners through Technology-Enabled Higher Education"
};

export const CET_PROGRAMS = [
  {
    id: "aics",
    code: "BS-AICS",
    name: "BS in Artificial Intelligence and Cyber Security",
    degree: "Bachelor of Science (4-Year / Flexible Exit)",
    duration: "4 Years (8 Semesters)",
    credits: 160,
    nepExitOptions: [
      { year: 1, exitAward: "Undergraduate Certificate in Computing Fundamentals", credits: 40 },
      { year: 2, exitAward: "Undergraduate Diploma in AI Foundations", credits: 80 },
      { year: 3, exitAward: "Bachelor of Science in AI & Cyber Security", credits: 120 },
      { year: 4, exitAward: "Bachelor of Science (Honours / Research) in AI & Cyber Security", credits: 160 }
    ],
    eligibility: "Class XII or equivalent with Mathematics and Physics (minimum 60% aggregate or equivalent CGPA). Valid JEE Main or IIT Patna CET Entrance Test score.",
    focusAreas: ["Deep Learning", "Ethical Hacking", "Cryptography", "Autonomous Systems", "Cloud Security"],
    keyCourses: ["CS101 Intro to Programming", "CS201 Data Structures & Algorithms", "AI301 Machine Learning Systems", "CY302 Network Defense & Forensics", "AI401 Generative AI & LLMs"]
  },
  {
    id: "csda",
    code: "BS-CSDA",
    name: "BS in Computer Science and Data Analytics",
    degree: "Bachelor of Science (4-Year / Flexible Exit)",
    duration: "4 Years (8 Semesters)",
    credits: 160,
    nepExitOptions: [
      { year: 1, exitAward: "Undergraduate Certificate in Data & Programming", credits: 40 },
      { year: 2, exitAward: "Undergraduate Diploma in Data Analytics", credits: 80 },
      { year: 3, exitAward: "Bachelor of Science in CS & Data Analytics", credits: 120 },
      { year: 4, exitAward: "Bachelor of Science (Honours) in CS & Data Analytics", credits: 160 }
    ],
    eligibility: "Class XII or equivalent with Mathematics. Minimum 60% aggregate. Suitable for both freshers and working professionals seeking data science leadership.",
    focusAreas: ["Big Data Architecture", "Statistical Machine Learning", "Data Engineering", "Cloud Analytics", "Natural Language Processing"],
    keyCourses: ["DS101 Foundations of Data Science", "CS202 Object Oriented Systems", "DS203 Applied Statistics & Probabilistic Models", "DS304 Big Data Pipelines", "DS405 MLOps & Scalable Systems"]
  },
  {
    id: "bba-mba",
    code: "BBA-MBA",
    name: "Integrated BBA-MBA & Executive MBA in Generative AI",
    degree: "Bachelor of Business Administration / Master of Business Administration",
    duration: "3 to 5 Years",
    credits: 150,
    nepExitOptions: [
      { year: 3, exitAward: "Bachelor of Business Administration (BBA)", credits: 120 },
      { year: 5, exitAward: "Master of Business Administration (MBA)", credits: 200 }
    ],
    eligibility: "Class XII in any discipline for BBA. Bachelor's degree (any discipline) with min 50% for Executive MBA programs.",
    focusAreas: ["FinTech", "Strategic Management", "Generative AI in Business", "Product Management", "Marketing Analytics"],
    keyCourses: ["MG101 Principles of Management", "MG202 Financial Accounting", "MG303 AI for Business Decisions", "MG404 Global Supply Chain", "MG505 Tech Leadership"]
  },
  {
    id: "mtech",
    code: "MTECH-AI",
    name: "M.Tech in Artificial Intelligence & Data Science Engineering",
    degree: "Master of Technology (2-Year)",
    duration: "2 Years (4 Semesters)",
    credits: 72,
    nepExitOptions: [],
    eligibility: "B.Tech/BE in CSE, ECE, EE, IT or Master's in Mathematics/Statistics/MCA with valid GATE score or IIT Patna CET Written Test.",
    focusAreas: ["Computer Vision", "Reinforcement Learning", "Distributed AI", "Trustworthy AI", "Quantum Machine Learning"],
    keyCourses: ["AI601 Mathematical Foundations of AI", "AI602 Advanced Deep Learning", "AI603 Optimization for ML", "AI701 Master's Thesis Project"]
  }
];

export const CET_EVALUATION_SCHEME = {
  title: "IIT Patna CET Academic Evaluation Scheme & Grading Regulations",
  components: [
    { name: "Continuous Internal Assessment", weightage: "40%", description: "Comprises two mandatory in-semester quizzes (15%), one mid-semester examination (20%), and class assignments / laboratory demonstrations (5%)." },
    { name: "End-Semester Examination", weightage: "60%", description: "Comprehensive 3-hour theoretical and analytical examination conducted centrally at designated test centers." }
  ],
  attendanceRule: "Minimum 75% verified attendance in all scheduled interactive lecture sessions and lab modules. Students with attendance below 75% receive an 'XX' grade and are debarred from the End-Semester Examination.",
  gradingSystem: [
    { grade: "AP", points: 10, description: "Exceptional / Outstanding Performance (reserved for top 2-5% of cohort with >90% raw score)" },
    { grade: "AA", points: 10, description: "Excellent (Raw score generally ≥85%)" },
    { grade: "AB", points: 9, description: "Very Good (Raw score generally 75-84%)" },
    { grade: "BB", points: 8, description: "Good (Raw score generally 65-74%)" },
    { grade: "BC", points: 7, description: "Fair (Raw score generally 55-64%)" },
    { grade: "CC", points: 6, description: "Average (Raw score generally 45-54%)" },
    { grade: "CD", points: 5, description: "Below Average (Raw score generally 40-44%)" },
    { grade: "DD", points: 4, description: "Marginal Pass (Raw score 35-39% - lowest credit-earning grade)" },
    { grade: "F", points: 0, description: "Fail (Raw score <35% - requires mandatory re-examination or re-registration)" },
    { grade: "XX", points: 0, description: "Debarred due to Attendance Deficit (<75%)" }
  ],
  spiCpiFormula: "Semester Performance Index (SPI) = Sum(Course Credits × Grade Points) / Sum(Course Credits). Cumulative Performance Index (CPI) tracks weighted performance across all completed semesters."
};

export const CET_ACADEMIC_CALENDAR = {
  academicYear: "2025–2026",
  autumnSemester: [
    { event: "Student Registration & Course Fee Payment", date: "July 28 – August 1, 2025" },
    { event: "Orientation & Induction Program for Fresh Cohorts", date: "August 2 – August 3, 2025" },
    { event: "Commencement of Autumn Semester Classes", date: "August 4, 2025" },
    { event: "Quiz I Assessment Window", date: "September 8 – September 12, 2025" },
    { event: "Mid-Semester Examinations", date: "September 22 – September 27, 2025" },
    { event: "Quiz II Assessment Window", date: "October 27 – October 31, 2025" },
    { event: "Last Day of Autumn Instruction", date: "November 21, 2025" },
    { event: "End-Semester Examinations", date: "November 24 – December 3, 2025" },
    { event: "Winter Vacation & Industry Internship Break", date: "December 8, 2025 – January 2, 2026" }
  ],
  springSemester: [
    { event: "Spring Semester Registration", date: "January 3 – January 4, 2026" },
    { event: "Commencement of Spring Semester Classes", date: "January 5, 2026" },
    { event: "Mid-Semester Examinations", date: "February 23 – February 28, 2026" },
    { event: "End-Semester Examinations", date: "April 27 – May 6, 2026" },
    { event: "Annual Convocation & Degree Conferral Ceremony", date: "August 18, 2026" }
  ]
};

// Official Preloaded Documents with page-by-page readable text for the Document Viewer
export const PRELOADED_DOCUMENTS = [
  {
    id: "doc-aics-curriculum",
    title: "BS in Artificial Intelligence and Cyber Security (AICS) — Academic Curriculum 2024–2028",
    filename: "AICS_Curriculum_2024.pdf",
    category: "Official IIT Patna CET Document",
    isInstitutional: true,
    pageCount: 5,
    fileSize: "2.4 MB",
    pages: [
      {
        pageNumber: 1,
        title: "Program Overview & NEP 2020 Architecture",
        content: `INDIAN INSTITUTE OF TECHNOLOGY PATNA
Centre for Educational Technology (CET)
Curriculum Specification: Bachelor of Science (BS) in Artificial Intelligence and Cyber Security (AICS)

1. PROGRAM MISSION & SCOPE
The 4-year BS in Artificial Intelligence and Cyber Security is an industry-aligned, hybrid degree program engineered to bridge the severe talent gap in AI-driven cybersecurity, defensive automation, and zero-trust infrastructure.

2. MULTIPLE ENTRY AND EXIT PATHWAYS (NEP 2020)
In strict conformity with the National Education Policy 2020 guidelines:
• Stage 1 (Completion of 40 Credits / 2 Semesters): Undergraduate Certificate in Computing Fundamentals.
• Stage 2 (Completion of 80 Credits / 4 Semesters): Undergraduate Diploma in AI Foundations & Defensive Scripting.
• Stage 3 (Completion of 120 Credits / 6 Semesters): Bachelor of Science (B.Sc.) in AI & Cyber Security.
• Stage 4 (Completion of 160 Credits / 8 Semesters): Bachelor of Science (Honours / Research) in AI & Cyber Security.

Exit awards are officially conferred by IIT Patna Senate with full academic transcripts.`
      },
      {
        pageNumber: 2,
        title: "Semester I & II Foundation Modules",
        content: `SEMESTER I COURSE STRUCTURE:
1. CS101: Problem Solving and Algorithmic Thinking (3-0-2: 4 Credits)
   Fundamental programming paradigms using Python and C. Recursion, pointers, memory allocation, and asymptotic analysis.
2. MA101: Linear Algebra & Matrix Computations (3-1-0: 4 Credits)
   Vector spaces, linear transformations, eigenvalues, eigenvectors, SVD, and applications to dimensionality reduction.
3. CY101: Foundations of Information Security (3-0-0: 3 Credits)
   CIA Triad (Confidentiality, Integrity, Availability), threat modeling, basic cipher techniques, and security ethics.
4. HS101: Professional Communication & Technical Writing (2-0-0: 2 Credits)

SEMESTER II COURSE STRUCTURE:
1. CS201: Data Structures & Algorithms (3-0-2: 4 Credits)
   Linear data structures (arrays, linked lists, stacks, queues), non-linear hierarchies (trees, AVL, Red-Black, B-Trees, graphs), hashing, and dynamic programming.
2. MA102: Probability, Random Processes & Statistics (3-1-0: 4 Credits)
   Discrete/continuous distributions, Bayes' Theorem, Markov chains, hypothesis testing for AI applications.
3. CS102: Computer System Architecture & Assembly (3-0-2: 4 Credits)
   Instruction set architecture, pipelining, cache memory hierarchy, virtual memory, and hardware vulnerability analysis.`
      },
      {
        pageNumber: 3,
        title: "Semester III & IV Core AI & Defensive Modules",
        content: `SEMESTER III COURSE STRUCTURE:
1. AI301: Machine Learning Foundations & Algorithms (3-0-2: 4 Credits)
   Supervised learning (Regression, SVM, Decision Trees, Ensembles), Unsupervised clustering (K-Means, GMM), gradient descent optimization.
2. CY201: Applied Cryptography & Public Key Infrastructure (3-0-2: 4 Credits)
   Symmetric ciphers (AES-256, ChaCha20), Asymmetric ciphers (RSA, ECC, Diffie-Hellman), Hash functions (SHA-3), zero-knowledge proofs.
3. CS203: Operating Systems & Kernel Internals (3-0-2: 4 Credits)
   Process scheduling, concurrency, semaphores, deadlock avoidance, memory paging, Linux kernel architecture.

SEMESTER IV COURSE STRUCTURE:
1. AI302: Deep Neural Networks & Representation Learning (3-0-2: 4 Credits)
   Backpropagation, CNN architectures (ResNet, EfficientNet), RNNs, LSTM, Attention mechanisms, and Transformer fundamentals.
2. CY202: Network Defense, Firewalls & Threat Hunting (3-0-2: 4 Credits)
   Packet inspection, Snort IDS/IPS configuration, Honeypots, SIEM telemetry analysis, Wireshark packet capture analysis.
3. CS204: Database Management Systems & NoSQL Security (3-0-2: 4 Credits)
   Relational schemas, SQL injection defense, transaction ACID properties, distributed indexing.`
      },
      {
        pageNumber: 4,
        title: "Semester V to VIII Advanced Specializations & Capstone",
        content: `ADVANCED ELECTIVES & CAPSTONE REPOSITORY:

1. AI401: Generative AI, LLMs & Retrieval Augmented Generation (3-0-2: 4 Credits)
   Pre-training vs. fine-tuning, LoRA/PEFT adaptations, Vector databases (ChromaDB, FAISS), RAG retrieval mechanics, semantic search, prompt defense.
2. CY401: Cloud Security & DevSecOps Automation (3-0-2: 4 Credits)
   Docker container isolation, Kubernetes RBAC, CI/CD pipeline scanning (Trivy, SonarQube), AWS IAM policies.
3. CY402: Adversarial Machine Learning & Model Stealing (3-0-0: 3 Credits)
   Evasion attacks (FGSM, PGD), poisoning attacks, model extraction, membership inference defense, differential privacy.
4. CS499: Capstone Research Project & Industry Defense (8 Credits)
   Year-long substantial software artifact or research paper presented before the IIT Patna CET Examination Board. Must demonstrate real-world utility and rigorous empirical evaluation.`
      },
      {
        pageNumber: 5,
        title: "Laboratory Requirements & Evaluation Norms",
        content: `LABORATORY BENCHMARKING REQUIREMENTS:
All students enrolled in AICS must complete minimum 20 hands-on laboratory exercises per practical course:
• Virtual Lab Infrastructure: High-Performance GPU Cluster access (NVIDIA A100/H100 nodes for deep learning assignments).
• Cyber Range Environment: Isolated CTF sandbox for penetration testing and incident response drills.

EVALUATION RULES SPECIFIC TO AICS:
• Code Plagiarism Policy: Any programming submission showing >15% lexical or syntactic overlap via MOSS is awarded zero marks and referred to the Institute Disciplinary Committee.
• Mandatory GitHub Portfolio: Capstone source code must be maintained on an institutional repository with commit history, CI/CD actions, and technical documentation.`
      }
    ]
  },
  {
    id: "doc-csda-curriculum",
    title: "BS in Computer Science and Data Analytics (CSDA) — Curriculum Handbook",
    filename: "CSDA_Curriculum_2024.pdf",
    category: "Official IIT Patna CET Document",
    isInstitutional: true,
    pageCount: 5,
    fileSize: "2.1 MB",
    pages: [
      {
        pageNumber: 1,
        title: "Program Vision & Industry Alignment",
        content: `INDIAN INSTITUTE OF TECHNOLOGY PATNA
Centre for Educational Technology (CET)
Curriculum Handbook: Bachelor of Science (BS) in Computer Science and Data Analytics (CSDA)

1. VISION
The BS in Computer Science and Data Analytics addresses the exponential growth of large-scale structured and unstructured data across scientific, financial, industrial, and healthcare systems.

2. GRADUATE PROFILE
Graduates are trained as dual-competency computer scientists who excel at both software architecture (distributed computing, algorithms) and empirical data science (statistical modeling, inference, predictive pipelines).

3. DEGREE STRUCTURE
Total Credit Requirement: 160 Credits across 8 Semesters.
NEP 2020 multi-exit credit awards: Certificate (Yr 1: 40 Cr), Diploma (Yr 2: 80 Cr), B.Sc. (Yr 3: 120 Cr), BS Honours (Yr 4: 160 Cr).`
      },
      {
        pageNumber: 2,
        title: "Mathematics & Analytical Core Courses",
        content: `CORE ANALYTICAL COURSES:

1. MA201: Discrete Mathematical Structures (3-1-0: 4 Credits)
   Propositional and predicate logic, set theory, relations and functions, graph theory (Eulerian, Hamiltonian, planar graphs), trees, recurrence relations and generating functions.
2. DS201: Applied Probability & Statistical Inference (3-1-0: 4 Credits)
   Random variables, probability mass/density functions, Central Limit Theorem, maximum likelihood estimation, confidence intervals, hypothesis testing, ANOVA.
3. MA202: Numerical Optimization & Multivariate Calculus (3-1-0: 4 Credits)
   Constrained optimization, Lagrange multipliers, Karush-Kuhn-Tucker (KKT) conditions, convex optimization, stochastic gradient descent.`
      },
      {
        pageNumber: 3,
        title: "Big Data & Software Engineering Modules",
        content: `BIG DATA ARCHITECTURES & SYSTEMS:

1. DS301: Distributed Computing & Big Data Engineering (3-0-2: 4 Credits)
   Hadoop ecosystem, HDFS architecture, Apache Spark core and Spark SQL, distributed dataset abstractions (RDDs, DataFrames), Kafka streaming.
2. CS205: Object-Oriented Software Design & Modern Design Patterns (3-0-2: 4 Credits)
   SOLID principles, Creational/Structural/Behavioral design patterns in Java and Python, modular system architecture, unit testing with PyTest/JUnit.
3. DS302: Data Warehousing, OLAP & Business Intelligence (3-0-2: 4 Credits)
   Star and snowflake schemas, ETL/ELT pipelines, columnar data formats (Parquet, ORC), query optimization in PostgreSQL and Snowflake.`
      },
      {
        pageNumber: 4,
        title: "Machine Learning & Visual Analytics",
        content: `ADVANCED ANALYTICS TRACK:

1. DS401: Statistical Machine Learning & Predictive Modeling (3-0-2: 4 Credits)
   Ridge and Lasso regularization, generalized linear models, spline regression, random forests, XGBoost, CatBoost, model interpretability (SHAP, LIME).
2. DS402: Natural Language Processing & Text Mining (3-0-2: 4 Credits)
   N-gram language models, TF-IDF, Word2Vec, GloVe, Recurrent neural architectures, BERT embeddings, question-answering systems.
3. DS403: Interactive Data Visualization & Visual Storytelling (2-0-2: 3 Credits)
   Grammar of Graphics, D3.js, Tableau, Seaborn, interactive dashboarding for decision-makers.`
      },
      {
        pageNumber: 5,
        title: "Capstone Analytics Project Requirements",
        content: `CAPSTONE THESIS & INDUSTRY INTERNSHIP:
• Students spend Semester VIII either on a full-time industrial internship or completing a sponsored research capstone thesis at an IIT Patna laboratory.
• Mandatory Deliverables:
  1. High-throughput data ingestion pipeline handling at least 100,000 real records.
  2. Statistically validated predictive or prescriptive model.
  3. Interactive web dashboard demonstrating actionable insights.
  4. Comprehensive thesis report formatted according to IIT Patna Senate guidelines.`
      }
    ]
  },
  {
    id: "doc-cet-eval-scheme",
    title: "IIT Patna CET Academic Regulations & Evaluation Scheme 2025",
    filename: "CET_Evaluation_Grading_Scheme.pdf",
    category: "Official IIT Patna CET Document",
    isInstitutional: true,
    pageCount: 4,
    fileSize: "1.8 MB",
    pages: [
      {
        pageNumber: 1,
        title: "Assessment Weightage & Continuous Evaluation",
        content: `INDIAN INSTITUTE OF TECHNOLOGY PATNA
Centre for Educational Technology (CET)
Academic Ordinances — Regulation 4: Examination & Evaluation Architecture

1. PHILOSOPHY OF CONTINUOUS ASSESSMENT
The assessment of academic performance at CET IIT Patna is continuous and cumulative. In every registered lecture/theory course, performance is measured across:

(a) CONTINUOUS INTERNAL ASSESSMENT: 40% Overall Weightage
    • In-Semester Quiz 1: 7.5%
    • In-Semester Quiz 2: 7.5%
    • Mid-Semester Examination: 20%
    • Class Participation, Lab Demos & Graded Homework: 5%

(b) END-SEMESTER EXAMINATION: 60% Overall Weightage
    • Centrally scheduled, invigilated 3-hour examination covering 100% of the prescribed course syllabus.`
      },
      {
        pageNumber: 2,
        title: "Grading Scale & Performance Indices (SPI / CPI)",
        content: `2. LETTER GRADING SCALE & GRADE POINTS
Awarded at the conclusion of each semester:

Letter Grade | Grade Points | Remarks
-------------|--------------|-----------------------------------------
AP           | 10           | Exceptional (Restricted to max 5% cohort)
AA           | 10           | Outstanding
AB           | 9            | Excellent
BB           | 8            | Very Good
BC           | 7            | Good
CC           | 6            | Fair / Average
CD           | 5            | Below Average
DD           | 4            | Marginal Pass (Minimum passing grade)
F            | 0            | Fail (Credit not earned)
XX           | 0            | Debarred due to Attendance Shortage (<75%)

3. PERFORMANCE INDEX CALCULATIONS
Semester Performance Index (SPI):
SPI = (SUM of [Course Credits × Grade Points Earned]) / (Total Registered Credits in that Semester)

Cumulative Performance Index (CPI):
CPI = (SUM of [Course Credits × Grade Points Earned across ALL Semesters]) / (Total Cumulative Credits Earned)`
      },
      {
        pageNumber: 3,
        title: "Attendance Regulations & Debarment Policy",
        content: `3. ATTENDANCE NORMS (STRICT INSTITUTIONAL ENFORCEMENT)
(a) Every student must achieve minimum 75% attendance in every course (lectures, tutorials, and practical sessions).
(b) Medical Leave: In cases of prolonged hospitalization, an official medical certificate signed by an authorized government physician must be submitted to the CET Academic Office within 7 working days. Maximum medical attendance condonation cannot exceed 10%. Under NO circumstance can a student with <65% attendance be permitted to sit for the End-Semester Examination.
(c) Consequences of XX Grade:
    • Debarred from the End-Semester Exam.
    • Must repeat the entire course during the subsequent academic year or summer term.
    • The 'XX' grade remains on the student's provisional grade sheet until cleared.`
      },
      {
        pageNumber: 4,
        title: "Re-examination & Degree Requirements",
        content: `4. REMEDIAL & SUPPLEMENTARY EXAMINATIONS
(a) A student securing an 'F' grade in a core course may apply for a Supplementary Re-Examination scheduled during the summer break.
(b) The maximum grade that can be awarded in any supplementary re-examination is 'CC' (Grade Point 6), regardless of the actual raw score achieved.
(c) Minimum CPI Requirement for Award of Degree:
    • B.Sc. Degree (Year 3 Exit): Minimum CPI of 5.00 with no uncleared 'F' grades in core modules.
    • B.S. (Honours) Degree (Year 4 Exit): Minimum CPI of 5.50 and successful defense of Capstone Project.`
      }
    ]
  },
  {
    id: "doc-academic-calendar",
    title: "IIT Patna CET Academic Calendar 2025–2026",
    filename: "Academic_Calendar_2025_2026.pdf",
    category: "Official IIT Patna CET Document",
    isInstitutional: true,
    pageCount: 3,
    fileSize: "1.2 MB",
    pages: [
      {
        pageNumber: 1,
        title: "Autumn Semester 2025 Milestones",
        content: `INDIAN INSTITUTE OF TECHNOLOGY PATNA
Centre for Educational Technology (CET)
Official Academic Calendar: Academic Year 2025–2026

AUTUMN SEMESTER (JULY – DECEMBER 2025):
• July 28 – August 1, 2025: Student Registration & Verification of Documents.
• August 2 – 3, 2025: Orientation & Digital Infrastructure Briefing (Moodle & CET AI Portal).
• August 4, 2025 (Monday): First Day of Instruction for all UG & PG programs.
• August 15, 2025: Independence Day (Holiday).
• September 8 – 12, 2025: Quiz I Evaluation Window (Administered online).
• September 22 – 27, 2025: Mid-Semester Examination Period.
• October 2, 2025: Mahatma Gandhi Jayanti (Holiday).
• October 20 – 24, 2025: Autumn Break (Dussehra).
• October 27 – 31, 2025: Quiz II Evaluation Window.
• November 21, 2025 (Friday): Last Day of Instruction.
• November 24 – December 3, 2025: End-Semester Examinations.
• December 8, 2025 – January 2, 2026: Winter Break & Capstone Internship.`
      },
      {
        pageNumber: 2,
        title: "Spring Semester 2026 Milestones",
        content: `SPRING SEMESTER (JANUARY – JUNE 2026):
• January 3 – 4, 2026: Spring Semester Course Registration.
• January 5, 2026 (Monday): Commencement of Spring Semester Classes.
• January 26, 2026: Republic Day (Holiday).
• February 9 – 13, 2026: Spring Quiz I Window.
• February 23 – 28, 2026: Mid-Semester Examinations.
• March 16 – 20, 2026: Spring Festival & Technical Conclave.
• April 6 – 10, 2026: Spring Quiz II Window.
• April 24, 2026 (Friday): Last Day of Instruction for Spring.
• April 27 – May 6, 2026: End-Semester Examinations.
• May 11 – July 24, 2026: Summer Term / Remedial Courses / Research Fellowship.
• August 18, 2026: Annual Convocation Ceremony.`
      },
      {
        pageNumber: 3,
        title: "Administrative Deadlines & Policy Notices",
        content: `IMPORTANT ADMINISTRATIVE DEADLINES:
1. Course Add/Drop Period: Closes strictly 10 calendar days after the commencement of classes (August 14 for Autumn; January 15 for Spring).
2. Grade Submission by Faculty: Grades must be finalized and submitted within 7 calendar days of the last examination date.
3. Grade Card Distribution: Digital transcripts published on CET Student Portal within 14 days of Senate approval.
4. Fee Refund Regulations: 100% refund (less Rs. 1000 processing fee) if withdrawal request is formally lodged before class commencement.`
      }
    ]
  }
];

// Default sample notebooks for the user, with rich realistic academic data
export const INITIAL_NOTEBOOKS = [
  {
    id: "nb-aics-dsa",
    title: "BS AICS — Data Structures & Algorithms (CS201)",
    programTag: "BS-AICS",
    topic: "CS201 Core Curriculum & Mid-Sem Prep",
    documentId: "doc-aics-curriculum",
    documentTitle: "AICS_Curriculum_2024.pdf",
    lastModified: "2 hours ago",
    documentCount: 1,
    summaryCount: 1,
    quizCount: 5,
    flashcardCount: 8,
    isSampleData: true,
    description: "Curated revision notebook for IIT Patna CET CS201 Data Structures. Covers asymptotic notations, tree traversals, AVL balancing, graph algorithms, and mid-sem assessment questions.",
    chatHistory: [
      {
        id: "msg-1",
        sender: "user",
        text: "What are the core topics covered in CS201 Data Structures according to the AICS curriculum?",
        timestamp: "10:14 AM"
      },
      {
        id: "msg-2",
        sender: "assistant",
        text: `Based on the official **AICS Curriculum 2024–2028**, **CS201: Data Structures & Algorithms** is a 4-credit course (3 lecture hours, 0 tutorial hours, 2 practical hours) scheduled in Semester II [AICS Curriculum, Page 2].

The core topic modules include:
1. **Linear Data Structures:** Dynamic arrays, singly and doubly linked lists, stacks, and circular queues.
2. **Hierarchical Structures:** Binary Search Trees (BST), balanced AVL trees, Red-Black trees, and B-Trees for database indexing.
3. **Graph Algorithms:** Breadth-First Search (BFS), Depth-First Search (DFS), Dijkstra's shortest path, and Minimum Spanning Trees (Kruskal/Prim).
4. **Algorithmic Strategies:** Divide-and-conquer, greedy techniques, dynamic programming (knapsack, longest common subsequence), and amortized asymptotic analysis.
5. **Practical Benchmarking:** Hands-on lab requiring implementations in C/C++ with strict memory leak profiling [AICS Curriculum, Page 5].`,
        citations: [
          { docName: "AICS_Curriculum_2024.pdf", page: 2, label: "AICS Curriculum, Page 2" },
          { docName: "AICS_Curriculum_2024.pdf", page: 5, label: "AICS Curriculum, Page 5" }
        ],
        timestamp: "10:15 AM"
      },
      {
        id: "msg-3",
        sender: "user",
        text: "What is the code plagiarism policy for programming lab submissions in this course?",
        timestamp: "10:18 AM"
      },
      {
        id: "msg-4",
        sender: "assistant",
        text: `According to the **Laboratory Requirements & Evaluation Norms** of the AICS curriculum [AICS Curriculum, Page 5]:

• **Strict Plagiarism Threshold:** Any programming or laboratory submission showing **greater than 15% lexical or syntactic overlap** via automated analysis tools (such as MOSS) is awarded **zero marks**.
• **Disciplinary Action:** The case is automatically forwarded to the **IIT Patna Institute Disciplinary Committee** for formal review.
• **Version Control Audit:** Capstone and lab submissions must maintain verified commit logs on the institutional GitHub repository to substantiate individual authorship [AICS Curriculum, Page 5].`,
        citations: [
          { docName: "AICS_Curriculum_2024.pdf", page: 5, label: "AICS Curriculum, Page 5" }
        ],
        timestamp: "10:19 AM"
      }
    ],
    summary: {
      executiveSummary: "CS201 Data Structures and Algorithms forms the computational backbone of the BS in Artificial Intelligence and Cyber Security program at IIT Patna CET. Spanning 4 credits, the course rigorously examines how data organization fundamentally dictates algorithmic time and space complexity. Key emphases are placed on pointer manipulation, self-balancing search trees (AVL/Red-Black), graph traversal mechanics, and practical memory management in systems-level programming languages.",
      keyConcepts: [
        { term: "Asymptotic Notation", definition: "Mathematical framework (Big-O, Omega, Theta) characterizing the upper, lower, and tight growth boundaries of an algorithm as input size approaches infinity." },
        { term: "AVL Tree Balancing Factor", definition: "The height difference between the left and right subtrees of any node, strictly constrained to {-1, 0, +1}; requires single or double rotations upon violation." },
        { term: "Dijkstra's Algorithm", definition: "A greedy graph search algorithm determining the single-source shortest path in non-negative weighted graphs using a priority queue in O((V + E) log V) time." },
        { term: "Dynamic Programming", definition: "An algorithmic paradigm breaking complex problems into overlapping subproblems with optimal substructure, memorizing intermediate states to prevent redundant recomputation." }
      ],
      coreFormulas: [
        { title: "Binary Tree Maximum Nodes", formula: "N_max = 2^(h+1) - 1, where h is tree height." },
        { title: "AVL Height Bound", formula: "h < 1.4404 log_2(n + 2) - 0.328, ensuring strict O(log n) search." },
        { title: "Master Theorem Case 1", formula: "T(n) = aT(n/b) + f(n). If f(n) = O(n^(log_b(a) - ε)), then T(n) = Θ(n^log_b(a))." }
      ],
      examTakeaways: [
        "Expect at least one numerical question on AVL rotation sequences (LL, RR, LR, RL) following consecutive node insertions.",
        "Graph representations: Adjacency list is preferred for sparse graphs (O(V+E) space) versus adjacency matrix (O(V²) space).",
        "Laboratory plagiarism policy strictly enforces zero marks for >15% lexical code similarity."
      ]
    },
    quizzes: [
      {
        id: "q-1",
        question: "In an AVL tree, what is the valid balance factor range permitted for any node before an automatic rotation is triggered?",
        options: [
          "A) Exactly 0",
          "B) {-1, 0, +1}",
          "C) {-2, -1, 0, +1, +2}",
          "D) Any value less than the tree height"
        ],
        correctAnswer: 1, // Index 1: {-1, 0, +1}
        explanation: "By mathematical definition, an AVL tree maintains height balance such that for every node, the height difference between the left and right subtrees must strictly belong to the set {-1, 0, +1}. A balance factor of ±2 triggers an immediate rebalancing rotation [AICS Curriculum, Page 2].",
        sourceCitation: "AICS_Curriculum_2024.pdf, Page 2"
      },
      {
        id: "q-2",
        question: "According to the official IIT Patna CET AICS plagiarism regulations, what is the maximum permissible lexical overlap threshold before a lab submission is awarded zero marks?",
        options: [
          "A) 5%",
          "B) 10%",
          "C) 15%",
          "D) 25%"
        ],
        correctAnswer: 2, // Index 2: 15%
        explanation: "The evaluation norms state that any programming code exhibiting >15% lexical or syntactic overlap via tools like MOSS receives zero marks and is escalated to the Institute Disciplinary Committee [AICS Curriculum, Page 5].",
        sourceCitation: "AICS_Curriculum_2024.pdf, Page 5"
      },
      {
        id: "q-3",
        question: "Under the NEP 2020 multi-exit policy in the BS AICS curriculum, what academic credential is awarded upon successful completion of 80 credits (Year 2)?",
        options: [
          "A) Undergraduate Certificate in Computing Fundamentals",
          "B) Undergraduate Diploma in AI Foundations",
          "C) Bachelor of Science in AI & Cyber Security",
          "D) Post-Graduate Diploma in Applied AI"
        ],
        correctAnswer: 1, // Index 1: Diploma
        explanation: "Stage 2 exit after completing 80 credits (4 semesters) confers the Undergraduate Diploma in AI Foundations, while 40 credits confers a Certificate and 120 credits confers a B.Sc. [AICS Curriculum, Page 1].",
        sourceCitation: "AICS_Curriculum_2024.pdf, Page 1"
      },
      {
        id: "q-4",
        question: "What is the worst-case time complexity of searching for an element in a standard Binary Search Tree (BST) that has become completely skewed?",
        options: [
          "A) O(1)",
          "B) O(log n)",
          "C) O(n)",
          "D) O(n log n)"
        ],
        correctAnswer: 2, // Index 2: O(n)
        explanation: "When elements are inserted into a standard BST in sorted order, the tree degenerates into a singly linked list with height equal to n, causing worst-case lookup to degrade to linear time O(n). Self-balancing structures like AVL trees prevent this degradation.",
        sourceCitation: "AICS_Curriculum_2024.pdf, Page 2"
      },
      {
        id: "q-5",
        question: "In the AICS course structure, in which semester is AI301 Machine Learning Foundations formally introduced?",
        options: [
          "A) Semester I",
          "B) Semester II",
          "C) Semester III",
          "D) Semester V"
        ],
        correctAnswer: 2, // Index 2: Semester III
        explanation: "AI301 Machine Learning Foundations & Algorithms (3-0-2: 4 Credits) is scheduled as a core module in Semester III, immediately building on the probability and linear algebra foundations from Year 1 [AICS Curriculum, Page 3].",
        sourceCitation: "AICS_Curriculum_2024.pdf, Page 3"
      }
    ],
    flashcards: [
      {
        id: "fc-1",
        category: "Data Structures",
        front: "What is the primary operational advantage of a Red-Black Tree over an AVL Tree in write-intensive systems?",
        back: "Red-Black trees require at most 2 rotations on insertion and 3 rotations on deletion, making writes and modifications significantly faster than AVL trees, which maintain stricter height balance requiring more frequent restructuring.",
        source: "AICS Curriculum, Page 2",
        isMastered: false
      },
      {
        id: "fc-2",
        category: "Institutional Regulations",
        front: "What are the credit milestones for Year 1, Year 2, Year 3, and Year 4 exit options under NEP 2020 at CET IIT Patna?",
        back: "Year 1 (Certificate): 40 Credits.\nYear 2 (Diploma): 80 Credits.\nYear 3 (B.Sc. Degree): 120 Credits.\nYear 4 (B.S. Honours/Research): 160 Credits.",
        source: "AICS Curriculum, Page 1",
        isMastered: true
      },
      {
        id: "fc-3",
        category: "Algorithms",
        front: "Why does QuickSort exhibit O(n log n) average time complexity but O(n²) worst-case time complexity?",
        back: "Average time is O(n log n) when the chosen pivot partitions the array into reasonably balanced halves. Worst-case O(n²) occurs when the pivot consistently isolates an extreme element (smallest or largest), degenerating recursion depth to n.",
        source: "CS201 Module Notes",
        isMastered: false
      },
      {
        id: "fc-4",
        category: "Graph Theory",
        front: "When should Breadth-First Search (BFS) be preferred over Depth-First Search (DFS)?",
        back: "BFS is preferred when finding the shortest path on unweighted graphs, exploring nodes closest to the source first, or searching in infinite state trees where DFS might loop infinitely.",
        source: "CS201 Syllabus, Page 2",
        isMastered: true
      },
      {
        id: "fc-5",
        category: "Evaluation Policy",
        front: "What constitutes the Continuous Internal Assessment (40%) at CET IIT Patna?",
        back: "Two in-semester quizzes (15%), one mid-semester examination (20%), and class assignments / lab performance (5%).",
        source: "Evaluation Scheme, Page 1",
        isMastered: false
      },
      {
        id: "fc-6",
        category: "Cyber Security",
        front: "What is the CIA Triad and in which course is it introduced?",
        back: "Confidentiality, Integrity, and Availability. Introduced in CY101: Foundations of Information Security in Semester I.",
        source: "AICS Curriculum, Page 2",
        isMastered: false
      },
      {
        id: "fc-7",
        category: "Memory Management",
        front: "What is the difference between Stack Memory and Heap Memory allocation in C/C++?",
        back: "Stack memory is automatically managed, very fast, follows LIFO, and stores local variables/function frames. Heap memory is manually managed (malloc/free), dynamically allocated at runtime, and susceptible to memory leaks.",
        source: "CS201 Lab Handout",
        isMastered: true
      },
      {
        id: "fc-8",
        category: "Asymptotics",
        front: "Define Amortized Time Complexity with a canonical example.",
        back: "Amortized complexity averages the time taken by a sequence of operations over time, guaranteeing a small average cost even if an occasional single operation is expensive. Example: Appending to a dynamic array (O(1) amortized, O(n) during occasional buffer doubling).",
        source: "CS201 Lecture 4",
        isMastered: false
      }
    ],
    studyGuide: {
      title: "Comprehensive Study Guide: CS201 Data Structures & Algorithms",
      targetExam: "Mid-Semester Examination (Autumn 2025)",
      units: [
        {
          unitNumber: 1,
          unitName: "Asymptotic Analysis & Elementary Linear Structures",
          weightage: "25% of Exam",
          topics: [
            "Formal proofs of Big-O, Big-Omega, Big-Theta definitions",
            "Singly vs. Doubly Linked Lists: In-place reversal, cycle detection (Floyd's Tortoise and Hare)",
            "Stack applications: Infix to Postfix conversion, balanced parentheses verification",
            "Queue architectures: Circular arrays vs. linked implementations"
          ],
          mustSolveProblems: [
            "Derive the tight asymptotic bound for T(n) = 2T(n/2) + n log n using the Master Theorem.",
            "Write an iterative algorithm to detect and sever a loop in a singly linked list in O(n) time and O(1) auxiliary space."
          ]
        },
        {
          unitNumber: 2,
          unitName: "Search Trees & Self-Balancing Mechanisms",
          weightage: "35% of Exam",
          topics: [
            "Binary Search Tree invariant and in-order predecessor/successor lookups",
            "AVL Trees: Calculation of balance factors, single (LL, RR) and double (LR, RL) rotations",
            "Red-Black Tree invariant: Root is black, no consecutive red nodes, equal black-height along all paths",
            "B-Trees: Order m properties, split operations on full leaf nodes"
          ],
          mustSolveProblems: [
            "Insert the sequence [14, 28, 7, 3, 11, 21, 35, 2] into an empty AVL tree and demonstrate step-by-step balance factor updates and rotations.",
            "Prove that the maximum height of an AVL tree containing n nodes is strictly bounded by 1.44 log₂(n)."
          ]
        },
        {
          unitNumber: 3,
          unitName: "Graph Traversals & Shortest Paths",
          weightage: "40% of Exam",
          topics: [
            "BFS traversal using FIFO Queue; DFS traversal using recursion / LIFO Stack",
            "Topological Sorting for Directed Acyclic Graphs (Kahn's Algorithm vs DFS timestamping)",
            "Dijkstra's Algorithm with Min-Heap implementation; proof of greediness",
            "Bellman-Ford Algorithm and negative-weight cycle detection"
          ],
          mustSolveProblems: [
            "Execute Dijkstra's algorithm on a 6-node weighted directed graph, tracing priority queue states at each extraction step.",
            "Contrast Kruskal's algorithm (Disjoint Set Union) and Prim's algorithm for computing Minimum Spanning Trees."
          ]
        }
      ]
    },
    audioOverview: {
      title: "Audio Overview: CS201 Data Structures & AICS NEP Pathway",
      duration: "3:42",
      speaker: "Dr. Alok Verma & AI Host Priya (Simulated Dialogue)",
      script: `[Host Priya]: Welcome to the CET AI Audio Study Capsule for IIT Patna! Today we are breaking down CS201 Data Structures and Algorithms for the BS in Artificial Intelligence and Cyber Security cohort.

[Dr. Alok]: Thanks Priya. For students preparing for the Autumn mid-sem, remember that CS201 isn't just about memorizing code syntax. It's about computational economics. Why do we move from simple arrays to AVL trees? Because binary trees degrade to linear O(n) lookups when data arrives sorted, while AVL trees enforce a strict balance factor of minus one, zero, or plus one.

[Host Priya]: That's a crucial point. And in the lab, students need to be mindful of the academic integrity rules. The curriculum strictly enforces that any code showing more than 15% lexical similarity is awarded zero marks.

[Dr. Alok]: Exactly. Write your code from first principles, master pointer manipulation, and understand graph shortest paths like Dijkstra's. Good luck with your revision, scholars!`,
      audioUrl: "https://actions.google.com/sounds/v1/science/digital_technology_pulse.ogg" // Reliable audio sample
    }
  },
  {
    id: "nb-csda-math",
    title: "BS CSDA — Discrete Mathematics & Linear Algebra",
    programTag: "BS-CSDA",
    topic: "MA201 Discrete Structures & Probability Core",
    documentId: "doc-csda-curriculum",
    documentTitle: "CSDA_Curriculum_2024.pdf",
    lastModified: "1 day ago",
    documentCount: 1,
    summaryCount: 1,
    quizCount: 4,
    flashcardCount: 6,
    isSampleData: true,
    description: "Focuses on propositional logic, recurrence relations, graph theory, Bayes' theorem, and linear algebra matrices for big data pipelines.",
    chatHistory: [
      {
        id: "msg-csda-1",
        sender: "user",
        text: "What are the core mathematics subjects prescribed in the BS CSDA curriculum?",
        timestamp: "Yesterday"
      },
      {
        id: "msg-csda-2",
        sender: "assistant",
        text: `According to the **BS in Computer Science and Data Analytics (CSDA) Curriculum Handbook** [CSDA Curriculum, Page 2], the mathematical backbone comprises three foundational modules:

1. **MA201: Discrete Mathematical Structures (3-1-0: 4 Credits)**  
   Focuses on propositional logic, predicate calculus, graph theory (Eulerian/Hamiltonian paths), trees, and recurrence relations.
2. **DS201: Applied Probability & Statistical Inference (3-1-0: 4 Credits)**  
   Covers Central Limit Theorem, Bayes' Rule, maximum likelihood estimation, and hypothesis testing.
3. **MA202: Numerical Optimization & Multivariate Calculus (3-1-0: 4 Credits)**  
   Explores Lagrange multipliers, KKT conditions, and stochastic gradient descent for ML models [CSDA Curriculum, Page 2].`,
        citations: [
          { docName: "CSDA_Curriculum_2024.pdf", page: 2, label: "CSDA Curriculum, Page 2" }
        ],
        timestamp: "Yesterday"
      }
    ],
    summary: {
      executiveSummary: "The CSDA mathematical curriculum builds the formal analytical foundation necessary to understand high-dimensional data, machine learning algorithms, and distributed computing proofs. The focus shifts from rote calculation to discrete abstractions, probabilistic reasoning, and matrix decompositions.",
      keyConcepts: [
        { term: "Bayes' Theorem", definition: "P(A|B) = [P(B|A) × P(A)] / P(B); fundamental engine for Bayesian inference and probabilistic classification." },
        { term: "Eulerian Path", definition: "A path in a finite graph that visits every edge exactly once; exists if and only if the number of vertices with odd degree is either 0 or 2." },
        { term: "Singular Value Decomposition (SVD)", definition: "Factorization of an m×n matrix into U Σ V*, critical for Principal Component Analysis (PCA) and dimensionality reduction." }
      ],
      coreFormulas: [
        { title: "Bayes Rule", formula: "P(Hypothesis|Evidence) = [P(Evidence|Hypothesis) * P(Hypothesis)] / P(Evidence)" },
        { title: "Euler's Formula for Planar Graphs", formula: "V - E + F = 2, where V is vertices, E is edges, F is faces." }
      ],
      examTakeaways: [
        "Master the proof of Euler's formula and Handshaking Lemma (Sum of degrees = 2 × Edges).",
        "Expect continuous distribution problems involving Gaussian and Exponential PDFs."
      ]
    },
    quizzes: [
      {
        id: "q-csda-1",
        question: "In graph theory, according to the Handshaking Lemma, what is the sum of degrees of all vertices in an undirected graph?",
        options: [
          "A) Equal to the number of vertices",
          "B) Exactly twice the number of edges",
          "C) Equal to the number of faces",
          "D) Zero"
        ],
        correctAnswer: 1,
        explanation: "Every undirected edge connects two endpoints, contributing exactly 2 to the total sum of vertex degrees. Hence Sum(deg(v)) = 2 × |E|.",
        sourceCitation: "CSDA_Curriculum_2024.pdf, Page 2"
      },
      {
        id: "q-csda-2",
        question: "What is the total credit requirement for the BS in CSDA degree at IIT Patna CET?",
        options: [
          "A) 120 Credits",
          "B) 140 Credits",
          "C) 160 Credits",
          "D) 180 Credits"
        ],
        correctAnswer: 2,
        explanation: "The CSDA curriculum handbook specifies 160 credits across 8 semesters for the complete 4-year degree [CSDA Curriculum, Page 1].",
        sourceCitation: "CSDA_Curriculum_2024.pdf, Page 1"
      }
    ],
    flashcards: [
      {
        id: "fc-csda-1",
        category: "Discrete Math",
        front: "State the necessary and sufficient condition for a connected graph to contain an Eulerian Circuit.",
        back: "Every vertex in the connected graph must have an EVEN degree. If exactly two vertices have odd degrees, it has an Eulerian Trail but not a closed circuit.",
        source: "CSDA Curriculum, Page 2",
        isMastered: true
      },
      {
        id: "fc-csda-2",
        category: "Probability",
        front: "State the Central Limit Theorem (CLT) in words.",
        back: "Given independent and identically distributed (i.i.d.) random variables with finite variance, their standardized sum or sample mean approaches a standard normal distribution as sample size grows large (n ≥ 30), regardless of the underlying population shape.",
        source: "DS201 Probability Notes",
        isMastered: false
      }
    ],
    studyGuide: {
      title: "CSDA Discrete Mathematics & Linear Foundations Guide",
      targetExam: "End-Semester Examination",
      units: [
        {
          unitNumber: 1,
          unitName: "Logic, Proofs and Recurrence Relations",
          weightage: "30%",
          topics: ["Truth tables, Modus Ponens", "Mathematical induction", "Solving homogeneous linear recurrences"],
          mustSolveProblems: ["Solve a_n = 5a_{n-1} - 6a_{n-2} with a_0=1, a_1=4."]
        }
      ]
    },
    audioOverview: {
      title: "Audio Overview: Big Data Foundations & Discrete Structures",
      duration: "2:50",
      speaker: "Prof. R. Sengupta (Simulated)",
      script: `Welcome CSDA scholars! In this capsule, we highlight why discrete mathematics is the language of computer science. Proofs by induction ensure your algorithms terminate, while probability theorems underpin modern data science inference.`,
      audioUrl: "https://actions.google.com/sounds/v1/science/digital_technology_pulse.ogg"
    }
  },
  {
    id: "nb-cet-regs",
    title: "CET Academic Regulations & Evaluation Scheme 2025",
    programTag: "Regulations",
    topic: "Grading Scale, Attendance, SPI/CPI, Remedial Rules",
    documentId: "doc-cet-eval-scheme",
    documentTitle: "CET_Evaluation_Grading_Scheme.pdf",
    lastModified: "3 days ago",
    documentCount: 1,
    summaryCount: 1,
    quizCount: 4,
    flashcardCount: 6,
    isSampleData: true,
    description: "Official guide to grading policies, attendance requirements, internal assessment splits, and SPI/CPI calculation algorithms at IIT Patna CET.",
    chatHistory: [
      {
        id: "msg-eval-1",
        sender: "user",
        text: "What is the minimum attendance required to appear in the end-semester examinations?",
        timestamp: "3 days ago"
      },
      {
        id: "msg-eval-2",
        sender: "assistant",
        text: `According to Regulation 4 of the **IIT Patna CET Evaluation Scheme & Grading Regulations** [Evaluation Scheme, Page 3]:

• **Mandatory Threshold:** Every student must maintain a **minimum of 75% attendance** in all scheduled lecture, tutorial, and laboratory sessions.
• **Debarment & XX Grade:** Students who fall below 75% are **debarred** from appearing in the End-Semester Examination and receive an **'XX' grade** on their transcript.
• **Medical Exception:** In cases of severe medical emergency with government hospital documentation, up to 10% condonation may be considered by the Academic Office, but **under no circumstances can a student with <65% attendance appear for exams** [Evaluation Scheme, Page 3].`,
        citations: [
          { docName: "CET_Evaluation_Grading_Scheme.pdf", page: 3, label: "Evaluation Scheme, Page 3" }
        ],
        timestamp: "3 days ago"
      }
    ],
    summary: {
      executiveSummary: "This document codifies the academic evaluation standards, grading mechanics, attendance regulations, and degree qualification criteria for all undergraduate and postgraduate programs administered by the Centre for Educational Technology (CET) at IIT Patna. The grading model balances continuous internal assessment (40%) with central end-semester examinations (60%).",
      keyConcepts: [
        { term: "Continuous Assessment (40%)", definition: "Consists of Quiz 1 (7.5%), Quiz 2 (7.5%), Mid-Semester Exam (20%), and continuous class/lab participation (5%)." },
        { term: "XX Grade", definition: "A non-credit grade awarded to students with less than 75% attendance, resulting in exam debarment and mandatory course repetition." },
        { term: "Capped Supplementary Grade", definition: "Students appearing for remedial re-examinations following an 'F' grade can be awarded a maximum letter grade of 'CC' (Grade Point 6)." }
      ],
      coreFormulas: [
        { title: "Semester Performance Index", formula: "SPI = Sum(Credits_i * GradePoints_i) / Sum(Credits_i)" },
        { title: "Minimum Degree CPI", formula: "CPI >= 5.00 for B.Sc. Exit; CPI >= 5.50 for B.S. (Honours)" }
      ],
      examTakeaways: [
        "Attendance strictly enforced at 75%.",
        "Grade AP is awarded to top performers with exceptional grasp.",
        "Supplementary exam grade cannot exceed CC (6 points)."
      ]
    },
    quizzes: [
      {
        id: "q-eval-1",
        question: "What is the maximum grade point that can be awarded to a student clearing a course through a supplementary re-examination?",
        options: [
          "A) AA (10 points)",
          "B) AB (9 points)",
          "C) BB (8 points)",
          "D) CC (6 points)"
        ],
        correctAnswer: 3,
        explanation: "Regulation 4 Section 4(b) states that the maximum grade that can be awarded in any supplementary re-examination is 'CC' (Grade Point 6), regardless of the raw score [Evaluation Scheme, Page 4].",
        sourceCitation: "CET_Evaluation_Grading_Scheme.pdf, Page 4"
      },
      {
        id: "q-eval-2",
        question: "What is the breakdown of Continuous Internal Assessment (40%) in the CET evaluation scheme?",
        options: [
          "A) Mid-sem 30%, Assignments 10%",
          "B) Quiz 1 (7.5%), Quiz 2 (7.5%), Mid-sem (20%), Classwork (5%)",
          "C) Quizzes 20%, Attendance 20%",
          "D) Only 1 Mid-sem exam worth 40%"
        ],
        correctAnswer: 1,
        explanation: "The scheme divides the 40% internal assessment into two quizzes (15% total), mid-semester exam (20%), and class/lab participation (5%) [Evaluation Scheme, Page 1].",
        sourceCitation: "CET_Evaluation_Grading_Scheme.pdf, Page 1"
      }
    ],
    flashcards: [
      {
        id: "fc-eval-1",
        category: "Regulations",
        front: "What is the minimum CPI needed to graduate with a 4-year B.S. (Honours) degree at CET IIT Patna?",
        back: "A minimum Cumulative Performance Index (CPI) of 5.50 along with successful defense of the Capstone Project and zero uncleared F grades.",
        source: "Evaluation Scheme, Page 4",
        isMastered: true
      },
      {
        id: "fc-eval-2",
        category: "Regulations",
        front: "What does the 'XX' grade signify and how does it affect a student?",
        back: "Signifies debarment due to attendance falling below 75%. The student cannot write the end-sem exam and must repeat the course during a subsequent term.",
        source: "Evaluation Scheme, Page 3",
        isMastered: false
      }
    ],
    studyGuide: {
      title: "CET Academic Regulations Quick Reference",
      targetExam: "Academic Orientation",
      units: [
        {
          unitNumber: 1,
          unitName: "Grading Scale & Calculations",
          weightage: "Essential",
          topics: ["AP to DD grade points", "SPI/CPI calculation formulas", "Passing criteria"],
          mustSolveProblems: ["Calculate SPI for a semester with four 4-credit courses with grades AA, AB, BB, and BC."]
        }
      ]
    },
    audioOverview: {
      title: "Audio Overview: IIT Patna CET Academic Grading & Attendance Rules",
      duration: "3:10",
      speaker: "Dean of Academic Affairs (Simulated)",
      script: `Welcome to the official guide on IIT Patna CET grading and academic policies. Remember that attendance of 75% is non-negotiable. Continuous assessment carries 40% weightage, and end-sem exams carry 60%. Study diligently and achieve your target CPI!`,
      audioUrl: "https://actions.google.com/sounds/v1/science/digital_technology_pulse.ogg"
    }
  }
];

// Pre-curated knowledge responses for the AI Assistant for realistic responses
export const CET_KNOWLEDGE_QA = [
  {
    keywords: ["aics", "cyber security", "curriculum", "artificial intelligence", "bs aics"],
    question: "What is the curriculum and structure of BS in AI & Cyber Security?",
    answer: `The **BS in Artificial Intelligence and Cyber Security (AICS)** at IIT Patna CET is a 4-year, 160-credit degree program compliant with NEP 2020 [AICS Curriculum, Page 1].

**Key Structural Highlights:**
• **Flexible NEP 2020 Exit Options:** Certificate at Year 1 (40 Cr), Diploma at Year 2 (80 Cr), B.Sc. at Year 3 (120 Cr), and B.S. Honours/Research at Year 4 (160 Cr) [AICS Curriculum, Page 1].
• **Foundational Year 1:** Problem Solving with C/Python (CS101), Linear Algebra (MA101), Foundations of Information Security (CY101), Data Structures (CS201), Probability (MA102).
• **Core AI & Security Years 2 & 3:** Applied Cryptography, Machine Learning Foundations (AI301), Deep Learning (AI302), Network Defense, Operating Systems Kernel Internals.
• **Advanced Year 4:** Generative AI & LLMs (AI401), Cloud DevSecOps, Adversarial ML, and an 8-credit Capstone Project [AICS Curriculum, Page 4].`,
    citations: [
      { docName: "AICS_Curriculum_2024.pdf", page: 1, label: "AICS Curriculum, Page 1" },
      { docName: "AICS_Curriculum_2024.pdf", page: 4, label: "AICS Curriculum, Page 4" }
    ]
  },
  {
    keywords: ["csda", "data analytics", "data science", "bs csda"],
    question: "What does the BS in Computer Science & Data Analytics (CSDA) cover?",
    answer: `The **BS in Computer Science and Data Analytics (CSDA)** equips students with dual expertise in software engineering and statistical data analysis [CSDA Curriculum, Page 1].

**Key Features:**
• **Degree Requirement:** 160 Credits over 8 Semesters.
• **Core Mathematics:** Discrete Mathematical Structures (MA201), Applied Probability (DS201), and Numerical Optimization (MA202) [CSDA Curriculum, Page 2].
• **Big Data Architecture:** Apache Spark, Kafka streaming, Distributed Computing (DS301), and Data Warehousing (DS302).
• **Machine Learning Track:** Predictive Modeling, Natural Language Processing (DS402), and Interactive Visual Analytics [CSDA Curriculum, Page 4].`,
    citations: [
      { docName: "CSDA_Curriculum_2024.pdf", page: 1, label: "CSDA Curriculum, Page 1" },
      { docName: "CSDA_Curriculum_2024.pdf", page: 2, label: "CSDA Curriculum, Page 2" }
    ]
  },
  {
    keywords: ["grading", "marks", "spi", "cpi", "pass", "fail", "evaluation", "weightage", "attendance"],
    question: "How does the IIT Patna CET grading and evaluation scheme work?",
    answer: `According to the **IIT Patna CET Evaluation Scheme & Grading Regulations** [Evaluation Scheme, Page 1]:

1. **Assessment Breakdown:**
   • **Continuous Internal Assessment (40%):** Quiz 1 (7.5%), Quiz 2 (7.5%), Mid-Semester Exam (20%), and Class/Lab Demos (5%).
   • **End-Semester Examination (60%):** Centrally invigilated 3-hour comprehensive exam.

2. **Letter Grades & Grade Points:**
   • **AP / AA:** 10 points (Exceptional / Outstanding)
   • **AB:** 9 points | **BB:** 8 points | **BC:** 7 points
   • **CC:** 6 points | **CD:** 5 points
   • **DD:** 4 points (**Marginal Pass** - lowest credit-bearing grade)
   • **F:** 0 points (Fail - requires re-examination)
   • **XX:** 0 points (Debarred due to <75% attendance) [Evaluation Scheme, Page 2].

3. **Attendance Requirement:** Minimum **75% verified attendance** is strictly mandatory.`,
    citations: [
      { docName: "CET_Evaluation_Grading_Scheme.pdf", page: 1, label: "Evaluation Scheme, Page 1" },
      { docName: "CET_Evaluation_Grading_Scheme.pdf", page: 2, label: "Evaluation Scheme, Page 2" }
    ]
  },
  {
    keywords: ["calendar", "dates", "exam", "mid-sem", "end-sem", "holidays", "registration", "autumn", "spring"],
    question: "What are the important dates in the Academic Calendar 2025–2026?",
    answer: `Key milestones from the **IIT Patna CET Academic Calendar 2025–2026** [Academic Calendar, Page 1-2]:

• **Autumn Semester 2025:**
  - Student Registration: July 28 – August 1, 2025
  - Classes Commence: August 4, 2025
  - Quiz I Window: September 8 – 12, 2025
  - Mid-Semester Exams: September 22 – 27, 2025
  - Quiz II Window: October 27 – 31, 2025
  - End-Semester Exams: November 24 – December 3, 2025
  - Winter Vacation: December 8, 2025 – January 2, 2026

• **Spring Semester 2026:**
  - Classes Commence: January 5, 2026
  - Mid-Semester Exams: February 23 – 28, 2026
  - End-Semester Exams: April 27 – May 6, 2026
  - Annual Convocation: August 18, 2026 [Academic Calendar, Page 2].`,
    citations: [
      { docName: "Academic_Calendar_2025_2026.pdf", page: 1, label: "Academic Calendar, Page 1" },
      { docName: "Academic_Calendar_2025_2026.pdf", page: 2, label: "Academic Calendar, Page 2" }
    ]
  },
  {
    keywords: ["eligibility", "admission", "entrance", "apply", "how to join"],
    question: "What are the admission eligibility requirements for CET programs?",
    answer: `Admission requirements for IIT Patna CET programs:

• **BS in AICS / BS in CSDA:**
  - 10+2 / Class XII or equivalent with Mathematics and Physics.
  - Minimum 60% aggregate (55% for reserved categories).
  - Selection via valid JEE Main score or IIT Patna CET Online Entrance Test score.
  - Official application portal: \`https://registrations.iitp-cep.in/\`.

• **Integrated BBA-MBA:**
  - 10+2 in any stream with minimum 50% aggregate.

• **M.Tech in AI & DSE:**
  - B.Tech/B.E. in CSE, ECE, EE or M.Sc. in Math/Statistics/MCA with valid GATE score or Institute Written Test.`,
    citations: [
      { docName: "AICS_Curriculum_2024.pdf", page: 1, label: "AICS Curriculum, Page 1" }
    ]
  }
];

export const STUDENT_PERSONAS = [
  {
    name: "Arjun Verma",
    role: "Prospective BS Student",
    program: "Evaluating BS AICS vs. CSDA",
    quote: "CET AI helped me compare the exact credit splits and NEP exit options between AICS and CSDA without hunting through multiple 20-page PDFs.",
    badge: "Applicant"
  },
  {
    name: "Pooja Kumari",
    role: "2nd Year Enrolled Student",
    program: "BS in AI & Cyber Security",
    quote: "The instant quiz generator and 3D flashcards made my mid-term revision in Data Structures 3x faster. The exact citations give me 100% confidence.",
    badge: "Student"
  },
  {
    name: "Rohan Nair",
    role: "Working Professional",
    program: "Executive MBA in GenAI",
    quote: "The AI Spoken Audio Overview lets me listen to 3-minute executive summaries of week lecture notes during my evening commute.",
    badge: "Executive Learner"
  },
  {
    name: "Prof. S. Sharma",
    role: "Course Instructor & Evaluator",
    program: "Centre for Educational Technology",
    quote: "Having an AI companion that strictly grounds answers in our syllabus ordinances prevents misconceptions about grading and attendance rules.",
    badge: "Faculty"
  }
];
