"""Remake photos

Revision ID: a40e8f8fe211
Revises: 87b510616075
Create Date: 2025-03-21 14:25:42.303804

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a40e8f8fe211'
down_revision: Union[str, None] = '87b510616075'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('photos',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('diary_entry_id', sa.Integer(), nullable=True),
    sa.Column('file_url', sa.String(), nullable=False),
    sa.ForeignKeyConstraint(['diary_entry_id'], ['diary_entries.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_photos_id'), 'photos', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_photos_id'), table_name='photos')
    op.drop_table('photos')
    # ### end Alembic commands ###
