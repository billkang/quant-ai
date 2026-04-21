from unittest.mock import MagicMock, patch

from src.services.scheduler import SchedulerService


class TestSchedulerService:
    def test_daily_update_closes_db_on_exception(self):
        mock_db = MagicMock()

        with patch("src.services.scheduler.SessionLocal", return_value=mock_db):
            with patch("src.models.crud.get_watchlist", side_effect=RuntimeError("DB down")):
                scheduler = SchedulerService()
                scheduler.daily_data_update()

        mock_db.close.assert_called_once()

    def test_night_update_closes_db_on_exception(self):
        mock_db = MagicMock()

        with patch("src.services.scheduler.SessionLocal", return_value=mock_db):
            with patch("src.models.crud.get_watchlist", side_effect=RuntimeError("DB down")):
                scheduler = SchedulerService()
                scheduler.night_data_update()

        mock_db.close.assert_called_once()
