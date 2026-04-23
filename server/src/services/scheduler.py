import logging
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from ..models import crud
from ..models.database import SessionLocal
from ..models.models import EventSource, Notification, NotificationSetting
from .event_fetchers import run_fetcher
from .event_pipeline_service import EventPipelineService
from .fundamental_service import fundamental_service
from .indicator import indicator_service
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
        self.scheduler.add_job(
            self.alert_scan,
            CronTrigger(hour=16, minute=30),
            id="alert_scan",
            name="每日告警扫描",
            replace_existing=True,
        )
        self.scheduler.add_job(
            self.fundamentals_update,
            CronTrigger(day=1, hour=2, minute=0),
            id="fundamentals_update",
            name="月度基本面数据更新",
            replace_existing=True,
        )
        self.scheduler.add_job(
            self.daily_event_update,
            CronTrigger(hour=17, minute=0),
            id="daily_event_update",
            name="每日事件因子聚合",
            replace_existing=True,
        )
        self.scheduler.add_job(
            self.interval_news_fetch,
            CronTrigger(hour="*/6", minute=0),
            id="interval_news_fetch",
            name="定时新闻采集",
            replace_existing=True,
        )
        self.scheduler.add_job(
            self.research_fetch,
            CronTrigger(hour=15, minute=35),
            id="research_fetch",
            name="每日研报公告抓取",
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
        db = SessionLocal()
        try:
            watchlist = crud.get_watchlist(db)
            for item in watchlist:
                try:
                    self._update_single_stock(db, item.stock_code)
                except Exception as e:
                    logger.error(f"Failed to update {item.stock_code}: {e}")
            logger.info("Daily data update completed")
        except Exception as e:
            logger.error(f"Daily data update failed: {e}")
        finally:
            db.close()

    def _update_single_stock(self, db, stock_code: str):
        """Update daily price and indicators for a single stock."""
        from datetime import datetime

        # 1. Fetch latest quote
        quote = stock_service.get_a_stock_quote(stock_code)
        if not quote:
            logger.warning(f"No quote data for {stock_code}, marking as suspended")
            today = datetime.now().date()
            crud.save_daily_price(db, stock_code, today, 0, 0, 0, 0, 0, 0, is_suspended=True)
            return

        # 2. Save daily price
        today = datetime.now().date()
        crud.save_daily_price(
            db,
            stock_code,
            today,
            open_price=quote.get("open", 0),
            high=quote.get("high", 0),
            low=quote.get("low", 0),
            close=quote.get("price", 0),
            volume=quote.get("volume", 0),
            amount=quote.get("amount", 0),
            is_suspended=False,
            adjusted=True,
        )

        # 3. Fetch last 60 days kline for indicator calculation
        klines = stock_service.get_a_stock_kline(stock_code, "daily")
        if not klines or len(klines) < 20:
            logger.warning(f"Insufficient kline data for {stock_code}")
            return

        # Ensure today's data is included
        has_today = any(k["date"] == today.strftime("%Y-%m-%d") for k in klines)
        if not has_today and quote:
            klines.append(
                {
                    "date": today.strftime("%Y-%m-%d"),
                    "open": quote.get("open", 0),
                    "close": quote.get("price", 0),
                    "high": quote.get("high", 0),
                    "low": quote.get("low", 0),
                    "volume": quote.get("volume", 0),
                    "amount": quote.get("amount", 0),
                }
            )

        # 4. Calculate indicators
        price_rows = [
            {
                "trade_date": k["date"],
                "open": k["open"],
                "high": k["high"],
                "low": k["low"],
                "close": k["close"],
                "volume": k["volume"],
                "amount": k.get("amount", 0),
            }
            for k in sorted(klines, key=lambda x: x["date"])
        ]

        indicators = indicator_service.calculate_all(price_rows)
        if not indicators:
            logger.warning(f"Indicator calculation failed for {stock_code}")
            return

        # 5. Save indicators (save last 60 days)
        for ind in indicators[-60:]:
            trade_date = (
                datetime.strptime(ind["trade_date"], "%Y-%m-%d")
                if isinstance(ind["trade_date"], str)
                else ind["trade_date"]
            )
            crud.save_indicator(
                db,
                stock_code,
                trade_date,
                ma5=ind.get("ma5"),
                ma10=ind.get("ma10"),
                ma20=ind.get("ma20"),
                ma60=ind.get("ma60"),
                rsi6=ind.get("rsi6"),
                rsi12=ind.get("rsi12"),
                rsi24=ind.get("rsi24"),
                macd_dif=ind.get("macd_dif"),
                macd_dea=ind.get("macd_dea"),
                macd_bar=ind.get("macd_bar"),
                kdj_k=ind.get("kdj_k"),
                kdj_d=ind.get("kdj_d"),
                kdj_j=ind.get("kdj_j"),
                boll_upper=ind.get("boll_upper"),
                boll_mid=ind.get("boll_mid"),
                boll_lower=ind.get("boll_lower"),
                vol_ma5=ind.get("vol_ma5"),
                vol_ma10=ind.get("vol_ma10"),
            )

        logger.info(f"Updated {stock_code}: {len(indicators)} days of indicators")

        # Push real-time quote update via WebSocket
        try:
            from src.api.ws import manager as ws_manager

            ws_manager.broadcast_sync(
                stock_code,
                {
                    "type": "quote",
                    "data": {
                        stock_code: {
                            "code": stock_code,
                            "name": stock_code,
                            "price": quote.get("price", 0),
                            "change": quote.get("change", 0),
                            "changePercent": quote.get("changePercent", 0),
                            "volume": quote.get("volume", 0),
                        }
                    },
                },
            )
        except Exception as e:
            logger.warning(f"WebSocket broadcast failed for {stock_code}: {e}")

    def night_data_update(self):
        logger.info("Running night news update job")
        db = SessionLocal()
        try:
            watchlist = crud.get_watchlist(db)
            for item in watchlist:
                try:
                    news_service.get_stock_news(item.stock_code)
                except Exception as e:
                    logger.error(f"Failed to fetch news for {item.stock_code}: {e}")
            logger.info("Night news update completed")
        except Exception as e:
            logger.error(f"Night news update failed: {e}")
        finally:
            db.close()

    def morning_ai_analysis(self):
        logger.info("Running morning AI analysis job")
        logger.info("Morning AI analysis completed (placeholder)")

    def alert_scan(self):
        logger.info("Running alert scan job")
        db = SessionLocal()
        try:
            watchlist = crud.get_watchlist(db)
            for item in watchlist:
                try:
                    self._scan_single_stock_alerts(db, item.stock_code)
                except Exception as e:
                    logger.error(f"Failed to scan alerts for {item.stock_code}: {e}")
            logger.info("Alert scan completed")
        except Exception as e:
            logger.error(f"Alert scan failed: {e}")
        finally:
            db.close()

    def _scan_single_stock_alerts(self, db, stock_code: str):
        """Scan for technical indicator signals and generate alerts."""
        indicator = crud.get_latest_indicator(db, stock_code)
        if not indicator:
            return

        today = datetime.now().date()
        alerts_to_create = []

        # RSI oversold/overbought
        if indicator.rsi6 is not None:
            if indicator.rsi6 < 20:
                alerts_to_create.append(
                    (
                        "indicator_signal",
                        f"RSI6={indicator.rsi6:.2f}",
                        f"{stock_code} RSI6 严重超卖 ({indicator.rsi6:.2f})，可能存在反弹机会",
                    )
                )
            elif indicator.rsi6 > 80:
                alerts_to_create.append(
                    (
                        "indicator_signal",
                        f"RSI6={indicator.rsi6:.2f}",
                        f"{stock_code} RSI6 严重超买 ({indicator.rsi6:.2f})，注意回调风险",
                    )
                )

        # MACD golden/dead cross
        if indicator.macd_dif is not None and indicator.macd_dea is not None:
            prev = crud.get_indicator_history(db, stock_code, limit=2)
            if len(prev) >= 2:
                prev_dif = prev[1].macd_dif
                prev_dea = prev[1].macd_dea
                if prev_dif is not None and prev_dea is not None:
                    if prev_dif <= prev_dea and indicator.macd_dif > indicator.macd_dea:
                        alerts_to_create.append(
                            (
                                "indicator_signal",
                                "MACD金叉",
                                f"{stock_code} MACD 金叉信号：DIF ({indicator.macd_dif:.3f}) 上穿 DEA ({indicator.macd_dea:.3f})",
                            )
                        )
                    elif prev_dif >= prev_dea and indicator.macd_dif < indicator.macd_dea:
                        alerts_to_create.append(
                            (
                                "indicator_signal",
                                "MACD死叉",
                                f"{stock_code} MACD 死叉信号：DIF ({indicator.macd_dif:.3f}) 下穿 DEA ({indicator.macd_dea:.3f})",
                            )
                        )

        # Bollinger band breakout
        latest_price = crud.get_daily_prices(db, stock_code, limit=1)
        if latest_price and indicator.boll_upper is not None and indicator.boll_lower is not None:
            price = latest_price[0].close
            if price > indicator.boll_upper:
                alerts_to_create.append(
                    (
                        "price_break",
                        f"price={price:.2f} > boll_upper={indicator.boll_upper:.2f}",
                        f"{stock_code} 股价突破布林带上轨 ({price:.2f} > {indicator.boll_upper:.2f})",
                    )
                )
            elif price < indicator.boll_lower:
                alerts_to_create.append(
                    (
                        "price_break",
                        f"price={price:.2f} < boll_lower={indicator.boll_lower:.2f}",
                        f"{stock_code} 股价跌破布林带下轨 ({price:.2f} < {indicator.boll_lower:.2f})",
                    )
                )

        for alert_type, condition, message in alerts_to_create:
            crud.save_alert(
                db,
                stock_code,
                alert_type,
                condition,
                message,
                triggered_at=today,
            )
            self._create_notification(db, stock_code, alert_type, message)

    def _create_notification(self, db, stock_code: str, alert_type: str, message: str):
        """Create in-app notification for alert."""
        try:
            # Find users who have this stock in watchlist and enabled in_app notifications
            from ..models.models import Watchlist

            watchlist_entries = db.query(Watchlist).filter(Watchlist.stock_code == stock_code).all()
            user_ids = {entry.user_id for entry in watchlist_entries if entry.user_id}

            if not user_ids:
                # Fallback: create a global notification (user_id=None)
                user_ids = {None}

            for user_id in user_ids:
                # Check notification settings
                settings = (
                    db.query(NotificationSetting)
                    .filter(NotificationSetting.user_id == user_id)
                    .first()
                )
                if settings and settings.channel_config:
                    channels = settings.channel_config.get(alert_type, ["in_app"])
                else:
                    channels = ["in_app"]

                if "in_app" not in channels:
                    continue

                # Deduplication: skip if same alert_type for same stock within 5 minutes
                from datetime import timedelta

                five_min_ago = datetime.utcnow() - timedelta(minutes=5)
                existing = (
                    db.query(Notification)
                    .filter(
                        Notification.user_id == user_id,
                        Notification.type == alert_type,
                        Notification.title.contains(stock_code),
                        Notification.created_at >= five_min_ago,
                    )
                    .first()
                )
                if existing:
                    continue

                notification = Notification(
                    user_id=user_id,
                    type=alert_type,
                    title=f"{stock_code} 告警",
                    content=message,
                    channels=channels,
                    is_read=0,
                )
                db.add(notification)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to create notification for {stock_code}: {e}")
            db.rollback()

    def fundamentals_update(self):
        logger.info("Running fundamentals update job")
        db = SessionLocal()
        try:
            watchlist = crud.get_watchlist(db)
            for item in watchlist:
                try:
                    data = fundamental_service.fetch_fundamental(item.stock_code)
                    if data:
                        report_date = datetime.strptime(
                            data.get("report_date", "2025-12-31"), "%Y-%m-%d"
                        )
                        crud.save_fundamental(db, item.stock_code, report_date, **data)
                        logger.info(f"Updated fundamentals for {item.stock_code}")
                except Exception as e:
                    logger.error(f"Failed to update fundamentals for {item.stock_code}: {e}")
            logger.info("Fundamentals update completed")
        except Exception as e:
            logger.error(f"Fundamentals update failed: {e}")
        finally:
            db.close()

    def interval_news_fetch(self):
        """Run enabled event sources fetchers."""
        logger.info("Running interval news fetch")
        db = SessionLocal()
        try:
            sources = db.query(EventSource).filter(EventSource.enabled == 1).all()
            for source in sources:
                try:
                    run_fetcher(db, source)
                    logger.info(f"Fetched from source: {source.name}")
                except Exception as e:
                    logger.error(f"Failed to fetch from {source.name}: {e}")
            logger.info("Interval news fetch completed")
        except Exception as e:
            logger.error(f"Interval news fetch failed: {e}")
        finally:
            db.close()

    def daily_event_update(self):
        """Aggregate events into event_factors for all symbols."""
        logger.info("Running daily event factor aggregation")
        db = SessionLocal()
        try:
            pipeline = EventPipelineService(db)
            watchlist = crud.get_watchlist(db)
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

            for item in watchlist:
                try:
                    pipeline.aggregate_event_factors(item.stock_code, today)
                    logger.info(f"Aggregated event factors for {item.stock_code}")
                except Exception as e:
                    logger.error(f"Failed to aggregate event factors for {item.stock_code}: {e}")
            logger.info("Daily event factor aggregation completed")
        except Exception as e:
            logger.error(f"Daily event factor aggregation failed: {e}")
        finally:
            db.close()

    def research_fetch(self):
        """Fetch research reports and stock notices for watchlist stocks."""
        logger.info("Running research fetch job")
        db = SessionLocal()
        try:
            watchlist = crud.get_watchlist(db)
            for item in watchlist:
                try:
                    self._fetch_research_for_stock(db, item.stock_code)
                    self._fetch_notices_for_stock(db, item.stock_code)
                except Exception as e:
                    logger.error(f"Failed to fetch research for {item.stock_code}: {e}")
            logger.info("Research fetch completed")
        except Exception as e:
            logger.error(f"Research fetch failed: {e}")
        finally:
            db.close()

    def _fetch_research_for_stock(self, db, stock_code: str):
        """Placeholder for research report fetching via AkShare."""
        # TODO: Integrate akshare stock_research_report_em() when stable
        logger.info(f"Research report fetch placeholder for {stock_code}")

    def _fetch_notices_for_stock(self, db, stock_code: str):
        """Placeholder for stock notice fetching via AkShare."""
        # TODO: Integrate akshare stock_notice_report() when stable
        logger.info(f"Stock notice fetch placeholder for {stock_code}")


scheduler_service = SchedulerService()
