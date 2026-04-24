"""add is_builtin to event_sources and create data_channels and sectors tables

Revision ID: a1b2c3d4e5f6
Revises: dd742f2e93bd
Create Date: 2026-04-24 14:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: str | Sequence[str] | None = "dd742f2e93bd"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add is_builtin to event_sources
    op.add_column("event_sources", sa.Column("is_builtin", sa.Integer(), nullable=True))

    # Create data_channels table
    op.create_table(
        "data_channels",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("endpoint", sa.String(length=500), nullable=True),
        sa.Column("headers", sa.JSON(), nullable=True),
        sa.Column("timeout", sa.Integer(), nullable=True),
        sa.Column("proxy_url", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_data_channels_id"), "data_channels", ["id"], unique=False)
    op.create_index(op.f("ix_data_channels_provider"), "data_channels", ["provider"], unique=False)

    # Create sectors table
    op.create_table(
        "sectors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=20), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("level", sa.Integer(), nullable=True),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("is_enabled", sa.Integer(), nullable=True),
        sa.Column("source", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["parent_id"], ["sectors.id"]),
    )
    op.create_index(op.f("ix_sectors_id"), "sectors", ["id"], unique=False)
    op.create_index(op.f("ix_sectors_code"), "sectors", ["code"], unique=True)
    op.create_index(op.f("ix_sectors_parent_id"), "sectors", ["parent_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_sectors_parent_id"), table_name="sectors")
    op.drop_index(op.f("ix_sectors_code"), table_name="sectors")
    op.drop_index(op.f("ix_sectors_id"), table_name="sectors")
    op.drop_table("sectors")
    op.drop_index(op.f("ix_data_channels_provider"), table_name="data_channels")
    op.drop_index(op.f("ix_data_channels_id"), table_name="data_channels")
    op.drop_table("data_channels")
    op.drop_column("event_sources", "is_builtin")
