"""add channel_id to event_jobs

Revision ID: h3i4j5k6l7m8
Revises: g2h3i4j5k6l7
Create Date: 2026-04-24 20:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "h3i4j5k6l7m8"
down_revision: str | Sequence[str] | None = "g2h3i4j5k6l7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("event_jobs", sa.Column("channel_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_event_jobs_channel_id"), "event_jobs", ["channel_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_event_jobs_channel_id"), table_name="event_jobs")
    op.drop_column("event_jobs", "channel_id")
