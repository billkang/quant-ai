from datetime import datetime

from src.models import crud


class TestPortfolioE2E:
    """End-to-end tests for portfolio management."""

    def test_get_empty_portfolio(self, e2e_client):
        response = e2e_client.get("/api/portfolio")
        assert response.status_code == 200
        data = response.json()
        assert data["positions"] == []
        assert data["totalValue"] == 0
        assert data["totalCost"] == 0

    def test_add_and_get_position(self, e2e_client, db_session):
        payload = {
            "stock_code": "000001",
            "stock_name": "平安银行",
            "quantity": 100,
            "cost_price": 10.0,
            "buy_date": "2025-01-01",
        }
        response = e2e_client.post("/api/portfolio", params=payload)
        assert response.status_code == 200

        positions = crud.get_positions(db_session)
        assert len(positions) == 1
        assert positions[0].stock_code == "000001"
        assert positions[0].quantity == 100

    def test_portfolio_calculates_profit(self, e2e_client):
        e2e_client.post(
            "/api/portfolio",
            params={
                "stock_code": "000001",
                "stock_name": "平安银行",
                "quantity": 100,
                "cost_price": 10.0,
            },
        )

        response = e2e_client.get("/api/portfolio")
        assert response.status_code == 200
        data = response.json()
        assert len(data["positions"]) == 1
        pos = data["positions"][0]
        assert pos["code"] == "000001"
        assert pos["quantity"] == 100
        assert pos["costPrice"] == 10.0
        assert pos["currentPrice"] > 0

    def test_delete_position(self, e2e_client, db_session):
        e2e_client.post(
            "/api/portfolio",
            params={
                "stock_code": "000001",
                "stock_name": "平安银行",
                "quantity": 100,
                "cost_price": 10.0,
            },
        )
        assert crud.get_positions(db_session)

        response = e2e_client.delete("/api/portfolio/000001")
        assert response.status_code == 200
        assert crud.get_positions(db_session) == []

    def test_get_transactions(self, e2e_client, db_session):
        crud.add_transaction(
            db_session, "000001", "平安银行", "buy", 100, 10.0, 5.0, datetime.now()
        )

        response = e2e_client.get("/api/portfolio/transactions")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["code"] == "000001"
        assert data[0]["type"] == "buy"


class TestNewsE2E:
    """End-to-end tests for news sources and articles."""

    def test_get_news_sources_empty(self, e2e_client):
        response = e2e_client.get("/api/news/sources")
        assert response.status_code == 200
        data = response.json()
        assert data == []

    def test_add_and_list_news_source(self, e2e_client, db_session):
        payload = {
            "name": "测试源",
            "source_type": "rss",
            "config": {"url": "http://test.com/rss"},
            "interval_minutes": 60,
        }
        response = e2e_client.post("/api/news/sources", json=payload)
        assert response.status_code == 200
        source_id = response.json()["data"]["id"]

        sources = crud.get_news_sources(db_session)
        assert len(sources) == 1
        assert sources[0].id == source_id

    def test_update_news_source(self, e2e_client):
        # Create first
        create_resp = e2e_client.post(
            "/api/news/sources",
            json={
                "name": "旧名称",
                "source_type": "rss",
                "config": {},
                "interval_minutes": 60,
            },
        )
        source_id = create_resp.json()["data"]["id"]

        update_resp = e2e_client.put(
            f"/api/news/sources/{source_id}",
            params={"name": "新名称", "enabled": False},
        )
        assert update_resp.status_code == 200

        detail = e2e_client.get("/api/news/sources").json()
        assert detail[0]["name"] == "新名称"
        assert detail[0]["enabled"] is False

    def test_delete_news_source(self, e2e_client, db_session):
        source = crud.add_news_source(db_session, "待删除", "rss", {}, 60)
        db_session.commit()

        response = e2e_client.delete(f"/api/news/sources/{source.id}")
        assert response.status_code == 200
        assert crud.get_news_sources(db_session) == []

    def test_fetch_news_source(self, e2e_client):
        create_resp = e2e_client.post(
            "/api/news/sources",
            json={
                "name": "测试股票新闻",
                "source_type": "stock_news",
                "config": {"symbol": "000001"},
                "interval_minutes": 1,
            },
        )
        source_id = create_resp.json()["data"]["id"]

        fetch_resp = e2e_client.post(f"/api/news/sources/{source_id}/fetch")
        assert fetch_resp.status_code == 200
        result = fetch_resp.json()
        assert result["status"] == "ok"
        assert result["new"] >= 0

    def test_get_news_by_symbol(self, e2e_client):
        response = e2e_client.get("/api/news?symbol=000001")
        assert response.status_code == 200
        # Returns list of articles (may be empty or created on demand)
        assert isinstance(response.json(), list)


class TestHealthE2E:
    """Basic health check end-to-end."""

    def test_health(self, e2e_client):
        response = e2e_client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert data["data"]["status"] == "ok"
