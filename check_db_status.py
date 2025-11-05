import os
print('Checking paygate.db in current directory')
print('Current working directory:', os.getcwd())
print('Files in directory:', os.listdir('.'))

import sqlite3
conn = sqlite3.connect('paygate.db')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type="table";')
tables = cursor.fetchall()
print(f'Tables in database: {tables}')

if tables:  # If there are tables
    if any('users' in table[0] for table in tables):
        cursor.execute('SELECT COUNT(*) FROM users;')
        user_count = cursor.fetchone()[0]
        print(f'Number of users: {user_count}')
        if user_count > 0:
            cursor.execute('SELECT id, email FROM users LIMIT 5;')
            users = cursor.fetchall()
            for user in users:
                print(f'User: ID={user[0]}, Email={user[1]}')
else:
    print('No tables in database')

conn.close()