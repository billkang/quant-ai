import time
from collections import defaultdict
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiter. Use Redis in production for distributed setups."""

    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: Callable):
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        # Stricter limits for expensive endpoints
        limit = self.requests_per_minute
        if path.startswith("/api/ai/"):
            limit = 10
        elif path.startswith("/api/news/sources/") and path.endswith("/fetch"):
            limit = 20

        now = time.time()
        window = 60  # 1 minute

        # Clean old requests
        self.requests[client_ip] = [t for t in self.requests[client_ip] if now - t < window]

        if len(self.requests[client_ip]) >= limit:
            return Response(
                content='{"code": 429, "message": "请求过于频繁，请稍后再试"}',
                status_code=429,
                media_type="application/json",
            )

        self.requests[client_ip].append(now)
        return await call_next(request)
