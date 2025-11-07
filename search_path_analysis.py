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

print("COMPREHENSIVE SEARCH_PATH SECURITY ANALYSIS")
print("=" * 60)

try:
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("[SUCCESS] Connected to Supabase database!")
    
    # Create a cursor to execute SQL queries
    cursor = connection.cursor()
    
    # Query to find all functions without search_path setting
    all_functions_query = """
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS arguments,
            CASE 
                WHEN LOWER(pg_get_functiondef(p.oid)) LIKE '%set search_path%' THEN 'SECURE'
                WHEN LOWER(pg_get_functiondef(p.oid)) LIKE '%search_path%' THEN 'SECURE'
                ELSE 'INSECURE'
            END AS security_status
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.prokind = 'f'  -- Only functions (not procedures)
        AND n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')  -- Exclude system schemas
        ORDER BY n.nspname, p.proname;
    """
    
    cursor.execute(all_functions_query)
    all_functions = cursor.fetchall()
    
    print(f"\n[INFO] Found {len(all_functions)} total functions")
    
    # Separate secure and insecure functions
    secure_functions = [f for f in all_functions if f[3] == 'SECURE']
    insecure_functions = [f for f in all_functions if f[3] == 'INSECURE']
    
    print(f"[INFO] Secure functions: {len(secure_functions)}")
    print(f"[INFO] Insecure functions: {len(insecure_functions)}")
    
    # Show details about insecure functions
    if insecure_functions:
        print(f"\nINSECURE FUNCTIONS (without search_path):")
        print("-" * 50)
        for schema_name, func_name, arguments, security_status in insecure_functions:
            print(f"  - {schema_name}.{func_name}({arguments})")
    
    # Focus on functions in public schema specifically
    public_insecure_query = """
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS arguments,
            pg_get_functiondef(p.oid) AS function_def
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'  -- Only public schema
        AND p.prokind = 'f'  -- Only functions
        AND LOWER(pg_get_functiondef(p.oid)) NOT LIKE '%set search_path%'
        AND LOWER(pg_get_functiondef(p.oid)) NOT LIKE '%search_path%'
        ORDER BY p.proname;
    """
    
    cursor.execute(public_insecure_query)
    public_insecure_functions = cursor.fetchall()
    
    print(f"\n[INFO] Public schema functions without search_path: {len(public_insecure_functions)}")
    
    if public_insecure_functions:
        print("\nINSECURE PUBLIC FUNCTIONS (NEED TO BE SECURED):")
        print("-" * 50)
        for schema_name, func_name, arguments, func_def in public_insecure_functions:
            print(f"  - {schema_name}.{func_name}({arguments})")
            print(f"    Function Definition Preview:")
            # Show first 200 characters of the function
            preview = func_def[:200] + "..." if len(func_def) > 200 else func_def
            print(f"    {preview}")
            print()
    
    # Also check trigger functions in public schema
    trigger_functions_query = """
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS arguments,
            CASE 
                WHEN LOWER(pg_get_functiondef(p.oid)) LIKE '%set search_path%' THEN 'SECURE'
                WHEN LOWER(pg_get_functiondef(p.oid)) LIKE '%search_path%' THEN 'SECURE'
                ELSE 'INSECURE'
            END AS security_status,
            pg_get_functiondef(p.oid) AS function_def
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'  -- Only public schema
        AND p.prorettype::regtype = 'trigger'::regtype  -- Only trigger functions
        ORDER BY p.proname;
    """
    
    cursor.execute(trigger_functions_query)
    trigger_functions = cursor.fetchall()
    
    insecure_triggers = [t for t in trigger_functions if t[3] == 'INSECURE']
    
    print(f"\n[INFO] Trigger functions: {len(trigger_functions)}, Insecure: {len(insecure_triggers)}")
    
    if insecure_triggers:
        print("\nINSECURE TRIGGER FUNCTIONS (NEED TO BE SECURED):")
        print("-" * 50)
        for schema_name, func_name, arguments, security_status, func_def in insecure_triggers:
            print(f"  - {schema_name}.{func_name}({arguments})")
            print(f"    Status: {security_status}")
            print(f"    Function Definition Preview:")
            preview = func_def[:200] + "..." if len(func_def) > 200 else func_def
            print(f"    {preview}")
            print()
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY:")
    print(f"- Total functions in database: {len(all_functions)}")
    print(f"- Secure functions: {len(secure_functions)}")
    print(f"- Insecure functions: {len(insecure_functions)}")
    print(f"- Public schema insecure functions: {len(public_insecure_functions)}")
    print(f"- Insecure trigger functions: {len(insecure_triggers)}")
    print("=" * 60)
    
    # Provide recommendations
    if insecure_functions or insecure_triggers:
        print("\nRECOMMENDATIONS:")
        print("  1. For public schema functions, add SET search_path to secure them")
        print("  2. Example secure pattern: SET search_path = public, pg_catalog;")
        print("  3. For triggers, include SET search_path in the function body")
        print("  4. Be careful not to modify Supabase system functions")
        print("  5. Test security changes in a development environment first")
    else:
        print("\n[SUCCESS] All functions appear to have proper search_path settings!")
    
    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("\n[SUCCESS] Database analysis completed!")

except Exception as e:
    print(f"[ERROR] Failed to connect or query functions: {e}")
    print("\nThis could be due to:")
    print("- Incorrect credentials")
    print("- Insufficient permissions to inspect function definitions")
    print("- Network/firewall restrictions")
    print("- Database being paused in the Supabase project")
    print("- IPv4/IPv6 compatibility issues")