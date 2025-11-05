import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def check_and_fix_db():
    # Path to your database
    db_path = os.path.join('paygate-backend-python', 'paygate.db')
    
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return False
    
    # Create SQLAlchemy engine
    engine = create_engine(f'sqlite:///{db_path}')
    
    try:
        with engine.connect() as conn:
            # Check if content table exists
            result = conn.execute(
                text("SELECT name FROM sqlite_master WHERE type='table' AND name='content'")
            ).fetchone()
            
            if not result:
                print("Error: 'content' table does not exist in the database.")
                return False
            
            # Check if created_at column exists
            result = conn.execute(
                text("PRAGMA table_info(content)")
            ).fetchall()
            
            columns = [row[1] for row in result]
            
            if 'created_at' not in columns or 'updated_at' not in columns:
                print("Adding missing columns to 'content' table...")
                
                # Add the missing columns
                if 'created_at' not in columns:
                    conn.execute(text("""
                        ALTER TABLE content 
                        ADD COLUMN created_at TIMESTAMP 
                        DEFAULT CURRENT_TIMESTAMP
                    """))
                
                if 'updated_at' not in columns:
                    conn.execute(text("""
                        ALTER TABLE content 
                        ADD COLUMN updated_at TIMESTAMP 
                        DEFAULT CURRENT_TIMESTAMP
                    """))
                
                # Create a trigger for updated_at
                conn.execute(text("""
                    CREATE TRIGGER IF NOT EXISTS update_content_timestamp
                    AFTER UPDATE ON content
                    FOR EACH ROW
                    BEGIN
                        UPDATE content 
                        SET updated_at = CURRENT_TIMESTAMP 
                        WHERE id = OLD.id;
                    END;
                
                """))
                
                print("Successfully added missing columns and created trigger.")
                return True
            else:
                print("All required columns exist in the 'content' table.")
                return True
                
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Checking database schema...")
    if check_and_fix_db():
        print("Database check/update completed successfully!")
    else:
        print("Database check/update failed. See error messages above.")
        sys.exit(1)
