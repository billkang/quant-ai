from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.main import app
from src.models.database import Base

# Create a fresh SQLite file database for API tests
TEST_DB_URL = "sqlite:///./test_api.db"
engine = create_engine(TEST_DB_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Monkey-patch the app's database module before creating TestClient
import src.models.database as db_module  # noqa: E402

db_module.engine = engine
db_module.SessionLocal = TestingSessionLocal

# Create all tables
Base.metadata.create_all(bind=engine)

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
