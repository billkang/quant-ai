from datetime import date

from src.models import crud


class TestAIE2E:
    """End-to-end tests for AI diagnosis."""

    def test_post_analyze_with_data(self, e2e_client, db_session):
        stock_code = "000001"
        # Pre-populate indicator and fundamental data
        crud.save_indicator(
            db_session,
            stock_code,
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
            db_session,
            stock_code,
            date(2025, 1, 15),
            pe_ttm=15.5,
            pb=2.1,
            roe=12.5,
            gross_margin=35.0,
            revenue_growth=10.2,
            debt_ratio=45.0,
        )
        db_session.commit()

        payload = {"code": stock_code, "dimensions": ["fundamental", "technical", "risk"]}
        response = e2e_client.post("/api/ai/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "fundamental_analysis" in data["data"]
        assert "technical_analysis" in data["data"]
        assert "risk_analysis" in data["data"]
        assert "final_report" in data["data"]

    def test_post_analyze_without_indicator_data(self, e2e_client):
        stock_code = "999999"
        payload = {"code": stock_code}
        response = e2e_client.post("/api/ai/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "final_report" in data["data"]

    def test_get_diagnostic_history(self, e2e_client, db_session):
        stock_code = "000001"
        crud.save_diagnostic_history(
            db_session,
            stock_code=stock_code,
            stock_name="平安银行",
            fundamental_analysis="基本面良好",
            technical_analysis="技术面中性",
            risk_analysis="风险可控",
            final_report="综合报告",
            user_id=1,
        )
        db_session.commit()

        response = e2e_client.get(f"/api/ai/history?code={stock_code}&limit=10")
        assert response.status_code == 200
        history = response.json()
        assert len(history) >= 1
        assert history[0]["stockCode"] == stock_code

    def test_get_diagnostic_history_detail(self, e2e_client, db_session):
        history = crud.save_diagnostic_history(
            db_session,
            stock_code="000001",
            stock_name="平安银行",
            fundamental_analysis="基本面良好",
            technical_analysis="技术面中性",
            risk_analysis="风险可控",
            final_report="综合报告",
            user_id=1,
        )
        db_session.commit()
        db_session.refresh(history)

        response = e2e_client.get(f"/api/ai/history/{history.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["stockCode"] == "000001"
        assert data["fundamentalAnalysis"] == "基本面良好"

    def test_chat(self, e2e_client):
        response = e2e_client.get("/api/ai/chat?question=你好")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == 0
        assert "answer" in data["data"]
