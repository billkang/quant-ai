"""Event pipeline service: fetch, dedup, extract, aggregate."""

import logging
from datetime import datetime, timedelta
from difflib import SequenceMatcher
from typing import Any, cast

from sqlalchemy.orm import Session

from src.models import models

logger = logging.getLogger(__name__)


class EventPipelineService:
    """Orchestrates event fetching, deduplication, extraction, and aggregation."""

    def __init__(self, db: Session):
        self.db = db

    # ───────────────────────────────────────────────
    #  Deduplication
    # ───────────────────────────────────────────────

    def is_duplicate(self, title: str, lookback_days: int = 7, threshold: float = 0.85) -> bool:
        """Check if a title is similar to any existing event within lookback window."""
        since = datetime.utcnow() - timedelta(days=lookback_days)
        recent_events = self.db.query(models.Event).filter(models.Event.created_at >= since).all()
        for event in recent_events:
            event_title = cast(str, event.title)
            if not event_title:
                continue
            similarity = SequenceMatcher(None, title, event_title).ratio()
            if similarity >= threshold:
                return True
        return False

    # ───────────────────────────────────────────────
    #  Sentiment Extraction
    # ───────────────────────────────────────────────

    def extract_sentiment(self, text: str) -> dict[str, Any]:
        """Extract sentiment signals using keyword-based rules."""
        active_rule = (
            self.db.query(models.EventRule)
            .filter(
                models.EventRule.rule_type == "sentiment_extractor", models.EventRule.is_active == 1
            )
            .first()
        )
        if not active_rule or not active_rule.config:
            return {"sentiment": 0, "strength": 0, "certainty": 0, "urgency": 0, "tags": []}

        config = active_rule.config
        pos_keywords = config.get("positive_keywords", [])
        neg_keywords = config.get("negative_keywords", [])
        multipliers = config.get("multipliers", {})
        scoring = config.get(
            "scoring", {"base_score_per_keyword": 0.15, "max_sentiment": 1.0, "min_sentiment": -1.0}
        )

        score = 0.0
        tags = []
        matched_keywords = []

        for kw in pos_keywords:
            if kw in text:
                matched_keywords.append(kw)
                mult = multipliers.get(kw, 1.0)
                score += scoring["base_score_per_keyword"] * mult
                tags.append("positive")

        for kw in neg_keywords:
            if kw in text:
                matched_keywords.append(kw)
                mult = multipliers.get(kw, 1.0)
                score -= scoring["base_score_per_keyword"] * mult
                tags.append("negative")

        max_sent = scoring.get("max_sentiment", 1.0)
        min_sent = scoring.get("min_sentiment", -1.0)
        sentiment = max(min_sent, min(max_sent, score))

        strength = min(1.0, len(matched_keywords) * 0.2)
        certainty = min(1.0, 0.5 + len(matched_keywords) * 0.1)
        urgency = 0.5 if len(matched_keywords) > 2 else 0.3

        return {
            "sentiment": round(sentiment, 3),
            "strength": round(strength, 3),
            "certainty": round(certainty, 3),
            "urgency": round(urgency, 3),
            "tags": list(set(tags)) if tags else ["neutral"],
        }

    # ───────────────────────────────────────────────
    #  Event Classification
    # ───────────────────────────────────────────────

    def classify_event(self, text: str) -> dict[str, Any]:
        """Classify event into category using rule-based classifier."""
        active_rule = (
            self.db.query(models.EventRule)
            .filter(models.EventRule.rule_type == "classifier", models.EventRule.is_active == 1)
            .first()
        )
        if not active_rule or not active_rule.config:
            return {"category": "general", "strength": 0.3, "duration": "short"}

        config = active_rule.config
        categories = config.get("categories", {})
        default = config.get(
            "default", {"category": "general", "strength": 0.3, "duration": "short"}
        )

        best_match = None
        best_score = 0

        for cat_name, cat_config in categories.items():
            keywords = cat_config.get("keywords", [])
            score = sum(1 for kw in keywords if kw in text)
            if score > best_score:
                best_score = score
                best_match = cat_name

        if best_match and best_score > 0:
            cat_config = categories[best_match]
            return {
                "category": best_match,
                "strength": cat_config.get("strength", 0.3),
                "duration": cat_config.get("duration", "short"),
            }

        return default

    # ───────────────────────────────────────────────
    #  Sector Mapping
    # ───────────────────────────────────────────────

    def map_sector(self, symbol: str | None, text: str | None = None) -> str | None:
        """Map stock symbol or text to CSRC sector."""
        if symbol:
            mapping = (
                self.db.query(models.StockSectorMapping)
                .filter(models.StockSectorMapping.stock_code == symbol)
                .first()
            )
            if mapping:
                return cast(str, mapping.sector)

        if text:
            active_rule = (
                self.db.query(models.EventRule)
                .filter(
                    models.EventRule.rule_type == "sector_mapper", models.EventRule.is_active == 1
                )
                .first()
            )
            if active_rule and active_rule.config:
                keyword_map = active_rule.config.get("keyword_to_sector", {})
                for kw, sector in keyword_map.items():
                    if kw in text:
                        return sector

        return None

    # ───────────────────────────────────────────────
    #  Event Creation
    # ───────────────────────────────────────────────

    def create_event(
        self,
        source_id: int,
        scope: str,
        title: str,
        summary: str | None = None,
        content: str | None = None,
        url: str | None = None,
        publish_time: datetime | None = None,
        symbol: str | None = None,
        sector: str | None = None,
    ) -> models.Event | None:
        """Create an event after deduplication and signal extraction."""
        if self.is_duplicate(title):
            logger.info(f"Duplicate event rejected: {title[:60]}...")
            return None

        full_text = f"{title} {summary or ''} {content or ''}"
        sentiment_result = self.extract_sentiment(full_text)
        classification = self.classify_event(full_text)

        resolved_sector = sector or self.map_sector(symbol, full_text)

        event = models.Event(
            source_id=source_id,
            scope=scope,
            symbol=symbol,
            sector=resolved_sector,
            title=title,
            summary=summary,
            content=content,
            url=url,
            publish_time=publish_time,
            sentiment=sentiment_result["sentiment"],
            strength=sentiment_result["strength"],
            certainty=sentiment_result["certainty"],
            urgency=sentiment_result["urgency"],
            duration=classification["duration"],
            tags=sentiment_result["tags"],
            signals={
                "classification": classification["category"],
                "classification_strength": classification["strength"],
                **sentiment_result,
            },
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        logger.info(f"Event created: id={event.id}, title={title[:60]}...")
        return event

    # ───────────────────────────────────────────────
    #  Daily Aggregation
    # ───────────────────────────────────────────────

    def aggregate_event_factors(self, symbol: str, trade_date: datetime) -> models.EventFactor:
        """Aggregate all events for a symbol on a trade date into event_factors."""
        start_of_day = trade_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)

        # Get sector for this symbol
        sector = self.map_sector(symbol)

        # Individual events
        individual_events = (
            self.db.query(models.Event)
            .filter(
                models.Event.symbol == symbol,
                models.Event.scope == "individual",
                models.Event.created_at >= start_of_day,
                models.Event.created_at < end_of_day,
            )
            .all()
        )

        # Sector events
        sector_events = []
        if sector:
            sector_events = (
                self.db.query(models.Event)
                .filter(
                    models.Event.sector == sector,
                    models.Event.scope == "sector",
                    models.Event.created_at >= start_of_day,
                    models.Event.created_at < end_of_day,
                )
                .all()
            )

        # Market events
        market_events = (
            self.db.query(models.Event)
            .filter(
                models.Event.scope == "market",
                models.Event.created_at >= start_of_day,
                models.Event.created_at < end_of_day,
            )
            .all()
        )

        def agg_events(events: list[models.Event]) -> dict[str, Any]:
            if not events:
                return {}
            sentiments = [e.sentiment for e in events if e.sentiment is not None]
            strengths = [e.strength for e in events if e.strength is not None]
            return {
                "news_count": len(events),
                "avg_sentiment": round(sum(sentiments) / len(sentiments), 4) if sentiments else 0,
                "max_strength": round(max(strengths), 4) if strengths else 0,
                "avg_strength": round(sum(strengths) / len(strengths), 4) if strengths else 0,
                "positive_count": sum(1 for s in sentiments if s > 0),
                "negative_count": sum(1 for s in sentiments if s < 0),
                "tags": list({tag for e in events for tag in (cast(list[str], e.tags) or [])}),
            }

        ind_agg = agg_events(individual_events)
        sec_agg = agg_events(sector_events)
        mkt_agg = agg_events(market_events)

        # Composite score
        composite = 0.0
        weights = {"individual": 0.5, "sector": 0.3, "market": 0.2}
        if ind_agg:
            composite += (
                ind_agg.get("avg_sentiment", 0)
                * ind_agg.get("avg_strength", 0)
                * weights["individual"]
            )
        if sec_agg:
            composite += (
                sec_agg.get("avg_sentiment", 0) * sec_agg.get("avg_strength", 0) * weights["sector"]
            )
        if mkt_agg:
            composite += (
                mkt_agg.get("avg_sentiment", 0) * mkt_agg.get("avg_strength", 0) * weights["market"]
            )
        composite = round(composite, 4)

        # Upsert event_factor
        existing = (
            self.db.query(models.EventFactor)
            .filter(
                models.EventFactor.symbol == symbol,
                models.EventFactor.trade_date == start_of_day,
            )
            .first()
        )
        if existing:
            existing.individual_events = ind_agg  # type: ignore[assignment]
            existing.sector_events = sec_agg  # type: ignore[assignment]
            existing.market_events = mkt_agg  # type: ignore[assignment]
            existing.composite = composite  # type: ignore[assignment]
            existing.updated_at = datetime.utcnow()  # type: ignore[assignment]
            self.db.commit()
            self.db.refresh(existing)
            return existing

        factor = models.EventFactor(
            symbol=symbol,
            trade_date=start_of_day,
            individual_events=ind_agg,
            sector_events=sec_agg,
            market_events=mkt_agg,
            composite=composite,
        )
        self.db.add(factor)
        self.db.commit()
        self.db.refresh(factor)
        return factor
