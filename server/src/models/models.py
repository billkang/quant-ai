from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String, Text

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


# ───────────────────────────────────────────────
#  Event Factor System (mvp-event-factor-core)
# ───────────────────────────────────────────────


class EventSource(Base):
    __tablename__ = "event_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    source_type = Column(
        String(50), nullable=False
    )  # stock_news, stock_notice, macro_data, international
    scope = Column(String(20), nullable=False, default="individual")  # individual / sector / market
    config = Column(JSON, default=dict)
    schedule = Column(String(100), default="0 */6 * * *")  # cron expression
    enabled = Column(Integer, default=1)
    last_fetched_at = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class EventJob(Base):
    __tablename__ = "event_jobs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("event_sources.id"), index=True)
    status = Column(String(20), default="running")  # running / success / failed
    new_events_count = Column(Integer, default=0)
    duplicate_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    logs = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class EventRule(Base):
    __tablename__ = "event_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    rule_type = Column(
        String(50), nullable=False
    )  # sentiment_extractor / classifier / sector_mapper
    version = Column(String(20), nullable=False, default="1.0")
    config = Column(JSON, default=dict)  # keywords, thresholds, mappings etc.
    is_active = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("event_sources.id"), index=True)
    scope = Column(String(20), nullable=False, default="individual")  # individual / sector / market
    symbol = Column(String(20), index=True, nullable=True)
    sector = Column(String(100), nullable=True)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)
    publish_time = Column(DateTime, nullable=True)
    # Extracted signals
    sentiment = Column(Float, default=0)  # -1 to 1
    strength = Column(Float, default=0)  # 0 to 1
    certainty = Column(Float, default=0)  # 0 to 1
    urgency = Column(Float, default=0)  # 0 to 1
    duration = Column(String(20), nullable=True)  # short / medium / long
    tags = Column(JSON, default=list)
    signals = Column(JSON, default=dict)  # raw extracted signals
    is_edited = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class EventFactor(Base):
    __tablename__ = "event_factors"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    trade_date = Column(DateTime, nullable=False, index=True)
    individual_events = Column(
        JSON, default=dict
    )  # { news_count, avg_sentiment, max_strength, ... }
    sector_events = Column(JSON, default=dict)
    market_events = Column(JSON, default=dict)
    composite = Column(Float, default=0)  # composite score
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class StockSectorMapping(Base):
    __tablename__ = "stock_sector_mappings"

    id = Column(Integer, primary_key=True, index=True)
    stock_code = Column(String(20), unique=True, index=True, nullable=False)
    stock_name = Column(String(100))
    sector = Column(String(100), nullable=False)
    sector_code = Column(String(10), nullable=True)
    industry_level1 = Column(String(100), nullable=True)
    industry_level2 = Column(String(100), nullable=True)
    source = Column(String(50), default="csrc")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ───────────────────────────────────────────────
#  Strategy Management
# ───────────────────────────────────────────────


class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="technical")  # technical / event / combined
    strategy_code = Column(String(50), nullable=False)  # ma_cross, rsi_oversold, etc.
    params_schema = Column(JSON, default=dict)  # JSON Schema for params
    is_builtin = Column(Integer, default=0)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class StrategyVersion(Base):
    __tablename__ = "strategy_versions"

    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), index=True)
    version_number = Column(Integer, nullable=False)
    params_schema = Column(JSON, default=dict)
    changelog = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ───────────────────────────────────────────────
#  Factor Snapshots
# ───────────────────────────────────────────────


class FactorSnapshot(Base):
    __tablename__ = "factor_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    trade_date = Column(DateTime, nullable=False, index=True)
    # Technical factors (denormalized from stock_indicators)
    technical = Column(JSON, default=dict)
    # Event factors (denormalized from event_factors)
    events = Column(JSON, default=dict)
    # Price (denormalized from stock_daily_prices)
    price = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ───────────────────────────────────────────────
#  Backtest Tasks (renamed / extended from strategy_backtests)
# ───────────────────────────────────────────────


class BacktestTask(Base):
    __tablename__ = "backtest_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=True)
    strategy_version_id = Column(Integer, ForeignKey("strategy_versions.id"), nullable=True)
    # Fallback for backward compatibility
    strategy_name = Column(String(100), nullable=True)
    stock_code = Column(String(20), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    initial_cash = Column(Float)
    params = Column(JSON, default=dict)  # runtime strategy params
    # Results
    final_value = Column(Float)
    total_return = Column(Float)
    annualized_return = Column(Float)
    max_drawdown = Column(Float)
    sharpe_ratio = Column(Float)
    win_rate = Column(Float)
    trade_count = Column(Integer)
    trades = Column(JSON)
    equity_curve = Column(JSON)
    # Execution tracking
    status = Column(String(20), default="completed")  # pending / running / completed / failed
    progress = Column(Float, default=100.0)  # 0-100
    factor_snapshot_ids = Column(JSON, default=list)
    error_message = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ───────────────────────────────────────────────
#  Virtual Portfolio (extended positions)
# ───────────────────────────────────────────────


class StrategyPosition(Base):
    __tablename__ = "strategy_positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    backtest_task_id = Column(Integer, ForeignKey("backtest_tasks.id"), index=True, nullable=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=True)
    stock_code = Column(String(20), index=True)
    stock_name = Column(String(100))
    quantity = Column(Integer)
    avg_cost = Column(Float)
    unrealized_pnl = Column(Float, default=0)
    is_active = Column(Integer, default=1)
    buy_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ───────────────────────────────────────────────
#  Paper Trading
# ───────────────────────────────────────────────


class PaperAccount(Base):
    __tablename__ = "paper_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    initial_cash = Column(Float, default=1000000)
    available_cash = Column(Float, default=1000000)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PaperPosition(Base):
    __tablename__ = "paper_positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    stock_code = Column(String(20), index=True)
    stock_name = Column(String(100))
    quantity = Column(Integer)
    cost_price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PaperOrder(Base):
    __tablename__ = "paper_orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    stock_code = Column(String(20))
    stock_name = Column(String(100))
    side = Column(String(10))  # buy / sell
    quantity = Column(Integer)
    price = Column(Float)
    amount = Column(Float)
    status = Column(String(20), default="filled")  # filled / pending / cancelled
    created_at = Column(DateTime, default=datetime.utcnow)


# ───────────────────────────────────────────────
#  Research Reports & Notices
# ───────────────────────────────────────────────


class ResearchReport(Base):
    __tablename__ = "research_reports"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    title = Column(String(500), nullable=False)
    source = Column(String(100), nullable=True)
    author = Column(String(100), nullable=True)
    rating = Column(String(20), nullable=True)
    target_price = Column(Float, nullable=True)
    summary = Column(Text, nullable=True)
    publish_date = Column(DateTime, nullable=True)
    url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class StockNotice(Base):
    __tablename__ = "stock_notices"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), index=True, nullable=False)
    title = Column(String(500), nullable=False)
    category = Column(String(50), nullable=True)
    source = Column(String(100), nullable=True)
    publish_date = Column(DateTime, nullable=True)
    url = Column(String(500), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ───────────────────────────────────────────────
#  Notification System
# ───────────────────────────────────────────────


class NotificationSetting(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    email_enabled = Column(Integer, default=0)
    email_address = Column(String(100), nullable=True)
    webhook_enabled = Column(Integer, default=0)
    webhook_url = Column(String(500), nullable=True)
    channel_config = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(String, nullable=True)
    channels = Column(JSON, default=list)
    is_read = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
