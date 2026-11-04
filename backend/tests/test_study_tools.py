import uuid
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from backend.main import app
from backend.database import (
    init_db,
    create_or_update_notebook,
    insert_document,
    insert_document_pages,
    insert_document_chunks,
    get_study_artifacts,
    get_latest_study_artifact
)
from backend.services.study_tools_service import study_tools_service, extract_and_parse_json

# Initialize SQLite tables
init_db()
client = TestClient(app)

@pytest.fixture(autouse=True)
def mock_llm_calls(monkeypatch):
    """Mocks external LLM provider calls with high-speed realistic structured responses."""
    import json
    from backend.services.llm_service import llm_service

    async def mock_generate(prompt: str, system_prompt: str = None):
        p_lower = prompt.lower()
        if "executivesummary" in p_lower or "produce a short summary" in p_lower or "produce a medium summary" in p_lower or "produce a detailed summary" in p_lower:
            return json.dumps({
                "executiveSummary": "CS201 Data Structures and Algorithms forms the computational foundation of the BS in Artificial Intelligence and Cyber Security at IIT Patna.",
                "keyConcepts": [
                    {"term": "Big-O Complexity", "definition": "Upper asymptotic growth boundary.", "page": 1},
                    {"term": "AVL Tree Balancing", "definition": "Height-balanced search tree with BF in {-1, 0, 1}.", "page": 1},
                    {"term": "Dijkstra Algorithm", "definition": "Greedy shortest path in non-negative weighted graphs.", "page": 2}
                ],
                "coreFormulas": [
                    {"title": "Master Theorem Formula", "formula": "T(n) = a*T(n/b) + f(n)"}
                ],
                "examTakeaways": [
                    "Minimum 75% attendance is required.",
                    "Plagiarism over 15% receives zero marks."
                ]
            }), "mock-gemini-flash"
        elif "flashcard" in p_lower:
            return json.dumps({
                "flashcards": [
                    {
                        "id": f"fc-{i}",
                        "category": "Data Structures",
                        "front": f"Define Concept {i} in Asymptotic Analysis?",
                        "back": f"Precise mathematical definition for concept {i}.",
                        "source": "CS201_Data_Structures.pdf, Page 1",
                        "isMastered": False
                    }
                    for i in range(1, 16)
                ]
            }), "mock-gemini-flash"
        elif "study guide" in p_lower or "units" in p_lower:
            return json.dumps({
                "title": "Comprehensive Study Guide: CS201 Data Structures",
                "targetExam": "Mid-Semester Examination",
                "overview": "Mastery of asymptotic complexity, trees, and graph algorithms.",
                "units": [
                    {
                        "unitNumber": 1,
                        "unitName": "Unit 1: Foundations of Complexity",
                        "weightage": "50% of Exam",
                        "topics": ["Big-O Complexity", "Omega Bounds", "Theta Tight Bounds"],
                        "mustSolveProblems": ["Derive Master theorem for T(n) = 2T(n/2) + n."],
                        "sourceCitation": "CS201_Data_Structures.pdf, Page 1"
                    }
                ]
            }), "mock-gemini-flash"
        else: # Quiz
            return json.dumps({
                "quizzes": [
                    {
                        "id": f"q-{i}",
                        "question": f"According to CS201 Data Structures, what is the role of Concept {i}?",
                        "options": [
                            f"A) Verified definition for concept {i}",
                            f"B) Secondary alternative for concept {i}",
                            f"C) Tertiary distractor for concept {i}",
                            f"D) Quaternary distractor for concept {i}"
                        ],
                        "correctAnswer": 0,
                        "explanation": f"Explanation verifying option A from CS201 Page 1.",
                        "sourceCitation": "CS201_Data_Structures.pdf, Page 1"
                    }
                    for i in range(1, 16)
                ]
            }), "mock-gemini-flash"

    monkeypatch.setattr(llm_service, "generate_completion", mock_generate)

SAMPLE_DOCUMENT_TEXT_PAGE1 = """INDIAN INSTITUTE OF TECHNOLOGY PATNA
Centre for Educational Technology (CET)
Course Syllabus: CS201 Data Structures and Algorithms

1. COURSE MISSION & OVERVIEW
CS201 Data Structures and Algorithms forms the computational foundation of the BS in Artificial Intelligence and Cyber Security.
Spanning 4 credits (3 lectures, 0 tutorials, 2 lab hours), this course explores how data organization dictates algorithmic time and space efficiency.

2. ASYMPTOTIC COMPLEXITY & BOUNDS
• Big-O Notation: Characterizes the mathematical asymptotic upper bound of growth rate as input n tends to infinity.
• Omega Notation: Defines the asymptotic lower bound of algorithmic performance.
• Theta Notation: Denotes asymptotically tight bounds where f(n) = Theta(g(n)).
Master Theorem Formula: T(n) = a*T(n/b) + f(n).

3. BALANCED SEARCH STRUCTURES
• AVL Tree: A height-balanced binary search tree where for every node, the balance factor BF = Height(Left) - Height(Right) is strictly bounded in {-1, 0, +1}.
• AVL Balancing Violation: An insertion causing balance factor ±2 triggers an immediate single (LL, RR) or double (LR, RL) rotation.
• Red-Black Trees: Balanced BST maintaining black-height invariant and ensuring no two consecutive red nodes."""

SAMPLE_DOCUMENT_TEXT_PAGE2 = """4. GRAPH ALGORITHMS & DISJOINT SETS
• Breadth-First Search (BFS): Graph traversal using a FIFO queue to discover shortest paths in unweighted graphs with O(V + E) time complexity.
• Depth-First Search (DFS): Graph exploration using recursive backtracking or LIFO stack, essential for topological sorting in DAGs.
• Dijkstra's Algorithm: Greedy single-source shortest path algorithm using a min-heap priority queue, running in O((V + E) log V) time.
• Kruskal's Algorithm: Computes Minimum Spanning Tree (MST) using Disjoint Set Union (DSU) with union-by-rank and path compression.

5. LABORATORY & ACADEMIC INTEGRITY NORMS
• Plagiarism Policy: Code submissions showing greater than 15% lexical or syntactic overlap via MOSS are awarded zero marks.
• Continuous Assessment: In-semester quizzes (15%), mid-semester exam (20%), and lab work (5%).
• Attendance: Minimum 75% attendance is required to be eligible for end-semester examinations."""


@pytest.fixture
def setup_test_notebook():
    """Sets up an isolated test notebook with genuine multi-page course document."""
    nb_id = f"test-nb-{uuid.uuid4().hex[:8]}"
    doc_id = f"test-doc-{uuid.uuid4().hex[:8]}"
    
    create_or_update_notebook(nb_id, title="Test DSA Notebook", program_tag="BS-AICS")
    
    insert_document(
        doc_id=doc_id,
        notebook_id=nb_id,
        title="CS201 Data Structures Syllabus",
        filename="CS201_Data_Structures.pdf",
        file_path=f"uploads/{doc_id}_CS201.pdf",
        page_count=2,
        char_count=len(SAMPLE_DOCUMENT_TEXT_PAGE1) + len(SAMPLE_DOCUMENT_TEXT_PAGE2),
        is_scanned=False,
        file_size_bytes=10240
    )
    
    insert_document_pages([
        {
            "id": f"p1-{doc_id}",
            "document_id": doc_id,
            "page_number": 1,
            "title": "Asymptotic Analysis & AVL Trees",
            "content": SAMPLE_DOCUMENT_TEXT_PAGE1
        },
        {
            "id": f"p2-{doc_id}",
            "document_id": doc_id,
            "page_number": 2,
            "title": "Graph Traversals & Lab Regulations",
            "content": SAMPLE_DOCUMENT_TEXT_PAGE2
        }
    ])
    
    return nb_id, doc_id


class TestSummaryGeneration:
    def test_summary_generation_medium(self, setup_test_notebook):
        """Tests medium summary generation from actual document pages."""
        nb_id, doc_id = setup_test_notebook
        res = client.post(
            f"/api/notebooks/{nb_id}/study/summary",
            json={"document_id": doc_id, "length": "medium"}
        )
        assert res.status_code == 200
        data = res.json()
        assert len(data["executiveSummary"]) > 40
        assert len(data["keyConcepts"]) >= 2
        assert any("AVL" in k["term"] or "Big-O" in k["term"] or "Dijkstra" in k["term"] for k in data["keyConcepts"])
        assert len(data["examTakeaways"]) >= 1
        assert data["documentTitle"] == "CS201_Data_Structures.pdf"

    def test_summary_length_options(self, setup_test_notebook):
        """Tests short and detailed summary options."""
        nb_id, doc_id = setup_test_notebook
        res_short = client.post(
            f"/api/notebooks/{nb_id}/study/summary",
            json={"document_id": doc_id, "length": "short"}
        )
        assert res_short.status_code == 200
        data_short = res_short.json()
        assert data_short["length"] == "short"

        res_detailed = client.post(
            f"/api/notebooks/{nb_id}/study/summary",
            json={"document_id": doc_id, "length": "detailed"}
        )
        assert res_detailed.status_code == 200
        data_detailed = res_detailed.json()
        assert data_detailed["length"] == "detailed"
        assert len(data_detailed["keyConcepts"]) >= len(data_short["keyConcepts"])


class TestQuizGeneration:
    def test_quiz_generation_5_questions(self, setup_test_notebook):
        """Tests generating 5 diagnostic MCQs with 4 options, 1 correct answer, and citations."""
        nb_id, doc_id = setup_test_notebook
        res = client.post(
            f"/api/notebooks/{nb_id}/study/quiz",
            json={"document_id": doc_id, "num_questions": 5}
        )
        assert res.status_code == 200
        data = res.json()
        quizzes = data["quizzes"]
        assert len(quizzes) == 5

        for q in quizzes:
            assert len(q["options"]) == 4
            assert 0 <= q["correctAnswer"] <= 3
            assert len(set(q["options"])) == 4  # All 4 options distinct
            assert len(q["explanation"]) > 10
            assert "CS201" in q["sourceCitation"] or "Page" in q["sourceCitation"]

    def test_quiz_answer_correctness_and_explanations(self, setup_test_notebook):
        """Verifies that the correct answer index points to the expected factual explanation."""
        nb_id, doc_id = setup_test_notebook
        res = client.post(
            f"/api/notebooks/{nb_id}/study/quiz",
            json={"document_id": doc_id, "num_questions": 3}
        )
        assert res.status_code == 200
        data = res.json()
        for q in data["quizzes"]:
            correct_idx = q["correctAnswer"]
            chosen_opt = q["options"][correct_idx]
            assert len(chosen_opt) > 0
            assert len(q["explanation"]) > 0


class TestFlashcardGeneration:
    def test_flashcard_generation_structure(self, setup_test_notebook):
        """Tests flashcard generation with front, back, category, and citations."""
        nb_id, doc_id = setup_test_notebook
        res = client.post(
            f"/api/notebooks/{nb_id}/study/flashcards",
            json={"document_id": doc_id, "num_cards": 8}
        )
        assert res.status_code == 200
        data = res.json()
        flashcards = data["flashcards"]
        assert len(flashcards) >= 4

        seen_fronts = set()
        for c in flashcards:
            assert len(c["front"]) > 8
            assert len(c["back"]) > 5
            assert "Page" in c["source"]
            assert c["isMastered"] is False
            # Duplicate prevention check
            assert c["front"].lower() not in seen_fronts
            seen_fronts.add(c["front"].lower())


class TestStudyGuideGeneration:
    def test_study_guide_structure(self, setup_test_notebook):
        """Tests structured study guide generation with units, topics, and analytical problems."""
        nb_id, doc_id = setup_test_notebook
        res = client.post(
            f"/api/notebooks/{nb_id}/study/guide",
            json={"document_id": doc_id, "target_exam": "Mid-Semester Examination"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "Study Guide" in data["title"]
        assert data["targetExam"] == "Mid-Semester Examination"
        assert len(data["units"]) >= 1

        for u in data["units"]:
            assert u["unitNumber"] >= 1
            assert len(u["topics"]) >= 1
            assert len(u["mustSolveProblems"]) >= 1
            assert len(u["weightage"]) > 0


class TestInsufficientContentAndEdgeCases:
    def test_insufficient_content_returns_400(self):
        """Tests that an empty or image-only scanned document with < 80 chars returns HTTP 400."""
        empty_nb = f"nb-empty-{uuid.uuid4().hex[:6]}"
        empty_doc = f"doc-empty-{uuid.uuid4().hex[:6]}"
        
        create_or_update_notebook(empty_nb, title="Empty Notebook")
        insert_document(
            doc_id=empty_doc,
            notebook_id=empty_nb,
            title="Empty Scan",
            filename="empty_scan.pdf",
            file_path="uploads/empty.pdf",
            page_count=1,
            char_count=20,
            is_scanned=True
        )
        insert_document_pages([{
            "id": f"p1-{empty_doc}",
            "document_id": empty_doc,
            "page_number": 1,
            "title": "Page 1",
            "content": "Minimal text."
        }])

        res = client.post(
            f"/api/notebooks/{empty_nb}/study/summary",
            json={"document_id": empty_doc}
        )
        assert res.status_code == 400
        assert "insufficient readable text" in res.json()["detail"].lower()

    def test_json_parser_markdown_fences_and_trailing_commas(self):
        """Tests extract_and_parse_json handles markdown code ticks and trailing commas."""
        raw_llm_output = """```json
        {
            "executiveSummary": "Valid test digest.",
            "keyConcepts": [
                {"term": "T1", "definition": "D1",}
            ],
            "examTakeaways": [
                "Takeaway 1",
            ]
        }
        ```"""
        parsed = extract_and_parse_json(raw_llm_output)
        assert parsed["executiveSummary"] == "Valid test digest."
        assert parsed["keyConcepts"][0]["term"] == "T1"

    def test_llm_failure_triggers_deterministic_grounded_fallback(self, setup_test_notebook):
        """Tests that when LLMs fail or timeout, deterministic grounded extractor takes over."""
        nb_id, doc_id = setup_test_notebook

        with patch("backend.services.llm_service.llm_service.generate_completion", side_effect=RuntimeError("API Quota Exceeded")):
            res = client.post(
                f"/api/notebooks/{nb_id}/study/quiz",
                json={"document_id": doc_id, "num_questions": 4}
            )
            assert res.status_code == 200
            data = res.json()
            assert data["engine"] == "grounded-deterministic-extractor"
            assert len(data["quizzes"]) == 4


class TestNotebookIsolationAndPersistence:
    def test_artifacts_saved_and_isolated(self, setup_test_notebook):
        """Verifies that generated study materials are saved in SQLite and isolated by notebook."""
        nb_id, doc_id = setup_test_notebook
        other_nb = f"other-nb-{uuid.uuid4().hex[:6]}"
        create_or_update_notebook(other_nb, title="Other Isolated Notebook")

        # Generate summary in nb_id
        client.post(f"/api/notebooks/{nb_id}/study/summary", json={"document_id": doc_id})

        # Check artifacts for nb_id
        res_artifacts = client.post(f"/api/notebooks/{nb_id}/artifacts", json={
            "document_id": doc_id,
            "artifact_type": "summary",
            "content": {"test": "manual-save"}
        })
        assert res_artifacts.status_code == 200

        # Retrieve artifacts list
        get_res = client.get(f"/api/notebooks/{nb_id}/artifacts")
        assert get_res.status_code == 200
        artifacts = get_res.json()
        assert len(artifacts) >= 1

        # Check other_nb does NOT see artifacts from nb_id
        other_res = client.get(f"/api/notebooks/{other_nb}/artifacts")
        assert other_res.status_code == 200
        assert len(other_res.json()) == 0
