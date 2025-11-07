#!/usr/bin/env python3
"""
Script to ensure the Supabase/PostgreSQL database schema is properly set up.
This script creates all required tables in the configured database.
"""

import asyncio
import sys
from pathlib import Path
import os

# Add the backend to the Python path
project_root = Path(__file__).parent
backend_path = project_root / "paygate-backend-python"
sys.path.insert(0, str(backend_path))

# Temporarily set environment variables to avoid validation errors
os.environ.pop('VITE_API_URL', None)
os.environ.pop('VITE_BACKEND_URL', None)
os.environ.pop('GENERATE_SOURCEMAP', None)

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import inspect
from config.settings import get_settings

async def create_supabase_schema():
    """Create Supabase/PostgreSQL schema based on SQLAlchemy models"""
    settings = get_settings()
    print(f"Configuring schema for database: {settings.DATABASE_URL}")
    
    # Check if the database URL starts with postgresql
    if not settings.DATABASE_URL.startswith('postgresql'):
        print(f"Warning: Database URL does not start with 'postgresql': {settings.DATABASE_URL}")
        response = input("Are you sure you want to proceed? (yes/no): ")
        if response.lower() != 'yes':
            print("Schema creation cancelled.")
            return False
    
    # Import models after settings are properly loaded
    from models import Base
    # Import all models
    from models.user import User
    from models.paywall import Paywall
    from models.payment import Payment
    from models.customer import Customer
    from models.content import Content
    from models.access import ContentAccess
    from models.billing import SubscriptionPlan, Subscription
    from models.billing import Invoice
    from models.billing import Coupon
    from models.billing import BillingInfo, PaymentMethod
    from models.notification import Notification, NotificationPreference
    from models.support import SupportCategory, SupportTicket, SupportTicketResponse
    from models.marketing import Affiliate, AffiliateReferral, MarketingCampaign, EmailList, EmailSubscriber
    from models.token_blacklist import TokenBlacklist
    # AnalyticsEvent is not currently implemented
    # from models.analytics import AnalyticsEvent
    
    try:
        # Create async engine
        engine = create_async_engine(settings.DATABASE_URL)
        
        # Create all tables
        async with engine.begin() as conn:
            # This will create all tables defined in the models
            await conn.run_sync(Base.metadata.create_all)
        
        print("SUCCESS: Supabase/PostgreSQL schema created successfully!")
        print("All required tables have been created in your database.")
        return True
    except Exception as e:
        print(f"ERROR: Error creating Supabase/PostgreSQL schema: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    print("=" * 60)
    print("Supabase Schema Creation Tool")
    print("=" * 60)
    settings = get_settings()
    print(f"Using DATABASE_URL from environment: {settings.DATABASE_URL}")
    print("-" * 60)
    
    success = await create_supabase_schema()
    
    if success:
        print("\nSUCCESS: Schema creation completed successfully!")
        print("Your Supabase database is now ready to use.")
        return True
    else:
        print("\nERROR: Schema creation failed!")
        print("Please check your database connection and try again.")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    if not success:
        sys.exit(1)