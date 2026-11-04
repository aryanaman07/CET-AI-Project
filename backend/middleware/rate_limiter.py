"""
IITP CET AI — API Rate Limiting Middleware
------------------------------------------
Protects the application against burst traffic, bot abuse, and external API quota
exhaustion using an in-memory sliding-window timestamp tracker.

Key Behaviors:
  1. Sliding-Window Counter:
     - Tracks client IP request timestamps over a rolling 60-second window.
     - Automatically purges timestamps older than 60 seconds on every request.
  2. Targeted Route Filtering:
     - Applies rate limits strictly to computationally expensive LLM endpoints:
         • /api/chat (Institutional chatbot)
         • /api/notebooks/{id}/chat (RAG QA)
         • /api/notebooks/{id}/study/summary
         • /api/notebooks/{id}/study/quiz
         • /api/notebooks/{id}/study/flashcards
         • /api/notebooks/{id}/study/guide
     - Leaves lightweight read operations (page navigation, notebook listings,
       file uploads) unhindered so student user experience remains snappy.
  3. Response on Limit Exceeded:
     - Returns HTTP 429 (Too Many Requests) with a clean JSON payload and Retry-After header.
"""

import time
from typing import Dict, List
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from ..config import settings

class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        # Dict mapping IP to list of request timestamps
        self.client_requests: Dict[str, List[float]] = {}

    def is_rate_limited_path(self, path: str) -> bool:
        """
        Target only expensive generative AI endpoints:
        - /api/chat (Institutional chatbot)
        - /api/notebooks/{id}/chat (Notebook RAG QA)
        - /api/notebooks/{id}/study/summary
        - /api/notebooks/{id}/study/quiz
        - /api/notebooks/{id}/study/flashcards
        - /api/notebooks/{id}/study/guide
        Excludes document uploads, metadata reads, page viewing, and deletions.
        """
        if path.startswith("/api/chat"):
            return True
        if "/study/" in path and any(path.endswith(f"/study/{tool}") for tool in ["summary", "quiz", "flashcards", "guide"]):
            return True
        if path.startswith("/api/notebooks/") and path.endswith("/chat"):
            return True
        return False

    def _clean_old_requests(self, ip: str, now: float):
        """Removes request timestamps older than 60 seconds."""
        if ip in self.client_requests:
            window_start = now - 60.0
            self.client_requests[ip] = [ts for ts in self.client_requests[ip] if ts > window_start]
            if not self.client_requests[ip]:
                del self.client_requests[ip]

    def reset(self):
        """Resets all tracking counters (useful for unit tests)."""
        self.client_requests.clear()

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        is_targeted = self.is_rate_limited_path(path)
        
        if not is_targeted or request.method == "OPTIONS":
            return await call_next(request)

        # Determine client identifier (client host or X-Forwarded-For)
        client_ip = request.client.host if request.client else "unknown"
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()

        now = time.time()
        self._clean_old_requests(client_ip, now)
        
        history = self.client_requests.get(client_ip, [])
        if len(history) >= self.requests_per_minute:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute allowed.",
                    "code": "RATE_LIMIT_EXCEEDED"
                },
                headers={"Retry-After": "60"}
            )

        # Record this request
        if client_ip not in self.client_requests:
            self.client_requests[client_ip] = []
        self.client_requests[client_ip].append(now)

        response = await call_next(request)
        return response
