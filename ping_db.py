#!/usr/bin/env python
"""
Simple script to test database connectivity
"""
import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def ping_database():
    # Get database URL from environment or use default
    database_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./paygate.db")
    
    # For Supabase, we need to remove pgbouncer parameter if present
    if "pgbouncer=true" in database_url:
        print(f"[INFO] Removing unsupported pgbouncer parameter from DATABASE_URL")
        clean_url = database_url.replace("?pgbouncer=true", "").replace("&pgbouncer=true", "")
        database_url = clean_url
    
    print(f"[INFO] Attempting to connect to database: {database_url}")
    
    engine = None
    try:
        engine = create_async_engine(database_url)
        async with engine.begin() as conn:
            # For PostgreSQL/Supabase, execute a simple query
            result = await conn.execute(text("SELECT 1"))
            row = result.fetchone()
            
            if row:
                print(f"[SUCCESS] Database connection successful!")
                print(f"[INFO] Database returned: {row[0]}")
            else:
                print(f"[ERROR] Database connection returned no results")
                
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if engine:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(ping_database())