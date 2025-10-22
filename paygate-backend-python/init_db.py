#!/usr/bin/env python3
"""
Manual database initialization script for Paygate
"""
import asyncio
from config.database import engine, Base
import models  # Import all models to register them

async def init_db():
    print("Initializing database tables...")
    async with engine.begin() as conn:
        # Drop all tables first (optional, for development)
        # await conn.run_sync(Base.metadata.drop_all)
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())