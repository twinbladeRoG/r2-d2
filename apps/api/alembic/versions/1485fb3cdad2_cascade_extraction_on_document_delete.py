"""cascade extraction on document delete

Revision ID: 1485fb3cdad2
Revises: 985b26a331ab
Create Date: 2025-04-06 18:50:56.431469

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "1485fb3cdad2"
down_revision: Union[str, None] = "985b26a331ab"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(
        "extractedsection_document_id_fkey", "extractedsection", type_="foreignkey"
    )
    op.create_foreign_key(
        None,
        "extractedsection",
        "document",
        ["document_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.drop_constraint(
        "extractionusagelog_document_id_fkey", "extractionusagelog", type_="foreignkey"
    )
    op.create_foreign_key(
        None,
        "extractionusagelog",
        "document",
        ["document_id"],
        ["id"],
        ondelete="CASCADE",
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "extractionusagelog", type_="foreignkey")
    op.create_foreign_key(
        "extractionusagelog_document_id_fkey",
        "extractionusagelog",
        "document",
        ["document_id"],
        ["id"],
    )
    op.drop_constraint(None, "extractedsection", type_="foreignkey")
    op.create_foreign_key(
        "extractedsection_document_id_fkey",
        "extractedsection",
        "document",
        ["document_id"],
        ["id"],
    )
    # ### end Alembic commands ###
