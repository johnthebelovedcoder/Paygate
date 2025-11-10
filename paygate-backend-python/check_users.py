#!/usr/bin/env python3
"""
Script to check if there are any users in the database
"""
import asyncio
from sqlalchemy import create_engine, text, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from config.settings import settings

# Import the User model
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import User

async def check_users():
    print(f"Database URL: {settings.DATABASE_URL}")
    
    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL)
    
    async with AsyncSession(engine) as session:
        try:
            # First, let's check if the users table exists by trying to count rows
            result = await session.execute(select(User))
            users = result.scalars().all()
            
            if users:
                print(f'Found {len(users)} user(s) in database:')
                for user in users:
                    print(f'  - ID: {user.id}, Email: {user.email}, Name: {user.full_name}, Active: {user.is_active}')
            else:
                print('No users found in database')
                
        except Exception as e:
            print(f"Error querying users: {e}")
            # Check if the table exists
            try:
                result = await session.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
                tables = result.fetchall()
                print(f"Tables in database: {[table[0] for table in tables]}")
            except Exception as table_e:
                print(f"Error checking tables: {table_e}")

if __name__ == "__main__":
    asyncio.run(check_users())