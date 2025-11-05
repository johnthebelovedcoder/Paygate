import sys
import os
from pathlib import Path

# Add the project root and backend to the Python path
project_root = str(Path(__file__).parent.absolute())
backend_path = os.path.join(project_root, 'paygate-backend-python')
sys.path.insert(0, project_root)
sys.path.insert(0, backend_path)

import asyncio
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Import settings and models
from config.settings import settings
from models import User

async def fix_password():
    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL)
    
    # Create async session
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with async_session() as session:
        try:
            # Check if users table exists (for SQLite)
            result = await session.execute(
                text("""
                SELECT name FROM sqlite_master WHERE type='table' AND name='users';
                """)
            )
            table_exists = result.scalar() is not None
            
            if not table_exists:
                print("\n[ERROR] 'users' table does not exist in the database.")
                return
                
            # Get the user record
            result = await session.execute(
                select(User).where(User.email == 'admin@example.com')
            )
            user = result.scalar_one_or_none()
            
            if user:
                print(f"\n[USER FOUND]")
                print(f"ID: {user.id}")
                print(f"Email: {user.email}")
                print(f"Current Hash: {user.hashed_password}")
                
                # Generate new hash
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                new_hash = pwd_context.hash("password123")
                
                # Update the password
                user.hashed_password = new_hash
                await session.commit()
                
                print("\n[PASSWORD UPDATED]")
                print(f"New hash for 'password123': {new_hash}")
                print("You can now log in with email: admin@example.com and password: password123")
                
            else:
                print("\n[ERROR] User 'admin@example.com' not found.")
                
                # List all users
                result = await session.execute(select(User))
                users = result.scalars().all()
                
                if users:
                    print("\n[EXISTING USERS]")
                    for u in users:
                        print(f"- {u.email} (ID: {u.id})")
                else:
                    print("\n[NO USERS FOUND] You may need to register a new user.")
                    
        except Exception as e:
            print(f"\n[ERROR] {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    print("\n=== PayGate Password Reset Tool ===")
    print("This will reset the password for admin@example.com to 'password123'")
    print("Connecting to database...")
    
    # Run the async function
    import asyncio
    asyncio.run(fix_password())
    
    print("\nDone. You can now try logging in with the new password.")
