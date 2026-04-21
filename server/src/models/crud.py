from datetime import datetime

from sqlalchemy.orm import Session

from src.models import models
from src.models.database import Base, engine


def init_db():
    Base.metadata.create_all(bind=engine)


def get_watchlist(db: Session) -> list[models.Watchlist]:
    return db.query(models.Watchlist).all()


def add_to_watchlist(db: Session, stock_code: str, stock_name: str = "") -> models.Watchlist:
    watch = models.Watchlist(stock_code=stock_code, stock_name=stock_name)
    db.add(watch)
    db.commit()
    db.refresh(watch)
    return watch


def remove_from_watchlist(db: Session, stock_code: str) -> bool:
    watch = db.query(models.Watchlist).filter(models.Watchlist.stock_code == stock_code).first()
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


def get_positions(db: Session) -> list[models.Position]:
    return db.query(models.Position).all()


def delete_position(db: Session, stock_code: str) -> bool:
    position = db.query(models.Position).filter(models.Position.stock_code == stock_code).first()
    if position:
        db.delete(position)
        db.commit()
        return True
    return False


def add_position(
    db: Session, stock_code: str, stock_name: str, quantity: int, cost_price: float, buy_date
) -> models.Position:
    position = models.Position(
        stock_code=stock_code,
        stock_name=stock_name,
        quantity=quantity,
        cost_price=cost_price,
        buy_date=buy_date,
    )
    db.add(position)
    db.commit()
    db.refresh(position)
    return position


def get_transactions(db: Session, limit: int = 50) -> list[models.Transaction]:
    return (
        db.query(models.Transaction)
        .order_by(models.Transaction.trade_date.desc())
        .limit(limit)
        .all()
    )


def add_transaction(
    db: Session,
    stock_code: str,
    stock_name: str,
    trans_type: str,
    quantity: int,
    price: float,
    commission: float,
    trade_date,
) -> models.Transaction:
    transaction = models.Transaction(
        stock_code=stock_code,
        stock_name=stock_name,
        type=trans_type,
        quantity=quantity,
        price=price,
        commission=commission,
        trade_date=trade_date,
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
    publish_time: datetime,
    url: str,
    content: str = None,
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


def update_fetch_time(db: Session, source_id: int) -> None:
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
) -> models.DiagnosticHistory:
    history = models.DiagnosticHistory(
        stock_code=stock_code,
        stock_name=stock_name,
        fundamental_analysis=fundamental_analysis,
        technical_analysis=technical_analysis,
        risk_analysis=risk_analysis,
        final_report=final_report,
        score=score,
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return history


def get_diagnostic_history(
    db: Session, stock_code: str = None, limit: int = 10
) -> list[models.DiagnosticHistory]:
    query = db.query(models.DiagnosticHistory)
    if stock_code:
        query = query.filter(models.DiagnosticHistory.stock_code == stock_code)
    return query.order_by(models.DiagnosticHistory.created_at.desc()).limit(limit).all()


def get_diagnostic_history_by_id(db: Session, history_id: int) -> models.DiagnosticHistory | None:
    return (
        db.query(models.DiagnosticHistory).filter(models.DiagnosticHistory.id == history_id).first()
    )
