"""add queue extraction status

Revision ID: c0644c46e6e5
Revises: 87f793799088
Create Date: 2025-05-22 20:36:38.546032

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c0644c46e6e5"
down_revision: Union[str, None] = "87f793799088"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE extractionstatus ADD VALUE IF NOT EXISTS 'IN_QUEUE'")


def downgrade() -> None:
    """Downgrade schema."""
    # Rename the existing enum type
    op.execute("ALTER TYPE extractionstatus RENAME TO extractionstatus_old")

    # Create the new enum type without 'IN_QUEUE'
    sa.Enum(
        "PENDING", "IN_PROGRESS", "COMPLETED", "FAILED", name="extractionstatus"
    ).create(op.get_bind(), checkfirst=False)

    # Alter the column to use the new enum type
    op.execute("""
        ALTER TABLE document
        ALTER COLUMN extraction_status
        TYPE extractionstatus
        USING extraction_status::text::extractionstatus
    """)

    # Drop the old enum type
    op.execute("DROP TYPE extractionstatus_old")
