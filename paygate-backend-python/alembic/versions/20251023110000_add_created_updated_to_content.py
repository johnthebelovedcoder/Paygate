"""Add created_at and updated_at to Content model

Revision ID: 20251023110000
Revises: 123456789012
Create Date: 2025-10-23 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision = '20251023110000'
down_revision = '123456789012'
branch_labels = None
depends_on = None

def upgrade():
    # Add created_at column with default current timestamp
    op.add_column('content', sa.Column('created_at', sa.DateTime(timezone=True), server_default=func.now(), nullable=True))
    
    # Add updated_at column with default current timestamp and onupdate
    op.add_column('content', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True))
    
    # If there are existing rows, set their timestamps to the current time
    op.execute('UPDATE content SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP')
    
    # Make the columns non-nullable after setting default values
    with op.batch_alter_table('content') as batch_op:
        batch_op.alter_column('created_at', existing_type=sa.DateTime(timezone=True), nullable=False)
        batch_op.alter_column('updated_at', existing_type=sa.DateTime(timezone=True), nullable=False)

def downgrade():
    # Drop the columns in reverse order
    with op.batch_alter_table('content') as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('created_at')
