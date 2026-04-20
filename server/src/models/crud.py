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
    existing = db.query(models.StockKline).filter(
        models.StockKline.stock_code == stock_code,
        models.StockKline.period == period
    ).first()
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
    return db.query(models.StockKline).filter(
        models.StockKline.stock_code == stock_code,
        models.StockKline.period == period
    ).first()


def get_positions(db: Session) -> list[models.Position]:
    return db.query(models.Position).all()


def delete_position(db: Session, stock_code: str) -> bool:
    position = db.query(models.Position).filter(models.Position.stock_code == stock_code).first()
    if position:
        db.delete(position)
        db.commit()
        return True
    return False


def add_position(db: Session, stock_code: str, stock_name: str, quantity: int, cost_price: float, buy_date) -> models.Position:
    position = models.Position(
        stock_code=stock_code,
        stock_name=stock_name,
        quantity=quantity,
        cost_price=cost_price,
        buy_date=buy_date
    )
    db.add(position)
    db.commit()
    db.refresh(position)
    return position


def get_transactions(db: Session, limit: int = 50) -> list[models.Transaction]:
    return db.query(models.Transaction).order_by(models.Transaction.trade_date.desc()).limit(limit).all()


def add_transaction(db: Session, stock_code: str, stock_name: str, trans_type: str, quantity: int, price: float, commission: float, trade_date) -> models.Transaction:
    transaction = models.Transaction(
        stock_code=stock_code,
        stock_name=stock_name,
        type=trans_type,
        quantity=quantity,
        price=price,
        commission=commission,
        trade_date=trade_date
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction
