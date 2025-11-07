import psycopg2
from dotenv import load_dotenv
import os
import urllib.parse

# Load the DATABASE_URL from the backend .env file
env_path = 'paygate-backend-python/.env'
with open(env_path, 'r') as f:
    for line in f:
        if line.startswith('DATABASE_URL='):
            DATABASE_URL = line.strip().split('=', 1)[1].replace('"', '').replace("'", "")
            break

# Parse the direct URL
if 'pgbouncer=true' in DATABASE_URL:
    direct_url = DATABASE_URL.replace('?pgbouncer=true', '').replace('&pgbouncer=true', '')
else:
    direct_url = DATABASE_URL

parsed = urllib.parse.urlparse(direct_url.replace('postgresql+asyncpg://', 'postgresql://'))
username = parsed.username
password = parsed.password
host = parsed.hostname
port = parsed.port or 5432
database = parsed.path.lstrip('/')

connection = psycopg2.connect(
    user=username,
    password=password,
    host=host,
    port=port,
    dbname=database
)

cursor = connection.cursor()

print('=== ANALYZING USERS TABLES IN ALL SCHEMAS ===')

# Check for users tables across schemas
print('Looking for users tables...')
cursor.execute("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'users' ORDER BY table_schema;")
user_tables = cursor.fetchall()

print(f'Found {len(user_tables)} users tables:')
for schema, table_name in user_tables:
    print(f'  Schema: {schema}, Table: {table_name}')
    
    print(f'\\n--- {schema}.{table_name} Structure ---')
    cursor.execute("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = %s AND table_name = %s ORDER BY ordinal_position;", (schema, table_name))
    columns = cursor.fetchall()
    for i, col in enumerate(columns[:15]):  # Show first 15 columns
        print(f'  {i+1:2d} {col[0]:25s} | {col[1]:15s} | Nullable: {col[2]:3s} | Default: {col[3]}')
    if len(columns) > 15:
        print(f'  ... and {len(columns) - 15} more columns')

if not user_tables:
    print('No users tables found in any schema')
    
print('\\n=== ANALYZING CUSTOMERS TABLE FOREIGN KEY ===')
cursor.execute("""SELECT kcu.column_name, ccu.table_name AS foreign_table_name, 
                 ccu.column_name AS foreign_column_name 
                 FROM information_schema.table_constraints AS tc 
                 JOIN information_schema.key_column_usage AS kcu 
                   ON tc.constraint_name = kcu.constraint_name 
                   AND tc.table_schema = kcu.table_schema 
                 JOIN information_schema.constraint_column_usage AS ccu 
                   ON ccu.constraint_name = tc.constraint_name 
                   AND ccu.table_schema = tc.table_schema 
                 WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='customers';""")
fks = cursor.fetchall()
for fk in fks:
    print(f'  {fk[0]} -> {fk[1]}.{fk[2]}')

print('\\n=== EXAMINING THE RELATIONSHIP ===')
# Let's check the exact foreign key constraint
try:
    cursor.execute("""
        SELECT 
            tc.constraint_name,
            tc.table_name, 
            kcu.column_name, 
            ccu.table_schema AS foreign_table_schema,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name = 'customers' OR ccu.table_name = 'users');
    """)
    constraints = cursor.fetchall()
    for constraint in constraints:
        print(f'  Constraint: {constraint[0]}: {constraint[1]}.{constraint[2]} -> {constraint[3]}.{constraint[4]}.{constraint[5]}')
except Exception as e:
    print(f'Error checking constraints: {e}')

cursor.close()
connection.close()
print('\\n=== ANALYSIS COMPLETE ===')