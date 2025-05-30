"""add document table

Revision ID: 3066bddc2656
Revises: 5280a559db93
Create Date: 2025-03-23 19:55:34.992641

"""

from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3066bddc2656"
down_revision: Union[str, None] = "5280a559db93"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "document",
        sa.Column(
            "filename", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False
        ),
        sa.Column(
            "original_filename",
            sqlmodel.sql.sqltypes.AutoString(length=255),
            nullable=False,
        ),
        sa.Column(
            "content_type", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False
        ),
        sa.Column("content_length", sa.Integer(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("owner_id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("document")
    # ### end Alembic commands ###
