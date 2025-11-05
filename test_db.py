import sqlite3
import os

print('Current directory:', os.getcwd())
print('Files in current directory:', os.listdir('.'))

if os.path.exists('paygate.db'):
    print('Database file exists')
    try:
        conn = sqlite3.connect('paygate.db')
        cursor = conn.cursor()
        cursor.execute('SELECT name FROM sqlite_master WHERE type="table";')
        tables = cursor.fetchall()
        print('Tables in database:', tables)
        
        # Check for users table specifically
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
        user_table = cursor.fetchone()
        if user_table:
            print('Users table exists')
            cursor.execute('SELECT COUNT(*) FROM users;')
            count = cursor.fetchone()[0]
            print(f'Number of users: {count}')
            
            # Check for admin user
            cursor.execute("SELECT id, email, hashed_password FROM users WHERE email='admin@example.com';")
            admin = cursor.fetchone()
            if admin:
                print(f'Admin user found: ID={admin[0]}, Email={admin[1]}, Hash Length={len(admin[2]) if admin[2] else 0}')
            else:
                print('Admin user not found')
        else:
            print('Users table does not exist')
        
        conn.close()
    except Exception as e:
        print('Error connecting to database:', str(e))
else:
    print('Database file does not exist')