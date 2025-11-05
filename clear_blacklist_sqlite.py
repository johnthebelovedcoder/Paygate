import sqlite3
import os

def clear_token_blacklist():
    # Path to the SQLite database file
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'paygate.db')
    
    if not os.path.exists(db_path):
        print(f"Database file not found at: {db_path}")
        return
    
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if the token_blacklist table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='token_blacklist'")
        if not cursor.fetchone():
            print("token_blacklist table not found in the database")
            return
        
        # Count tokens before deletion
        cursor.execute("SELECT COUNT(*) FROM token_blacklist")
        count_before = cursor.fetchone()[0]
        print(f"Found {count_before} blacklisted tokens")
        
        if count_before > 0:
            # Delete all blacklisted tokens
            cursor.execute("DELETE FROM token_blacklist")
            conn.commit()
            print(f"Successfully cleared {count_before} blacklisted tokens")
        else:
            print("No blacklisted tokens found")
            
    except sqlite3.Error as e:
        print(f"Error clearing token blacklist: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    clear_token_blacklist()
