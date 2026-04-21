import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from ..models import crud
from ..models.database import SessionLocal
from .news import news_service
from .stock_data import stock_service

logger = logging.getLogger(__name__)


class SchedulerService:
    def __init__(self):
        self.scheduler: AsyncIOScheduler | None = None

    async def start(self):
        self.scheduler = AsyncIOScheduler()
        self.scheduler.add_job(
            self.daily_data_update,
            CronTrigger(hour=16, minute=0),
            id="daily_data_update",
            name="每日行情数据更新",
            replace_existing=True,
        )
        self.scheduler.add_job(
            self.night_data_update,
            CronTrigger(hour=18, minute=0),
            id="night_data_update",
            name="盘后新闻更新",
            replace_existing=True,
        )
        self.scheduler.add_job(
            self.morning_ai_analysis,
            CronTrigger(hour=8, minute=0),
            id="morning_ai_analysis",
            name="早盘AI分析",
            replace_existing=True,
        )
        self.scheduler.start()
        logger.info("Scheduler started")

    async def stop(self):
        if self.scheduler:
            self.scheduler.shutdown()
            logger.info("Scheduler stopped")

    def daily_data_update(self):
        logger.info("Running daily data update job")
        try:
            db = SessionLocal()
            watchlist = crud.get_watchlist(db)
            for item in watchlist:
                try:
                    stock_service.get_a_stock_quote(item.stock_code)
                    stock_service.get_a_stock_kline(item.stock_code, "1mo")
                except Exception as e:
                    logger.error(f"Failed to update {item.stock_code}: {e}")
            db.close()
            logger.info("Daily data update completed")
        except Exception as e:
            logger.error(f"Daily data update failed: {e}")

    def night_data_update(self):
        logger.info("Running night news update job")
        try:
            db = SessionLocal()
            watchlist = crud.get_watchlist(db)
            for item in watchlist:
                try:
                    news_service.get_stock_news(item.stock_code)
                except Exception as e:
                    logger.error(f"Failed to fetch news for {item.stock_code}: {e}")
            db.close()
            logger.info("Night news update completed")
        except Exception as e:
            logger.error(f"Night news update failed: {e}")

    def morning_ai_analysis(self):
        logger.info("Running morning AI analysis job")
        logger.info("Morning AI analysis completed (placeholder)")


scheduler_service = SchedulerService()
