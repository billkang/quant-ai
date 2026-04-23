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

# Mock stock service to avoid network calls
import src.services.stock_data as _stock_module  # noqa: E402


def _mock_a_quote(symbol):
    return {
        "code": symbol,
        "name": f"股票{symbol}",
        "price": 10.5,
        "open": 10.0,
        "high": 11.0,
        "low": 9.5,
        "volume": 100000,
        "amount": 1050000,
        "change": 0.5,
        "changePercent": 5.0,
    }


_stock_module.stock_service.get_a_stock_quote = _mock_a_quote

client = TestClient(app)


class TestPaperTradingAPI:
    def setup_method(self):
        self.token = self._register_and_login()
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def _register_and_login(self):
        res = client.post(
            "/api/auth/register",
            json={
                "username": "paper_test_user",
                "email": "paper@test.com",
                "password": "testpass123",
            },
        )
        if res.status_code == 400 and "已存在" in (res.json().get("detail") or ""):
            res = client.post(
                "/api/auth/login",
                json={
                    "username": "paper_test_user",
                    "password": "testpass123",
                },
            )
        return res.json()["data"]["access_token"]

    def test_get_account_creates_default(self):
        res = client.get("/api/paper/account", headers=self.headers)
        assert res.status_code == 200
        data = res.json()["data"]
        assert data["initialCash"] == 1_000_000
        assert data["availableCash"] == 1_000_000
        assert data["totalAssets"] == 1_000_000

    def test_buy_order(self):
        res = client.post(
            "/api/paper/orders",
            headers=self.headers,
            json={
                "stock_code": "600519",
                "stock_name": "贵州茅台",
                "side": "buy",
                "quantity": 100,
                "order_type": "market",
            },
        )
        assert res.status_code == 200
        data = res.json()["data"]
        assert data["side"] == "buy"
        assert data["quantity"] == 100
        assert data["status"] == "filled"

    def test_sell_order_without_position_fails(self):
        res = client.post(
            "/api/paper/orders",
            headers=self.headers,
            json={
                "stock_code": "000001",
                "stock_name": "平安银行",
                "side": "sell",
                "quantity": 100,
                "order_type": "market",
            },
        )
        assert res.status_code == 400

    def test_reset_account(self):
        client.post(
            "/api/paper/orders",
            headers=self.headers,
            json={
                "stock_code": "600519",
                "stock_name": "贵州茅台",
                "side": "buy",
                "quantity": 100,
                "order_type": "market",
            },
        )
        res = client.post("/api/paper/reset", headers=self.headers)
        assert res.status_code == 200
        res = client.get("/api/paper/positions", headers=self.headers)
        assert res.json()["data"] == []

    def test_get_orders(self):
        client.post(
            "/api/paper/orders",
            headers=self.headers,
            json={
                "stock_code": "600519",
                "stock_name": "贵州茅台",
                "side": "buy",
                "quantity": 100,
                "order_type": "market",
            },
        )
        res = client.get("/api/paper/orders", headers=self.headers)
        assert res.status_code == 200
        assert len(res.json()["data"]) >= 1
