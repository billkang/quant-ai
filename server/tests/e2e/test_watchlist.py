from src.models import crud


class TestWatchlistE2E:
    """End-to-end tests for watchlist CRUD and kline caching."""

    def test_get_watchlist_empty(self, e2e_client):
        response = e2e_client.get("/api/stocks/watchlist")
        assert response.status_code == 200
        assert response.json() == []

    def test_add_watchlist_and_verify_db(self, e2e_client, db_session):
        stock_code = "000001"
        response = e2e_client.post(f"/api/stocks/watchlist?stock_code={stock_code}")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert data["data"]["stock_code"] == stock_code

        # Verify DB state
        watchlist = crud.get_watchlist(db_session)
        assert len(watchlist) == 1
        assert watchlist[0].stock_code == stock_code

    def test_add_duplicate_watchlist(self, e2e_client):
        stock_code = "000001"
        r1 = e2e_client.post(f"/api/stocks/watchlist?stock_code={stock_code}")
        assert r1.status_code == 200

        r2 = e2e_client.post(f"/api/stocks/watchlist?stock_code={stock_code}")
        assert r2.status_code == 200
        assert "已存在" in r2.json()["message"] or r2.json()["code"] == 0

    def test_add_hk_stock_to_watchlist(self, e2e_client, db_session):
        stock_code = "3690.HK"
        response = e2e_client.post(f"/api/stocks/watchlist?stock_code={stock_code}")
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["stock_code"] == stock_code

        watchlist = crud.get_watchlist(db_session)
        assert any(w.stock_code == stock_code for w in watchlist)

    def test_remove_watchlist(self, e2e_client, db_session):
        stock_code = "000001"
        e2e_client.post(f"/api/stocks/watchlist?stock_code={stock_code}")
        assert crud.get_watchlist(db_session)

        response = e2e_client.delete(f"/api/stocks/watchlist/{stock_code}")
        assert response.status_code == 200

        watchlist = crud.get_watchlist(db_session)
        assert len(watchlist) == 0

    def test_get_watchlist_returns_enriched_data(self, e2e_client):
        stock_code = "000001"
        e2e_client.post(f"/api/stocks/watchlist?stock_code={stock_code}")

        response = e2e_client.get("/api/stocks/watchlist")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["code"] == stock_code
        assert "name" in data[0]
        assert "price" in data[0]

    def test_kline_cached_on_add(self, e2e_client, db_session):
        stock_code = "000001"
        e2e_client.post(f"/api/stocks/watchlist?stock_code={stock_code}")

        kline = crud.get_stock_kline(db_session, stock_code, "6mo")
        assert kline is not None
        assert isinstance(kline.data, list)
        assert len(kline.data) > 0

    def test_get_kline_endpoint(self, e2e_client):
        stock_code = "000001"
        response = e2e_client.get(f"/api/stocks/{stock_code}/kline?period=daily")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "date" in data[0]
        assert "open" in data[0]
        assert "close" in data[0]

    def test_get_stock_detail(self, e2e_client):
        stock_code = "000001"
        response = e2e_client.get(f"/api/stocks/{stock_code}")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == stock_code
        assert "name" in data
