#!/usr/bin/env python3
"""
Script to reset the database to a clean state
"""
import os
import asyncio
from scripts.init_db import init_db

async def reset_database():
    # Delete database file if it exists
    db_path = "paygate.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database: {db_path}")
    
    # Initialize new database
    await init_db()
    print("Database has been reset successfully!")

if __name__ == "__main__":
    asyncio.run(reset_database())
