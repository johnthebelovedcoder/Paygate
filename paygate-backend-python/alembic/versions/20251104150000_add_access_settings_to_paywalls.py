"""Add access settings fields to paywalls table

Revision ID: 20251104150000
Revises: 123456789012
Create Date: 2025-11-04 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by alembic.
revision = '20251104150000'
down_revision = '123456789012'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add download_limit column to paywalls table
    with op.batch_alter_table('paywalls') as batch_op:
        batch_op.add_column(sa.Column('download_limit', sa.Integer(), nullable=True, server_default='0'))
        batch_op.add_column(sa.Column('expiration_days', sa.Integer(), nullable=True, server_default='0'))
        batch_op.add_column(sa.Column('customer_restrictions', sa.Text(), nullable=True, server_default='[]'))
    
    # Update existing paywalls to have default values
    op.execute("UPDATE paywalls SET download_limit = 0 WHERE download_limit IS NULL")
    op.execute("UPDATE paywalls SET expiration_days = 0 WHERE expiration_days IS NULL")
    op.execute("UPDATE paywalls SET customer_restrictions = '[]' WHERE customer_restrictions IS NULL")


def downgrade() -> None:
    # Remove the access settings columns from paywalls table
    with op.batch_alter_table('paywalls') as batch_op:
        batch_op.drop_column('download_limit')
        batch_op.drop_column('expiration_days')
        batch_op.drop_column('customer_restrictions')