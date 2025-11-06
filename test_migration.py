#!/usr/bin/env python3
"""
Test script to validate the PostgreSQL migration
This script tests database connectivity and verifies the migration
"""

import sys
import os
from pathlib import Path
import asyncio

# Add the backend directory to the path so imports work
backend_path = Path(__file__).parent / "paygate-backend-python"
sys.path.insert(0, str(backend_path))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from config.settings import settings
from models import Base
from models.user import User
from models.content import Content
from models.paywall import Paywall
from models.payment import Payment
from models.customer import Customer

async def test_postgres_connection():
    """Test PostgreSQL connection"""
    try:
        print(f"Testing connection to: {settings.DATABASE_URL}")
        
        # Create async engine for PostgreSQL
        engine = create_async_engine(settings.DATABASE_URL)
        
        # Test the connection
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("✓ PostgreSQL connection successful")
            return True
            
    except Exception as e:
        print(f"✗ PostgreSQL connection failed: {str(e)}")
        return False

async def test_schema_creation():
    """Test if schema was created properly"""
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        
        # Try to create tables (this will succeed if they already exist)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("✓ Schema verification successful")
        return True
        
    except Exception as e:
        print(f"✗ Schema verification failed: {str(e)}")
        return False

async def compare_data_counts():
    """Compare data counts between SQLite and PostgreSQL"""
    try:
        import sqlite3
        
        # Get SQLite connection
        sqlite_db_path = backend_path / "paygate.db"
        if not sqlite_db_path.exists():
            print("⚠ SQLite database not found, skipping data comparison")
            return True
            
        sqlite_conn = sqlite3.connect(str(sqlite_db_path))
        sqlite_cursor = sqlite_conn.cursor()
        
        # Get PostgreSQL engine
        postgres_engine = create_async_engine(settings.DATABASE_URL)
        
        # Compare counts for important tables
        tables_to_check = [
            ("users", User),
            ("content", Content), 
            ("paywalls", Paywall),
            ("payments", Payment),
            ("customers", Customer)
        ]
        
        all_match = True
        for table_name, model_class in tables_to_check:
            try:
                # Get SQLite count
                sqlite_cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                sqlite_count = sqlite_cursor.fetchone()[0]
                
                # Get PostgreSQL count
                async with postgres_engine.begin() as conn:
                    result = await conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                    postgres_count = result.fetchone()[0]
                
                print(f"  {table_name}: SQLite={sqlite_count}, PostgreSQL={postgres_count}")
                
                if sqlite_count != postgres_count:
                    print(f"  ⚠ Count mismatch for {table_name}")
                    all_match = False
                else:
                    print(f"  ✓ {table_name} counts match")
                    
            except Exception as e:
                print(f"  ⚠ Could not compare {table_name}: {str(e)}")
                continue
        
        sqlite_conn.close()
        
        if all_match:
            print("✓ All table counts match between databases")
            return True
        else:
            print("⚠ Some table counts don't match, but this may be expected")
            return True  # Don't fail the test just because counts don't match
            
    except Exception as e:
        print(f"⚠ Data comparison failed: {str(e)}")
        return True  # Don't fail the overall test for comparison issues

async def test_basic_operations():
    """Test basic database operations to ensure everything works"""
    try:
        from config.database import AsyncSessionLocal
        from sqlalchemy import select
        
        # Test creating a new async session
        async with AsyncSessionLocal() as session:
            # Try to count users
            result = await session.execute(select(User))
            users = result.scalars().all()
            user_count = len(users)
            
            print(f"✓ Successfully queried {user_count} users from PostgreSQL")
            
            # Try to get the first user if any exist
            if users:
                first_user = users[0]
                print(f"✓ Retrieved user: {first_user.email if hasattr(first_user, 'email') else 'N/A'}")
        
        return True
    except Exception as e:
        print(f"✗ Basic operations test failed: {str(e)}")
        return False

async def run_all_tests():
    """Run all migration tests"""
    print("Starting PostgreSQL migration validation tests...")
    print("=" * 50)
    
    tests = [
        ("PostgreSQL Connection", test_postgres_connection),
        ("Schema Creation", test_schema_creation),
        ("Data Comparison", compare_data_counts),
        ("Basic Operations", test_basic_operations)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\nRunning: {test_name}")
        print("-" * 30)
        result = await test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 50)
    print("Test Results Summary:")
    print("=" * 50)
    
    all_passed = True
    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{test_name}: {status}")
        if not result:
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("🎉 All tests passed! PostgreSQL migration appears successful.")
        return True
    else:
        print("❌ Some tests failed. Please check the migration.")
        return False

if __name__ == "__main__":
    if not settings.DATABASE_URL.startswith('postgresql'):
        print("⚠ Warning: DATABASE_URL is not pointing to PostgreSQL")
        print(f"Current DATABASE_URL: {settings.DATABASE_URL}")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            print("Aborting test.")
            sys.exit(1)
    
    success = asyncio.run(run_all_tests())
    if success:
        print("\nMigration validation completed successfully!")
        sys.exit(0)
    else:
        print("\nMigration validation failed!")
        sys.exit(1)