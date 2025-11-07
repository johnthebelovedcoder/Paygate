import asyncio
import os
from pathlib import Path
import sys

# Add the backend to the Python path
project_root = Path(__file__).parent
backend_path = project_root / "paygate-backend-python"
sys.path.insert(0, str(backend_path))

from config.settings import settings
from sqlalchemy.ext.asyncio import create_async_engine


async def ping_database():
    """Simple database ping test"""
    print("Pinging database connection...")
    print(f"DATABASE_URL: {settings.DATABASE_URL}")
    
    try:
        engine = create_async_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,  # This will test the connection
        )
        
        print("Attempting to connect to database...")
        async with engine.begin() as conn:
            print("Connected successfully!")
            result = await conn.execute("SELECT 1 as ping_test")
            row = result.fetchone()
            print(f"Database ping successful! Result: {row[0] if row else 'No result'}")
            
        print("\nDatabase connection test PASSED!")
        return True
            
    except Exception as e:
        print(f"Database ping FAILED: {str(e)}")
        return False


if __name__ == "__main__":
    print("Database Connection Ping Test")
    print("=" * 40)
    success = asyncio.run(ping_database())
    
    if success:
        print("\nDatabase is accessible and responding!")
    else:
        print("\nDatabase connection failed. Please check your configuration.")