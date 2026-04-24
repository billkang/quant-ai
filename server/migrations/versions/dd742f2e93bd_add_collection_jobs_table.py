"""add collection_jobs table

Revision ID: dd742f2e93bd
Revises: 83b62059c768
Create Date: 2026-04-24 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "dd742f2e93bd"
down_revision: str | Sequence[str] | None = "83b62059c768"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "collection_jobs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("job_type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("progress", sa.Float(), nullable=True),
        sa.Column("total_items", sa.Integer(), nullable=True),
        sa.Column("processed_items", sa.Integer(), nullable=True),
        sa.Column("start_time", sa.DateTime(), nullable=True),
        sa.Column("end_time", sa.DateTime(), nullable=True),
        sa.Column("error_log", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_collection_jobs_id"), "collection_jobs", ["id"], unique=False)
    op.create_index(
        op.f("ix_collection_jobs_job_type"), "collection_jobs", ["job_type"], unique=False
    )
    op.create_index(op.f("ix_collection_jobs_status"), "collection_jobs", ["status"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_collection_jobs_status"), table_name="collection_jobs")
    op.drop_index(op.f("ix_collection_jobs_job_type"), table_name="collection_jobs")
    op.drop_index(op.f("ix_collection_jobs_id"), table_name="collection_jobs")
    op.drop_table("collection_jobs")
