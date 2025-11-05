import sys
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

# Database connection string
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # Default SQLite URL if not specified
    DATABASE_URL = 'sqlite:///./paygate.db'

def reset_admin_password():
    print("\n=== Admin Password Reset Tool ===")
    print(f"Connecting to database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
    
    try:
        # Create database engine
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Check if users table exists
        result = session.execute(text(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
        ))
        table_exists = result.scalar()
        
        if not table_exists:
            print("\n[ERROR] 'users' table does not exist in the database.")
            return
        
        # Get the admin user
        admin = session.execute(
            text("SELECT * FROM users WHERE email = 'admin@example.com'")
        ).fetchone()
        
        if not admin:
            print("\n[ERROR] User 'admin@example.com' not found.")
            # List all users
            users = session.execute(text("SELECT id, email FROM users")).fetchall()
            if users:
                print("\n[EXISTING USERS]")
                for user in users:
                    print(f"- {user.email} (ID: {user.id})")
            return
        
        print(f"\n[ADMIN USER FOUND]")
        print(f"ID: {admin.id}")
        print(f"Email: {admin.email}")
        print(f"Current Hash: {admin.hashed_password}")
        
        # Generate new password hash
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        new_password = "password123"
        new_hash = pwd_context.hash(new_password)
        
        # Update the password
        session.execute(
            text("UPDATE users SET hashed_password = :hash WHERE email = :email"),
            {"hash": new_hash, "email": "admin@example.com"}
        )
        session.commit()
        
        print("\n[PASSWORD UPDATED SUCCESSFULLY]")
        print(f"Email: admin@example.com")
        print(f"New Password: {new_password}")
        print("\nYou can now log in with these credentials.")
        
    except Exception as e:
        print(f"\n[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if 'session' in locals():
            session.close()
        if 'engine' in locals():
            engine.dispose()

if __name__ == "__main__":
    reset_admin_password()
    print("\nPassword reset complete.")
