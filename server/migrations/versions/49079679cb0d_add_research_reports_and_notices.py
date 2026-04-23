"""add research reports and notices tables

Revision ID: 49079679cb0d
Revises: 7bd72a2c279c
Create Date: 2026-04-24 10:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "49079679cb0d"
down_revision: str | Sequence[str] | None = "7bd72a2c279c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "research_reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("symbol", sa.String(length=20), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("source", sa.String(length=100), nullable=True),
        sa.Column("author", sa.String(length=100), nullable=True),
        sa.Column("rating", sa.String(length=20), nullable=True),
        sa.Column("target_price", sa.Float(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("publish_date", sa.DateTime(), nullable=True),
        sa.Column("url", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_research_reports_id"), "research_reports", ["id"], unique=False)
    op.create_index(
        op.f("ix_research_reports_symbol"), "research_reports", ["symbol"], unique=False
    )

    op.create_table(
        "stock_notices",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("symbol", sa.String(length=20), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=True),
        sa.Column("source", sa.String(length=100), nullable=True),
        sa.Column("publish_date", sa.DateTime(), nullable=True),
        sa.Column("url", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_stock_notices_id"), "stock_notices", ["id"], unique=False)
    op.create_index(op.f("ix_stock_notices_symbol"), "stock_notices", ["symbol"], unique=False)
    op.create_index(op.f("ix_stock_notices_url"), "stock_notices", ["url"], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_stock_notices_url"), table_name="stock_notices")
    op.drop_index(op.f("ix_stock_notices_symbol"), table_name="stock_notices")
    op.drop_index(op.f("ix_stock_notices_id"), table_name="stock_notices")
    op.drop_table("stock_notices")
    op.drop_index(op.f("ix_research_reports_symbol"), table_name="research_reports")
    op.drop_index(op.f("ix_research_reports_id"), table_name="research_reports")
    op.drop_table("research_reports")
