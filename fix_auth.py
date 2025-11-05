import sqlite3
from passlib.context import CryptContext

def reset_password():
    print("\n=== Admin Password Reset ===")
    
    # Database path - adjust if needed
    db_path = 'paygate-backend-python/paygate.db'
    
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if users table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if not cursor.fetchone():
            print("\n[ERROR] 'users' table not found in the database.")
            return
        
        # Get admin user
        cursor.execute("SELECT * FROM users WHERE email = 'admin@example.com'")
        admin = cursor.fetchone()
        
        if not admin:
            print("\n[ERROR] Admin user not found.")
            # List all users
            cursor.execute("SELECT id, email FROM users")
            users = cursor.fetchall()
            if users:
                print("\n[EXISTING USERS]")
                for user in users:
                    print(f"- {user[1]} (ID: {user[0]})")
            return
        
        print("\n[ADMIN USER FOUND]")
        print(f"ID: {admin[0]}")
        print(f"Email: {admin[2]}")  # Assuming email is the 3rd column
        print(f"Current Hash: {admin[3]}")  # Assuming hashed_password is the 4th column
        
        # Generate new password hash
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        new_password = "password123"
        new_hash = pwd_context.hash(new_password)
        
        # Update the password
        cursor.execute(
            "UPDATE users SET hashed_password = ? WHERE email = ?",
            (new_hash, 'admin@example.com')
        )
        conn.commit()
        
        print("\n[PASSWORD UPDATED]")
        print(f"Email: admin@example.com")
        print(f"New Password: {new_password}")
        print("\nYou can now log in with the new password.")
        
    except Exception as e:
        print(f"\n[ERROR] {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    reset_password()
