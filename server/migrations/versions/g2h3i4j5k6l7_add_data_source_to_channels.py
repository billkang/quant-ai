"""add data_source_id and collection_method to data_channels

Revision ID: g2h3i4j5k6l7
Revises: f1a2b3c4d5e6
Create Date: 2026-04-24 17:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "g2h3i4j5k6l7"
down_revision: str | Sequence[str] | None = "f1a2b3c4d5e6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new columns to data_channels
    op.add_column("data_channels", sa.Column("data_source_id", sa.Integer(), nullable=True))
    op.add_column(
        "data_channels", sa.Column("collection_method", sa.String(length=50), nullable=True)
    )
    op.add_column("data_channels", sa.Column("config", sa.JSON(), nullable=True))
    op.add_column(
        "data_channels", sa.Column("enabled", sa.Integer(), nullable=True, server_default="1")
    )

    # Create foreign key
    op.create_foreign_key(
        "fk_data_channels_event_sources",
        "data_channels",
        "event_sources",
        ["data_source_id"],
        ["id"],
    )
    op.create_index(
        op.f("ix_data_channels_data_source_id"), "data_channels", ["data_source_id"], unique=False
    )

    # Drop old is_active column (migrate data first if needed)
    op.drop_column("data_channels", "is_active")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column(
        "data_channels", sa.Column("is_active", sa.Integer(), nullable=True, server_default="1")
    )
    op.drop_index(op.f("ix_data_channels_data_source_id"), table_name="data_channels")
    op.drop_constraint("fk_data_channels_event_sources", "data_channels", type_="foreignkey")
    op.drop_column("data_channels", "enabled")
    op.drop_column("data_channels", "config")
    op.drop_column("data_channels", "collection_method")
    op.drop_column("data_channels", "data_source_id")
