from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

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
