from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Float, Integer, String

from src.models.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True)
    password_hash = Column(String(255))
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


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
    user_id = Column(Integer, index=True, nullable=True)
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
    user_id = Column(Integer, index=True, nullable=True)
    stock_code = Column(String(20), index=True)
    stock_name = Column(String(100))
    quantity = Column(Integer)
    cost_price = Column(Float)
    buy_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
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


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, index=True)
    title = Column(String(500))
    summary = Column(String(1000))
    content = Column(String)
    source = Column(String(100))
    publish_time = Column(DateTime, nullable=True)
    url = Column(String(500), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class DiagnosticHistory(Base):
    __tablename__ = "diagnostic_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    stock_code = Column(String(20), index=True)
    stock_name = Column(String(100))
    fundamental_analysis = Column(String)
    technical_analysis = Column(String)
    risk_analysis = Column(String)
    final_report = Column(String)
    score = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)


class StockDailyPrice(Base):
    __tablename__ = "stock_daily_prices"

    id = Column(Integer, primary_key=True, index=True)
    stock_code = Column(String(20), index=True, nullable=False)
    trade_date = Column(DateTime, nullable=False)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Integer)
    amount = Column(Float)
    is_suspended = Column(Integer, default=0)
    adjusted = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)


class StockIndicator(Base):
    __tablename__ = "stock_indicators"

    id = Column(Integer, primary_key=True, index=True)
    stock_code = Column(String(20), index=True, nullable=False)
    trade_date = Column(DateTime, nullable=False)
    ma5 = Column(Float)
    ma10 = Column(Float)
    ma20 = Column(Float)
    ma60 = Column(Float)
    rsi6 = Column(Float)
    rsi12 = Column(Float)
    rsi24 = Column(Float)
    macd_dif = Column(Float)
    macd_dea = Column(Float)
    macd_bar = Column(Float)
    kdj_k = Column(Float)
    kdj_d = Column(Float)
    kdj_j = Column(Float)
    boll_upper = Column(Float)
    boll_mid = Column(Float)
    boll_lower = Column(Float)
    vol_ma5 = Column(Float)
    vol_ma10 = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


class StockFundamental(Base):
    __tablename__ = "stock_fundamentals"

    id = Column(Integer, primary_key=True, index=True)
    stock_code = Column(String(20), index=True, nullable=False)
    report_date = Column(DateTime, nullable=False)
    pe_ttm = Column(Float)
    pb = Column(Float)
    ps = Column(Float)
    roe = Column(Float)
    roa = Column(Float)
    gross_margin = Column(Float)
    net_margin = Column(Float)
    revenue_growth = Column(Float)
    profit_growth = Column(Float)
    debt_ratio = Column(Float)
    free_cash_flow = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


class StrategyBacktest(Base):
    __tablename__ = "strategy_backtests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    strategy_name = Column(String(100), nullable=False)
    stock_code = Column(String(20), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    initial_cash = Column(Float)
    final_value = Column(Float)
    total_return = Column(Float)
    annualized_return = Column(Float)
    max_drawdown = Column(Float)
    sharpe_ratio = Column(Float)
    win_rate = Column(Float)
    trade_count = Column(Integer)
    trades = Column(JSON)
    equity_curve = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


class ScreenerTemplate(Base):
    __tablename__ = "screener_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    name = Column(String(100))
    conditions = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    stock_code = Column(String(20), nullable=False)
    alert_type = Column(String(50), nullable=False)
    condition = Column(String(200))
    triggered_at = Column(DateTime, nullable=True)
    message = Column(String)
    is_read = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
