"""Factor snapshot builder: align technical + event factors by trade_date."""

import logging
from datetime import datetime
from typing import Any, cast

import pandas as pd
from sqlalchemy.orm import Session

from src.models import models

logger = logging.getLogger(__name__)


class FactorSnapshotBuilder:
    """Build factor snapshots by combining technical indicators, event factors, and prices."""

    def __init__(self, db: Session):
        self.db = db

    def build_for_symbol(
        self, symbol: str, trade_date: datetime | None = None
    ) -> models.FactorSnapshot:
        """Build snapshot for a single symbol on a trade date (default latest)."""
        if trade_date is None:
            latest_price = (
                self.db.query(models.StockDailyPrice)
                .filter(models.StockDailyPrice.stock_code == symbol)
                .order_by(models.StockDailyPrice.trade_date.desc())
                .first()
            )
            if not latest_price:
                raise ValueError(f"No price data for {symbol}")
            trade_date = latest_price.trade_date  # type: ignore[assignment]

        if trade_date is None:
            raise ValueError(f"No trade date for {symbol}")
        start_of_day = trade_date.replace(hour=0, minute=0, second=0, microsecond=0)

        # Get technical indicators
        indicator = (
            self.db.query(models.StockIndicator)
            .filter(
                models.StockIndicator.stock_code == symbol,
                models.StockIndicator.trade_date == start_of_day,
            )
            .first()
        )

        # Get event factors
        event_factor = (
            self.db.query(models.EventFactor)
            .filter(
                models.EventFactor.symbol == symbol,
                models.EventFactor.trade_date == start_of_day,
            )
            .first()
        )

        # Get price
        price = (
            self.db.query(models.StockDailyPrice)
            .filter(
                models.StockDailyPrice.stock_code == symbol,
                models.StockDailyPrice.trade_date == start_of_day,
            )
            .first()
        )

        technical = {}
        if indicator:
            technical = {
                "ma5": indicator.ma5,
                "ma10": indicator.ma10,
                "ma20": indicator.ma20,
                "ma60": indicator.ma60,
                "rsi6": indicator.rsi6,
                "rsi12": indicator.rsi12,
                "rsi24": indicator.rsi24,
                "macd_dif": indicator.macd_dif,
                "macd_dea": indicator.macd_dea,
                "macd_bar": indicator.macd_bar,
                "kdj_k": indicator.kdj_k,
                "kdj_d": indicator.kdj_d,
                "kdj_j": indicator.kdj_j,
                "boll_upper": indicator.boll_upper,
                "boll_mid": indicator.boll_mid,
                "boll_lower": indicator.boll_lower,
                "vol_ma5": indicator.vol_ma5,
                "vol_ma10": indicator.vol_ma10,
            }

        events: dict[str, Any] = {}
        if event_factor:
            events = {
                "individual": event_factor.individual_events or {},
                "sector": event_factor.sector_events or {},
                "market": event_factor.market_events or {},
                "composite": event_factor.composite,
            }

        price_data = {}
        if price:
            price_data = {
                "open": price.open,
                "high": price.high,
                "low": price.low,
                "close": price.close,
                "volume": price.volume,
                "amount": price.amount,
            }

        # Upsert snapshot
        existing = (
            self.db.query(models.FactorSnapshot)
            .filter(
                models.FactorSnapshot.symbol == symbol,
                models.FactorSnapshot.trade_date == start_of_day,
            )
            .first()
        )
        if existing:
            existing.technical = technical  # type: ignore[assignment]
            existing.events = events  # type: ignore[assignment]
            existing.price = price_data  # type: ignore[assignment]
            existing.updated_at = datetime.utcnow()  # type: ignore[assignment]
            self.db.commit()
            self.db.refresh(existing)
            return existing

        snapshot = models.FactorSnapshot(
            symbol=symbol,
            trade_date=start_of_day,
            technical=technical,
            events=events,
            price=price_data,
        )
        self.db.add(snapshot)
        self.db.commit()
        self.db.refresh(snapshot)
        return snapshot

    def build_range(
        self, symbol: str, start_date: datetime, end_date: datetime
    ) -> list[models.FactorSnapshot]:
        """Build snapshots for a symbol over a date range."""
        snapshots = []
        prices = (
            self.db.query(models.StockDailyPrice)
            .filter(
                models.StockDailyPrice.stock_code == symbol,
                models.StockDailyPrice.trade_date >= start_date,
                models.StockDailyPrice.trade_date <= end_date,
            )
            .order_by(models.StockDailyPrice.trade_date)
            .all()
        )

        for price in prices:
            try:
                snapshot = self.build_for_symbol(symbol, price.trade_date)  # type: ignore[arg-type]
                snapshots.append(snapshot)
            except Exception as e:
                logger.error(f"Failed to build snapshot for {symbol} on {price.trade_date}: {e}")

        return snapshots

    def to_dataframe(self, symbol: str, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        """Convert snapshots to a DataFrame for strategy consumption."""
        snapshots = (
            self.db.query(models.FactorSnapshot)
            .filter(
                models.FactorSnapshot.symbol == symbol,
                models.FactorSnapshot.trade_date >= start_date,
                models.FactorSnapshot.trade_date <= end_date,
            )
            .order_by(models.FactorSnapshot.trade_date)
            .all()
        )

        if not snapshots:
            # Auto-build if missing
            self.build_range(symbol, start_date, end_date)
            snapshots = (
                self.db.query(models.FactorSnapshot)
                .filter(
                    models.FactorSnapshot.symbol == symbol,
                    models.FactorSnapshot.trade_date >= start_date,
                    models.FactorSnapshot.trade_date <= end_date,
                )
                .order_by(models.FactorSnapshot.trade_date)
                .all()
            )

        rows: list[dict[str, Any]] = []
        for s in snapshots:
            price_data = cast(dict[str, Any], s.price) or {}
            tech_data = cast(dict[str, Any], s.technical) or {}
            row: dict[str, Any] = {
                "date": s.trade_date,
                **price_data,
                **tech_data,
            }
            ev: dict[str, Any] = cast(dict[str, Any], s.events) or {}
            if ev:
                row["avg_sentiment"] = ev.get("individual", {}).get("avg_sentiment", 0)
                row["event_strength"] = ev.get("individual", {}).get("avg_strength", 0)
                row["news_count"] = ev.get("individual", {}).get("news_count", 0)
                row["sector_sentiment"] = ev.get("sector", {}).get("avg_sentiment", 0)
                row["market_sentiment"] = ev.get("market", {}).get("avg_sentiment", 0)
                row["composite"] = ev.get("composite", 0)
            else:
                row["avg_sentiment"] = 0
                row["event_strength"] = 0
                row["news_count"] = 0
                row["sector_sentiment"] = 0
                row["market_sentiment"] = 0
                row["composite"] = 0
            rows.append(row)

        df = pd.DataFrame(rows)
        if not df.empty:
            df["date"] = pd.to_datetime(df["date"])
            df = df.set_index("date")
        return df
