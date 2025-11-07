import asyncio
import os
import sys
from pathlib import Path

# Add the backend to the Python path
project_root = Path(__file__).parent
backend_path = project_root / "paygate-backend-python"
sys.path.insert(0, str(backend_path))

# Clear any cached settings modules to ensure fresh env loading
modules_to_remove = [key for key in sys.modules.keys() if 'config' in key or 'settings' in key]
for module in modules_to_remove:
    del sys.modules[module]

# Now load fresh settings
from pydantic_settings import BaseSettings
from typing import List, Optional, Union

class FreshSettings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./paygate_local.db")
    
    class Config:
        env_file = str(project_root / ".env")
        env_file_encoding = 'utf-8'
        case_sensitive = True
        extra = "allow"  # Allow extra fields from .env

def get_fresh_settings():
    return FreshSettings()

async def ping_database():
    """Simple database ping test with fresh settings"""
    settings = get_fresh_settings()
    print("Pinging database connection...")
    print(f"DATABASE_URL: {settings.DATABASE_URL}")
    
    try:
        from sqlalchemy.ext.asyncio import create_async_engine
        
        engine = create_async_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
        )
        
        print("Attempting to connect to database...")
        async with engine.begin() as conn:
            print("Connected successfully!")
            from sqlalchemy import text
            if "sqlite" in settings.DATABASE_URL:
                result = await conn.execute(text("SELECT 1"))
            else:
                result = await conn.execute(text("SELECT 1 as ping_test"))
            row = result.fetchone()
            print(f"Database ping successful! Result: {row[0] if row else 'No result'}")
            
        print("\nDatabase connection test PASSED!")
        return True
            
    except Exception as e:
        print(f"Database ping FAILED: {str(e)}")
        return False


if __name__ == "__main__":
    print("Database Connection Ping Test (Fresh Settings)")
    print("=" * 50)
    success = asyncio.run(ping_database())
    
    if success:
        print("\nDatabase is accessible and responding!")
    else:
        print("\nDatabase connection failed. Please check your configuration.")