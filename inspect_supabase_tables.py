import psycopg2
from dotenv import load_dotenv
import os
import urllib.parse

# Use the database URL from the backend .env file
env_path = os.path.join('paygate-backend-python', '.env')
if os.path.exists(env_path):
    # Read the DATABASE_URL directly from the backend .env file
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('DATABASE_URL='):
                DATABASE_URL = line.strip().split('=', 1)[1].replace('"', '').replace("'", "")
                break

# Remove pgbouncer parameters and parse the connection string
try:
    if 'pgbouncer=true' in DATABASE_URL:
        direct_url = DATABASE_URL.replace('?pgbouncer=true', '').replace('&pgbouncer=true', '')
    else:
        direct_url = DATABASE_URL

    # Parse the direct URL
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
    
    print("[SUCCESS] Connection established to Supabase database")
    print(f"[INFO] Database: {database}")
    print(f"[INFO] Host: {host}:{port}")
    
    cursor = connection.cursor()
    
    # Get all tables in the public schema
    print("\n" + "="*60)
    print("TABLES IN DATABASE:")
    print("="*60)
    
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    for i, (table_name,) in enumerate(tables, 1):
        print(f"{i:2d}. {table_name}")
    
    print(f"\n[INFO] Total tables found: {len(tables)}")
    
    # Get detailed info about each table
    print("\n" + "="*60)
    print("TABLE STRUCTURES:")
    print("="*60)
    
    for table_name, in tables:
        print(f"\n--- Structure for table: {table_name} ---")
        cursor.execute(f"""
            SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default
            FROM information_schema.columns 
            WHERE table_name = '{table_name}'
            ORDER BY ordinal_position;
        """)
        
        columns = cursor.fetchall()
        for col in columns:
            col_name, col_type, is_nullable, default_val = col
            nullable_str = "NULL" if is_nullable == 'YES' else "NOT NULL"
            default_str = f" DEFAULT {default_val}" if default_val else ""
            print(f"  - {col_name}: {col_type} {nullable_str}{default_str}")
    
    # Get row counts for each table (if manageable)
    print("\n" + "="*60)
    print("ROW COUNTS:")
    print("="*60)
    
    for table_name, in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM \"{table_name}\";")
            count = cursor.fetchone()[0]
            print(f"  {table_name}: {count} rows")
        except Exception as e:
            print(f"  {table_name}: Could not count rows ({str(e)})")
    
    cursor.close()
    connection.close()
    print("\n[SUCCESS] Database inspection completed successfully!")

except Exception as e:
    print(f"[ERROR] Failed to connect or query: {e}")