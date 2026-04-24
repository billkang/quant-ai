"""add system_logs table

Revision ID: ef1a2b3c4d5e
Revises: dd742f2e93bd
Create Date: 2026-04-24 15:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "ef1a2b3c4d5e"
down_revision: str | Sequence[str] | None = "a1b2c3d4e5f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "system_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("level", sa.String(length=20), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("details", sa.JSON(), nullable=True),
        sa.Column("source", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_system_logs_id"), "system_logs", ["id"], unique=False)
    op.create_index(op.f("ix_system_logs_level"), "system_logs", ["level"], unique=False)
    op.create_index(op.f("ix_system_logs_category"), "system_logs", ["category"], unique=False)
    op.create_index(op.f("ix_system_logs_source"), "system_logs", ["source"], unique=False)
    op.create_index(op.f("ix_system_logs_created_at"), "system_logs", ["created_at"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_system_logs_created_at"), table_name="system_logs")
    op.drop_index(op.f("ix_system_logs_source"), table_name="system_logs")
    op.drop_index(op.f("ix_system_logs_category"), table_name="system_logs")
    op.drop_index(op.f("ix_system_logs_level"), table_name="system_logs")
    op.drop_index(op.f("ix_system_logs_id"), table_name="system_logs")
    op.drop_table("system_logs")
