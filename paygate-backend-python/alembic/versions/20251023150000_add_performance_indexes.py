"""Add performance indexes

Revision ID: 20251023150000
Revises: 20251023110000
Create Date: 2025-10-23 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251023150000'
down_revision = '20251023110000'
branch_labels = None
depends_on = None

def upgrade():
    # Add indexes for payments table
    op.create_index('idx_payments_owner_status', 'payments', ['owner_id', 'status'], unique=False)
    op.create_index('idx_payments_created_at', 'payments', ['created_at'], unique=False)
    
    # Add indexes for paywalls table
    op.create_index('idx_paywalls_owner', 'paywalls', ['owner_id'], unique=False)
    
    # Add indexes for customers table
    op.create_index('idx_customers_owner', 'customers', ['owner_id'], unique=False)
    
    # Add indexes for content table
    op.create_index('idx_content_owner', 'content', ['owner_id'], unique=False)
    op.create_index('idx_content_created_at', 'content', ['created_at'], unique=False)
    
    # Add indexes for any other frequently queried columns
    op.create_index('idx_payments_status', 'payments', ['status'], unique=False)
    op.create_index('idx_payments_owner_created', 'payments', ['owner_id', 'created_at'], unique=False)


def downgrade():
    # Drop all indexes in reverse order
    op.drop_index('idx_payments_owner_created', table_name='payments')
    op.drop_index('idx_payments_status', table_name='payments')
    op.drop_index('idx_content_created_at', table_name='content')
    op.drop_index('idx_content_owner', table_name='content')
    op.drop_index('idx_customers_owner', table_name='customers')
    op.drop_index('idx_paywalls_owner', table_name='paywalls')
    op.drop_index('idx_payments_created_at', table_name='payments')
    op.drop_index('idx_payments_owner_status', table_name='payments')
