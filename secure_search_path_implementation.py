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

print("SECURE SEARCH PATH IMPLEMENTATION FOR SUPABASE FUNCTIONS")
print("=" * 70)
print("This script identifies functions with insecure search_path configuration")
print("and provides secure implementations for custom functions")
print("=" * 70)

try:
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("[SUCCESS] Connection successful!")
    
    # Create a cursor to execute SQL queries
    cursor = connection.cursor()
    
    # Query to find CUSTOM functions that don't have search_path set
    # Focus only on functions in the 'public' schema (custom functions)
    query_custom_functions_without_search_path = """
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS arguments,
            pg_get_functiondef(p.oid) AS function_definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'  -- Only focus on custom functions in public schema
        AND p.prokind = 'f'  -- Only functions (not procedures)
        AND p.prorettype::regtype != 'trigger'::regtype  -- Exclude trigger functions
        AND LOWER(pg_get_functiondef(p.oid)) NOT LIKE '%set search_path%'
        AND LOWER(pg_get_functiondef(p.oid)) NOT LIKE '%search_path%'
        ORDER BY n.nspname, p.proname;
    """
    
    cursor.execute(query_custom_functions_without_search_path)
    custom_functions_without_search_path = cursor.fetchall()
    
    print(f"\n[FOUND] {len(custom_functions_without_search_path)} custom functions in 'public' schema without search_path setting")
    
    # Generate secure implementations for only the custom functions
    if custom_functions_without_search_path:
        print(f"\nSECURE IMPLEMENTATIONS FOR CUSTOM FUNCTIONS:")
        print("-" * 50)
        
        for schema_name, func_name, args, definition in custom_functions_without_search_path:
            print(f"-- Securing custom function: {schema_name}.{func_name}({args})")
            
            # For custom functions in public schema, provide secure implementation
            if func_name == 'get_tables':
                # Example implementation for get_tables function
                print(f"""
-- Secure implementation for {func_name}
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
""")
            elif func_name == 'update_updated_at_column':
                # Example implementation for trigger function
                print(f"""
-- Secure implementation for {func_name} (trigger function)
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
""")
            else:
                # Generic secure implementation template
                print(f"""
-- Template for securing {schema_name}.{func_name}({args})
-- IMPORTANT: Manually implement based on your original function logic
-- Add SET search_path to your original function:
/*
Original function would be modified to include:
SET search_path = public, pg_catalog; -- or appropriate schemas
at the beginning of the function body
*/
""")
            
            print()
    
    # Check for trigger functions in public schema
    trigger_query = """
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS arguments,
            pg_get_functiondef(p.oid) AS function_definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'  -- Only in public schema
        AND p.prorettype::regtype = 'trigger'::regtype  -- Only trigger functions
        AND LOWER(pg_get_functiondef(p.oid)) NOT LIKE '%set search_path%'
        AND LOWER(pg_get_functiondef(p.oid)) NOT LIKE '%search_path%'
        ORDER BY n.nspname, p.proname;
    """
    
    cursor.execute(trigger_query)
    trigger_functions = cursor.fetchall()
    
    if trigger_functions:
        print(f"\n[FOUND] {len(trigger_functions)} trigger functions without search_path setting")
        print("SECURE IMPLEMENTATIONS FOR TRIGGER FUNCTIONS:")
        print("-" * 50)
        
        for schema_name, func_name, args, definition in trigger_functions:
            print(f"-- Securing trigger function: {schema_name}.{func_name}({args})")
            print(f"""
-- Secure implementation for trigger function {func_name}
CREATE OR REPLACE FUNCTION {schema_name}.{func_name}()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  SET search_path = {schema_name}, public, pg_catalog; -- Secure schema resolution
  -- Your original trigger logic here
  RETURN NEW;  -- or appropriate return value
END;
$$;
""")
    
    # Identify system functions that should NOT be modified
    system_functions_query = """
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS arguments
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname IN ('auth', 'storage', 'realtime', 'graphql', 'extensions')
        AND p.prokind = 'f'  -- Only functions
        AND LOWER(pg_get_functiondef(p.oid)) NOT LIKE '%set search_path%'
        AND LOWER(pg_get_functiondef(p.oid)) NOT LIKE '%search_path%'
        ORDER BY n.nspname, p.proname
        LIMIT 10;  -- Limit to sample
    """
    
    cursor.execute(system_functions_query)
    system_functions = cursor.fetchall()
    
    print(f"\n[NOTE] System functions (auth, storage, etc.) also lack search_path settings")
    print("These are Supabase core functions and should generally NOT be modified")
    print("unless you specifically need to customize their behavior.")
    
    if system_functions:
        print("\nExamples of system functions that would need modification (if at all):")
        for schema_name, func_name, args in system_functions:
            print(f"  - {schema_name}.{func_name}({args})")
    
    print(f"\nSUMMARY:")
    print(f"- Custom functions in 'public' schema: {len(custom_functions_without_search_path)} need securing")
    print(f"- Custom trigger functions: {len(trigger_functions)} need securing") 
    print(f"- System functions: Should generally NOT be modified")
    print(f"\nRECOMMENDATION:")
    print(f"1. Apply secure implementations only to functions you control in 'public' schema")
    print(f"2. Add SET search_path to your custom functions for security")
    print(f"3. For system functions, rely on Supabase's built-in security")
    print(f"4. Example secure pattern: SET search_path = your_schema, public, pg_catalog;")
    
    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("\n[SUCCESS] Analysis complete. Connection closed.")

except Exception as e:
    print(f"[ERROR] Failed to connect or query functions: {e}")
    print("\nThis could be due to:")
    print("- Incorrect credentials")
    print("- Insufficient permissions to inspect function definitions")
    print("- Network/firewall restrictions")
    print("- Database being paused in the Supabase project")