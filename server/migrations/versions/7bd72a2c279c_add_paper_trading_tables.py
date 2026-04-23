"""add paper trading tables

Revision ID: 7bd72a2c279c
Revises: 4a3f2e1b8c9d
Create Date: 2026-04-24 10:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7bd72a2c279c"
down_revision: str | Sequence[str] | None = "4a3f2e1b8c9d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "paper_accounts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("initial_cash", sa.Float(), nullable=True),
        sa.Column("available_cash", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_paper_accounts_id"), "paper_accounts", ["id"], unique=False)
    op.create_index(op.f("ix_paper_accounts_user_id"), "paper_accounts", ["user_id"], unique=False)

    op.create_table(
        "paper_positions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("stock_code", sa.String(length=20), nullable=True),
        sa.Column("stock_name", sa.String(length=100), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=True),
        sa.Column("cost_price", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_paper_positions_id"), "paper_positions", ["id"], unique=False)
    op.create_index(
        op.f("ix_paper_positions_user_id"), "paper_positions", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_paper_positions_stock_code"), "paper_positions", ["stock_code"], unique=False
    )

    op.create_table(
        "paper_orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("stock_code", sa.String(length=20), nullable=True),
        sa.Column("stock_name", sa.String(length=100), nullable=True),
        sa.Column("side", sa.String(length=10), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=True),
        sa.Column("price", sa.Float(), nullable=True),
        sa.Column("amount", sa.Float(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_paper_orders_id"), "paper_orders", ["id"], unique=False)
    op.create_index(op.f("ix_paper_orders_user_id"), "paper_orders", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_paper_orders_user_id"), table_name="paper_orders")
    op.drop_index(op.f("ix_paper_orders_id"), table_name="paper_orders")
    op.drop_table("paper_orders")
    op.drop_index(op.f("ix_paper_positions_stock_code"), table_name="paper_positions")
    op.drop_index(op.f("ix_paper_positions_user_id"), table_name="paper_positions")
    op.drop_index(op.f("ix_paper_positions_id"), table_name="paper_positions")
    op.drop_table("paper_positions")
    op.drop_index(op.f("ix_paper_accounts_user_id"), table_name="paper_accounts")
    op.drop_index(op.f("ix_paper_accounts_id"), table_name="paper_accounts")
    op.drop_table("paper_accounts")
