#!/usr/bin/env python3
"""
Script to create a user in the Paygate database
"""
import sqlite3
from passlib.context import CryptContext

def create_user():
    # Create password context using bcrypt (same as the application)
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Connect directly to SQLite to insert user
    conn = sqlite3.connect('paygate.db')
    cursor = conn.cursor()
    
    # Create a test user with a known password from environment or generate one
    import os
    import secrets
    import string
    password = os.getenv("TEST_USER_PASSWORD", 
                        ''.join(secrets.choice(string.ascii_letters + string.digits + string.punctuation) 
                               for _ in range(12)))
    email = os.getenv("TEST_USER_EMAIL", 'admin@example.com')
    name = os.getenv("TEST_USER_NAME", 'Admin User')
    hashed_password = pwd_context.hash(password)
    
    # Insert the user
    try:
        cursor.execute('''
            INSERT INTO users (name, email, hashed_password, is_active, is_verified, role)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (name, email, hashed_password, True, True, 'admin'))
        
        conn.commit()
        print(f"User created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")
        print(f"Role: admin")
        print("You can now login with these credentials.")
        
    except sqlite3.IntegrityError:
        print(f"User with email {email} already exists!")
    finally:
        conn.close()

if __name__ == "__main__":
    create_user()