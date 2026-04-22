from datetime import date, datetime, timedelta

from src.models import crud, models


class TestQuantIndicatorsE2E:
    """End-to-end tests for technical indicators API."""

    def test_get_indicators_empty_when_no_data(self, e2e_client):
        response = e2e_client.get("/api/quant/indicators/000001")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert data["data"] is None

    def test_get_indicator_history_empty(self, e2e_client):
        response = e2e_client.get("/api/quant/indicators/000001/history?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert data["data"] == []

    def test_indicator_roundtrip(self, e2e_client, db_session):
        stock_code = "000001"
        trade_date = date.today()
        crud.save_indicator(
            db_session,
            stock_code,
            trade_date,
            ma5=10.0,
            ma10=10.5,
            ma20=11.0,
            ma60=12.0,
            rsi6=45.0,
            rsi12=50.0,
            rsi24=55.0,
            macd_dif=0.5,
            macd_dea=0.3,
            macd_bar=0.4,
            kdj_k=60.0,
            kdj_d=55.0,
            kdj_j=70.0,
            boll_upper=13.0,
            boll_mid=11.0,
            boll_lower=9.0,
            vol_ma5=100000,
            vol_ma10=120000,
        )

        response = e2e_client.get(f"/api/quant/indicators/{stock_code}")
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["stockCode"] == stock_code
        assert data["ma5"] == 10.0
        assert data["rsi6"] == 45.0

    def test_indicator_history_roundtrip(self, e2e_client, db_session):
        stock_code = "000001"
        for i in range(5):
            crud.save_indicator(
                db_session, stock_code, date.today() - timedelta(days=i), ma5=float(i)
            )

        response = e2e_client.get(f"/api/quant/indicators/{stock_code}/history?limit=10")
        assert response.status_code == 200
        data = response.json()["data"]
        assert len(data) == 5


class TestQuantBacktestE2E:
    """End-to-end tests for strategy backtest."""

    def test_run_backtest_ma_cross(self, e2e_client):
        payload = {
            "stockCode": "000001",
            "strategy": "ma_cross",
            "strategyParams": {"short": 5, "long": 20},
            "startDate": "2024-01-01",
            "endDate": "2024-12-31",
            "initialCash": 100000,
        }
        response = e2e_client.post("/api/quant/backtest", json=payload)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "id" in data
        # run_backtest returns raw result keys (snake_case)
        assert "total_return" in data
        assert "trade_count" in data
        assert "equity_curve" in data
        assert "trades" in data

    def test_run_backtest_rsi_oversold(self, e2e_client):
        payload = {
            "stockCode": "000001",
            "strategy": "rsi_oversold",
            "strategyParams": {"period": 6, "oversold": 30, "overbought": 70},
            "startDate": "2024-01-01",
            "endDate": "2024-12-31",
            "initialCash": 100000,
        }
        response = e2e_client.post("/api/quant/backtest", json=payload)
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["trade_count"] >= 0

    def test_backtest_list_and_detail(self, e2e_client):
        # Create a backtest first
        payload = {
            "stockCode": "000001",
            "strategy": "ma_cross",
            "strategyParams": {},
            "startDate": "2024-01-01",
            "endDate": "2024-12-31",
            "initialCash": 100000,
        }
        create_resp = e2e_client.post("/api/quant/backtest", json=payload)
        backtest_id = create_resp.json()["data"]["id"]

        # List backtests
        list_resp = e2e_client.get("/api/quant/backtests")
        assert list_resp.status_code == 200
        backtests = list_resp.json()["data"]
        assert any(b["id"] == backtest_id for b in backtests)

        # Get detail
        detail_resp = e2e_client.get(f"/api/quant/backtests/{backtest_id}")
        assert detail_resp.status_code == 200
        detail = detail_resp.json()["data"]
        assert detail["id"] == backtest_id
        assert detail["strategy"] == "ma_cross"


class TestQuantAlertsE2E:
    """End-to-end tests for alert rules and scanning."""

    def test_get_alerts_empty(self, e2e_client):
        response = e2e_client.get("/api/quant/alerts")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert data["data"] == []

    def test_create_alert_rule(self, e2e_client, db_session):
        payload = {
            "stockCode": "000001",
            "alertType": "price_break",
            "condition": "price > 15.0",
            "message": "股价突破15元",
        }
        response = e2e_client.post("/api/quant/alerts/rules", json=payload)
        assert response.status_code == 200
        alert_id = response.json()["data"]["id"]

        alerts = crud.get_alerts(db_session)
        assert len(alerts) == 1
        assert alerts[0].id == alert_id
        assert alerts[0].stock_code == "000001"

    def test_mark_alert_read(self, e2e_client, db_session):
        alert = crud.save_alert(
            db_session,
            stock_code="000001",
            alert_type="indicator_signal",
            condition="RSI6 < 20",
            message="RSI6 超卖",
            triggered_at=datetime.now(),
        )
        db_session.refresh(alert)

        response = e2e_client.put(f"/api/quant/alerts/{alert.id}/read")
        assert response.status_code == 200

        updated = db_session.query(models.Alert).filter(models.Alert.id == alert.id).first()
        assert updated.is_read == 1

    def test_alert_filter_by_read_status(self, e2e_client, db_session):
        crud.save_alert(
            db_session,
            stock_code="000001",
            alert_type="test",
            condition="test",
            message="unread",
            triggered_at=datetime.now(),
        )
        read_alert = crud.save_alert(
            db_session,
            stock_code="000002",
            alert_type="test",
            condition="test",
            message="read",
            triggered_at=datetime.now(),
        )
        crud.mark_alert_read(db_session, read_alert.id)

        unread_resp = e2e_client.get("/api/quant/alerts?is_read=false")
        assert unread_resp.status_code == 200
        unread_data = unread_resp.json()["data"]
        assert all(not a["isRead"] for a in unread_data)

        read_resp = e2e_client.get("/api/quant/alerts?is_read=true")
        assert read_resp.status_code == 200
        read_data = read_resp.json()["data"]
        assert all(a["isRead"] for a in read_data)


class TestQuantFundamentalsE2E:
    """End-to-end tests for fundamental data API."""

    def test_get_fundamentals_on_demand_fetch(self, e2e_client):
        response = e2e_client.get("/api/quant/fundamentals/000001")
        assert response.status_code == 200
        data = response.json()["data"]
        assert data is not None
        assert data["stockCode"] == "000001"
        assert data["peTtm"] == 15.5

    def test_get_fundamentals_from_db(self, e2e_client, db_session):
        stock_code = "000001"
        report_date = datetime.strptime("2025-12-31", "%Y-%m-%d")
        crud.save_fundamental(
            db_session,
            stock_code,
            report_date,
            pe_ttm=20.0,
            pb=3.0,
            roe=15.0,
        )

        response = e2e_client.get(f"/api/quant/fundamentals/{stock_code}")
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["peTtm"] == 20.0
        assert data["pb"] == 3.0


class TestQuantPortfolioAnalysisE2E:
    """End-to-end tests for portfolio analysis."""

    def test_portfolio_analysis_empty(self, e2e_client):
        response = e2e_client.get("/api/quant/portfolio/analysis")
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["sharpeRatio"] == 0
        assert data["maxDrawdown"] == 0
        assert data["industryDistribution"] == {}

    def test_portfolio_analysis_with_positions(self, e2e_client, db_session):
        crud.add_position(db_session, "000001", "平安银行", 100, 10.0, datetime.now())
        crud.add_position(db_session, "000002", "万科A", 200, 15.0, datetime.now())

        response = e2e_client.get("/api/quant/portfolio/analysis")
        assert response.status_code == 200
        data = response.json()["data"]
        assert "sharpeRatio" in data
        assert "correlationMatrix" in data
