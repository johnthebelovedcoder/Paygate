#!/usr/bin/env python3
"""
Database initialization script for PostgreSQL
This script creates the PostgreSQL schema based on the existing models
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the backend directory to the path so imports work
backend_path = Path(__file__).parent / "paygate-backend-python"
sys.path.insert(0, str(backend_path))

from sqlalchemy import text
from config.database import engine, Base
from config.settings import settings

async def create_postgresql_schema():
    """Create PostgreSQL schema based on SQLAlchemy models"""
    try:
        print(f"Connecting to database: {settings.DATABASE_URL}")
        
        # Create all tables defined in models
        async with engine.begin() as conn:
            # For PostgreSQL, we don't need to recreate the tables if they exist
            # but we'll use this to create them fresh
            await conn.run_sync(Base.metadata.create_all)
        
        print("PostgreSQL schema created successfully!")
        return True
        
    except Exception as e:
        print(f"Error creating PostgreSQL schema: {str(e)}")
        return False

async def test_connection():
    """Test the database connection"""
    try:
        async with engine.begin() as conn:
            # Run a simple query to test the connection
            result = await conn.execute(text("SELECT 1"))
            print("Database connection test successful!")
            return True
    except Exception as e:
        print(f"Database connection test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("Initializing PostgreSQL database...")
    
    # Test connection first
    if not asyncio.run(test_connection()):
        print("Failed to connect to PostgreSQL. Please check your database configuration.")
        sys.exit(1)
    
    # Create schema
    success = asyncio.run(create_postgresql_schema())
    if success:
        print("PostgreSQL database initialized successfully!")
    else:
        print("Failed to initialize PostgreSQL database.")
        sys.exit(1)