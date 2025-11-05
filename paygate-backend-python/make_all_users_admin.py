#!/usr/bin/env python3
"""
Script to update all existing users to have admin role
"""
import sqlite3

def make_all_users_admin():
    # Connect to the database
    conn = sqlite3.connect('paygate.db')
    cursor = conn.cursor()
    
    try:
        # Update all users to have admin role
        cursor.execute('UPDATE users SET role = "admin" WHERE 1=1')
        
        rows_affected = cursor.rowcount
        conn.commit()
        
        print(f"Successfully updated {rows_affected} users to admin role!")
        
        # Show the updated user counts
        cursor.execute('SELECT role, COUNT(*) FROM users GROUP BY role')
        results = cursor.fetchall()
        print("\nUpdated user roles:")
        for role, count in results:
            print(f"  - {role}: {count} users")
        
    except Exception as e:
        print(f"Error updating users: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    make_all_users_admin()