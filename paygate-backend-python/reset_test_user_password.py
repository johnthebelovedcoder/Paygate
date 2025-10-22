#!/usr/bin/env python3
"""
Script to reset the test user's password in the database
"""
import sqlite3
from passlib.context import CryptContext

def reset_test_user_password():
    # Create password context using bcrypt (same as the application)
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Connect directly to SQLite to update test user's password
    conn = sqlite3.connect('paygate.db')
    cursor = conn.cursor()
    
    # Create the new hash for the test password
    email = 'testuser@paygate.com'
    new_password = 'securepassword123'  # Use the known test password
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
            
            # Create the user if it doesn't exist
            hashed_password = pwd_context.hash(new_password)
            cursor.execute('''
                INSERT INTO users (name, email, hashed_password, is_active, is_verified, role)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', ('Test User', email, hashed_password, True, True, 'user'))
            
            conn.commit()
            print(f"Created new user: {email} with password: {new_password}")
        
    except Exception as e:
        print(f"Error updating password: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    reset_test_user_password()