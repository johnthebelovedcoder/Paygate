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
    print(f"Found DATABASE_URL: {DATABASE_URL}")

# Remove asyncpg and pgbouncer parameters for psycopg2 compatibility
# Parse the connection string properly
try:
    if DATABASE_URL.startswith('postgresql+asyncpg://'):
        # Extract credentials from the PostgreSQL URL
        # Format: postgresql+asyncpg://user:password@host:port/database?params
        db_url = DATABASE_URL.replace('postgresql+asyncpg://', '')
        
        # Split into credentials and host parts
        credentials_part, rest = db_url.split('@', 1)
        username, password = credentials_part.split(':', 1)
        
        # Split host:port/database?params
        host_part, database_part = rest.split('/', 1)
        host, port_str = host_part.split(':', 1)
        
        # Remove pgbouncer and other parameters
        if '?' in database_part:
            database, _ = database_part.split('?', 1)
        else:
            database = database_part
            
        print(f"Connecting to database: {database}")
        print(f"Host: {host}:{port_str}")
        print(f"User: {username}")
        
        # Connect using psycopg2
        connection = psycopg2.connect(
            user=username,
            password=password,
            host=host,
            port=port_str,
            dbname=database
        )
        print("[SUCCESS] Connection successful!")
        
        # Create a cursor to execute SQL queries
        cursor = connection.cursor()
        
        # Example query
        cursor.execute("SELECT NOW();")
        result = cursor.fetchone()
        print(f"[INFO] Current Time: {result[0]}")

        # Check if we're connected to the right database
        cursor.execute("SELECT current_database();")
        db_result = cursor.fetchone()
        print(f"[INFO] Connected to database: {db_result[0]}")

        # Get database version
        cursor.execute("SELECT version();")
        version_result = cursor.fetchone()
        print(f"[INFO] Database version: {version_result[0][:50]}...")

        # List tables to verify connection
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 10;")
        tables = cursor.fetchall()
        if tables:
            print(f"[INFO] Tables in database: {len(tables)} found")
            for i, table in enumerate(tables[:5]):  # Show first 5 tables
                print(f"   - {table[0]}")
            if len(tables) > 5:
                print(f"   ... and {len(tables) - 5} more tables")
        else:
            print("[INFO] No tables found in 'public' schema")

        # Close the cursor and connection
        cursor.close()
        connection.close()
        print("[SUCCESS] Connection closed successfully.")

except Exception as e:
    print(f"[ERROR] Failed to connect: {e}")
    print("\n[INFO] This is likely due to one of the following reasons:")
    print("   1. Network restrictions preventing connection to Supabase")
    print("   2. Invalid credentials in your .env file")
    print("   3. Supabase project is paused or inaccessible")
    print("   4. Firewall or security settings blocking the connection")
    print("   5. IPv4/IPv6 compatibility issues (as mentioned in your documentation)")
    
    # Try direct connection without pgbouncer parameters for comparison
    print("\n[INFO] Attempting direct connection (without pgbouncer)...")
    try:
        if 'pgbouncer=true' in DATABASE_URL:
            direct_url = DATABASE_URL.replace('?pgbouncer=true', '').replace('&pgbouncer=true', '')
            print(f"[INFO] Using direct URL: {direct_url}")
            
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
            print("[SUCCESS] Direct connection successful!")
            connection.close()
    except Exception as direct_e:
        print(f"[ERROR] Direct connection also failed: {direct_e}")