from datetime import datetime

from sqlalchemy.orm import Session

from src.models import models
from src.models.database import Base, engine


def init_db():
    Base.metadata.create_all(bind=engine)


def get_watchlist(db: Session, user_id: int = None) -> list[models.Watchlist]:
    query = db.query(models.Watchlist)
    if user_id is not None:
        query = query.filter(models.Watchlist.user_id == user_id)
    return query.all()


def add_to_watchlist(
    db: Session, stock_code: str, stock_name: str = "", user_id: int = None
) -> models.Watchlist:
    watch = models.Watchlist(stock_code=stock_code, stock_name=stock_name, user_id=user_id)
    db.add(watch)
    db.commit()
    db.refresh(watch)
    return watch


def remove_from_watchlist(db: Session, stock_code: str, user_id: int = None) -> bool:
    query = db.query(models.Watchlist).filter(models.Watchlist.stock_code == stock_code)
    if user_id is not None:
        query = query.filter(models.Watchlist.user_id == user_id)
    watch = query.first()
    if watch:
        db.delete(watch)
        db.commit()
        return True
    return False


def save_stock_kline(db: Session, stock_code: str, period: str, data: list) -> models.StockKline:
    existing = (
        db.query(models.StockKline)
        .filter(models.StockKline.stock_code == stock_code, models.StockKline.period == period)
        .first()
    )
    if existing:
        existing.data = data
        existing.updated_at = datetime.utcnow()
        db.commit()
        return existing
    kline = models.StockKline(stock_code=stock_code, period=period, data=data)
    db.add(kline)
    db.commit()
    db.refresh(kline)
    return kline


def get_stock_kline(db: Session, stock_code: str, period: str) -> models.StockKline | None:
    return (
        db.query(models.StockKline)
        .filter(models.StockKline.stock_code == stock_code, models.StockKline.period == period)
        .first()
    )


def get_positions(db: Session, user_id: int = None) -> list[models.Position]:
    query = db.query(models.Position)
    if user_id is not None:
        query = query.filter(models.Position.user_id == user_id)
    return query.all()


def delete_position(db: Session, stock_code: str, user_id: int = None) -> bool:
    query = db.query(models.Position).filter(models.Position.stock_code == stock_code)
    if user_id is not None:
        query = query.filter(models.Position.user_id == user_id)
    position = query.first()
    if position:
        db.delete(position)
        db.commit()
        return True
    return False


def add_position(
    db: Session,
    stock_code: str,
    stock_name: str,
    quantity: int,
    cost_price: float,
    buy_date,
    user_id: int = None,
) -> models.Position:
    position = models.Position(
        stock_code=stock_code,
        stock_name=stock_name,
        quantity=quantity,
        cost_price=cost_price,
        buy_date=buy_date,
        user_id=user_id,
    )
    db.add(position)
    db.commit()
    db.refresh(position)
    return position


def get_transactions(db: Session, limit: int = 50, user_id: int = None) -> list[models.Transaction]:
    query = db.query(models.Transaction)
    if user_id is not None:
        query = query.filter(models.Transaction.user_id == user_id)
    return query.order_by(models.Transaction.trade_date.desc()).limit(limit).all()


def add_transaction(
    db: Session,
    stock_code: str,
    stock_name: str,
    trans_type: str,
    quantity: int,
    price: float,
    commission: float,
    trade_date,
    user_id: int = None,
) -> models.Transaction:
    transaction = models.Transaction(
        stock_code=stock_code,
        stock_name=stock_name,
        type=trans_type,
        quantity=quantity,
        price=price,
        commission=commission,
        trade_date=trade_date,
        user_id=user_id,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def get_news_sources(db: Session) -> list[models.NewsSource]:
    return db.query(models.NewsSource).all()


def add_news_source(
    db: Session, name: str, source_type: str, config: dict, interval_minutes: int = 60
) -> models.NewsSource:
    source = models.NewsSource(
        name=name, source_type=source_type, config=config, interval_minutes=interval_minutes
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


def update_news_source(
    db: Session,
    source_id: int,
    name: str = None,
    source_type: str = None,
    config: dict = None,
    interval_minutes: int = None,
    enabled: bool = None,
) -> models.NewsSource | None:
    source = db.query(models.NewsSource).filter(models.NewsSource.id == source_id).first()
    if not source:
        return None
    if name is not None:
        source.name = name
    if source_type is not None:
        source.source_type = source_type
    if config is not None:
        source.config = config
    if interval_minutes is not None:
        source.interval_minutes = interval_minutes
    if enabled is not None:
        source.enabled = 1 if enabled else 0
    db.commit()
    db.refresh(source)
    return source


def delete_news_source(db: Session, source_id: int) -> bool:
    source = db.query(models.NewsSource).filter(models.NewsSource.id == source_id).first()
    if source:
        db.delete(source)
        db.commit()
        return True
    return False


def get_news_articles(
    db: Session, source_id: int = None, symbol: str = None, limit: int = 50
) -> list[models.NewsArticle]:
    query = db.query(models.NewsArticle)
    if source_id:
        query = query.filter(models.NewsArticle.source_id == source_id)
    if symbol:
        sources = db.query(models.NewsSource).all()
        source_ids = [s.id for s in sources if s.config and s.config.get("symbol") == symbol]
        query = query.filter(models.NewsArticle.source_id.in_(source_ids))
    return query.order_by(models.NewsArticle.publish_time.desc()).limit(limit).all()


def article_url_exists(db: Session, url: str) -> bool:
    return db.query(models.NewsArticle).filter(models.NewsArticle.url == url).first() is not None


def save_news_article(
    db: Session,
    source_id: int,
    title: str,
    summary: str,
    source: str,
    publish_time: datetime | None,
    url: str,
    content: str | None = None,
) -> models.NewsArticle:
    article = models.NewsArticle(
        source_id=source_id,
        title=title,
        summary=summary,
        content=content,
        source=source,
        publish_time=publish_time,
        url=url,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def update_news_source_fetch_time(db: Session, source_id: int) -> None:
    source = db.query(models.NewsSource).filter(models.NewsSource.id == source_id).first()
    if source:
        source.last_fetched_at = datetime.utcnow()
        db.commit()


def save_diagnostic_history(
    db: Session,
    stock_code: str,
    stock_name: str,
    fundamental_analysis: str,
    technical_analysis: str,
    risk_analysis: str,
    final_report: str,
    score: str = None,
    user_id: int = None,
) -> models.DiagnosticHistory:
    history = models.DiagnosticHistory(
        stock_code=stock_code,
        stock_name=stock_name,
        fundamental_analysis=fundamental_analysis,
        technical_analysis=technical_analysis,
        risk_analysis=risk_analysis,
        final_report=final_report,
        score=score,
        user_id=user_id,
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return history


def get_diagnostic_history(
    db: Session, stock_code: str = None, limit: int = 10, user_id: int = None
) -> list[models.DiagnosticHistory]:
    query = db.query(models.DiagnosticHistory)
    if user_id is not None:
        query = query.filter(models.DiagnosticHistory.user_id == user_id)
    if stock_code:
        query = query.filter(models.DiagnosticHistory.stock_code == stock_code)
    return query.order_by(models.DiagnosticHistory.created_at.desc()).limit(limit).all()


def get_diagnostic_history_by_id(
    db: Session, history_id: int, user_id: int = None
) -> models.DiagnosticHistory | None:
    query = db.query(models.DiagnosticHistory).filter(models.DiagnosticHistory.id == history_id)
    if user_id is not None:
        query = query.filter(models.DiagnosticHistory.user_id == user_id)
    return query.first()


# ---- Stock Daily Prices ----


def save_daily_price(
    db: Session,
    stock_code: str,
    trade_date,
    open_price,
    high,
    low,
    close,
    volume,
    amount,
    is_suspended=False,
    adjusted=True,
):
    existing = (
        db.query(models.StockDailyPrice)
        .filter(
            models.StockDailyPrice.stock_code == stock_code,
            models.StockDailyPrice.trade_date == trade_date,
        )
        .first()
    )
    if existing:
        existing.open = open_price
        existing.high = high
        existing.low = low
        existing.close = close
        existing.volume = volume
        existing.amount = amount
        existing.is_suspended = 1 if is_suspended else 0
        existing.adjusted = 1 if adjusted else 0
        db.commit()
        return existing
    price = models.StockDailyPrice(
        stock_code=stock_code,
        trade_date=trade_date,
        open=open_price,
        high=high,
        low=low,
        close=close,
        volume=volume,
        amount=amount,
        is_suspended=1 if is_suspended else 0,
        adjusted=1 if adjusted else 0,
    )
    db.add(price)
    db.commit()
    db.refresh(price)
    return price


def get_daily_prices(db: Session, stock_code: str, limit: int = 60):
    return (
        db.query(models.StockDailyPrice)
        .filter(models.StockDailyPrice.stock_code == stock_code)
        .order_by(models.StockDailyPrice.trade_date.desc())
        .limit(limit)
        .all()
    )


# ---- Stock Indicators ----


def save_indicator(db: Session, stock_code: str, trade_date, **kwargs):
    existing = (
        db.query(models.StockIndicator)
        .filter(
            models.StockIndicator.stock_code == stock_code,
            models.StockIndicator.trade_date == trade_date,
        )
        .first()
    )
    if existing:
        for key, value in kwargs.items():
            if hasattr(existing, key):
                setattr(existing, key, value)
        db.commit()
        return existing
    indicator = models.StockIndicator(stock_code=stock_code, trade_date=trade_date, **kwargs)
    db.add(indicator)
    db.commit()
    db.refresh(indicator)
    return indicator


def get_latest_indicator(db: Session, stock_code: str):
    return (
        db.query(models.StockIndicator)
        .filter(models.StockIndicator.stock_code == stock_code)
        .order_by(models.StockIndicator.trade_date.desc())
        .first()
    )


def get_indicator_history(db: Session, stock_code: str, limit: int = 60):
    return (
        db.query(models.StockIndicator)
        .filter(models.StockIndicator.stock_code == stock_code)
        .order_by(models.StockIndicator.trade_date.desc())
        .limit(limit)
        .all()
    )


# ---- Stock Fundamentals ----


def save_fundamental(db: Session, stock_code: str, report_date, **kwargs):
    existing = (
        db.query(models.StockFundamental)
        .filter(
            models.StockFundamental.stock_code == stock_code,
            models.StockFundamental.report_date == report_date,
        )
        .first()
    )
    if existing:
        for key, value in kwargs.items():
            if hasattr(existing, key):
                setattr(existing, key, value)
        db.commit()
        return existing
    fundamental = models.StockFundamental(stock_code=stock_code, report_date=report_date, **kwargs)
    db.add(fundamental)
    db.commit()
    db.refresh(fundamental)
    return fundamental


def get_latest_fundamental(db: Session, stock_code: str):
    return (
        db.query(models.StockFundamental)
        .filter(models.StockFundamental.stock_code == stock_code)
        .order_by(models.StockFundamental.report_date.desc())
        .first()
    )


# ---- Strategy Backtests ----


def save_backtest(db: Session, **kwargs) -> models.StrategyBacktest:
    backtest = models.StrategyBacktest(**kwargs)
    db.add(backtest)
    db.commit()
    db.refresh(backtest)
    return backtest


def get_backtests(db: Session, limit: int = 50, user_id: int = None):
    query = db.query(models.StrategyBacktest)
    if user_id is not None:
        query = query.filter(models.StrategyBacktest.user_id == user_id)
    return query.order_by(models.StrategyBacktest.created_at.desc()).limit(limit).all()


def get_backtest_by_id(db: Session, backtest_id: int, user_id: int = None):
    query = db.query(models.StrategyBacktest).filter(models.StrategyBacktest.id == backtest_id)
    if user_id is not None:
        query = query.filter(models.StrategyBacktest.user_id == user_id)
    return query.first()


# ---- Alerts ----


def save_alert(
    db: Session,
    stock_code: str,
    alert_type: str,
    condition: str,
    message: str,
    triggered_at=None,
    user_id: int = None,
):
    alert = models.Alert(
        stock_code=stock_code,
        alert_type=alert_type,
        condition=condition,
        message=message,
        triggered_at=triggered_at,
        user_id=user_id,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def get_alerts(db: Session, is_read=None, limit: int = 50, user_id: int = None):
    query = db.query(models.Alert)
    if user_id is not None:
        query = query.filter(models.Alert.user_id == user_id)
    if is_read is not None:
        query = query.filter(models.Alert.is_read == (1 if is_read else 0))
    return query.order_by(models.Alert.created_at.desc()).limit(limit).all()


def mark_alert_read(db: Session, alert_id: int, user_id: int = None):
    query = db.query(models.Alert).filter(models.Alert.id == alert_id)
    if user_id is not None:
        query = query.filter(models.Alert.user_id == user_id)
    alert = query.first()
    if alert:
        alert.is_read = 1
        db.commit()
        return True
    return False


def get_unread_alert_count(db: Session, user_id: int = None):
    query = db.query(models.Alert).filter(models.Alert.is_read == 0)
    if user_id is not None:
        query = query.filter(models.Alert.user_id == user_id)
    return query.count()


# ---- Data Channels ----


def get_data_channels(
    db: Session, data_source_id: int = None, enabled: bool = None
) -> list[models.DataChannel]:
    query = db.query(models.DataChannel)
    if data_source_id is not None:
        query = query.filter(models.DataChannel.data_source_id == data_source_id)
    if enabled is not None:
        query = query.filter(models.DataChannel.enabled == (1 if enabled else 0))
    return query.order_by(models.DataChannel.created_at.desc()).all()


def get_data_channel_by_id(db: Session, channel_id: int) -> models.DataChannel | None:
    return db.query(models.DataChannel).filter(models.DataChannel.id == channel_id).first()


def create_data_channel(db: Session, **kwargs) -> models.DataChannel:
    channel = models.DataChannel(**kwargs)
    db.add(channel)
    db.commit()
    db.refresh(channel)
    return channel


def update_data_channel(db: Session, channel_id: int, **kwargs) -> models.DataChannel | None:
    channel = get_data_channel_by_id(db, channel_id)
    if not channel:
        return None
    for key, value in kwargs.items():
        if hasattr(channel, key):
            setattr(channel, key, value)
    db.commit()
    db.refresh(channel)
    return channel


def delete_data_channel(db: Session, channel_id: int) -> bool:
    channel = get_data_channel_by_id(db, channel_id)
    if channel:
        db.delete(channel)
        db.commit()
        return True
    return False


def get_data_channels_by_source(db: Session, data_source_id: int) -> list[models.DataChannel]:
    return (
        db.query(models.DataChannel)
        .filter(models.DataChannel.data_source_id == data_source_id)
        .order_by(models.DataChannel.created_at.desc())
        .all()
    )


def get_selected_channels_by_source(db: Session, source_id: int) -> list[models.DataChannel]:
    return (
        db.query(models.DataChannel)
        .join(
            models.SourceChannelLink, models.SourceChannelLink.channel_id == models.DataChannel.id
        )
        .filter(models.SourceChannelLink.source_id == source_id)
        .order_by(models.DataChannel.created_at.desc())
        .all()
    )


def link_channel_to_source(db: Session, source_id: int, channel_id: int) -> bool:
    existing = (
        db.query(models.SourceChannelLink)
        .filter(
            models.SourceChannelLink.source_id == source_id,
            models.SourceChannelLink.channel_id == channel_id,
        )
        .first()
    )
    if existing:
        return True
    link = models.SourceChannelLink(source_id=source_id, channel_id=channel_id)
    db.add(link)
    db.commit()
    return True


def unlink_channel_from_source(db: Session, source_id: int, channel_id: int) -> bool:
    link = (
        db.query(models.SourceChannelLink)
        .filter(
            models.SourceChannelLink.source_id == source_id,
            models.SourceChannelLink.channel_id == channel_id,
        )
        .first()
    )
    if not link:
        return False
    db.delete(link)
    db.commit()
    return True


def get_source_ids_for_channel(db: Session, channel_id: int) -> list[int]:
    rows = (
        db.query(models.SourceChannelLink.source_id)
        .filter(models.SourceChannelLink.channel_id == channel_id)
        .all()
    )
    return [r[0] for r in rows]


# ---- Sectors ----


def get_sectors(db: Session, level: int = None, is_enabled: bool = None) -> list[models.Sector]:
    query = db.query(models.Sector)
    if level is not None:
        query = query.filter(models.Sector.level == level)
    if is_enabled is not None:
        query = query.filter(models.Sector.is_enabled == (1 if is_enabled else 0))
    return query.order_by(models.Sector.code).all()


def get_sector_by_id(db: Session, sector_id: int) -> models.Sector | None:
    return db.query(models.Sector).filter(models.Sector.id == sector_id).first()


def get_enabled_sectors(db: Session) -> list[models.Sector]:
    return (
        db.query(models.Sector)
        .filter(models.Sector.is_enabled == 1)
        .order_by(models.Sector.code)
        .all()
    )


def create_sector(db: Session, **kwargs) -> models.Sector:
    sector = models.Sector(**kwargs)
    db.add(sector)
    db.commit()
    db.refresh(sector)
    return sector


def update_sector(db: Session, sector_id: int, **kwargs) -> models.Sector | None:
    sector = get_sector_by_id(db, sector_id)
    if not sector:
        return None
    for key, value in kwargs.items():
        if hasattr(sector, key):
            setattr(sector, key, value)
    db.commit()
    db.refresh(sector)
    return sector


def delete_sector(db: Session, sector_id: int) -> bool:
    sector = get_sector_by_id(db, sector_id)
    if sector:
        db.delete(sector)
        db.commit()
        return True
    return False


# ---- Collection Jobs ----


def create_collection_job(db: Session, job_type: str, total_items: int = 0) -> models.CollectionJob:
    job = models.CollectionJob(job_type=job_type, status="running", total_items=total_items)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_collection_jobs(
    db: Session,
    job_type: str = None,
    status: str = None,
    limit: int = 50,
    offset: int = 0,
):
    query = db.query(models.CollectionJob)
    if job_type:
        query = query.filter(models.CollectionJob.job_type == job_type)
    if status:
        query = query.filter(models.CollectionJob.status == status)
    return query.order_by(models.CollectionJob.created_at.desc()).offset(offset).limit(limit).all()


def get_collection_job_by_id(db: Session, job_id: int) -> models.CollectionJob | None:
    return db.query(models.CollectionJob).filter(models.CollectionJob.id == job_id).first()


def update_collection_job_progress(
    db: Session, job_id: int, processed_items: int, total_items: int = None
) -> models.CollectionJob | None:
    job = get_collection_job_by_id(db, job_id)
    if not job:
        return None
    job.processed_items = processed_items
    if total_items is not None:
        job.total_items = total_items
    if job.total_items > 0:
        job.progress = round((job.processed_items / job.total_items) * 100, 2)
    db.commit()
    db.refresh(job)
    return job


def complete_collection_job(
    db: Session,
    job_id: int,
    status: str = "completed",
    error_log: str = None,
) -> models.CollectionJob | None:
    job = get_collection_job_by_id(db, job_id)
    if not job:
        return None
    job.status = status
    job.end_time = datetime.utcnow()
    if error_log:
        job.error_log = error_log
    db.commit()
    db.refresh(job)
    return job


def cancel_collection_job(db: Session, job_id: int) -> models.CollectionJob | None:
    job = get_collection_job_by_id(db, job_id)
    if not job or job.status != "running":
        return None
    job.status = "cancelled"
    job.end_time = datetime.utcnow()
    db.commit()
    db.refresh(job)
    return job


# ---- System Logs ----


def create_system_log(
    db: Session,
    level: str,
    category: str,
    message: str,
    details: dict = None,
    source: str = None,
) -> models.SystemLog:
    log = models.SystemLog(
        level=level.upper(),
        category=category,
        message=message,
        details=details or {},
        source=source,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_system_logs(
    db: Session,
    level: str = None,
    category: str = None,
    source: str = None,
    start_time=None,
    end_time=None,
    limit: int = 50,
    offset: int = 0,
):
    query = db.query(models.SystemLog)
    if level:
        query = query.filter(models.SystemLog.level == level.upper())
    if category:
        query = query.filter(models.SystemLog.category == category)
    if source:
        query = query.filter(models.SystemLog.source == source)
    if start_time:
        query = query.filter(models.SystemLog.created_at >= start_time)
    if end_time:
        query = query.filter(models.SystemLog.created_at <= end_time)
    total = query.count()
    items = query.order_by(models.SystemLog.created_at.desc()).offset(offset).limit(limit).all()
    return items, total


def get_system_log_by_id(db: Session, log_id: int) -> models.SystemLog | None:
    return db.query(models.SystemLog).filter(models.SystemLog.id == log_id).first()


def delete_system_logs_by_time(db: Session, before) -> int:
    result = db.query(models.SystemLog).filter(models.SystemLog.created_at < before).delete()
    db.commit()
    return result


def delete_system_logs_by_ids(db: Session, log_ids: list[int]) -> int:
    result = db.query(models.SystemLog).filter(models.SystemLog.id.in_(log_ids)).delete()
    db.commit()
    return result


def get_system_log_stats(db: Session, hours: int = 24):
    from datetime import datetime, timedelta

    since = datetime.utcnow() - timedelta(hours=hours)
    total = db.query(models.SystemLog).filter(models.SystemLog.created_at >= since).count()
    levels = (
        db.query(models.SystemLog.level, db.func.count(models.SystemLog.id))
        .filter(models.SystemLog.created_at >= since)
        .group_by(models.SystemLog.level)
        .all()
    )
    categories = (
        db.query(models.SystemLog.category, db.func.count(models.SystemLog.id))
        .filter(models.SystemLog.created_at >= since)
        .group_by(models.SystemLog.category)
        .all()
    )
    return {
        "total": total,
        "by_level": dict(levels),
        "by_category": dict(categories),
    }
