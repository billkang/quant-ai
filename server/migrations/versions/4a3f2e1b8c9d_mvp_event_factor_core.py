"""mvp_event_factor_core

Revision ID: 4a3f2e1b8c9d
Revises: 907cfd0caa9f
Create Date: 2026-04-23 10:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "4a3f2e1b8c9d"
down_revision: str | Sequence[str] | None = "907cfd0caa9f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema for mvp-event-factor-core."""

    # ───────────────────────────────────────────────
    #  1. New tables: Event system
    # ───────────────────────────────────────────────

    op.create_table(
        "event_sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("source_type", sa.String(length=50), nullable=False),
        sa.Column("scope", sa.String(length=20), nullable=False, server_default="individual"),
        sa.Column("config", sa.JSON(), nullable=True),
        sa.Column("schedule", sa.String(length=100), nullable=True, server_default="0 */6 * * *"),
        sa.Column("enabled", sa.Integer(), nullable=True, server_default="1"),
        sa.Column("last_fetched_at", sa.DateTime(), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_event_sources_id"), "event_sources", ["id"], unique=False)

    op.create_table(
        "event_jobs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=True, server_default="running"),
        sa.Column("new_events_count", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("duplicate_count", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("error_count", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("logs", sa.Text(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_event_jobs_id"), "event_jobs", ["id"], unique=False)
    op.create_index(op.f("ix_event_jobs_source_id"), "event_jobs", ["source_id"], unique=False)

    op.create_table(
        "event_rules",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("rule_type", sa.String(length=50), nullable=False),
        sa.Column("version", sa.String(length=20), nullable=False, server_default="1.0"),
        sa.Column("config", sa.JSON(), nullable=True),
        sa.Column("is_active", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_event_rules_id"), "event_rules", ["id"], unique=False)

    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=True),
        sa.Column("scope", sa.String(length=20), nullable=False, server_default="individual"),
        sa.Column("symbol", sa.String(length=20), nullable=True),
        sa.Column("sector", sa.String(length=100), nullable=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("url", sa.String(length=500), nullable=True),
        sa.Column("publish_time", sa.DateTime(), nullable=True),
        sa.Column("sentiment", sa.Float(), nullable=True, server_default="0"),
        sa.Column("strength", sa.Float(), nullable=True, server_default="0"),
        sa.Column("certainty", sa.Float(), nullable=True, server_default="0"),
        sa.Column("urgency", sa.Float(), nullable=True, server_default="0"),
        sa.Column("duration", sa.String(length=20), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("signals", sa.JSON(), nullable=True),
        sa.Column("is_edited", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_events_id"), "events", ["id"], unique=False)
    op.create_index(op.f("ix_events_source_id"), "events", ["source_id"], unique=False)
    op.create_index(op.f("ix_events_symbol"), "events", ["symbol"], unique=False)

    op.create_table(
        "event_factors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("symbol", sa.String(length=20), nullable=False),
        sa.Column("trade_date", sa.DateTime(), nullable=False),
        sa.Column("individual_events", sa.JSON(), nullable=True),
        sa.Column("sector_events", sa.JSON(), nullable=True),
        sa.Column("market_events", sa.JSON(), nullable=True),
        sa.Column("composite", sa.Float(), nullable=True, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_event_factors_id"), "event_factors", ["id"], unique=False)
    op.create_index(op.f("ix_event_factors_symbol"), "event_factors", ["symbol"], unique=False)
    op.create_index(
        op.f("ix_event_factors_trade_date"), "event_factors", ["trade_date"], unique=False
    )

    op.create_table(
        "stock_sector_mappings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_code", sa.String(length=20), nullable=False),
        sa.Column("stock_name", sa.String(length=100), nullable=True),
        sa.Column("sector", sa.String(length=100), nullable=False),
        sa.Column("sector_code", sa.String(length=10), nullable=True),
        sa.Column("industry_level1", sa.String(length=100), nullable=True),
        sa.Column("industry_level2", sa.String(length=100), nullable=True),
        sa.Column("source", sa.String(length=50), nullable=True, server_default="csrc"),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stock_code"),
    )
    op.create_index(
        op.f("ix_stock_sector_mappings_id"), "stock_sector_mappings", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_stock_sector_mappings_stock_code"),
        "stock_sector_mappings",
        ["stock_code"],
        unique=False,
    )

    # ───────────────────────────────────────────────
    #  2. New tables: Strategy Management
    # ───────────────────────────────────────────────

    op.create_table(
        "strategies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=50), nullable=True, server_default="technical"),
        sa.Column("strategy_code", sa.String(length=50), nullable=False),
        sa.Column("params_schema", sa.JSON(), nullable=True),
        sa.Column("is_builtin", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("is_active", sa.Integer(), nullable=True, server_default="1"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_strategies_id"), "strategies", ["id"], unique=False)
    op.create_index(op.f("ix_strategies_user_id"), "strategies", ["user_id"], unique=False)

    op.create_table(
        "strategy_versions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("strategy_id", sa.Integer(), nullable=True),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("params_schema", sa.JSON(), nullable=True),
        sa.Column("changelog", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_strategy_versions_id"), "strategy_versions", ["id"], unique=False)
    op.create_index(
        op.f("ix_strategy_versions_strategy_id"), "strategy_versions", ["strategy_id"], unique=False
    )

    # ───────────────────────────────────────────────
    #  3. New table: Factor Snapshots
    # ───────────────────────────────────────────────

    op.create_table(
        "factor_snapshots",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("symbol", sa.String(length=20), nullable=False),
        sa.Column("trade_date", sa.DateTime(), nullable=False),
        sa.Column("technical", sa.JSON(), nullable=True),
        sa.Column("events", sa.JSON(), nullable=True),
        sa.Column("price", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_factor_snapshots_id"), "factor_snapshots", ["id"], unique=False)
    op.create_index(
        op.f("ix_factor_snapshots_symbol"), "factor_snapshots", ["symbol"], unique=False
    )
    op.create_index(
        op.f("ix_factor_snapshots_trade_date"), "factor_snapshots", ["trade_date"], unique=False
    )

    # ───────────────────────────────────────────────
    #  4. Migrate strategy_backtests -> backtest_tasks
    # ───────────────────────────────────────────────

    op.create_table(
        "backtest_tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("strategy_id", sa.Integer(), nullable=True),
        sa.Column("strategy_version_id", sa.Integer(), nullable=True),
        sa.Column("strategy_name", sa.String(length=100), nullable=True),
        sa.Column("stock_code", sa.String(length=20), nullable=False),
        sa.Column("start_date", sa.DateTime(), nullable=False),
        sa.Column("end_date", sa.DateTime(), nullable=False),
        sa.Column("initial_cash", sa.Float(), nullable=True),
        sa.Column("params", sa.JSON(), nullable=True),
        sa.Column("final_value", sa.Float(), nullable=True),
        sa.Column("total_return", sa.Float(), nullable=True),
        sa.Column("annualized_return", sa.Float(), nullable=True),
        sa.Column("max_drawdown", sa.Float(), nullable=True),
        sa.Column("sharpe_ratio", sa.Float(), nullable=True),
        sa.Column("win_rate", sa.Float(), nullable=True),
        sa.Column("trade_count", sa.Integer(), nullable=True),
        sa.Column("trades", sa.JSON(), nullable=True),
        sa.Column("equity_curve", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=True, server_default="completed"),
        sa.Column("progress", sa.Float(), nullable=True, server_default="100"),
        sa.Column("factor_snapshot_ids", sa.JSON(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_backtest_tasks_id"), "backtest_tasks", ["id"], unique=False)

    # Migrate data from strategy_backtests
    op.execute(
        """
        INSERT INTO backtest_tasks (
            id, user_id, strategy_name, stock_code, start_date, end_date,
            initial_cash, final_value, total_return, annualized_return,
            max_drawdown, sharpe_ratio, win_rate, trade_count,
            trades, equity_curve, created_at
        )
        SELECT
            id, user_id, strategy_name, stock_code, start_date, end_date,
            initial_cash, final_value, total_return, annualized_return,
            max_drawdown, sharpe_ratio, win_rate, trade_count,
            trades, equity_curve, created_at
        FROM strategy_backtests
        """
    )

    # Drop old table
    op.drop_index(op.f("ix_strategy_backtests_id"), table_name="strategy_backtests")
    op.drop_table("strategy_backtests")

    # ───────────────────────────────────────────────
    #  5. New table: Strategy Positions (virtual portfolio)
    # ───────────────────────────────────────────────

    op.create_table(
        "strategy_positions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("backtest_task_id", sa.Integer(), nullable=True),
        sa.Column("strategy_id", sa.Integer(), nullable=True),
        sa.Column("stock_code", sa.String(length=20), nullable=True),
        sa.Column("stock_name", sa.String(length=100), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=True),
        sa.Column("avg_cost", sa.Float(), nullable=True),
        sa.Column("unrealized_pnl", sa.Float(), nullable=True, server_default="0"),
        sa.Column("is_active", sa.Integer(), nullable=True, server_default="1"),
        sa.Column("buy_date", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_strategy_positions_id"), "strategy_positions", ["id"], unique=False)
    op.create_index(
        op.f("ix_strategy_positions_stock_code"), "strategy_positions", ["stock_code"], unique=False
    )
    op.create_index(
        op.f("ix_strategy_positions_backtest_task_id"),
        "strategy_positions",
        ["backtest_task_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Drop new tables in reverse order
    op.drop_index(op.f("ix_strategy_positions_backtest_task_id"), table_name="strategy_positions")
    op.drop_index(op.f("ix_strategy_positions_stock_code"), table_name="strategy_positions")
    op.drop_index(op.f("ix_strategy_positions_id"), table_name="strategy_positions")
    op.drop_table("strategy_positions")

    # Recreate strategy_backtests
    op.create_table(
        "strategy_backtests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
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

    op.drop_index(op.f("ix_backtest_tasks_id"), table_name="backtest_tasks")
    op.drop_table("backtest_tasks")

    op.drop_index(op.f("ix_factor_snapshots_trade_date"), table_name="factor_snapshots")
    op.drop_index(op.f("ix_factor_snapshots_symbol"), table_name="factor_snapshots")
    op.drop_index(op.f("ix_factor_snapshots_id"), table_name="factor_snapshots")
    op.drop_table("factor_snapshots")

    op.drop_index(op.f("ix_strategy_versions_strategy_id"), table_name="strategy_versions")
    op.drop_index(op.f("ix_strategy_versions_id"), table_name="strategy_versions")
    op.drop_table("strategy_versions")

    op.drop_index(op.f("ix_strategies_user_id"), table_name="strategies")
    op.drop_index(op.f("ix_strategies_id"), table_name="strategies")
    op.drop_table("strategies")

    op.drop_index(op.f("ix_stock_sector_mappings_stock_code"), table_name="stock_sector_mappings")
    op.drop_index(op.f("ix_stock_sector_mappings_id"), table_name="stock_sector_mappings")
    op.drop_table("stock_sector_mappings")

    op.drop_index(op.f("ix_event_factors_trade_date"), table_name="event_factors")
    op.drop_index(op.f("ix_event_factors_symbol"), table_name="event_factors")
    op.drop_index(op.f("ix_event_factors_id"), table_name="event_factors")
    op.drop_table("event_factors")

    op.drop_index(op.f("ix_events_symbol"), table_name="events")
    op.drop_index(op.f("ix_events_source_id"), table_name="events")
    op.drop_index(op.f("ix_events_id"), table_name="events")
    op.drop_table("events")

    op.drop_index(op.f("ix_event_rules_id"), table_name="event_rules")
    op.drop_table("event_rules")

    op.drop_index(op.f("ix_event_jobs_source_id"), table_name="event_jobs")
    op.drop_index(op.f("ix_event_jobs_id"), table_name="event_jobs")
    op.drop_table("event_jobs")

    op.drop_index(op.f("ix_event_sources_id"), table_name="event_sources")
    op.drop_table("event_sources")
