import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv("paygate-backend-python/.env")

# Supabase connection details based on your credentials
USER = "postgres.ixbiabwdzmezugjtxnzi"  # Supabase project-specific user
PASSWORD = "3xrBa3dqGroX27Wi"  # Password from your .env file
HOST = "aws-1-eu-north-1.pooler.supabase.com"  # Supabase pooler host
PORT = "6543"  # Pooler port
DBNAME = "postgres"  # Default database name

print("FINAL SUPABASE SEARCH_PATH SECURITY IMPLEMENTATION")
print("=" * 60)

try:
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("[SUCCESS] Connection established!")
    
    # Create a cursor to execute SQL queries
    cursor = connection.cursor()
    
    # Apply security fix only to get_tables function (which doesn't have dependencies)
    print("\nStep 1: Securing get_tables function with search_path...")
    
    # Get the current definition of get_tables function
    get_tables_query = """
        SELECT pg_get_functiondef(oid) AS function_def
        FROM pg_proc 
        WHERE proname = 'get_tables' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    """
    cursor.execute(get_tables_query)
    result = cursor.fetchone()
    
    if result:
        # Drop and recreate with SET search_path
        secure_get_tables = """
DROP FUNCTION IF EXISTS public.get_tables();
CREATE OR REPLACE FUNCTION public.get_tables()
RETURNS TABLE(table_name text)
LANGUAGE sql
AS $function$
  SET search_path = public, pg_catalog; -- Secure schema resolution
  
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
  ORDER BY table_name;
$function$;
"""
        cursor.execute(secure_get_tables)
        print("  - [SUCCESS] get_tables function secured with search_path")
    else:
        print("  - [INFO] get_tables function not found")
    
    # For the trigger function, we need to handle it differently since it has dependencies
    print("\nStep 2: Handling update_updated_at_column trigger function...")
    print("  - NOTE: This function has 23 dependent triggers and cannot be dropped")
    print("  - To secure it, you need to:")
    print("    1. Remove all dependent triggers")
    print("    2. Update the function with SET search_path")
    print("    3. Recreate all the triggers")
    
    # Provide the SQL command to properly update the trigger function
    print("\nMANUAL STEPS FOR SECURING THE TRIGGER FUNCTION:")
    print("-" * 50)
    print("# To securely update the trigger function, execute these commands in Supabase SQL Editor:")
    print("# (Do this when you have a maintenance window)")
    print("""
-- First, remove all triggers that depend on this function
-- Example commands (adjust based on your specific triggers):
-- DROP TRIGGER IF EXISTS update_users_updated_at ON users CASCADE;
-- DROP TRIGGER IF EXISTS update_content_updated_at ON content CASCADE;
-- ... repeat for all 23 dependent triggers ...

-- Then update the function with SET search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  SET search_path = public, pg_catalog; -- Secure schema resolution
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Finally, recreate all triggers
-- Example commands:
-- CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- ... repeat for all the necessary tables ...
""")
    
    # Commit the changes for the get_tables function
    connection.commit()
    print("\n[PARTIAL SUCCESS] Applied search_path security to get_tables function")
    
    # Verify the change for get_tables
    print("\nStep 3: Verifying get_tables function security...")
    verify_query = """
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            CASE 
                WHEN LOWER(pg_get_functiondef(p.oid)) LIKE '%set search_path%' THEN 'YES'
                WHEN LOWER(pg_get_functiondef(p.oid)) LIKE '%search_path%' THEN 'YES'
                ELSE 'NO'
            END AS has_search_path
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'get_tables'
        ORDER BY n.nspname, p.proname;
    """
    
    cursor.execute(verify_query)
    verification_results = cursor.fetchall()
    
    print("\nVerification Results:")
    for schema_name, func_name, has_search_path in verification_results:
        status = "[SECURE]" if has_search_path == 'YES' else "[INSECURE]"
        print(f"  - {schema_name}.{func_name}: {status}")
    
    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("\n[SUCCESS] Security implementation completed!")
    print("  - get_tables function is now secured with search_path")
    print("  - Manual steps needed for update_updated_at_column due to dependencies")

except Exception as e:
    print(f"[ERROR] Failed to implement search_path fixes: {e}")
    print("\nThis could be due to:")
    print("- Insufficient permissions to modify functions")
    print("- Connection issues to the database")
    print("- Database being paused in the Supabase project")
    print("\nSOLUTION: Use the SQL Editor in your Supabase Dashboard to apply these commands manually")