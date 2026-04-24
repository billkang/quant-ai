"""add source_channel_links table

Revision ID: j5k6l7m8n9o0
Revises: i4j5k6l7m8n9
Create Date: 2026-04-24 22:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "j5k6l7m8n9o0"
down_revision: str | Sequence[str] | None = "i4j5k6l7m8n9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "source_channel_links",
        sa.Column("source_id", sa.Integer(), nullable=False),
        sa.Column("channel_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["source_id"], ["event_sources.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["channel_id"], ["data_channels.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("source_id", "channel_id"),
    )
    op.create_index(
        op.f("ix_source_channel_links_source_id"),
        "source_channel_links",
        ["source_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_source_channel_links_channel_id"),
        "source_channel_links",
        ["channel_id"],
        unique=False,
    )

    # Migrate existing data_source_id relationships into the link table
    op.execute(
        """
        INSERT INTO source_channel_links (source_id, channel_id)
        SELECT data_source_id, id FROM data_channels WHERE data_source_id IS NOT NULL
        ON CONFLICT DO NOTHING
        """
    )

    # Make data_source_id nullable on data_channels
    op.alter_column("data_channels", "data_source_id", existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column("data_channels", "data_source_id", existing_type=sa.Integer(), nullable=False)
    op.drop_index(op.f("ix_source_channel_links_channel_id"), table_name="source_channel_links")
    op.drop_index(op.f("ix_source_channel_links_source_id"), table_name="source_channel_links")
    op.drop_table("source_channel_links")
