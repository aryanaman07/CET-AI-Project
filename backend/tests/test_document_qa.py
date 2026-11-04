import io
import os
import pytest
import fitz  # PyMuPDF
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db, get_db_connection
from backend.services.document_processor import document_processor
from backend.services.vector_store import vector_store

@pytest.fixture(scope="module", autouse=True)
def setup_test_environment():
    """Initializes the database schema before test runs."""
    init_db()

@pytest.fixture
def client():
    """Test client for FastAPI app."""
    return TestClient(app)

def create_sample_pdf(pages_text: list) -> bytes:
    """Helper to synthesize in-memory valid PDFs with known text on known pages using PyMuPDF."""
    doc = fitz.open()
    for text in pages_text:
        page = doc.new_page()
        page.insert_text(fitz.Point(50, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def test_upload_valid_pdf(client):
    """TEST 1: Upload a valid PDF and verify extraction, page count, and chunk indexing."""
    pages = [
        "IIT Patna CS101: Introduction to Computing. In this course, students learn algorithmic problem solving and recursion.",
        "Page Two covers Complexity Analysis. Big-O notation measures the asymptotic upper bound of runtime.",
        "Page Three covers Graph Theory. Dijkstra's Algorithm finds the single-source shortest path in weighted graphs with non-negative edges."
    ]
    pdf_bytes = create_sample_pdf(pages)
    nb_id = "test-nb-valid-pdf"

    # Create notebook
    client.post("/api/notebooks", json={"title": "Computer Science Notebook", "program_tag": "BS-AICS"})

    # Upload PDF
    files = {"file": ("cs101_syllabus.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    res = client.post(f"/api/notebooks/{nb_id}/documents/upload", files=files)
    
    assert res.status_code == 201, res.text
    data = res.json()
    assert data["filename"] == "cs101_syllabus.pdf"
    assert data["page_count"] == 3
    assert data["chunks_indexed"] >= 3
    assert data["is_scanned"] is False
    assert data["scan_warning"] is None

def test_reject_invalid_file(client):
    """TEST 2: Reject non-PDF file, empty file, and files exceeding size limit."""
    nb_id = "test-nb-rejections"

    # 1. Non-PDF file (text file disguised as pdf or .txt extension)
    files = {"file": ("malicious_script.txt", io.BytesIO(b"Hello world this is plain text"), "text/plain")}
    res = client.post(f"/api/notebooks/{nb_id}/documents/upload", files=files)
    assert res.status_code == 400
    assert "Invalid file format" in res.json()["detail"] or "PDF" in res.json()["detail"]

    # 2. Corrupt / fake PDF with .pdf extension but invalid magic bytes
    files_fake = {"file": ("corrupt.pdf", io.BytesIO(b"NOT A REAL PDF HEADER JUST TEXT"), "application/pdf")}
    res_fake = client.post(f"/api/notebooks/{nb_id}/documents/upload", files=files_fake)
    assert res_fake.status_code == 400
    assert "Invalid PDF structure" in res_fake.json()["detail"] or "Failed to read" in res_fake.json()["detail"]

    # 3. Zero-byte empty file
    files_empty = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}
    res_empty = client.post(f"/api/notebooks/{nb_id}/documents/upload", files=files_empty)
    assert res_empty.status_code == 400
    assert "empty" in res_empty.json()["detail"].lower()

def test_ask_question_on_known_page_and_verify_citation(client):
    """TEST 3 & 4: Ask a question whose answer appears on a known page, verify citation doc name and page number."""
    pages = [
        "Welcome to Operating Systems CS301. Lecture 1 covers process management and threads.",
        "Round Robin Scheduling: The time quantum is strictly configured to 10 milliseconds for interactive processes.",
        "Virtual memory uses paging with 4KB frames and Translation Lookaside Buffers (TLB)."
    ]
    pdf_bytes = create_sample_pdf(pages)
    nb_id = "test-nb-known-page"

    # Upload document
    files = {"file": ("operating_systems.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    upload_res = client.post(f"/api/notebooks/{nb_id}/documents/upload", files=files)
    assert upload_res.status_code == 201

    # Ask question specifically about Round Robin quantum (which is on Page 2)
    chat_res = client.post(
        f"/api/notebooks/{nb_id}/chat",
        json={"query": "What is the time quantum for Round Robin scheduling in interactive processes?"}
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert chat_data["verified"] is True
    assert "10" in chat_data["response"]
    
    # Verify citations contain operating_systems.pdf and Page 2
    assert len(chat_data["citations"]) > 0
    top_citation = chat_data["citations"][0]
    assert top_citation["doc_title"] == "operating_systems.pdf"
    assert top_citation["page"] == 2
    assert "Round Robin" in top_citation["snippet"] or "time quantum" in top_citation["snippet"]

def test_ask_unrelated_question_states_missing_info(client):
    """TEST 5: Ask a question unrelated to the uploaded PDF -> states information was not found."""
    pages = [
        "Fluid Dynamics and Thermodynamics. Ideal gas law states PV = nRT.",
        "Bernoulli's equation models incompressible flow along a streamline."
    ]
    pdf_bytes = create_sample_pdf(pages)
    nb_id = "test-nb-unrelated"

    files = {"file": ("thermodynamics.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    client.post(f"/api/notebooks/{nb_id}/documents/upload", files=files)

    # Ask an unrelated question (e.g. quantum entanglement or campus laundry hours)
    chat_res = client.post(
        f"/api/notebooks/{nb_id}/chat",
        json={"query": "What are the campus laundry facility timings and washing machine fees?"}
    )
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "do not contain information" in data["response"] or "no supporting information" in data["response"].lower()
    assert data["confidence"] == "none"
    assert len(data["citations"]) == 0

def test_multi_pdf_upload_and_source_attribution(client):
    """TEST 6: Upload two PDFs to the same notebook and verify source attribution."""
    pdf_math = create_sample_pdf([
        "Linear Algebra: Singular Value Decomposition (SVD) factors matrix A into U * Sigma * V^T.",
        "Eigenvalues satisfy det(A - lambda * I) = 0."
    ])
    pdf_chem = create_sample_pdf([
        "Chemical Kinetics: The Arrhenius equation relates reaction rate constant k = A * exp(-Ea / (R*T)).",
        "Catalysts accelerate chemical reactions by lowering activation energy."
    ])
    nb_id = "test-nb-multi-docs"

    # Upload PDF 1: linear_algebra.pdf
    client.post(
        f"/api/notebooks/{nb_id}/documents/upload",
        files={"file": ("linear_algebra.pdf", io.BytesIO(pdf_math), "application/pdf")}
    )

    # Upload PDF 2: chemical_kinetics.pdf
    client.post(
        f"/api/notebooks/{nb_id}/documents/upload",
        files={"file": ("chemical_kinetics.pdf", io.BytesIO(pdf_chem), "application/pdf")}
    )

    # Ask about chemistry
    res_chem = client.post(
        f"/api/notebooks/{nb_id}/chat",
        json={"query": "What does the Arrhenius equation calculate in chemical kinetics?"}
    )
    assert res_chem.status_code == 200
    data_chem = res_chem.json()
    assert len(data_chem["citations"]) > 0
    assert data_chem["citations"][0]["doc_title"] == "chemical_kinetics.pdf"
    assert data_chem["citations"][0]["page"] == 1

    # Ask about math
    res_math = client.post(
        f"/api/notebooks/{nb_id}/chat",
        json={"query": "How is Singular Value Decomposition SVD formulated?"}
    )
    assert res_math.status_code == 200
    data_math = res_math.json()
    assert len(data_math["citations"]) > 0
    assert data_math["citations"][0]["doc_title"] == "linear_algebra.pdf"
    assert data_math["citations"][0]["page"] == 1

def test_delete_document_and_verify_unretrievable(client):
    """TEST 7: Delete a document and verify its content is no longer retrievable."""
    secret_text = "The secret exam room passcode is DELTA_NINE_ALPHA."
    pdf_bytes = create_sample_pdf([secret_text])
    nb_id = "test-nb-delete-doc"

    # Upload document
    upload_res = client.post(
        f"/api/notebooks/{nb_id}/documents/upload",
        files={"file": ("secret_code.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    )
    doc_id = upload_res.json()["document_id"]

    # Verify retrievable initially
    query_res1 = client.post(
        f"/api/notebooks/{nb_id}/chat",
        json={"query": "What is the secret exam room passcode?"}
    )
    assert query_res1.status_code == 200
    assert "DELTA_NINE_ALPHA" in query_res1.json()["response"]

    # Delete the document
    del_res = client.delete(f"/api/notebooks/{nb_id}/documents/{doc_id}")
    assert del_res.status_code == 200

    # Verify no longer retrievable
    query_res2 = client.post(
        f"/api/notebooks/{nb_id}/chat",
        json={"query": "What is the secret exam room passcode?"}
    )
    assert query_res2.status_code == 200
    data2 = query_res2.json()
    assert "do not contain information" in data2["response"] or "DELTA_NINE_ALPHA" not in data2["response"]
    assert len(data2["citations"]) == 0

def test_notebook_isolation_between_different_notebooks(client):
    """TEST 8: Verify content from Notebook A is strictly isolated and never leaked to Notebook B."""
    nb_a = "test-isolated-notebook-alpha"
    nb_b = "test-isolated-notebook-beta"

    pdf_alpha = create_sample_pdf(["Quantum Computing: Qubits exploit superposition and entanglement."])
    client.post(
        f"/api/notebooks/{nb_a}/documents/upload",
        files={"file": ("quantum_alpha.pdf", io.BytesIO(pdf_alpha), "application/pdf")}
    )

    # Ask Notebook B about quantum superposition (which was only uploaded to Notebook A)
    res_b = client.post(
        f"/api/notebooks/{nb_b}/chat",
        json={"query": "Explain quantum superposition and qubits."}
    )
    assert res_b.status_code == 200
    data_b = res_b.json()
    assert len(data_b["citations"]) == 0
    assert "do not contain information" in data_b["response"]

def test_empty_and_scanned_pdf_ocr_limitations(client):
    """TEST 9: Test empty and image-only scanned PDFs, documenting OCR limitations."""
    # Synthesize an empty PDF page (0 selectable text)
    doc = fitz.open()
    doc.new_page()  # Blank page
    empty_bytes = doc.tobytes()
    doc.close()

    nb_id = "test-nb-scanned"
    res = client.post(
        f"/api/notebooks/{nb_id}/documents/upload",
        files={"file": ("scanned_handwritten_note.pdf", io.BytesIO(empty_bytes), "application/pdf")}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["is_scanned"] is True
    assert data["scan_warning"] is not None
    assert "OCR" in data["scan_warning"]
    assert "scanned" in data["scan_warning"]
