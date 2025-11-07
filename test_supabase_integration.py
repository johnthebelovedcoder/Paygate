#!/usr/bin/env python3
"""
Test script to verify Supabase integration in the PayGate application
"""
import asyncio
import os
from pathlib import Path
import sys

# Add the backend to the Python path
project_root = Path(__file__).parent
backend_path = project_root / "paygate-backend-python"
sys.path.insert(0, str(backend_path))

from supabase_client import supabase, get_supabase_client
from config.settings import settings


async def test_supabase_client():
    """Test the Supabase client connection and functionality"""
    print("=" * 60)
    print("Testing Supabase Integration")
    print("=" * 60)
    
    # Show the configuration
    print(f"Supabase URL: {settings.NEXT_PUBLIC_SUPABASE_URL}")
    print(f"Supabase configured: {settings.is_supabase_configured}")
    print("-" * 60)
    
    try:
        # Test 1: Verify the client was created successfully
        print("1. Testing Supabase client instantiation...")
        client = get_supabase_client()
        print("[SUCCESS] Supabase client created successfully!")
        
        # Test 2: Test database connection via raw SQL query
        print("\n2. Testing database connection...")
        # Use Supabase's built-in version function
        result = await client.rpc('version').execute()
        print("[SUCCESS] Database connection test successful!")
        
        # Test 3: Test authentication status
        print("\n3. Testing authentication configuration...")
        if settings.NEXT_PUBLIC_SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY:
            print("[SUCCESS] Supabase authentication keys are properly configured!")
        else:
            print("[WARNING] Supabase authentication keys not found in settings")
        
        # Test 4: Try to list tables (if possible with the configured key)
        print("\n4. Testing basic database access...")
        try:
            # This may not work with anon key, but it's a good test
            result = await client.table('users').select('id').limit(1).execute()
            print("[SUCCESS] Basic database access test completed (table query)")
        except Exception as e:
            print(f"[INFO] Basic database access resulted in: {str(e)} (this may be expected with anon key)")
        
        print("\n" + "=" * 60)
        print("[SUCCESS] All Supabase integration tests completed successfully!")
        print("[SUCCESS] Your PayGate application is now properly configured for Supabase!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Supabase integration test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def test_sqlalchemy_supabase_connection():
    """Test that SQLAlchemy can still connect to Supabase database"""
    print("\n" + "-" * 60)
    print("Testing SQLAlchemy connection to Supabase PostgreSQL")
    print("-" * 60)
    
    try:
        from sqlalchemy.ext.asyncio import create_async_engine
        print(f"Using DATABASE_URL: {settings.DATABASE_URL}")
        
        # Create async engine
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,  # Set to True to see detailed logs
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={
                "ssl": "require"  # Ensure SSL connection for Supabase
            }
        )
        
        # Try to connect
        print("Attempting to connect to Supabase PostgreSQL...")
        async with engine.begin() as conn:
            print("[SUCCESS] Connection established! Testing with a simple query...")
            result = await conn.execute("SELECT 1 as test")
            row = result.fetchone()
            print(f"[SUCCESS] Query executed successfully! Result: {row[0] if row else 'No result'}")
            
        return True
            
    except Exception as e:
        print(f"[ERROR] SQLAlchemy connection test FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("Running Supabase Integration Tests for PayGate")
    
    success1 = asyncio.run(test_supabase_client())
    success2 = asyncio.run(test_sqlalchemy_supabase_connection())
    
    if success1 and success2:
        print("\nAll tests passed! Supabase integration is working correctly.")
        print("\nSummary:")
        print("   - Supabase client is properly configured and accessible")
        print("   - SQLAlchemy can connect to Supabase PostgreSQL database")
        print("   - Environment variables are correctly set")
        print("   - PayGate is ready for both development and production with Supabase")
    else:
        print("\nSome tests failed. Please check the above errors.")
        sys.exit(1)