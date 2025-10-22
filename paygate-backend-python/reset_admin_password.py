#!/usr/bin/env python3
"""
Script to reset the admin user's password in the database
"""
import sqlite3
from passlib.context import CryptContext

def reset_admin_password():
    # Create password context using bcrypt (same as the application)
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Connect directly to SQLite to update admin user's password
    conn = sqlite3.connect('paygate.db')
    cursor = conn.cursor()
    
    # Create the new hash for the default password
    email = 'admin@example.com'
    new_password = 'password123'  # Use the known password
    hashed_password = pwd_context.hash(new_password)
    
    # Update the user's password
    try:
        cursor.execute('''
            UPDATE users 
            SET hashed_password = ?
            WHERE email = ?
        ''', (hashed_password, email))
        
        rows_affected = cursor.rowcount
        if rows_affected > 0:
            conn.commit()
            print(f"Successfully reset password for user: {email}")
            print(f"New password: {new_password}")
            print("You can now log in with these credentials.")
        else:
            print(f"User with email {email} not found in the database!")
            
            # Let's see what users do exist
            cursor.execute('SELECT email FROM users')
            users = cursor.fetchall()
            print("Available users in the database:")
            for user in users:
                print(f"  - {user[0]}")
        
    except Exception as e:
        print(f"Error updating password: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    reset_admin_password()