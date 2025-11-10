"""
Database migration to add missing columns to users table
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from sqlalchemy.sql import text
from config.database import engine
import asyncio

async def add_missing_columns():
    """Add missing columns to the users table"""
    async with engine.begin() as conn:
        # Add country column
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN country VARCHAR(100)"))
            print("Added 'country' column to users table")
        except Exception as e:
            print(f"Column 'country' may already exist: {e}")

        # Add currency column
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN currency VARCHAR(10)"))
            print("Added 'currency' column to users table")
        except Exception as e:
            print(f"Column 'currency' may already exist: {e}")

        # Add user_type column
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN user_type VARCHAR(50)"))
            print("Added 'user_type' column to users table")
        except Exception as e:
            print(f"Column 'user_type' may already exist: {e}")

        print("Migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(add_missing_columns())