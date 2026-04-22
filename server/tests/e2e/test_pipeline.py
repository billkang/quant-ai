from datetime import date, timedelta

import pytest

from src.models import crud
from src.services.indicator import indicator_service
from src.services.scheduler import SchedulerService


class TestSchedulerPipelineE2E:
    """
    End-to-end tests for the data pipeline (scheduler jobs).
    These tests invoke the scheduler service methods directly while
    mocking external stock data APIs, verifying the full flow from
    data fetch -> DB write -> indicator calculation -> alert generation.
    """

    @pytest.fixture
    def scheduler(self, monkeypatch, db_session):
        """Provide a SchedulerService with mocked external deps and test DB."""
        import src.services.scheduler as sched_module
        import src.services.stock_data as stock_data_module

        monkeypatch.setattr(sched_module, "SessionLocal", lambda: db_session)

        # Mock quote
        def _mock_quote(code):
            return {
                "code": code,
                "name": f"股票{code}",
                "price": 10.5,
                "open": 10.0,
                "high": 11.0,
                "low": 9.5,
                "volume": 100000,
                "amount": 1050000,
            }

        # Mock kline – 100 days of oscillating prices
        def _mock_kline(code, period):
            data = []
            base = 10.0
            for i in range(100):
                d = date.today() - timedelta(days=100 - 1 - i)
                price = base + (i % 20 - 10) * 0.1
                data.append(
                    {
                        "date": d.strftime("%Y-%m-%d"),
                        "open": round(price - 0.1, 2),
                        "close": round(price, 2),
                        "high": round(price + 0.2, 2),
                        "low": round(price - 0.2, 2),
                        "volume": 100000 + i * 100,
                        "amount": 1000000 + i * 1000,
                    }
                )
            return data

        monkeypatch.setattr(stock_data_module.stock_service, "get_a_stock_quote", _mock_quote)
        monkeypatch.setattr(stock_data_module.stock_service, "get_a_stock_kline", _mock_kline)

        svc = SchedulerService()
        return svc

    def test_daily_data_update_creates_prices_and_indicators(self, scheduler, db_session):
        crud.add_to_watchlist(db_session, "000001", "平安银行")
        db_session.commit()

        scheduler.daily_data_update()

        prices = crud.get_daily_prices(db_session, "000001", limit=10)
        assert len(prices) >= 1

        indicators = crud.get_indicator_history(db_session, "000001", limit=10)
        assert len(indicators) >= 1

    def test_daily_data_update_suspended_stock(self, scheduler, db_session):
        crud.add_to_watchlist(db_session, "999999", "不存在的股票")
        db_session.commit()

        # Force quote to return None so stock is marked suspended
        import src.services.stock_data as stock_data_module

        stock_data_module.stock_service.get_a_stock_quote = lambda c: None

        scheduler.daily_data_update()

        prices = crud.get_daily_prices(db_session, "999999", limit=1)
        assert len(prices) == 1
        assert prices[0].is_suspended == 1

    def test_alert_scan_generates_rsi_alerts(self, scheduler, db_session):
        stock_code = "000001"
        crud.add_to_watchlist(db_session, stock_code, "平安银行")

        # Save an indicator with extreme RSI to trigger oversold alert
        today = date.today()
        crud.save_indicator(
            db_session,
            stock_code,
            today,
            rsi6=15.0,  # oversold
            macd_dif=0.5,
            macd_dea=0.3,
            boll_upper=15.0,
            boll_lower=8.0,
        )
        # Previous day indicator for MACD crossover check
        crud.save_indicator(
            db_session,
            stock_code,
            today - timedelta(days=1),
            macd_dif=0.2,
            macd_dea=0.3,
        )
        # Daily price for bollinger check
        crud.save_daily_price(
            db_session,
            stock_code,
            today,
            open_price=10.0,
            high=11.0,
            low=9.0,
            close=16.0,  # above boll_upper -> breakout alert
            volume=100000,
            amount=1000000,
        )
        db_session.commit()

        scheduler.alert_scan()

        alerts = crud.get_alerts(db_session)
        assert len(alerts) >= 2  # RSI oversold + Bollinger breakout
        types = {a.alert_type for a in alerts}
        assert "indicator_signal" in types
        assert "price_break" in types

    def test_alert_scan_macd_golden_cross(self, scheduler, db_session):
        stock_code = "000001"
        crud.add_to_watchlist(db_session, stock_code, "平安银行")

        today = date.today()
        crud.save_indicator(
            db_session,
            stock_code,
            today - timedelta(days=2),
            macd_dif=0.1,
            macd_dea=0.2,
        )
        crud.save_indicator(
            db_session,
            stock_code,
            today - timedelta(days=1),
            macd_dif=0.15,
            macd_dea=0.14,  # DIF crosses above DEA
        )
        db_session.commit()

        scheduler.alert_scan()

        alerts = crud.get_alerts(db_session)
        macd_alerts = [a for a in alerts if "MACD金叉" in a.condition]
        assert len(macd_alerts) == 1

    def test_night_data_update_fetches_news(self, scheduler, db_session):
        stock_code = "000001"
        crud.add_to_watchlist(db_session, stock_code, "平安银行")
        db_session.commit()

        # Mock news service to avoid external calls
        import src.services.news as news_module

        original_get_stock_news = news_module.news_service.get_stock_news
        news_module.news_service.get_stock_news = lambda s: []

        try:
            scheduler.night_data_update()
        finally:
            news_module.news_service.get_stock_news = original_get_stock_news

        # Night update should complete without error even with empty news
        assert True

    def test_fundamentals_update(self, scheduler, db_session):
        stock_code = "000001"
        crud.add_to_watchlist(db_session, stock_code, "平安银行")
        db_session.commit()

        import src.services.fundamental_service as fs_module

        original = fs_module.fundamental_service.fetch_fundamental
        fs_module.fundamental_service.fetch_fundamental = lambda c: {
            "pe_ttm": 10.0,
            "pb": 1.5,
        }

        try:
            scheduler.fundamentals_update()
        finally:
            fs_module.fundamental_service.fetch_fundamental = original

        fund = crud.get_latest_fundamental(db_session, stock_code)
        assert fund is not None
        assert fund.pe_ttm == 10.0
        assert fund.pb == 1.5

    def test_scheduler_start_stop(self):
        """Verify scheduler can start and stop without error."""
        svc = SchedulerService()
        import asyncio

        async def _run():
            await svc.start()
            assert svc.scheduler is not None
            await svc.stop()
            # Scheduler object still exists after shutdown, just stopped
            assert svc.scheduler is not None

        asyncio.run(_run())


class TestIndicatorCalculationE2E:
    """Direct tests for the indicator calculation service."""

    def test_calculate_all_indicators(self):
        prices = []
        base = 10.0
        for i in range(70):
            d = date.today() - timedelta(days=70 - 1 - i)
            price = base + (i % 20 - 10) * 0.1
            prices.append(
                {
                    "trade_date": d.strftime("%Y-%m-%d"),
                    "open": round(price - 0.1, 2),
                    "high": round(price + 0.2, 2),
                    "low": round(price - 0.2, 2),
                    "close": round(price, 2),
                    "volume": 100000 + i * 100,
                    "amount": 1000000 + i * 1000,
                }
            )

        indicators = indicator_service.calculate_all(prices)
        assert len(indicators) == 70
        last = indicators[-1]
        assert "ma5" in last
        assert "ma60" in last
        assert "rsi6" in last
        assert "macd_dif" in last
        assert "kdj_k" in last
        assert "boll_upper" in last
        assert "vol_ma5" in last

    def test_insufficient_data_returns_empty(self):
        prices = [
            {
                "trade_date": "2025-01-01",
                "open": 10,
                "high": 11,
                "low": 9,
                "close": 10.5,
                "volume": 100000,
                "amount": 1000000,
            }
        ]
        result = indicator_service.calculate_all(prices)
        assert result == []
