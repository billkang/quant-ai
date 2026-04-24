import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.main import app
from src.models.database import Base

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

import src.models.database as db_module  # noqa: E402

db_module.engine = engine
db_module.SessionLocal = TestingSessionLocal

import src.services.news as _news_module  # noqa: E402

_news_module.SessionLocal = TestingSessionLocal

import src.models.models  # noqa: E402, F401

Base.metadata.create_all(bind=engine)

import src.api.deps as _deps_module  # noqa: E402


class _FakeRedis:
    _store = {}

    def get(self, key):
        return self._store.get(key)

    def setex(self, key, ttl, value):
        self._store[key] = value

    def delete(self, *keys):
        for k in keys:
            self._store.pop(k, None)


_deps_module.redis_client = _FakeRedis()

import src.api.auth as _auth_module  # noqa: E402
from src.models import models as _models_module  # noqa: E402

_mock_user = _models_module.User(id=1, username="test", email="t@test.com", is_active=True)
app.dependency_overrides[_auth_module.get_current_user] = lambda: _mock_user

client = TestClient(app)


class TestCollectionAPI:
    def test_list_jobs_empty(self):
        response = client.get("/api/collection/jobs")
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["items"] == []
        assert data["total"] == 0

    def test_trigger_stock_collection(self):
        response = client.post(
            "/api/collection/jobs/trigger", json={"job_type": "stock_collection"}
        )
        assert response.status_code == 200
        assert "id" in response.json()["data"]

    def test_trigger_news_collection(self):
        response = client.post("/api/collection/jobs/trigger", json={"job_type": "news_collection"})
        assert response.status_code == 200
        assert "id" in response.json()["data"]

    def test_trigger_invalid_job_type(self):
        response = client.post("/api/collection/jobs/trigger", json={"job_type": "invalid"})
        assert response.status_code == 400

    def test_get_job_detail(self):
        create_resp = client.post(
            "/api/collection/jobs/trigger", json={"job_type": "stock_collection"}
        )
        job_id = create_resp.json()["data"]["id"]

        response = client.get(f"/api/collection/jobs/{job_id}")
        assert response.status_code == 200
        assert response.json()["data"]["jobType"] == "stock_collection"

    def test_get_job_not_found(self):
        response = client.get("/api/collection/jobs/99999")
        assert response.status_code == 404

    def test_cancel_job(self):
        create_resp = client.post(
            "/api/collection/jobs/trigger", json={"job_type": "news_collection"}
        )
        job_id = create_resp.json()["data"]["id"]

        response = client.post(f"/api/collection/jobs/{job_id}/cancel")
        assert response.status_code == 200

        # Verify status
        detail = client.get(f"/api/collection/jobs/{job_id}")
        assert detail.json()["data"]["status"] == "cancelled"

    def test_cancel_completed_job_fails(self):
        from src.models import crud
        from src.models.database import SessionLocal

        db = SessionLocal()
        job = crud.create_collection_job(db, "stock_collection")
        crud.complete_collection_job(db, job.id)
        db.close()

        response = client.post(f"/api/collection/jobs/{job.id}/cancel")
        assert response.status_code == 400

    def test_filter_jobs_by_status(self):
        client.post("/api/collection/jobs/trigger", json={"job_type": "stock_collection"})

        response = client.get("/api/collection/jobs?status=running")
        assert response.status_code == 200
        data = response.json()["data"]
        assert len(data["items"]) >= 1
        for item in data["items"]:
            assert item["status"] == "running"

    def test_filter_jobs_by_type(self):
        client.post("/api/collection/jobs/trigger", json={"job_type": "news_collection"})

        response = client.get("/api/collection/jobs?jobType=news_collection")
        assert response.status_code == 200
        data = response.json()["data"]
        assert len(data["items"]) >= 1
        assert any(item["jobType"] == "news_collection" for item in data["items"])
