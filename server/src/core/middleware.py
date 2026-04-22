import time
from collections import defaultdict
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from src.api.deps import redis_client


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiter using Redis for distributed setups, with in-memory fallback."""

    def __init__(self, app, requests_per_minute: int = 60, use_redis: bool = False):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.use_redis = use_redis
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: Callable):
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        limit = self.requests_per_minute
        if path.startswith("/api/ai/"):
            limit = 10
        elif path.startswith("/api/news/sources/") and path.endswith("/fetch"):
            limit = 20

        now = time.time()
        window = 60

        if self.use_redis:
            try:
                key = f"rate_limit:{client_ip}:{path}"
                pipe = redis_client.pipeline()
                pipe.zremrangebyscore(key, 0, now - window)
                pipe.zcard(key)
                pipe.zadd(key, {str(now): now})
                pipe.expire(key, window)
                _, count, _, _ = pipe.execute()
                if count >= limit:
                    return Response(
                        content='{"code": 429, "message": "请求过于频繁，请稍后再试"}',
                        status_code=429,
                        media_type="application/json",
                    )
            except Exception:
                pass
        else:
            key = f"{client_ip}:{path}"
            self.requests[key] = [t for t in self.requests[key] if now - t < window]
            if len(self.requests[key]) >= limit:
                return Response(
                    content='{"code": 429, "message": "请求过于频繁，请稍后再试"}',
                    status_code=429,
                    media_type="application/json",
                )
            self.requests[key].append(now)

        return await call_next(request)
