from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import Base
from config.settings import settings
from models.user import User
from passlib.context import CryptContext
import os

# Convert async database URL to sync for DDL operations
sync_db_url = settings.DATABASE_URL.replace('sqlite+aiosqlite:///', 'sqlite:///', 1)

print(f'Sync DB URL: {sync_db_url}')

sync_engine = create_engine(sync_db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

# Create tables if they don't exist
Base.metadata.create_all(bind=sync_engine)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    db = SessionLocal()
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.email == 'admin@example.com').first()
        
        if existing_admin:
            print(f'Admin user already exists with ID: {existing_admin.id}')
            return
        
        # Create a new admin user
        # Use environment variable for default password, fallback to a secure random one
        import os
        import secrets
        import string
        default_password = os.getenv("DEFAULT_ADMIN_PASSWORD", 
                                   ''.join(secrets.choice(string.ascii_letters + string.digits + string.punctuation) 
                                          for _ in range(16)))
        hashed_password = pwd_context.hash(default_password)
        admin_user = User(
            name="Admin User",
            email="admin@example.com",
            hashed_password=hashed_password,
            is_active=True,
            is_verified=True,
            role="admin",
            country="US",
            currency="USD"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f'Admin user created successfully with ID: {admin_user.id}')
        print(f'Email: {admin_user.email}')
        print(f'Password: {default_password} (hashed)')
        
    except Exception as e:
        print(f'Error creating admin user: {str(e)}')
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating admin user...")
    create_admin_user()
    print("Admin user setup completed!")