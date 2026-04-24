"""add category to event_sources

Revision ID: f1a2b3c4d5e6
Revises: ef1a2b3c4d5e
Create Date: 2026-04-24 16:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f1a2b3c4d5e6"
down_revision: str | Sequence[str] | None = "ef1a2b3c4d5e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("event_sources", sa.Column("category", sa.String(length=20), nullable=True))
    op.create_index(op.f("ix_event_sources_category"), "event_sources", ["category"], unique=False)
    op.add_column(
        "event_jobs",
        sa.Column("trigger_type", sa.String(length=20), nullable=True, server_default="auto"),
    )
    op.create_index(
        op.f("ix_event_jobs_trigger_type"), "event_jobs", ["trigger_type"], unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_event_jobs_trigger_type"), table_name="event_jobs")
    op.drop_column("event_jobs", "trigger_type")
    op.drop_index(op.f("ix_event_sources_category"), table_name="event_sources")
    op.drop_column("event_sources", "category")
