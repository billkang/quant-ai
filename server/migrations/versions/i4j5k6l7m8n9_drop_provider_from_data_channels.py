"""drop provider column from data_channels

Revision ID: i4j5k6l7m8n9
Revises: h3i4j5k6l7m8
Create Date: 2026-04-24 21:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "i4j5k6l7m8n9"
down_revision: str | Sequence[str] | None = "h3i4j5k6l7m8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_index(op.f("ix_data_channels_provider"), table_name="data_channels")
    op.drop_column("data_channels", "provider")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column("data_channels", sa.Column("provider", sa.String(length=50), nullable=True))
    op.create_index(op.f("ix_data_channels_provider"), "data_channels", ["provider"], unique=False)
