#!/usr/bin/env python
"""
Simple test script to verify the database models and structure
"""
import asyncio
from models import User, Content, Paywall, Payment, Customer, Base
from config.database import engine
from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncSession

async def test_database():
    try:
        # Test that all models are properly defined
        print("[SUCCESS] All models imported successfully!")
        print(f"[INFO] User model: {User.__tablename__}")
        print(f"[INFO] Content model: {Content.__tablename__}")
        print(f"[INFO] Paywall model: {Paywall.__tablename__}")
        print(f"[INFO] Payment model: {Payment.__tablename__}")
        print(f"[INFO] Customer model: {Customer.__tablename__}")
        
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("[SUCCESS] Database tables created successfully!")
        
        # Test basic database connection
        async with AsyncSession(engine) as session:
            # Try to access the database (even if it's empty)
            pass
        
        print("[SUCCESS] Database connection established!")
        print("[SUCCESS] All checks passed - database is properly set up!")
        
    except Exception as e:
        print(f"[ERROR] Error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_database())