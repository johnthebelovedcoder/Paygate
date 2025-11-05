import sqlite3
import os

def check_database():
    # Path to the SQLite database file in the backend directory
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'paygate-backend-python', 'paygate.db')
    
    if not os.path.exists(db_path):
        print(f"Database file not found at: {db_path}")
        return
    
    print(f"Found database at: {db_path}")
    
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # List all tables
        print("\nTables in the database:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        for table in tables:
            print(f"- {table[0]}")
            
            # Show table structure
            cursor.execute(f"PRAGMA table_info({table[0]})")
            columns = cursor.fetchall()
            if columns:
                print("  Columns:")
                for col in columns:
                    print(f"  - {col[1]} ({col[2]})")
            
            # Show row count
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
            count = cursor.fetchone()[0]
            print(f"  Rows: {count}")
            
    except sqlite3.Error as e:
        print(f"Error checking database: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    check_database()
