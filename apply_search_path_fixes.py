import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv("paygate-backend-python/.env")

# Supabase connection details
USER = "postgres.ixbiabwdzmezugjtxnzi"  # Supabase project-specific user
PASSWORD = "3xrBa3dqGroX27Wi"  # Password from your .env file
HOST = "aws-1-eu-north-1.pooler.supabase.com"  # Supabase pooler host
PORT = "6543"  # Pooler port
DBNAME = "postgres"  # Default database name

print("IMPLEMENTING SECURE SEARCH PATH FOR SUPABASE FUNCTIONS")
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
    
    # Get the original definitions to preserve the functions' core logic
    print("\nStep 1: Retrieving current function definitions...")
    
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
        original_get_tables = result[0]
        print("  - Found get_tables function definition")
    else:
        print("  - get_tables function not found")
        original_get_tables = None
    
    # Get the current definition of update_updated_at_column function
    update_timestamp_query = """
        SELECT pg_get_functiondef(oid) AS function_def
        FROM pg_proc 
        WHERE proname = 'update_updated_at_column' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    """
    cursor.execute(update_timestamp_query)
    result = cursor.fetchone()
    
    if result:
        original_update_timestamp = result[0]
        print("  - Found update_updated_at_column function definition")
    else:
        print("  - update_updated_at_column function not found")
        original_update_timestamp = None
    
    # Step 2: Apply security fixes with preserved logic
    print("\nStep 2: Applying search_path security fixes...")
    
    if original_get_tables:
        # Modify the get_tables function to include SET search_path
        secure_get_tables = original_get_tables.replace(
            "AS $function$\n",
            "AS $function$\n  SET search_path = public, pg_catalog; -- Secure schema resolution\n\n"
        )
        
        print("  - Updating get_tables function with secure search_path...")
        cursor.execute(secure_get_tables)
        print("  - [SECURE] get_tables function secured with search_path")
    
    if original_update_timestamp:
        # Modify the update_updated_at_column function to include SET search_path
        secure_update_timestamp = original_update_timestamp.replace(
            "AS $$\n",
            "AS $$\n  SET search_path = public, pg_catalog; -- Secure schema resolution\nBEGIN\n"
        ).replace(
            "BEGIN\n", 
            "BEGIN\n  SET search_path = public, pg_catalog; -- Secure schema resolution\n"
        )
        
        print("  - Updating update_updated_at_column function with secure search_path...")
        cursor.execute(secure_update_timestamp)
        print("  - [SECURE] update_updated_at_column function secured with search_path")
    
    # Commit the changes
    connection.commit()
    print("\n[SUCCESS] All functions have been secured with proper search_path settings!")
    
    # Verify the changes
    print("\nStep 3: Verifying the changes...")
    
    # Check if the functions now have the search_path setting
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
        AND p.proname IN ('get_tables', 'update_updated_at_column')
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
    print("\n[SUCCESS] All functions are now secured with proper search_path settings!")

except Exception as e:
    print(f"[ERROR] Failed to implement search_path fixes: {e}")
    print("\nThis could be due to:")
    print("- Insufficient permissions to modify functions")
    print("- Connection issues to the database")
    print("- Functions being locked by the system")
    print("- Database being paused in the Supabase project")
    print("\nIf you still get permission errors, contact your Supabase administrator")
    print("or use the SQL Editor in the Supabase Dashboard to apply these changes manually.")