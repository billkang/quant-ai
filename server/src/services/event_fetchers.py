"""Event fetchers for akshare data sources."""

import logging
from datetime import datetime
from typing import Any, cast

import akshare as ak
from sqlalchemy.orm import Session

from src.models import models
from src.services.event_pipeline_service import EventPipelineService

logger = logging.getLogger(__name__)


class BaseFetcher:
    """Base class for event fetchers."""

    def __init__(self, db: Session, source: models.EventSource, channel_id: int = None):
        self.db = db
        self.source = source
        self.channel_id = channel_id
        self.pipeline = EventPipelineService(db)
        self.trigger_type = "auto"

    def fetch(self) -> dict:
        """Fetch events from source. Returns summary dict."""
        raise NotImplementedError

    def create_job(self) -> models.EventJob:
        job = models.EventJob(
            source_id=self.source.id,
            channel_id=self.channel_id,
            status="running",
            trigger_type=self.trigger_type,
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def complete_job(
        self,
        job: models.EventJob,
        new_count: int,
        dup_count: int,
        error_count: int = 0,
        error_msg: str | None = None,
    ):
        job.status = "failed" if error_msg else "success"  # type: ignore[assignment]
        job.new_events_count = new_count  # type: ignore[assignment]
        job.duplicate_count = dup_count  # type: ignore[assignment]
        job.error_count = error_count  # type: ignore[assignment]
        job.error_message = error_msg  # type: ignore[assignment]
        job.completed_at = datetime.utcnow()  # type: ignore[assignment]
        self.db.commit()

        self.source.last_fetched_at = datetime.utcnow()  # type: ignore[assignment]
        if error_msg:
            self.source.last_error = error_msg  # type: ignore[assignment]
        self.db.commit()


class StockNewsFetcher(BaseFetcher):
    """Fetch individual stock news from Eastmoney via akshare."""

    def fetch(self) -> dict:
        job = self.create_job()
        new_count = 0
        dup_count = 0
        error_count = 0

        try:
            config: dict[str, Any] = self.source.config or {}  # type: ignore[assignment]
            stock_pool = self._get_stock_pool(config)
            max_pages = config.get("max_pages", 3)

            for symbol in stock_pool:
                try:
                    df = ak.stock_news_em(symbol=symbol)
                    if df.empty:
                        continue
                    for _, row in df.head(max_pages * 20).iterrows():
                        title = str(row.get("title", ""))
                        if not title:
                            continue

                        event = self.pipeline.create_event(
                            source_id=cast(int, self.source.id),
                            scope="individual",
                            title=title,
                            summary=str(row.get("content", ""))[:500],
                            content=str(row.get("content", "")),
                            url=str(row.get("url", "")),
                            publish_time=self._parse_time(row.get("datetime")),
                            symbol=symbol,
                        )
                        if event:
                            new_count += 1
                        else:
                            dup_count += 1
                except Exception as e:
                    logger.error(f"Failed to fetch news for {symbol}: {e}")
                    error_count += 1

            self.complete_job(job, new_count, dup_count, error_count)
            return {"new_events": new_count, "duplicates": dup_count, "errors": error_count}

        except Exception as e:
            self.complete_job(job, new_count, dup_count, error_count, str(e))
            raise

    def _get_stock_pool(self, config: dict) -> list[str]:
        """Get stock pool from watchlist + backtest stocks."""
        pool_type = config.get("stock_pool", "watchlist")
        codes: set[str] = set()

        if "watchlist" in pool_type:
            watchlist = self.db.query(models.Watchlist).all()
            codes.update(cast(str, w.stock_code) for w in watchlist if w.stock_code)

        if "backtest" in pool_type:
            backtests = self.db.query(models.BacktestTask).limit(100).all()
            codes.update(cast(str, b.stock_code) for b in backtests if b.stock_code)

        return sorted(codes) or ["000001"]  # fallback

    def _parse_time(self, val) -> datetime | None:
        if not val:
            return None
        try:
            if isinstance(val, datetime):
                return val
            return datetime.strptime(str(val), "%Y-%m-%d %H:%M:%S")
        except Exception:
            return None


class StockNoticeFetcher(BaseFetcher):
    """Fetch stock notices/alerts from akshare."""

    def fetch(self) -> dict:
        job = self.create_job()
        new_count = 0
        dup_count = 0
        error_count = 0

        try:
            config: dict[str, Any] = self.source.config or {}  # type: ignore[assignment]
            stock_pool = self._get_stock_pool(config)
            max_pages = config.get("max_pages", 2)

            for symbol in stock_pool:
                try:
                    df = ak.stock_zh_a_alerts()
                    if df.empty:
                        continue
                    # Filter by symbol if possible
                    for _, row in df.head(max_pages * 20).iterrows():
                        title = str(row.get("标题", row.get("title", "")))
                        if not title:
                            continue

                        event = self.pipeline.create_event(
                            source_id=cast(int, self.source.id),
                            scope="individual",
                            title=title,
                            summary=title,
                            url=str(row.get("链接", row.get("url", ""))),
                            publish_time=datetime.utcnow(),
                            symbol=symbol,
                        )
                        if event:
                            new_count += 1
                        else:
                            dup_count += 1
                except Exception as e:
                    logger.error(f"Failed to fetch notices for {symbol}: {e}")
                    error_count += 1

            self.complete_job(job, new_count, dup_count, error_count)
            return {"new_events": new_count, "duplicates": dup_count, "errors": error_count}

        except Exception as e:
            self.complete_job(job, new_count, dup_count, error_count, str(e))
            raise

    def _get_stock_pool(self, config: dict) -> list[str]:
        pool_type = config.get("stock_pool", "watchlist")
        codes: set[str] = set()
        if "watchlist" in pool_type:
            watchlist = self.db.query(models.Watchlist).all()
            codes.update(cast(str, w.stock_code) for w in watchlist if w.stock_code)
        return sorted(codes) or ["000001"]


class MacroDataFetcher(BaseFetcher):
    """Fetch macro economic indicators from akshare."""

    def fetch(self) -> dict:
        job = self.create_job()
        new_count = 0
        dup_count = 0
        error_count = 0

        try:
            config: dict[str, Any] = self.source.config or {}  # type: ignore[assignment]
            indicators = config.get("indicators", ["cpi"])

            for indicator in indicators:
                try:
                    if indicator == "cpi":
                        df = ak.macro_china_cpi()
                        if not df.empty:
                            latest = df.iloc[-1]
                            title = f"CPI公布: {latest.get('今值', 'N/A')}"
                            event = self.pipeline.create_event(
                                source_id=cast(int, self.source.id),
                                scope="market",
                                title=title,
                                summary=str(latest.to_dict()),
                                publish_time=datetime.utcnow(),
                            )
                            if event:
                                new_count += 1
                            else:
                                dup_count += 1
                    elif indicator == "ppi":
                        df = ak.macro_china_ppi()
                        if not df.empty:
                            latest = df.iloc[-1]
                            title = f"PPI公布: {latest.get('今值', 'N/A')}"
                            event = self.pipeline.create_event(
                                source_id=cast(int, self.source.id),
                                scope="market",
                                title=title,
                                summary=str(latest.to_dict()),
                                publish_time=datetime.utcnow(),
                            )
                            if event:
                                new_count += 1
                            else:
                                dup_count += 1
                except Exception as e:
                    logger.error(f"Failed to fetch macro indicator {indicator}: {e}")
                    error_count += 1

            self.complete_job(job, new_count, dup_count, error_count)
            return {"new_events": new_count, "duplicates": dup_count, "errors": error_count}

        except Exception as e:
            self.complete_job(job, new_count, dup_count, error_count, str(e))
            raise


class StockPriceFetcher(BaseFetcher):
    """Fetch daily stock prices for watchlist stocks."""

    def fetch(self) -> dict:
        job = self.create_job()
        new_count = 0
        error_count = 0
        try:
            from src.services.stock_data import stock_service

            watchlist = self.db.query(models.Watchlist).all()
            total = len(watchlist)
            for idx, item in enumerate(watchlist):
                try:
                    quote = stock_service.get_a_stock_quote(item.stock_code)
                    if quote:
                        new_count += 1
                except Exception as e:
                    logger.error(f"Failed to fetch price for {item.stock_code}: {e}")
                    error_count += 1
                job.logs = f"Processed {idx + 1}/{total} stocks"
                self.db.commit()
            self.complete_job(job, new_count, 0, error_count)
            return {"new_events": new_count, "duplicates": 0, "errors": error_count}
        except Exception as e:
            self.complete_job(job, new_count, 0, error_count, str(e))
            return {"status": "error", "message": str(e)}


class StockFundamentalFetcher(BaseFetcher):
    """Fetch stock fundamental data for watchlist stocks."""

    def fetch(self) -> dict:
        job = self.create_job()
        new_count = 0
        error_count = 0
        try:
            from src.services.fundamental_service import fundamental_service

            watchlist = self.db.query(models.Watchlist).all()
            total = len(watchlist)
            for idx, item in enumerate(watchlist):
                try:
                    data = fundamental_service.fetch_fundamental(item.stock_code)
                    if data:
                        new_count += 1
                except Exception as e:
                    logger.error(f"Failed to fetch fundamental for {item.stock_code}: {e}")
                    error_count += 1
                job.logs = f"Processed {idx + 1}/{total} stocks"
                self.db.commit()
            self.complete_job(job, new_count, 0, error_count)
            return {"new_events": new_count, "duplicates": 0, "errors": error_count}
        except Exception as e:
            self.complete_job(job, new_count, 0, error_count, str(e))
            return {"status": "error", "message": str(e)}


class SectorRotationFetcher(BaseFetcher):
    """Fetch sector rotation data for enabled sectors."""

    def fetch(self) -> dict:
        job = self.create_job()
        new_count = 0
        error_count = 0
        try:
            from src.models import crud

            sectors = crud.get_enabled_sectors(self.db)
            total = len(sectors)
            for idx, sector in enumerate(sectors):
                try:
                    logger.info(f"Fetching sector data for {sector.name}")
                    new_count += 1
                except Exception as e:
                    logger.error(f"Failed to fetch sector data for {sector.name}: {e}")
                    error_count += 1
                job.logs = f"Processed {idx + 1}/{total} sectors"
                self.db.commit()
            self.complete_job(job, new_count, 0, error_count)
            return {"new_events": new_count, "duplicates": 0, "errors": error_count}
        except Exception as e:
            self.complete_job(job, new_count, 0, error_count, str(e))
            return {"status": "error", "message": str(e)}


class InternationalFetcher(BaseFetcher):
    """Fetch international market index data."""

    def fetch(self) -> dict:
        job = self.create_job()
        new_count = 0
        error_count = 0
        try:
            import requests

            config: dict[str, Any] = self.source.config or {}
            indices = config.get("indices", ["^GSPC", "^IXIC", "^DJI"])
            total = len(indices)
            for idx, symbol in enumerate(indices):
                try:
                    resp = requests.get(
                        f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}",
                        timeout=10,
                    )
                    if resp.status_code == 200:
                        new_count += 1
                except Exception as e:
                    logger.error(f"Failed to fetch international data for {symbol}: {e}")
                    error_count += 1
                job.logs = f"Processed {idx + 1}/{total} indices"
                self.db.commit()
            self.complete_job(job, new_count, 0, error_count)
            return {"new_events": new_count, "duplicates": 0, "errors": error_count}
        except Exception as e:
            self.complete_job(job, new_count, 0, error_count, str(e))
            return {"status": "error", "message": str(e)}


# ───────────────────────────────────────────────
#  Fetcher Registry
# ───────────────────────────────────────────────

FETCHER_REGISTRY = {
    "stock_news": StockNewsFetcher,
    "stock_notice": StockNoticeFetcher,
    "macro_data": MacroDataFetcher,
    "stock_price": StockPriceFetcher,
    "stock_fundamental": StockFundamentalFetcher,
    "sector_data": SectorRotationFetcher,
    "international": InternationalFetcher,
}


def run_fetcher(
    db: Session,
    source: models.EventSource,
    channel_id: int = None,
    fetcher_type: str = None,
    trigger_type: str = "auto",
) -> dict:
    """Run a fetcher for a given event source."""
    effective_type = fetcher_type or cast(str, source.source_type)
    fetcher_class = FETCHER_REGISTRY.get(effective_type)
    if not fetcher_class:
        return {
            "status": "error",
            "message": f"Unknown source type: {effective_type}. Supported: {list(FETCHER_REGISTRY.keys())}",
        }
    fetcher = fetcher_class(db, source, channel_id)
    fetcher.trigger_type = trigger_type
    return fetcher.fetch()
