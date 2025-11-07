#!/usr/bin/env python
"""
Test Supabase database connection with timeout handling
"""
import sys
import os
sys.path.append('.')

# Add current directory to path so we can import config
current_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(current_dir)

import asyncio
from sqlalchemy import text
from config.database import engine

async def test_connection():
    try:
        print('[INFO] Attempting to connect to Supabase database...')
        
        # Test with a timeout
        async with asyncio.timeout(10):  # 10 second timeout
            async with engine.begin() as conn:
                print('[INFO] Connection established, executing query...')
                result = await conn.execute(text('SELECT 1'))
                row = result.fetchone()
                print('[SUCCESS] Database connection works! Result:', row[0])
                
    except asyncio.TimeoutError:
        print('[ERROR] Connection timed out after 10 seconds')
    except Exception as e:
        print('[ERROR] Database connection failed:', e)
        import traceback
        traceback.print_exc()
    finally:
        # Properly dispose of the engine
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection())