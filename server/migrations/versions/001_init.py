"""init

Revision ID: 001
Revises:
Create Date: 2026-04-21 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "stocks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=20), nullable=True),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("market", sa.String(length=10), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )
    op.create_index(op.f("ix_stocks_code"), "stocks", ["code"], unique=False)
    op.create_index(op.f("ix_stocks_id"), "stocks", ["id"], unique=False)

    op.create_table(
        "watchlist",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_code", sa.String(length=20), nullable=True),
        sa.Column("stock_name", sa.String(length=100), nullable=True),
        sa.Column("added_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_watchlist_id"), "watchlist", ["id"], unique=False)
    op.create_index(op.f("ix_watchlist_stock_code"), "watchlist", ["stock_code"], unique=False)

    op.create_table(
        "stock_kline",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_code", sa.String(length=20), nullable=True),
        sa.Column("period", sa.String(length=10), nullable=True),
        sa.Column("data", sa.JSON(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_stock_kline_id"), "stock_kline", ["id"], unique=False)
    op.create_index(op.f("ix_stock_kline_stock_code"), "stock_kline", ["stock_code"], unique=False)

    op.create_table(
        "positions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_code", sa.String(length=20), nullable=True),
        sa.Column("stock_name", sa.String(length=100), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=True),
        sa.Column("cost_price", sa.Float(), nullable=True),
        sa.Column("buy_date", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_positions_id"), "positions", ["id"], unique=False)
    op.create_index(op.f("ix_positions_stock_code"), "positions", ["stock_code"], unique=False)

    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_code", sa.String(length=20), nullable=True),
        sa.Column("stock_name", sa.String(length=100), nullable=True),
        sa.Column("type", sa.String(length=10), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=True),
        sa.Column("price", sa.Float(), nullable=True),
        sa.Column("commission", sa.Float(), nullable=True),
        sa.Column("trade_date", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_transactions_id"), "transactions", ["id"], unique=False)
    op.create_index(
        op.f("ix_transactions_stock_code"), "transactions", ["stock_code"], unique=False
    )

    op.create_table(
        "news_sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("source_type", sa.String(length=50), nullable=True),
        sa.Column("config", sa.JSON(), nullable=True),
        sa.Column("interval_minutes", sa.Integer(), nullable=True),
        sa.Column("enabled", sa.Integer(), nullable=True),
        sa.Column("last_fetched_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_news_sources_id"), "news_sources", ["id"], unique=False)

    op.create_table(
        "news_articles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=500), nullable=True),
        sa.Column("summary", sa.String(length=1000), nullable=True),
        sa.Column("content", sa.String(), nullable=True),
        sa.Column("source", sa.String(length=100), nullable=True),
        sa.Column("publish_time", sa.DateTime(), nullable=True),
        sa.Column("url", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("url"),
    )
    op.create_index(op.f("ix_news_articles_id"), "news_articles", ["id"], unique=False)
    op.create_index(
        op.f("ix_news_articles_source_id"), "news_articles", ["source_id"], unique=False
    )
    op.create_index(op.f("ix_news_articles_url"), "news_articles", ["url"], unique=False)

    op.create_table(
        "diagnostic_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_code", sa.String(length=20), nullable=True),
        sa.Column("stock_name", sa.String(length=100), nullable=True),
        sa.Column("fundamental_analysis", sa.String(), nullable=True),
        sa.Column("technical_analysis", sa.String(), nullable=True),
        sa.Column("risk_analysis", sa.String(), nullable=True),
        sa.Column("final_report", sa.String(), nullable=True),
        sa.Column("score", sa.String(length=10), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_diagnostic_history_id"), "diagnostic_history", ["id"], unique=False)
    op.create_index(
        op.f("ix_diagnostic_history_stock_code"), "diagnostic_history", ["stock_code"], unique=False
    )

    op.create_table(
        "stock_daily_prices",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_code", sa.String(length=20), nullable=False),
        sa.Column("trade_date", sa.DateTime(), nullable=False),
        sa.Column("open", sa.Float(), nullable=True),
        sa.Column("high", sa.Float(), nullable=True),
        sa.Column("low", sa.Float(), nullable=True),
        sa.Column("close", sa.Float(), nullable=True),
        sa.Column("volume", sa.Integer(), nullable=True),
        sa.Column("amount", sa.Float(), nullable=True),
        sa.Column("is_suspended", sa.Integer(), nullable=True),
        sa.Column("adjusted", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_stock_daily_prices_id"), "stock_daily_prices", ["id"], unique=False)
    op.create_index(
        op.f("ix_stock_daily_prices_stock_code"), "stock_daily_prices", ["stock_code"], unique=False
    )

    op.create_table(
        "stock_indicators",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_code", sa.String(length=20), nullable=False),
        sa.Column("trade_date", sa.DateTime(), nullable=False),
        sa.Column("ma5", sa.Float(), nullable=True),
        sa.Column("ma10", sa.Float(), nullable=True),
        sa.Column("ma20", sa.Float(), nullable=True),
        sa.Column("ma60", sa.Float(), nullable=True),
        sa.Column("rsi6", sa.Float(), nullable=True),
        sa.Column("rsi12", sa.Float(), nullable=True),
        sa.Column("rsi24", sa.Float(), nullable=True),
        sa.Column("macd_dif", sa.Float(), nullable=True),
        sa.Column("macd_dea", sa.Float(), nullable=True),
        sa.Column("macd_bar", sa.Float(), nullable=True),
        sa.Column("kdj_k", sa.Float(), nullable=True),
        sa.Column("kdj_d", sa.Float(), nullable=True),
        sa.Column("kdj_j", sa.Float(), nullable=True),
        sa.Column("boll_upper", sa.Float(), nullable=True),
        sa.Column("boll_mid", sa.Float(), nullable=True),
        sa.Column("boll_lower", sa.Float(), nullable=True),
        sa.Column("vol_ma5", sa.Float(), nullable=True),
        sa.Column("vol_ma10", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_stock_indicators_id"), "stock_indicators", ["id"], unique=False)
    op.create_index(
        op.f("ix_stock_indicators_stock_code"), "stock_indicators", ["stock_code"], unique=False
    )

    op.create_table(
        "stock_fundamentals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_code", sa.String(length=20), nullable=False),
        sa.Column("report_date", sa.DateTime(), nullable=False),
        sa.Column("pe_ttm", sa.Float(), nullable=True),
        sa.Column("pb", sa.Float(), nullable=True),
        sa.Column("ps", sa.Float(), nullable=True),
        sa.Column("roe", sa.Float(), nullable=True),
        sa.Column("roa", sa.Float(), nullable=True),
        sa.Column("gross_margin", sa.Float(), nullable=True),
        sa.Column("net_margin", sa.Float(), nullable=True),
        sa.Column("revenue_growth", sa.Float(), nullable=True),
        sa.Column("profit_growth", sa.Float(), nullable=True),
        sa.Column("debt_ratio", sa.Float(), nullable=True),
        sa.Column("free_cash_flow", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_stock_fundamentals_id"), "stock_fundamentals", ["id"], unique=False)
    op.create_index(
        op.f("ix_stock_fundamentals_stock_code"), "stock_fundamentals", ["stock_code"], unique=False
    )

    op.create_table(
        "strategy_backtests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("strategy_name", sa.String(length=100), nullable=False),
        sa.Column("stock_code", sa.String(length=20), nullable=False),
        sa.Column("start_date", sa.DateTime(), nullable=False),
        sa.Column("end_date", sa.DateTime(), nullable=False),
        sa.Column("initial_cash", sa.Float(), nullable=True),
        sa.Column("final_value", sa.Float(), nullable=True),
        sa.Column("total_return", sa.Float(), nullable=True),
        sa.Column("annualized_return", sa.Float(), nullable=True),
        sa.Column("max_drawdown", sa.Float(), nullable=True),
        sa.Column("sharpe_ratio", sa.Float(), nullable=True),
        sa.Column("win_rate", sa.Float(), nullable=True),
        sa.Column("trade_count", sa.Integer(), nullable=True),
        sa.Column("trades", sa.JSON(), nullable=True),
        sa.Column("equity_curve", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_strategy_backtests_id"), "strategy_backtests", ["id"], unique=False)

    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_code", sa.String(length=20), nullable=False),
        sa.Column("alert_type", sa.String(length=50), nullable=False),
        sa.Column("condition", sa.String(length=200), nullable=True),
        sa.Column("triggered_at", sa.DateTime(), nullable=True),
        sa.Column("message", sa.String(), nullable=True),
        sa.Column("is_read", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_alerts_id"), "alerts", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_alerts_id"), table_name="alerts")
    op.drop_table("alerts")
    op.drop_index(op.f("ix_strategy_backtests_id"), table_name="strategy_backtests")
    op.drop_table("strategy_backtests")
    op.drop_index(op.f("ix_stock_fundamentals_stock_code"), table_name="stock_fundamentals")
    op.drop_index(op.f("ix_stock_fundamentals_id"), table_name="stock_fundamentals")
    op.drop_table("stock_fundamentals")
    op.drop_index(op.f("ix_stock_indicators_stock_code"), table_name="stock_indicators")
    op.drop_index(op.f("ix_stock_indicators_id"), table_name="stock_indicators")
    op.drop_table("stock_indicators")
    op.drop_index(op.f("ix_stock_daily_prices_stock_code"), table_name="stock_daily_prices")
    op.drop_index(op.f("ix_stock_daily_prices_id"), table_name="stock_daily_prices")
    op.drop_table("stock_daily_prices")
    op.drop_index(op.f("ix_diagnostic_history_stock_code"), table_name="diagnostic_history")
    op.drop_index(op.f("ix_diagnostic_history_id"), table_name="diagnostic_history")
    op.drop_table("diagnostic_history")
    op.drop_index(op.f("ix_news_articles_url"), table_name="news_articles")
    op.drop_index(op.f("ix_news_articles_source_id"), table_name="news_articles")
    op.drop_index(op.f("ix_news_articles_id"), table_name="news_articles")
    op.drop_table("news_articles")
    op.drop_index(op.f("ix_news_sources_id"), table_name="news_sources")
    op.drop_table("news_sources")
    op.drop_index(op.f("ix_transactions_stock_code"), table_name="transactions")
    op.drop_index(op.f("ix_transactions_id"), table_name="transactions")
    op.drop_table("transactions")
    op.drop_index(op.f("ix_positions_stock_code"), table_name="positions")
    op.drop_index(op.f("ix_positions_id"), table_name="positions")
    op.drop_table("positions")
    op.drop_index(op.f("ix_stock_kline_stock_code"), table_name="stock_kline")
    op.drop_index(op.f("ix_stock_kline_id"), table_name="stock_kline")
    op.drop_table("stock_kline")
    op.drop_index(op.f("ix_watchlist_stock_code"), table_name="watchlist")
    op.drop_index(op.f("ix_watchlist_id"), table_name="watchlist")
    op.drop_table("watchlist")
    op.drop_index(op.f("ix_stocks_id"), table_name="stocks")
    op.drop_index(op.f("ix_stocks_code"), table_name="stocks")
    op.drop_table("stocks")
