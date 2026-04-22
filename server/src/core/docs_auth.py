from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from src.core.config import settings


class DocsAuthMiddleware(BaseHTTPMiddleware):
    """Basic auth for Swagger/OpenAPI docs in production."""

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if settings.ENV != "production":
            return await call_next(request)

        if not settings.DOCS_USERNAME or not settings.DOCS_PASSWORD:
            return await call_next(request)

        if path in ("/docs", "/redoc", "/openapi.json"):
            auth = request.headers.get("Authorization", "")
            if not auth.startswith("Basic "):
                return Response(
                    status_code=401,
                    headers={"WWW-Authenticate": "Basic"},
                    content="Authentication required",
                )
            import base64

            try:
                creds = base64.b64decode(auth[6:]).decode("utf-8")
                username, password = creds.split(":", 1)
            except Exception:
                return Response(status_code=401, content="Invalid credentials")

            if username != settings.DOCS_USERNAME or password != settings.DOCS_PASSWORD:
                return Response(status_code=401, content="Invalid credentials")

        return await call_next(request)
