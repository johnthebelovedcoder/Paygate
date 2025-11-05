import asyncio
import sys
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine

# Add the paygate-backend-python directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'paygate-backend-python'))

from models import User, Base
from config.settings import settings

async def check_user():
    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL)
    
    async with engine.begin() as conn:
        # Check if the users table exists
        result = await conn.execute(
            """
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            )
            """
        )
        table_exists = result.scalar()
        
        if not table_exists:
            print("Error: 'users' table does not exist in the database.")
            return
            
        # Get the user record
        result = await conn.execute(
            select(User).where(User.email == 'admin@example.com')
        )
        user = result.scalar_one_or_none()
        
        if user:
            print(f"\n[USER FOUND]")
            print(f"ID: {user.id}")
            print(f"Email: {user.email}")
            print(f"Password Hash: {user.hashed_password}")
            print(f"Hash Length: {len(user.hashed_password)}")
            print(f"Created At: {user.created_at}")
            print(f"Updated At: {user.updated_at}")
            
            # Check if we can update the password
            try:
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                new_hash = pwd_context.hash("password123")
                
                print("\n[PASSWORD UPDATE]")
                print(f"New hash for 'password123': {new_hash}")
                
                # Update the password
                await conn.execute(
                    "UPDATE users SET hashed_password = :hash WHERE email = :email",
                    {"hash": new_hash, "email": "admin@example.com"}
                )
                await conn.commit()
                print("Password updated successfully!")
                
            except Exception as e:
                print(f"Error updating password: {str(e)}")
                
        else:
            print("\n[ERROR] User 'admin@example.com' not found in the database.")
            
        # Check if there are any users in the database
        result = await conn.execute(select(User).limit(5))
        users = result.all()
        if users:
            print("\n[FIRST 5 USERS]")
            for u in users:
                print(f"- {u.email} (ID: {u.id})")
        else:
            print("\n[NO USERS FOUND IN DATABASE]")

if __name__ == "__main__":
    print("Checking database for user 'admin@example.com'...")
    asyncio.run(check_user())
