import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings
from backend.services.retriever import retriever_service
from backend.services.llm_service import llm_service
from backend.middleware.rate_limiter import RateLimiterMiddleware

from backend.database import init_db

# Ensure test DB tables are initialized
init_db()

client = TestClient(app)

# Helper fixture to reset rate limiter between tests
@pytest.fixture(autouse=True)
def reset_rate_limiter():
    init_db()
    yield

# ============================================================================
# 1. TEST: Questions with answers in the knowledge base
# ============================================================================
class TestQuestionsInKnowledgeBase:
    def test_csda_eligibility_query(self):
        """Tests that a question about BS in CSDA eligibility returns verified answers."""
        payload = {"query": "What are the admission eligibility requirements for BS in CSDA?"}
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] is True
        assert data["confidence"] in ["high", "medium"]
        assert len(data["citations"]) > 0
        assert data["retrieval_count"] > 0
        # Check that response mentions key verified facts
        resp_text = data["response"].lower()
        assert "60%" in resp_text or "science" in resp_text or "entrance" in resp_text

    def test_evaluation_scheme_query(self):
        """Tests that asking about the grading/evaluation scheme returns accurate weightages."""
        payload = {"query": "What is the evaluation scheme and attendance requirement at CET IIT Patna?"}
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] is True
        resp_text = data["response"].lower()
        # Verifies 75% attendance or evaluation components
        assert "75%" in resp_text or "attendance" in resp_text or "evaluation" in resp_text
        assert len(data["citations"]) > 0

    def test_aics_exit_options_query(self):
        """Tests that NEP 2020 exit options for BS AICS are correctly retrieved."""
        payload = {"query": "What are the NEP exit options in BS in AI & Cyber Security?"}
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] is True
        resp_text = data["response"].lower()
        assert "certificate" in resp_text or "diploma" in resp_text or "credits" in resp_text

    def test_moodle_instructions_query(self):
        """Tests that Moodle guidance provides official URL and mentions credentials safety."""
        payload = {"query": "How do I access IIT Patna Moodle and what are the instructions?"}
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] is True
        resp_text = data["response"].lower()
        assert "moodle.iitp.ac.in" in resp_text

# ============================================================================
# 2. TEST: Questions with NO supporting information
# ============================================================================
class TestQuestionsWithNoSupportingInfo:
    def test_off_topic_unsupported_query(self):
        """Tests that asking an off-topic query explicitly admits lack of info."""
        payload = {"query": "What is the price of a Margherita pizza in the local cafeteria?"}
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] is False
        assert data["confidence"] == "none"
        assert len(data["citations"]) == 0
        resp_text = data["response"].lower()
        assert "no supporting information" in resp_text or "not contain" in resp_text

    def test_unverified_fee_inquiry(self):
        """Tests that hallucinated/non-indexed fees or laundry queries are deflected."""
        payload = {"query": "How much does the hostel laundry service charge per semester?"}
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["confidence"] == "none"
        assert data["verified"] is False
        assert "no supporting information" in data["response"].lower()

# ============================================================================
# 3. TEST: Invalid requests
# ============================================================================
class TestInvalidRequests:
    def test_empty_query(self):
        """Tests that an empty string query is rejected with 400 Bad Request."""
        payload = {"query": ""}
        response = client.post("/api/chat", json=payload)
        assert response.status_code == 400
        assert "validation error" in response.json()["detail"].lower() or "empty" in response.json()["detail"].lower()

    def test_whitespace_only_query(self):
        """Tests that a whitespace-only query is rejected with 400 Bad Request."""
        payload = {"query": "     "}
        response = client.post("/api/chat", json=payload)
        assert response.status_code == 400

    def test_query_too_long(self):
        """Tests that a query exceeding 1000 characters is rejected with 400 Bad Request."""
        payload = {"query": "A" * 1005}
        response = client.post("/api/chat", json=payload)
        assert response.status_code == 400

    def test_malformed_json_payload(self):
        """Tests that non-JSON or malformed payload receives 400/422 status."""
        response = client.post(
            "/api/chat",
            content="Not a JSON string",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code in [400, 422]

# ============================================================================
# 4. TEST: API Failures & Resilient Fallback
# ============================================================================
class TestAPIFailures:
    @patch("backend.services.llm_service.llm_service._gemini_client")
    def test_gemini_failure_switches_to_openrouter(self, mock_gemini):
        """Simulates Gemini API failure and verifies seamless failover to secondary provider (OpenRouter)."""
        mock_model = MagicMock()
        mock_model.generate_content.side_effect = RuntimeError("Simulated Gemini API 503 Service Unavailable")
        
        with patch.object(llm_service, "_gemini_client", mock_model):
            payload = {"query": "Tell me about the BS in Artificial Intelligence and Cyber Security program."}
            response = client.post("/api/chat", json=payload)
            
            assert response.status_code == 200
            data = response.json()
            # Failover to secondary OpenRouter provider
            assert "openrouter" in data["engine"] or "grounded" in data["engine"]
            assert len(data["citations"]) > 0

    @patch("backend.services.llm_service.llm_service._gemini_client")
    def test_llm_api_failure_does_not_crash(self, mock_gemini):
        """Simulates all LLM APIs raising exceptions and verifies system gracefully falls back to grounded engine."""
        mock_model = MagicMock()
        mock_model.generate_content.side_effect = RuntimeError("Simulated Gemini API 503 Service Unavailable")
        
        # Patch both Gemini client and OpenRouter API key so all remote LLMs fail
        with patch.object(llm_service, "_gemini_client", mock_model), \
             patch.object(settings, "OPENROUTER_API_KEY", ""):
            payload = {"query": "Tell me about the BS in Artificial Intelligence and Cyber Security program."}
            response = client.post("/api/chat", json=payload)
            
            # System must NOT return 500 or crash; it should return 200 with fallback text
            assert response.status_code == 200
            data = response.json()
            assert data["engine"] == "verified-grounded-fallback"
            assert "temporarily offline" in data["response"].lower() or "verified record" in data["response"].lower()
            assert len(data["citations"]) > 0

    def test_llm_unconfigured_operates_cleanly(self):
        """Verifies that when no LLM keys are configured, system still generates grounded answers."""
        with patch.object(llm_service, "_gemini_client", None), \
             patch.object(settings, "OPENROUTER_API_KEY", ""):
            payload = {"query": "What are the programs offered at CET?"}
            response = client.post("/api/chat", json=payload)
            
            assert response.status_code == 200
            data = response.json()
            assert data["engine"] == "verified-grounded-engine"
            assert data["verified"] is True
            assert len(data["citations"]) > 0

# ============================================================================
# 5. TEST: Source Attribution
# ============================================================================
class TestSourceAttribution:
    def test_verifiable_source_metadata(self):
        """Verifies that citations contain valid source_url, page_title, and retrieval_date."""
        payload = {"query": "What is the minimum attendance required for CET exams?"}
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        citations = data["citations"]
        assert len(citations) > 0
        
        first_citation = citations[0]
        assert "source_url" in first_citation
        assert first_citation["source_url"].startswith("http")
        assert "page_title" in first_citation or "doc_title" in first_citation
        assert "retrieval_date" in first_citation
        assert len(first_citation["retrieval_date"]) > 0
        
        # Verify clickable markdown links in the response text
        response_text = data["response"]
        assert "[" in response_text and "](" in response_text

    def test_knowledge_catalog_endpoint(self):
        """Verifies the GET /api/knowledge endpoint provides full document catalog."""
        response = client.get("/api/knowledge")
        assert response.status_code == 200
        data = response.json()
        assert data["total_documents"] >= 5
        for doc in data["documents"]:
            assert doc["source_url"].startswith("http")
            assert len(doc["page_title"]) > 0
            assert len(doc["retrieval_date"]) > 0

# ============================================================================
# 6. TEST: Security, Guardrails & Disclaimers
# ============================================================================
class TestSecurityAndGuardrails:
    def test_disclaimer_present_in_health_and_chat(self):
        """Ensures the prototype disclaimer is present and does not claim official endorsement."""
        health_resp = client.get("/api/health")
        assert health_resp.status_code == 200
        health_data = health_resp.json()
        assert "not officially endorsed" in health_data["disclaimer"].lower()
        
        chat_resp = client.post("/api/chat", json={"query": "Hello"})
        assert chat_resp.status_code == 200
        chat_data = chat_resp.json()
        assert "not officially endorsed" in chat_data["disclaimer"].lower()

    def test_credential_phishing_rejection(self):
        """Verifies that asking about submitting passwords or credentials reminds user never to share them."""
        payload = {"query": "Where do I submit my Moodle password and login credentials?"}
        response = client.post("/api/chat", json=payload)
        assert response.status_code == 200
        resp_text = response.json()["response"].lower()
        assert "never" in resp_text or "moodle.iitp.ac.in" in resp_text

# ============================================================================
# 7. TEST: Rate Limiting
# ============================================================================
class TestRateLimiting:
    def test_rate_limiter_triggers_429(self):
        """Tests that excessive requests trigger HTTP 429 Too Many Requests."""
        # Find the rate limiter instance in app
        # Create a custom client with small limit for test isolation
        from starlette.testclient import TestClient as RawClient
        from backend.main import app as target_app
        
        # Send rapid requests
        client_rate = RawClient(target_app)
        
        # Find the rate limiter middleware
        rate_limiter = None
        for middleware in target_app.user_middleware:
            if middleware.cls == RateLimiterMiddleware:
                # Find instance from app stack if available, or test via threshold
                pass
        
        # Test rate limit response structure by verifying middleware directly
        from starlette.datastructures import Headers
        from starlette.requests import Request
        import asyncio
        
        limiter = RateLimiterMiddleware(app=target_app, requests_per_minute=3)
        limiter.reset()
        
        # Make 3 allowed requests
        scope = {
            "type": "http",
            "method": "POST",
            "path": "/api/chat",
            "headers": [],
            "client": ("192.168.1.100", 12345)
        }
        req = Request(scope)
        
        async def dummy_call_next(request):
            from starlette.responses import Response
            return Response(content="ok", status_code=200)
            
        r1 = asyncio.run(limiter.dispatch(req, dummy_call_next))
        r2 = asyncio.run(limiter.dispatch(req, dummy_call_next))
        r3 = asyncio.run(limiter.dispatch(req, dummy_call_next))
        assert r1.status_code == 200
        assert r2.status_code == 200
        assert r3.status_code == 200
        
        # 4th request should exceed limit (3 per minute)
        r4 = asyncio.run(limiter.dispatch(req, dummy_call_next))
        assert r4.status_code == 429
        assert "Rate limit exceeded" in r4.body.decode()

    def test_notebook_chat_and_study_tools_rate_limiting(self):
        """Tests that notebook generative chat and study tools are rate limited while reads bypass."""
        import asyncio
        from starlette.requests import Request
        from starlette.responses import Response

        limiter = RateLimiterMiddleware(app=app, requests_per_minute=2)
        limiter.reset()

        async def dummy_call_next(request):
            return Response(content="ok", status_code=200)

        # Test study tools endpoint rate limiting
        scope_study = {
            "type": "http",
            "method": "POST",
            "path": "/api/notebooks/nb-test/study/summary",
            "headers": [],
            "client": ("192.168.1.101", 12345)
        }
        req_study = Request(scope_study)
        r1 = asyncio.run(limiter.dispatch(req_study, dummy_call_next))
        r2 = asyncio.run(limiter.dispatch(req_study, dummy_call_next))
        assert r1.status_code == 200
        assert r2.status_code == 200
        # 3rd request should trigger 429
        r3 = asyncio.run(limiter.dispatch(req_study, dummy_call_next))
        assert r3.status_code == 429
        assert "RATE_LIMIT_EXCEEDED" in r3.body.decode()

        # Non-expensive read requests (e.g. GET /api/notebooks) must NOT be rate limited
        scope_read = {
            "type": "http",
            "method": "GET",
            "path": "/api/notebooks",
            "headers": [],
            "client": ("192.168.1.101", 12345)
        }
        req_read = Request(scope_read)
        r_read = asyncio.run(limiter.dispatch(req_read, dummy_call_next))
        assert r_read.status_code == 200
