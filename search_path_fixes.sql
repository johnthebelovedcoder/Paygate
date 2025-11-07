/*
SEARCH PATH FIXES FOR SUPABASE FUNCTIONS
=======================================
These SQL commands can be run in the Supabase SQL Editor.
They will apply search_path settings to functions for security.
*/

-- 1. Fix the custom function in public schema: get_tables()
DROP FUNCTION IF EXISTS public.get_tables();

CREATE OR REPLACE FUNCTION public.get_tables()
RETURNS TABLE(table_name text)
LANGUAGE sql
AS $function$
  SET search_path = public;
  
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
  ORDER BY table_name;
$function$;

-- 2. Fix the public schema updated_at trigger function
-- First drop the existing function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate with proper search_path setting
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  SET search_path = public;  -- Secure schema resolution
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3. Fix the auth functions (these are safe to modify as they're basic utility functions)
DROP FUNCTION IF EXISTS auth.email();

CREATE OR REPLACE FUNCTION auth.email()
RETURNS text
LANGUAGE sql
STABLE
AS $function$
  SET search_path = auth, public;
  
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$function$;

DROP FUNCTION IF EXISTS auth.jwt();

CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $function$
  SET search_path = auth, public;
  
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$function$;

DROP FUNCTION IF EXISTS auth.role();

CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql
STABLE
AS $function$
  SET search_path = auth, public;
  
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$function$;

DROP FUNCTION IF EXISTS auth.uid();

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $function$
  SET search_path = auth, public;
  
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$function$;

-- 4. Fix some storage utility functions
DROP FUNCTION IF EXISTS storage.get_level(name text);

CREATE OR REPLACE FUNCTION storage.get_level(name text)
RETURNS integer
LANGUAGE sql
IMMUTABLE STRICT
AS $function$
  SET search_path = storage, public;
  
SELECT array_length(string_to_array("name", '/'), 1);
$function$;

DROP FUNCTION IF EXISTS storage.get_prefix(name text);

CREATE OR REPLACE FUNCTION storage.get_prefix(name text)
RETURNS text
LANGUAGE sql
IMMUTABLE STRICT
AS $function$
  SET search_path = storage, public;
  
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$function$;

DROP FUNCTION IF EXISTS storage.to_regrole(role_name text);
CREATE OR REPLACE FUNCTION storage.to_regrole(role_name text)
RETURNS regrole
LANGUAGE sql
IMMUTABLE
AS $function$
  SET search_path = storage, public;
 select role_name::regrole $function$;

-- 5. Fix some realtime utility functions
DROP FUNCTION IF EXISTS realtime.topic();

CREATE OR REPLACE FUNCTION realtime.topic()
RETURNS text
LANGUAGE sql
STABLE
AS $function$
  SET search_path = realtime, public;
  
select nullif(current_setting('realtime.topic', true), '')::text;
$function$;

/*
IMPORTANT SAFETY NOTES:
1. The above functions are relatively safe to modify as they are basic utility functions
2. System functions (like extensions.*, vault.*) should NOT be modified as they're core Supabase functionality
3. Only apply these changes in development first and test thoroughly
4. Backup your database before applying to production
5. Monitor for any unexpected behavior after applying these changes
6. For functions that depend on other database objects, ensure dependencies are in the specified search_path
*/

-- Verification query to confirm the applied functions have search_path settings
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    CASE 
        WHEN LOWER(pg_get_functiondef(p.oid)) LIKE '%set search_path%' THEN 'YES'
        ELSE 'NO'
    END AS has_search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'auth', 'storage', 'realtime', 'graphql_public', 'graphql')
AND p.prokind = 'f'
ORDER BY n.nspname, p.proname;