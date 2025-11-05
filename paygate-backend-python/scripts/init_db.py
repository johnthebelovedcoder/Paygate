#!/usr/bin/env python3
"""
Database initialization script with admin user creation
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from config.database import engine, Base, async_session
from models import User
from services.user_service import get_password_hash

async def init_db():
    print("Initializing database...")
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create default admin user if it doesn't exist
    async with async_session() as session:
        try:
            # Check if admin user already exists
            from sqlalchemy import select
            result = await session.execute(select(User).where(User.email == "admin@example.com"))
            admin_user = result.scalars().first()
            
            if not admin_user:
                # Create admin user
                admin = User(
                    email="admin@example.com",
                    hashed_password=get_password_hash("admin123"),
                    is_active=True,
                    is_verified=True,
                    role="admin",
                    name="Admin User"
                )
                session.add(admin)
                await session.commit()
                print("\n=== Created default admin user ===")
                print(f"Email: admin@example.com")
                print(f"Password: admin123")
                print("===============================\n")
            else:
                print("Admin user already exists.")
                
            await session.commit()
            print("✅ Database initialization complete!")
            
        except Exception as e:
            print(f"❌ Error initializing database: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()

if __name__ == "__main__":
    # Delete existing database file if it exists
    db_path = "paygate.db"
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print(f"🗑️  Removed existing database: {db_path}")
        except Exception as e:
            print(f"❌ Error removing database: {e}")
    
    asyncio.run(init_db())
