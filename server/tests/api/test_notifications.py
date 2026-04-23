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

client = TestClient(app)


class TestNotificationAPI:
    def setup_method(self):
        self.token = self._register_and_login()
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def _register_and_login(self):
        res = client.post(
            "/api/auth/register",
            json={
                "username": "notif_test_user",
                "email": "notif@test.com",
                "password": "testpass123",
            },
        )
        if res.status_code == 400 and "已存在" in (res.json().get("detail") or ""):
            res = client.post(
                "/api/auth/login",
                json={
                    "username": "notif_test_user",
                    "password": "testpass123",
                },
            )
        return res.json()["data"]["access_token"]

    def test_get_settings(self):
        res = client.get("/api/notifications/settings", headers=self.headers)
        assert res.status_code == 200
        data = res.json()["data"]
        assert "email" in data
        assert "webhook" in data

    def test_update_settings(self):
        res = client.put(
            "/api/notifications/settings",
            headers=self.headers,
            json={
                "email": {"enabled": True, "address": "test@example.com"},
                "webhook": {"enabled": False, "url": ""},
                "channels": {"price_alert": ["email", "in_app"]},
            },
        )
        assert res.status_code == 200

    def test_get_history_empty(self):
        res = client.get("/api/notifications/history", headers=self.headers)
        assert res.status_code == 200
        assert res.json()["data"] == []

    def test_test_channel(self):
        res = client.post(
            "/api/notifications/test",
            headers=self.headers,
            json={
                "channel": "email",
            },
        )
        assert res.status_code == 200
