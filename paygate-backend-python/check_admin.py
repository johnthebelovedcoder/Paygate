#!/usr/bin/env python3
"""
Script to verify admin user and password hashing
"""
import sys
import os
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine
from passlib.context import CryptContext
from config.settings import settings
from models import User

# Create password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def check_admin_user():
    # Create a new engine for this script
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True,
        connect_args={"check_same_thread": False}
    )
    
    from sqlalchemy.ext.asyncio import AsyncSession
    
    async with AsyncSession(engine) as session:
        try:
            # Check if admin user exists
            result = await session.execute(select(User).where(User.email == "admin@example.com"))
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                print("❌ Admin user not found in the database!")
                return
                
            print("\n=== Admin User Found ===")
            print(f"ID: {admin_user.id}")
            print(f"Email: {admin_user.email}")
            print(f"Is Active: {admin_user.is_active}")
            print(f"Is Verified: {admin_user.is_verified}")
            print(f"Role: {admin_user.role}")
            print(f"Has Password: {'Yes' if admin_user.hashed_password else 'No'}")
            print("=======================\n")
            
            # Test password verification
            test_password = "admin123"
            is_valid = pwd_context.verify(test_password, admin_user.hashed_password)
            print(f"Password verification for '{test_password}': {'✅ Valid' if is_valid else '❌ Invalid'}")
            
        except Exception as e:
            print(f"❌ Error checking admin user: {e}")
            raise
        finally:
            await session.close()
            await engine.dispose()

if __name__ == "__main__":
    import asyncio
    asyncio.run(check_admin_user())
