#!/usr/bin/env python3
"""
Data migration script from SQLite to PostgreSQL
This script migrates all data from the SQLite database to PostgreSQL
"""

import asyncio
import sqlite3
import sys
import os
from pathlib import Path
from datetime import datetime

# Add the backend directory to the path so imports work
backend_path = Path(__file__).parent / "paygate-backend-python"
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from config.settings import settings
from models import Base
from models.user import User
from models.content import Content
from models.paywall import Paywall
from models.payment import Payment
from models.customer import Customer
from models.token_blacklist import TokenBlacklist
from models.access import ContentAccess
from models.billing import SubscriptionPlan, Subscription, Invoice, Coupon, BillingInfo, PaymentMethod
from models.notification import Notification, NotificationPreference
from models.support import SupportCategory, SupportTicket, SupportTicketResponse
from models.marketing import DiscountCode, Affiliate, AffiliateReferral, MarketingCampaign, EmailList, EmailSubscriber

def get_sqlite_connection():
    """Get a connection to the SQLite database"""
    db_path = backend_path / "paygate.db"
    if not db_path.exists():
        raise FileNotFoundError(f"SQLite database not found at {db_path}")
    
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row  # This allows us to access columns by name
    return conn

def get_postgres_sync_engine():
    """Get a synchronous PostgreSQL engine for the migration"""
    # Replace async driver with sync driver for migration purposes
    sync_db_url = settings.DATABASE_URL.replace("+aiosqlite", "").replace("postgresql", "postgresql")
    return create_engine(sync_db_url)

async def migrate_users(sqlite_conn, postgres_session):
    """Migrate users table"""
    print("Migrating users...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    
    for row in rows:
        # Create a user object based on the SQLite row
        user = User(
            id=row['id'],
            name=row['name'],
            email=row['email'],
            hashed_password=row['hashed_password'],
            is_active=row['is_active'],
            is_verified=row['is_verified'],
            mfa_enabled=row['mfa_enabled'] if row['mfa_enabled'] is not None else False,
            mfa_secret=row['mfa_secret'],
            role=row['role'],
            country=row['country'],
            currency=row['currency'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None,
            last_login=datetime.fromisoformat(row['last_login']) if row['last_login'] else None,
            username=row['username'],
            avatar=row['avatar'],
            user_type=row['user_type']
        )
        postgres_session.add(user)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} users")

async def migrate_content(sqlite_conn, postgres_session):
    """Migrate content table"""
    print("Migrating content...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM content")
    rows = cursor.fetchall()
    
    for row in rows:
        content = Content(
            id=row['id'],
            title=row['title'],
            description=row['description'],
            content_type=row['content_type'],
            file_path=row['file_path'],
            file_size=row['file_size'],
            download_count=row['download_count'],
            price=row['price'],
            currency=row['currency'],
            is_active=row['is_active'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None,
            owner_id=row['owner_id']
        )
        postgres_session.add(content)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} content items")

async def migrate_paywalls(sqlite_conn, postgres_session):
    """Migrate paywalls table"""
    print("Migrating paywalls...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM paywalls")
    rows = cursor.fetchall()
    
    for row in rows:
        paywall = Paywall(
            id=row['id'],
            title=row['title'],
            description=row['description'],
            price=row['price'],
            currency=row['currency'],
            duration=row['duration'],
            max_downloads=row['max_downloads'],
            is_active=row['is_active'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None,
            views=row['views'],
            conversions=row['conversions'],
            owner_id=row['owner_id'],
            download_limit=row['download_limit'],
            expiration_days=row['expiration_days']
        )
        postgres_session.add(paywall)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} paywalls")

async def migrate_payments(sqlite_conn, postgres_session):
    """Migrate payments table"""
    print("Migrating payments...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM payments")
    rows = cursor.fetchall()
    
    for row in rows:
        payment = Payment(
            id=row['id'],
            user_id=row['user_id'],
            amount=row['amount'],
            currency=row['currency'],
            status=row['status'],
            payment_method=row['payment_method'],
            transaction_id=row['transaction_id'],
            payment_gateway=row['payment_gateway'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None,
            paywall_id=row['paywall_id'],
            owner_id=row['owner_id']
        )
        postgres_session.add(payment)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} payments")

async def migrate_customers(sqlite_conn, postgres_session):
    """Migrate customers table"""
    print("Migrating customers...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM customers")
    rows = cursor.fetchall()
    
    for row in rows:
        customer = Customer(
            id=row['id'],
            name=row['name'],
            email=row['email'],
            phone=row['phone'],
            total_purchases=row['total_purchases'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None,
            owner_id=row['owner_id']
        )
        postgres_session.add(customer)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} customers")

async def migrate_token_blacklist(sqlite_conn, postgres_session):
    """Migrate token_blacklist table"""
    print("Migrating token blacklist...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM token_blacklist")
    rows = cursor.fetchall()
    
    for row in rows:
        token = TokenBlacklist(
            id=row['id'],
            token=row['token'],
            blacklisted_on=datetime.fromisoformat(row['blacklisted_on']) if row['blacklisted_on'] else None,
            expires_at=datetime.fromisoformat(row['expires_at']) if row['expires_at'] else None
        )
        postgres_session.add(token)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} blacklisted tokens")

async def migrate_content_access(sqlite_conn, postgres_session):
    """Migrate content_access table"""
    print("Migrating content access...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM content_access")
    rows = cursor.fetchall()
    
    for row in rows:
        access = ContentAccess(
            id=row['id'],
            content_id=row['content_id'],
            user_id=row['user_id'],
            granted_by=row['granted_by'],
            granted_at=datetime.fromisoformat(row['granted_at']) if row['granted_at'] else None,
            expires_at=datetime.fromisoformat(row['expires_at']) if row['expires_at'] else None,
            is_active=row['is_active']
        )
        postgres_session.add(access)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} content access records")

async def migrate_subscription_plans(sqlite_conn, postgres_session):
    """Migrate subscription_plans table"""
    print("Migrating subscription plans...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM subscription_plans")
    rows = cursor.fetchall()
    
    for row in rows:
        plan = SubscriptionPlan(
            id=row['id'],
            name=row['name'],
            description=row['description'],
            price=row['price'],
            currency=row['currency'],
            billing_period=row['billing_period'],
            features=row['features'],
            is_active=row['is_active'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(plan)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} subscription plans")

async def migrate_subscriptions(sqlite_conn, postgres_session):
    """Migrate subscriptions table"""
    print("Migrating subscriptions...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM subscriptions")
    rows = cursor.fetchall()
    
    for row in rows:
        subscription = Subscription(
            id=row['id'],
            user_id=row['user_id'],
            plan_id=row['plan_id'],
            status=row['status'],
            start_date=datetime.fromisoformat(row['start_date']) if row['start_date'] else None,
            end_date=datetime.fromisoformat(row['end_date']) if row['end_date'] else None,
            next_billing_date=datetime.fromisoformat(row['next_billing_date']) if row['next_billing_date'] else None,
            auto_renew=row['auto_renew'],
            payment_method=row['payment_method'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(subscription)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} subscriptions")

async def migrate_invoices(sqlite_conn, postgres_session):
    """Migrate invoices table"""
    print("Migrating invoices...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM invoices")
    rows = cursor.fetchall()
    
    for row in rows:
        invoice = Invoice(
            id=row['id'],
            user_id=row['user_id'],
            subscription_id=row['subscription_id'],
            amount=row['amount'],
            currency=row['currency'],
            status=row['status'],
            invoice_number=row['invoice_number'],
            description=row['description'],
            due_date=datetime.fromisoformat(row['due_date']) if row['due_date'] else None,
            paid_at=datetime.fromisoformat(row['paid_at']) if row['paid_at'] else None,
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(invoice)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} invoices")

async def migrate_coupons(sqlite_conn, postgres_session):
    """Migrate coupons table"""
    print("Migrating coupons...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM coupons")
    rows = cursor.fetchall()
    
    for row in rows:
        coupon = Coupon(
            id=row['id'],
            code=row['code'],
            discount_type=row['discount_type'],
            discount_value=row['discount_value'],
            usage_limit=row['usage_limit'],
            used_count=row['used_count'],
            valid_from=datetime.fromisoformat(row['valid_from']) if row['valid_from'] else None,
            valid_until=datetime.fromisoformat(row['valid_until']) if row['valid_until'] else None,
            is_active=row['is_active'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(coupon)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} coupons")

async def migrate_billing_info(sqlite_conn, postgres_session):
    """Migrate billing_info table"""
    print("Migrating billing info...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM billing_info")
    rows = cursor.fetchall()
    
    for row in rows:
        billing_info = BillingInfo(
            id=row['id'],
            user_id=row['user_id'],
            first_name=row['first_name'],
            last_name=row['last_name'],
            company=row['company'],
            address_line_1=row['address_line_1'],
            address_line_2=row['address_line_2'],
            city=row['city'],
            state=row['state'],
            postal_code=row['postal_code'],
            country=row['country'],
            phone=row['phone'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(billing_info)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} billing info records")

async def migrate_payment_methods(sqlite_conn, postgres_session):
    """Migrate payment_methods table"""
    print("Migrating payment methods...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM payment_methods")
    rows = cursor.fetchall()
    
    for row in rows:
        payment_method = PaymentMethod(
            id=row['id'],
            user_id=row['user_id'],
            type=row['type'],
            provider=row['provider'],
            provider_customer_id=row['provider_customer_id'],
            provider_payment_method_id=row['provider_payment_method_id'],
            brand=row['brand'],
            last4=row['last4'],
            expiry_month=row['expiry_month'],
            expiry_year=row['expiry_year'],
            is_default=row['is_default'],
            is_active=row['is_active'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(payment_method)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} payment methods")

async def migrate_notifications(sqlite_conn, postgres_session):
    """Migrate notifications table"""
    print("Migrating notifications...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM notifications")
    rows = cursor.fetchall()
    
    for row in rows:
        notification = Notification(
            id=row['id'],
            user_id=row['user_id'],
            title=row['title'],
            message=row['message'],
            notification_type=row['notification_type'],
            is_read=row['is_read'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None
        )
        postgres_session.add(notification)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} notifications")

async def migrate_notification_preferences(sqlite_conn, postgres_session):
    """Migrate notification_preferences table"""
    print("Migrating notification preferences...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM notification_preferences")
    rows = cursor.fetchall()
    
    for row in rows:
        preference = NotificationPreference(
            id=row['id'],
            user_id=row['user_id'],
            email_notifications=row['email_notifications'],
            push_notifications=row['push_notifications'],
            sms_notifications=row['sms_notifications'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(preference)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} notification preferences")

async def migrate_support_categories(sqlite_conn, postgres_session):
    """Migrate support_categories table"""
    print("Migrating support categories...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM support_categories")
    rows = cursor.fetchall()
    
    for row in rows:
        category = SupportCategory(
            id=row['id'],
            name=row['name'],
            description=row['description'],
            is_active=row['is_active'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(category)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} support categories")

async def migrate_support_tickets(sqlite_conn, postgres_session):
    """Migrate support_tickets table"""
    print("Migrating support tickets...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM support_tickets")
    rows = cursor.fetchall()
    
    for row in rows:
        ticket = SupportTicket(
            id=row['id'],
            user_id=row['user_id'],
            category_id=row['category_id'],
            subject=row['subject'],
            description=row['description'],
            priority=row['priority'],
            status=row['status'],
            assigned_to=row['assigned_to'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(ticket)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} support tickets")

async def migrate_support_ticket_responses(sqlite_conn, postgres_session):
    """Migrate support_ticket_responses table"""
    print("Migrating support ticket responses...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM support_ticket_responses")
    rows = cursor.fetchall()
    
    for row in rows:
        response = SupportTicketResponse(
            id=row['id'],
            ticket_id=row['ticket_id'],
            user_id=row['user_id'],
            response=row['response'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None
        )
        postgres_session.add(response)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} support ticket responses")

async def migrate_discount_codes(sqlite_conn, postgres_session):
    """Migrate discount_codes table"""
    print("Migrating discount codes...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM discount_codes")
    rows = cursor.fetchall()
    
    for row in rows:
        code = DiscountCode(
            id=row['id'],
            code=row['code'],
            discount_type=row['discount_type'],
            discount_value=row['discount_value'],
            usage_limit=row['usage_limit'],
            used_count=row['used_count'],
            valid_from=datetime.fromisoformat(row['valid_from']) if row['valid_from'] else None,
            valid_until=datetime.fromisoformat(row['valid_until']) if row['valid_until'] else None,
            is_active=row['is_active'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(code)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} discount codes")

async def migrate_affiliates(sqlite_conn, postgres_session):
    """Migrate affiliates table"""
    print("Migrating affiliates...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM affiliates")
    rows = cursor.fetchall()
    
    for row in rows:
        affiliate = Affiliate(
            id=row['id'],
            user_id=row['user_id'],
            commission_rate=row['commission_rate'],
            total_earnings=row['total_earnings'],
            total_referrals=row['total_referrals'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(affiliate)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} affiliates")

async def migrate_affiliate_referrals(sqlite_conn, postgres_session):
    """Migrate affiliate_referrals table"""
    print("Migrating affiliate referrals...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM affiliate_referrals")
    rows = cursor.fetchall()
    
    for row in rows:
        referral = AffiliateReferral(
            id=row['id'],
            affiliate_id=row['affiliate_id'],
            referred_user_id=row['referred_user_id'],
            commission_amount=row['commission_amount'],
            commission_status=row['commission_status'],
            order_id=row['order_id'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None
        )
        postgres_session.add(referral)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} affiliate referrals")

async def migrate_marketing_campaigns(sqlite_conn, postgres_session):
    """Migrate marketing_campaigns table"""
    print("Migrating marketing campaigns...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM marketing_campaigns")
    rows = cursor.fetchall()
    
    for row in rows:
        campaign = MarketingCampaign(
            id=row['id'],
            name=row['name'],
            description=row['description'],
            start_date=datetime.fromisoformat(row['start_date']) if row['start_date'] else None,
            end_date=datetime.fromisoformat(row['end_date']) if row['end_date'] else None,
            budget=row['budget'],
            status=row['status'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(campaign)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} marketing campaigns")

async def migrate_email_lists(sqlite_conn, postgres_session):
    """Migrate email_lists table"""
    print("Migrating email lists...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM email_lists")
    rows = cursor.fetchall()
    
    for row in rows:
        email_list = EmailList(
            id=row['id'],
            name=row['name'],
            description=row['description'],
            subscriber_count=row['subscriber_count'],
            is_active=row['is_active'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row['updated_at'] else None
        )
        postgres_session.add(email_list)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} email lists")

async def migrate_email_subscribers(sqlite_conn, postgres_session):
    """Migrate email_subscribers table"""
    print("Migrating email subscribers...")
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM email_subscribers")
    rows = cursor.fetchall()
    
    for row in rows:
        subscriber = EmailSubscriber(
            id=row['id'],
            email_list_id=row['email_list_id'],
            email=row['email'],
            name=row['name'],
            is_subscribed=row['is_subscribed'],
            created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None
        )
        postgres_session.add(subscriber)
    
    await postgres_session.commit()
    print(f"Migrated {len(rows)} email subscribers")

async def migrate_all_data():
    """Main function to migrate all data from SQLite to PostgreSQL"""
    print("Starting data migration from SQLite to PostgreSQL...")
    
    # Get connections
    sqlite_conn = get_sqlite_connection()
    postgres_engine = get_postgres_sync_engine()
    postgres_session = sessionmaker(bind=postgres_engine, expire_on_commit=False)()
    
    try:
        # Migrate data in the correct order (tables without foreign keys first)
        await migrate_users(sqlite_conn, postgres_session)
        await migrate_support_categories(sqlite_conn, postgres_session)
        await migrate_subscription_plans(sqlite_conn, postgres_session)
        await migrate_content(sqlite_conn, postgres_session)
        await migrate_paywalls(sqlite_conn, postgres_session)
        await migrate_customers(sqlite_conn, postgres_session)
        
        # Then tables with foreign keys to users
        await migrate_content_access(sqlite_conn, postgres_session)
        await migrate_subscriptions(sqlite_conn, postgres_session)
        await migrate_token_blacklist(sqlite_conn, postgres_session)
        await migrate_notifications(sqlite_conn, postgres_session)
        await migrate_notification_preferences(sqlite_conn, postgres_session)
        await migrate_billing_info(sqlite_conn, postgres_session)
        await migrate_payment_methods(sqlite_conn, postgres_session)
        await migrate_support_tickets(sqlite_conn, postgres_session)
        
        # Then related to paywalls and payments
        await migrate_payments(sqlite_conn, postgres_session)
        
        # Then support responses
        await migrate_support_ticket_responses(sqlite_conn, postgres_session)
        
        # Marketing related tables
        await migrate_discount_codes(sqlite_conn, postgres_session)
        await migrate_affiliates(sqlite_conn, postgres_session)
        await migrate_marketing_campaigns(sqlite_conn, postgres_session)
        await migrate_email_lists(sqlite_conn, postgres_session)
        
        # Finally the dependent tables
        await migrate_affiliate_referrals(sqlite_conn, postgres_session)
        await migrate_invoices(sqlite_conn, postgres_session)
        await migrate_coupons(sqlite_conn, postgres_session)
        await migrate_email_subscribers(sqlite_conn, postgres_session)
        
        print("Data migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"Error during data migration: {str(e)}")
        postgres_session.rollback()
        return False
    finally:
        postgres_session.close()
        sqlite_conn.close()

if __name__ == "__main__":
    print("Starting SQLite to PostgreSQL migration...")
    
    if not settings.DATABASE_URL.startswith('postgresql'):
        print("Error: DATABASE_URL must point to a PostgreSQL database for migration!")
        sys.exit(1)
    
    success = asyncio.run(migrate_all_data())
    if success:
        print("Migration completed successfully!")
    else:
        print("Migration failed!")
        sys.exit(1)