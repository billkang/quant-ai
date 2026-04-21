from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String

from src.models.database import Base


class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True)
    name = Column(String(100))
    market = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)


class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    stock_code = Column(String(20), index=True)
    stock_name = Column(String(100))
    added_at = Column(DateTime, default=datetime.utcnow)


class StockKline(Base):
    __tablename__ = "stock_kline"

    id = Column(Integer, primary_key=True, index=True)
    stock_code = Column(String(20), index=True)
    period = Column(String(10))
    data = Column(JSON)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    stock_code = Column(String(20), index=True)
    stock_name = Column(String(100))
    quantity = Column(Integer)
    cost_price = Column(Float)
    buy_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    stock_code = Column(String(20), index=True)
    stock_name = Column(String(100))
    type = Column(String(10))
    quantity = Column(Integer)
    price = Column(Float)
    commission = Column(Float, default=0)
    trade_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class NewsSource(Base):
    __tablename__ = "news_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    source_type = Column(String(50))
    config = Column(JSON)
    interval_minutes = Column(Integer, default=60)
    enabled = Column(Integer, default=1)
    last_fetched_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
