import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.main import app
from src.models.database import Base

# Create a fresh SQLite memory database for API tests
TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Monkey-patch the app's database module before creating TestClient
import src.models.database as db_module  # noqa: E402

db_module.engine = engine
db_module.SessionLocal = TestingSessionLocal

# Also patch services that import SessionLocal at module level
import src.services.news as _news_module  # noqa: E402

_news_module.SessionLocal = TestingSessionLocal

# Import models so their tables are registered on Base.metadata
import src.models.models  # noqa: E402, F401

# Create all tables
Base.metadata.create_all(bind=engine)

# Mock Redis to avoid connection errors in tests
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

# Provide a default mock user for all authenticated endpoints
import src.api.auth as _auth_module  # noqa: E402
from src.models import models as _models_module  # noqa: E402

_mock_user = _models_module.User(id=1, username="test", email="t@test.com", is_active=True)
app.dependency_overrides[_auth_module.get_current_user] = lambda: _mock_user

client = TestClient(app)


class TestStocksAPI:
    def test_get_watchlist_empty(self):
        response = client.get("/api/stocks/watchlist")
        assert response.status_code == 200

    def test_add_and_remove_watchlist(self):
        response = client.post("/api/stocks/watchlist?stock_code=000001")
        assert response.status_code == 200

        response = client.delete("/api/stocks/watchlist/000001")
        assert response.status_code == 200

    def test_get_stock_not_found(self):
        response = client.get("/api/stocks/999999")
        assert response.status_code in (200, 404)

    def test_get_kline(self):
        response = client.get("/api/stocks/000001/kline?period=daily")
        assert response.status_code in (200, 404)


class TestNewsAPI:
    def test_get_news_sources(self):
        response = client.get("/api/news/sources")
        assert response.status_code == 200

    def test_get_news_with_symbol(self):
        response = client.get("/api/news?symbol=000001")
        assert response.status_code == 200

    def test_add_news_source(self):
        payload = {
            "name": "测试源",
            "source_type": "rss",
            "config": {"url": "http://test.com/rss"},
            "interval_minutes": 60,
        }
        response = client.post("/api/news/sources", json=payload)
        assert response.status_code == 200

    def test_delete_news_source(self):
        response = client.delete("/api/news/sources/999999")
        assert response.status_code in (200, 404)


class TestAIAPI:
    def test_post_analyze_passes_dict_params(self, monkeypatch):
        from datetime import date

        import src.api.auth as auth_module
        from src.models import crud, models

        # Create a mock user and patch authentication
        mock_user = models.User(id=1, username="test", email="t@test.com", is_active=True)
        app.dependency_overrides[auth_module.get_current_user] = lambda: mock_user

        # Insert indicator and fundamental data into the test DB
        db = db_module.SessionLocal()
        crud.save_indicator(
            db,
            "000001",
            date(2025, 1, 15),
            ma5=10.0,
            ma20=11.0,
            rsi6=45.0,
            macd_dif=0.5,
            macd_dea=0.3,
            boll_upper=13.0,
            boll_lower=9.0,
        )
        crud.save_fundamental(
            db,
            "000001",
            date(2025, 1, 15),
            pe_ttm=15.5,
            pb=2.1,
            roe=12.5,
            gross_margin=35.0,
            revenue_growth=10.2,
            debt_ratio=45.0,
        )
        db.close()

        # Capture arguments passed to diagnostic_service.analyze
        captured = {}

        def _mock_analyze(code, stock, indicators=None, fundamentals=None, news=None):
            captured["indicators"] = indicators
            captured["fundamentals"] = fundamentals
            captured["news"] = news
            return {
                "fundamental_analysis": "基本面良好",
                "technical_analysis": "技术面中性",
                "risk_analysis": "风险可控",
                "final_report": "综合报告",
            }

        import src.api.ai as ai_module
        import src.services.ai_diagnostic as diag_module

        monkeypatch.setattr(diag_module.diagnostic_service, "analyze", _mock_analyze)

        async def _mock_get_stock(code):
            return {"code": code, "name": f"股票{code}", "price": 10.5}

        monkeypatch.setattr(ai_module, "get_stock", _mock_get_stock)

        response = client.post("/api/ai/analyze", json={"code": "000001"})
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert data["data"]["fundamental_analysis"] == "基本面良好"

        # The key assertion: indicators and fundamentals must be dicts, not lists
        assert isinstance(captured["indicators"], dict)
        assert captured["indicators"].get("ma5") == 10.0
        assert isinstance(captured["fundamentals"], dict)
        assert captured["fundamentals"].get("pe_ttm") == 15.5
        assert isinstance(captured["news"], list)

        app.dependency_overrides[auth_module.get_current_user] = lambda: _mock_user

    def test_get_history_empty(self):
        response = client.get("/api/ai/history")
        assert response.status_code == 200

    def test_get_history_detail_not_found(self):
        # Use fresh client to avoid rate limit from previous AI tests
        c = TestClient(app, headers={"X-Forwarded-For": "10.0.0.1"})
        response = c.get("/api/ai/history/999999")
        assert response.status_code == 404

    def test_chat(self):
        c = TestClient(app, headers={"X-Forwarded-For": "10.0.0.2"})
        response = c.get("/api/ai/chat?question=你好")
        assert response.status_code == 200


class TestPortfolioAPI:
    def test_get_portfolio(self):
        response = client.get("/api/portfolio")
        assert response.status_code == 200

    def test_add_and_delete_position(self):
        payload = {
            "stock_code": "000001",
            "stock_name": "平安银行",
            "quantity": 100,
            "cost_price": 10.0,
        }
        response = client.post("/api/portfolio", params=payload)
        assert response.status_code == 200

        response = client.delete("/api/portfolio/000001")
        assert response.status_code == 200

    def test_get_transactions(self):
        response = client.get("/api/portfolio/transactions")
        assert response.status_code == 200


class TestQuantAPI:
    def test_get_indicators_not_found(self):
        response = client.get("/api/quant/indicators/999999")
        assert response.status_code == 200

    def test_get_indicator_history(self):
        response = client.get("/api/quant/indicators/000001/history?limit=10")
        assert response.status_code == 200

    def test_get_fundamentals(self):
        response = client.get("/api/quant/fundamentals/000001")
        assert response.status_code == 200

    def test_get_backtests(self):
        response = client.get("/api/quant/backtests")
        assert response.status_code == 200

    def test_get_backtest_detail_not_found(self):
        response = client.get("/api/quant/backtests/999999")
        assert response.status_code == 200

    def test_get_portfolio_analysis(self):
        response = client.get("/api/quant/portfolio/analysis")
        assert response.status_code == 200

    def test_get_alerts(self):
        response = client.get("/api/quant/alerts")
        assert response.status_code == 200

    def test_mark_alert_read_not_found(self):
        response = client.put("/api/quant/alerts/999999/read")
        assert response.status_code == 200


class TestHealthAPI:
    def test_health(self):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert data["data"]["status"] == "ok"
