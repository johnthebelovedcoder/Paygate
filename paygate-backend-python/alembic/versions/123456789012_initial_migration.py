"""Initial migration

Revision ID: 123456789012
Revises: 
Create Date: 2023-10-16 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by alembic.
revision = '123456789012'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('mfa_enabled', sa.Boolean(), nullable=True),
        sa.Column('mfa_secret', sa.String(), nullable=True),
        sa.Column('role', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('currency', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.Column('username', sa.String(), nullable=True),
        sa.Column('avatar', sa.String(), nullable=True),
        sa.Column('user_type', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_is_active'), 'users', ['is_active'], unique=False)
    op.create_index(op.f('ix_users_is_verified'), 'users', ['is_verified'], unique=False)
    op.create_index(op.f('ix_users_last_login'), 'users', ['last_login'], unique=False)
    op.create_index(op.f('ix_users_mfa_enabled'), 'users', ['mfa_enabled'], unique=False)
    op.create_index(op.f('ix_users_name'), 'users', ['name'], unique=False)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)
    op.create_index(op.f('ix_users_updated_at'), 'users', ['updated_at'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=False)
    op.create_index(op.f('ix_users_user_type'), 'users', ['user_type'], unique=False)
    op.create_index(op.f('ix_users_created_at'), 'users', ['created_at'], unique=False)
    op.create_index(op.f('ix_users_country'), 'users', ['country'], unique=False)
    op.create_index(op.f('ix_users_currency'), 'users', ['currency'], unique=False)

    # Create content table
    op.create_table(
        'content',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('type', sa.String(), nullable=True),
        sa.Column('url', sa.String(), nullable=True),
        sa.Column('file_path', sa.String(), nullable=True),
        sa.Column('is_protected', sa.Boolean(), nullable=True),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('currency', sa.String(), nullable=True),
        sa.Column('paywall_title', sa.String(), nullable=True),
        sa.Column('paywall_description', sa.Text(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_content_id'), 'content', ['id'], unique=False)
    op.create_index(op.f('ix_content_is_protected'), 'content', ['is_protected'], unique=False)
    op.create_index(op.f('ix_content_owner_id'), 'content', ['owner_id'], unique=False)
    op.create_index(op.f('ix_content_price'), 'content', ['price'], unique=False)
    op.create_index(op.f('ix_content_title'), 'content', ['title'], unique=False)
    op.create_index(op.f('ix_content_type'), 'content', ['type'], unique=False)
    op.create_index(op.f('ix_content_url'), 'content', ['url'], unique=False)
    op.create_index(op.f('ix_content_currency'), 'content', ['currency'], unique=False)
    op.create_index(op.f('ix_content_description'), 'content', ['description'], unique=False)
    op.create_index(op.f('ix_content_file_path'), 'content', ['file_path'], unique=False)

    # Create paywalls table
    op.create_table(
        'paywalls',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('content_ids', sa.String(), nullable=True),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('currency', sa.String(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('success_redirect_url', sa.String(), nullable=True),
        sa.Column('cancel_redirect_url', sa.String(), nullable=True),
        sa.Column('webhook_url', sa.String(), nullable=True),
        sa.Column('views', sa.Integer(), nullable=True),
        sa.Column('conversions', sa.Integer(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_paywalls_conversions'), 'paywalls', ['conversions'], unique=False)
    op.create_index(op.f('ix_paywalls_currency'), 'paywalls', ['currency'], unique=False)
    op.create_index(op.f('ix_paywalls_duration'), 'paywalls', ['duration'], unique=False)
    op.create_index(op.f('ix_paywalls_id'), 'paywalls', ['id'], unique=False)
    op.create_index(op.f('ix_paywalls_owner_id'), 'paywalls', ['owner_id'], unique=False)
    op.create_index(op.f('ix_paywalls_price'), 'paywalls', ['price'], unique=False)
    op.create_index(op.f('ix_paywalls_status'), 'paywalls', ['status'], unique=False)
    op.create_index(op.f('ix_paywalls_title'), 'paywalls', ['title'], unique=False)
    op.create_index(op.f('ix_paywalls_views'), 'paywalls', ['views'], unique=False)
    op.create_index(op.f('ix_paywalls_created_at'), 'paywalls', ['created_at'], unique=False)
    op.create_index(op.f('ix_paywalls_description'), 'paywalls', ['description'], unique=False)

    # Create payments table
    op.create_table(
        'payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=True),
        sa.Column('currency', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('paywall_id', sa.Integer(), nullable=True),
        sa.Column('customer_email', sa.String(), nullable=True),
        sa.Column('customer_name', sa.String(), nullable=True),
        sa.Column('reference', sa.String(), nullable=True),
        sa.Column('payment_method', sa.String(), nullable=True),
        sa.Column('channel', sa.String(), nullable=True),
        sa.Column('gateway_response', sa.JSON(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['paywall_id'], ['paywalls.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('reference')
    )
    op.create_index(op.f('ix_payments_amount'), 'payments', ['amount'], unique=False)
    op.create_index(op.f('ix_payments_channel'), 'payments', ['channel'], unique=False)
    op.create_index(op.f('ix_payments_created_at'), 'payments', ['created_at'], unique=False)
    op.create_index(op.f('ix_payments_currency'), 'payments', ['currency'], unique=False)
    op.create_index(op.f('ix_payments_customer_email'), 'payments', ['customer_email'], unique=False)
    op.create_index(op.f('ix_payments_customer_name'), 'payments', ['customer_name'], unique=False)
    op.create_index(op.f('ix_payments_id'), 'payments', ['id'], unique=False)
    op.create_index(op.f('ix_payments_owner_id'), 'payments', ['owner_id'], unique=False)
    op.create_index(op.f('ix_payments_paywall_id'), 'payments', ['paywall_id'], unique=False)
    op.create_index(op.f('ix_payments_payment_method'), 'payments', ['payment_method'], unique=False)
    op.create_index(op.f('ix_payments_reference'), 'payments', ['reference'], unique=False)
    op.create_index(op.f('ix_payments_status'), 'payments', ['status'], unique=False)

    # Create customers table
    op.create_table(
        'customers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('total_spent', sa.Float(), nullable=True),
        sa.Column('total_purchases', sa.Integer(), nullable=True),
        sa.Column('last_purchase', sa.DateTime(), nullable=True),
        sa.Column('join_date', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_customers_email'), 'customers', ['email'], unique=True)
    op.create_index(op.f('ix_customers_id'), 'customers', ['id'], unique=False)
    op.create_index(op.f('ix_customers_join_date'), 'customers', ['join_date'], unique=False)
    op.create_index(op.f('ix_customers_last_purchase'), 'customers', ['last_purchase'], unique=False)
    op.create_index(op.f('ix_customers_name'), 'customers', ['name'], unique=False)
    op.create_index(op.f('ix_customers_owner_id'), 'customers', ['owner_id'], unique=False)
    op.create_index(op.f('ix_customers_status'), 'customers', ['status'], unique=False)
    op.create_index(op.f('ix_customers_total_purchases'), 'customers', ['total_purchases'], unique=False)
    op.create_index(op.f('ix_customers_total_spent'), 'customers', ['total_spent'], unique=False)
    op.create_index(op.f('ix_customers_created_at'), 'customers', ['created_at'], unique=False)

    # Create content_access table
    op.create_table(
        'content_access',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('content_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('granted_by', sa.String(), nullable=True),
        sa.Column('granted_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['content_id'], ['content.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_content_access_content_id'), 'content_access', ['content_id'], unique=False)
    op.create_index(op.f('ix_content_access_expires_at'), 'content_access', ['expires_at'], unique=False)
    op.create_index(op.f('ix_content_access_granted_at'), 'content_access', ['granted_at'], unique=False)
    op.create_index(op.f('ix_content_access_granted_by'), 'content_access', ['granted_by'], unique=False)
    op.create_index(op.f('ix_content_access_id'), 'content_access', ['id'], unique=False)
    op.create_index(op.f('ix_content_access_is_active'), 'content_access', ['is_active'], unique=False)
    op.create_index(op.f('ix_content_access_user_id'), 'content_access', ['user_id'], unique=False)

    # Create token_blacklist table
    op.create_table(
        'token_blacklist',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(), nullable=False),
        sa.Column('blacklisted_on', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )
    op.create_index(op.f('ix_token_blacklist_blacklisted_on'), 'token_blacklist', ['blacklisted_on'], unique=False)
    op.create_index(op.f('ix_token_blacklist_expires_at'), 'token_blacklist', ['expires_at'], unique=False)
    op.create_index(op.f('ix_token_blacklist_id'), 'token_blacklist', ['id'], unique=False)
    op.create_index(op.f('ix_token_blacklist_token'), 'token_blacklist', ['token'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_token_blacklist_token'), table_name='token_blacklist')
    op.drop_index(op.f('ix_token_blacklist_id'), table_name='token_blacklist')
    op.drop_index(op.f('ix_token_blacklist_expires_at'), table_name='token_blacklist')
    op.drop_index(op.f('ix_token_blacklist_blacklisted_on'), table_name='token_blacklist')
    op.drop_table('token_blacklist')

    op.drop_index(op.f('ix_content_access_user_id'), table_name='content_access')
    op.drop_index(op.f('ix_content_access_is_active'), table_name='content_access')
    op.drop_index(op.f('ix_content_access_id'), table_name='content_access')
    op.drop_index(op.f('ix_content_access_granted_by'), table_name='content_access')
    op.drop_index(op.f('ix_content_access_granted_at'), table_name='content_access')
    op.drop_index(op.f('ix_content_access_expires_at'), table_name='content_access')
    op.drop_index(op.f('ix_content_access_content_id'), table_name='content_access')
    op.drop_table('content_access')

    op.drop_index(op.f('ix_customers_created_at'), table_name='customers')
    op.drop_index(op.f('ix_customers_total_spent'), table_name='customers')
    op.drop_index(op.f('ix_customers_total_purchases'), table_name='customers')
    op.drop_index(op.f('ix_customers_status'), table_name='customers')
    op.drop_index(op.f('ix_customers_owner_id'), table_name='customers')
    op.drop_index(op.f('ix_customers_name'), table_name='customers')
    op.drop_index(op.f('ix_customers_last_purchase'), table_name='customers')
    op.drop_index(op.f('ix_customers_join_date'), table_name='customers')
    op.drop_index(op.f('ix_customers_id'), table_name='customers')
    op.drop_index(op.f('ix_customers_email'), table_name='customers')
    op.drop_table('customers')

    op.drop_index(op.f('ix_payments_status'), table_name='payments')
    op.drop_index(op.f('ix_payments_reference'), table_name='payments')
    op.drop_index(op.f('ix_payments_payment_method'), table_name='payments')
    op.drop_index(op.f('ix_payments_paywall_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_owner_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_customer_name'), table_name='payments')
    op.drop_index(op.f('ix_payments_customer_email'), table_name='payments')
    op.drop_index(op.f('ix_payments_currency'), table_name='payments')
    op.drop_index(op.f('ix_payments_created_at'), table_name='payments')
    op.drop_index(op.f('ix_payments_channel'), table_name='payments')
    op.drop_index(op.f('ix_payments_amount'), table_name='payments')
    op.drop_table('payments')

    op.drop_index(op.f('ix_paywalls_description'), table_name='paywalls')
    op.drop_index(op.f('ix_paywalls_created_at'), table_name='paywalls')
    op.drop_index(op.f('ix_paywalls_views'), table_name='paywalls')
    op.drop_index(op.f('ix_paywalls_title'), table_name='paywalls')
    op.drop_index(op.f('ix_paywalls_status'), table_name='paywalls')
    op.drop_index(op.f('ix_paywalls_price'), table_name='paywalls')
    op.drop_index(op.f('ix_paywalls_owner_id'), table_name='paywalls')
    op.drop_index(op.f('ix_paywalls_id'), table_name='paywalls')
    op.drop_index(op.f('ix_paywalls_duration'), table_name='paywalls')
    op.drop_index(op.f('ix_paywalls_currency'), table_name='paywalls')
    op.drop_index(op.f('ix_paywalls_conversions'), table_name='paywalls')
    op.drop_table('paywalls')

    op.drop_index(op.f('ix_content_file_path'), table_name='content')
    op.drop_index(op.f('ix_content_currency'), table_name='content')
    op.drop_index(op.f('ix_content_description'), table_name='content')
    op.drop_index(op.f('ix_content_url'), table_name='content')
    op.drop_index(op.f('ix_content_type'), table_name='content')
    op.drop_index(op.f('ix_content_title'), table_name='content')
    op.drop_index(op.f('ix_content_price'), table_name='content')
    op.drop_index(op.f('ix_content_owner_id'), table_name='content')
    op.drop_index(op.f('ix_content_is_protected'), table_name='content')
    op.drop_index(op.f('ix_content_id'), table_name='content')
    op.drop_table('content')

    op.drop_index(op.f('ix_users_currency'), table_name='users')
    op.drop_index(op.f('ix_users_country'), table_name='users')
    op.drop_index(op.f('ix_users_created_at'), table_name='users')
    op.drop_index(op.f('ix_users_user_type'), table_name='users')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_updated_at'), table_name='users')
    op.drop_index(op.f('ix_users_role'), table_name='users')
    op.drop_index(op.f('ix_users_name'), table_name='users')
    op.drop_index(op.f('ix_users_mfa_enabled'), table_name='users')
    op.drop_index(op.f('ix_users_last_login'), table_name='users')
    op.drop_index(op.f('ix_users_is_verified'), table_name='users')
    op.drop_index(op.f('ix_users_is_active'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')