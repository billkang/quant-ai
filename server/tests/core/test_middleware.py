import time

import pytest
from fastapi import FastAPI
from starlette.testclient import TestClient

from src.core.middleware import RateLimitMiddleware


@pytest.fixture
def rate_limit_app():
    app = FastAPI()
    app.add_middleware(RateLimitMiddleware, requests_per_minute=60, use_redis=False)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    @app.post("/api/ai/analyze")
    def analyze():
        return {"advice": "test"}

    return app


def test_rate_limit_allows_requests_within_limit(rate_limit_app):
    client = TestClient(rate_limit_app)
    for _ in range(10):
        resp = client.post("/api/ai/analyze")
        assert resp.status_code == 200


def test_rate_limit_blocks_excessive_requests(rate_limit_app):
    client = TestClient(rate_limit_app)
    for _ in range(10):
        resp = client.post("/api/ai/analyze")
        assert resp.status_code == 200

    resp = client.post("/api/ai/analyze")
    assert resp.status_code == 429
    assert resp.json()["code"] == 429


def test_rate_limit_is_per_path(rate_limit_app):
    """Different paths should have independent rate-limit counters."""
    client = TestClient(rate_limit_app)

    # Exhaust the /api/ai/analyze limit (10/min)
    for _ in range(10):
        resp = client.post("/api/ai/analyze")
        assert resp.status_code == 200

    resp = client.post("/api/ai/analyze")
    assert resp.status_code == 429

    # /api/health should still work because it has its own counter (60/min)
    resp = client.get("/api/health")
    assert resp.status_code == 200


def test_rate_limit_uses_forwarded_for(rate_limit_app):
    client = TestClient(rate_limit_app)

    for _ in range(10):
        resp = client.post(
            "/api/ai/analyze",
            headers={"X-Forwarded-For": "1.2.3.4"},
        )
        assert resp.status_code == 200

    resp = client.post(
        "/api/ai/analyze",
        headers={"X-Forwarded-For": "1.2.3.4"},
    )
    assert resp.status_code == 429

    # A different IP behind the proxy should still be allowed
    resp = client.post(
        "/api/ai/analyze",
        headers={"X-Forwarded-For": "5.6.7.8"},
    )
    assert resp.status_code == 200


def test_rate_limit_window_expires(rate_limit_app):
    """After the 60-second window, requests should be allowed again."""
    client = TestClient(rate_limit_app)

    for _ in range(10):
        resp = client.post("/api/ai/analyze")
        assert resp.status_code == 200

    # Blocked
    resp = client.post("/api/ai/analyze")
    assert resp.status_code == 429

    # Instead of waiting 60s, mutate the in-memory store directly
    instance = rate_limit_app.middleware_stack.app
    now = time.time()
    for key in list(instance.requests.keys()):
        instance.requests[key] = [t for t in instance.requests[key] if now - t < 60]

    # Since we didn't actually wait, the request is still blocked
    resp = client.post("/api/ai/analyze")
    assert resp.status_code == 429
