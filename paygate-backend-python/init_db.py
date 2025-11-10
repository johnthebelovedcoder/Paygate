#!/usr/bin/env python3
"""
Database initialization script for PayGate application
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from config.database import Base, engine
from config.settings import settings
import logging

# Import all models to ensure they're registered with SQLAlchemy
import models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    """Initialize database tables"""
    logger.info(f"Initializing database with URL: {settings.DATABASE_URL}")
    
    try:
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database tables created successfully!")
        
        # Verify tables exist by checking if we can access the users table
        from sqlalchemy import text
        async with engine.begin() as conn:
            # Try to get table count
            result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
            tables = result.fetchall()
            logger.info(f"Tables in database: {[table[0] for table in tables]}")
        
        logger.info("Database initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(init_db())