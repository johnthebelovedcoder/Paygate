import sys
import os

# Add the project root to the Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from paygate_backend_python.config.database import SQLALCHEMY_DATABASE_URL
from paygate_backend_python.models import TokenBlacklist

def clear_token_blacklist():
    # Create database connection
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Count tokens before deletion
        count_before = db.query(TokenBlacklist).count()
        print(f"Found {count_before} blacklisted tokens")
        
        if count_before > 0:
            # Delete all blacklisted tokens
            db.query(TokenBlacklist).delete()
            db.commit()
            print(f"Successfully cleared {count_before} blacklisted tokens")
        else:
            print("No blacklisted tokens found")
            
    except Exception as e:
        print(f"Error clearing token blacklist: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_token_blacklist()
