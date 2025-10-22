#!/usr/bin/env python
"""
Test script to verify the database schema and that all models are properly configured
"""
import asyncio
from sqlalchemy import inspect
from config.database import engine
from models import Base

async def test_database():
    try:
        # Create all tables
        async with engine.begin() as conn:
            # Drop all tables first (for testing)
            await conn.run_sync(Base.metadata.drop_all)
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        
        print("[SUCCESS] Database tables created successfully!")
        
        # Check if all expected tables exist
        def check_tables(conn):
            inspector = inspect(conn)
            return inspector.get_table_names()
        
        # Use run_sync to handle the inspection
        tables = await engine.run_sync(check_tables)
            
        expected_tables = ['users', 'content', 'paywalls', 'payments', 'customers']
        
        print(f"\n[INFO] Database tables found: {tables}")
        
        missing_tables = [table for table in expected_tables if table not in tables]
        if missing_tables:
            print(f"[ERROR] Missing tables: {missing_tables}")
        else:
            print("[SUCCESS] All expected tables are present")
        
        # Show table structure for each table
        def get_table_columns(table_name):
            def get_cols(conn):
                inspector = inspect(conn)
                return inspector.get_columns(table_name)
            return get_cols
            
        for table_name in expected_tables:
            if table_name in tables:
                columns = await engine.run_sync(get_table_columns(table_name))
                print(f"\n[INFO] {table_name} table structure:")
                for col in columns:
                    print(f"  - {col['name']}: {col['type']} {'(PK)' if col['primary_key'] else ''} {'(nullable)' if col['nullable'] else '(not nullable)'}")
        
        print("\n[SUCCESS] Database verification completed!")
        
    except Exception as e:
        print(f"[ERROR] Error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_database())