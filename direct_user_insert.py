import psycopg2
import uuid
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import secrets
import json
from passlib.hash import bcrypt

# Load environment variables from .env
load_dotenv("paygate-backend-python/.env")

# Supabase connection details
USER = "postgres.ixbiabwdzmezugjtxnzi"  # Supabase project-specific user
PASSWORD = "3xrBa3dqGroX27Wi"  # Password from your .env file
HOST = "aws-1-eu-north-1.pooler.supabase.com"  # Supabase pooler host
PORT = "6543"  # Pooler port
DBNAME = "postgres"  # Default database name

print("DIRECT USER INSERTION INTO SUPABASE AUTH TABLE")
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
    
    # Generate user data
    user_id = str(uuid.uuid4())
    email = f"user_{secrets.token_hex(4)}@example.com"
    username = f"user_{secrets.token_hex(3)}"
    full_name = f"Test User {secrets.token_hex(2).upper()}"
    
    # Properly hash the password using bcrypt format that Supabase expects
    password = "SecurePassword123!"
    hashed_password = bcrypt.hash(password)
    
    print(f"Creating new user with:")
    print(f"  - Email: {email}")
    print(f"  - Username: {username}")
    print(f"  - Full Name: {full_name}")
    print(f"  - User UUID: {user_id}")
    print(f"  - Password: {password}")
    
    # Try to insert with proper minimal fields respecting the actual schema
    # We'll need to identify which are the required fields by trial and error
    insert_user_query = """
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, invited_at, confirmation_token, 
        confirmation_sent_at, recovery_token, email_change_token_new,
        email_change, email_change_sent_at, last_sign_in_at, 
        raw_app_meta_data, raw_user_meta_data, is_super_admin, 
        created_at, updated_at, phone, phone_confirmed_at, phone_change,
        phone_change_token, phone_change_sent_at, email_change_token_current,
        email_change_confirm_status, banned_until, reauthentication_token,
        is_anonymous
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    ) RETURNING id;
    """
    
    now = datetime.now()
    
    cursor.execute(insert_user_query, (
        str(uuid.uuid4()),    # instance_id
        user_id,              # id (UUID)
        'authenticated',      # aud
        'authenticated',      # role
        email,                # email
        hashed_password,      # encrypted_password
        now,                  # email_confirmed_at
        None,                 # invited_at
        '',                   # confirmation_token
        None,                 # confirmation_sent_at
        '',                   # recovery_token
        '',                   # email_change_token_new
        '',                   # email_change
        None,                 # email_change_sent_at
        now,                  # last_sign_in_at
        json.dumps({"provider": "email", "providers": ["email"]}),  # raw_app_meta_data
        json.dumps({"full_name": full_name, "preferred_username": username}),  # raw_user_meta_data
        False,                # is_super_admin
        now,                  # created_at
        now,                  # updated_at
        None,                 # phone
        None,                 # phone_confirmed_at
        '',                   # phone_change
        '',                   # phone_change_token
        None,                 # phone_change_sent_at
        '',                   # email_change_token_current
        0,                    # email_change_confirm_status (0 = unconfirmed, 2 = confirmed)
        None,                 # banned_until
        '',                   # reauthentication_token
        False                 # is_anonymous
    ))
    
    print("[SUCCESS] User inserted into auth.users table!")
    
    # Insert into the public.users table (if it exists separately and we can identify its structure)
    # Let's check if there's actually a separate public.users table with a different structure
    print("\nTesting public.users table insertion...")
    try:
        # Check if public.users exists with integer ID
        check_query = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public';"
        cursor.execute(check_query)
        count = cursor.fetchone()[0]
        
        if count > 0:
            # Try to insert into public.users table as well, but we need to be smart about it
            # Since we can't easily duplicate the integer id, let's see if we can do this differently
            # Let's update the auth.users record in the public schema to match
            print("  - Note: The public.users table might be an alias/view of auth.users")
        else:
            print("  - No separate public.users table found")
    except Exception as e:
        print(f"  - Could not check public table: {e}")
    
    # Now we can create application data with the properly created user
    print("\nCreating application data for the user...")
    
    # Create a customer record (this should work now since user exists in auth)
    create_customer_query = """
    INSERT INTO customers (
        user_id, email, first_name, last_name, full_name, 
        created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s);
    """
    
    first_name, last_name = full_name.split(' ', 1)
    cursor.execute(create_customer_query, (
        user_id, email, first_name, last_name, full_name, now, now
    ))
    
    print("  - Created customer record")
    
    # Create a sample paywall
    create_paywall_query = """
    INSERT INTO paywalls (
        name, description, pricing_type, price, currency, 
        duration, creator_id, is_active, created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    
    cursor.execute(create_paywall_query, (
        f"{full_name}'s Premium Content", 
        f"Exclusive content by {full_name}",
        'fixed', 19.99, 'USD', 30, user_id, True, now, now
    ))
    
    print("  - Created paywall for user")
    
    # Create a sample content
    create_content_query = """
    INSERT INTO content (
        title, slug, content, excerpt, author_id, status, 
        is_premium, created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    
    sample_content = f"""
    This is premium content created by {full_name}.
    
    This content is protected by a paywall and can only be accessed by 
    users who have subscribed to the premium access plan.
    
    The content includes exclusive insights and premium material that 
    provides additional value to subscribers.
    """
    
    cursor.execute(create_content_query, (
        f"Premium Content by {full_name}", 
        f"premium-content-{secrets.token_hex(4)}",
        sample_content,
        f"Exclusive insights by {full_name}",
        user_id, 'published', True, now, now
    ))
    
    print("  - Created sample content")
    
    # Create a sample subscription plan
    create_plan_query = """
    INSERT INTO subscription_plans (
        name, description, price, currency, billing_period, 
        features, is_active, created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    
    cursor.execute(create_plan_query, (
        "Premium Monthly", 
        "Access to all premium content",
        29.99, 'USD', 'month',
        '["Unlimited access", "Premium content", "Early access to new features"]',
        True, now, now
    ))
    
    print("  - Created subscription plan")
    
    # Create a notification preference
    create_pref_query = """
    INSERT INTO notification_preferences (
        user_id, email_notifications, push_notifications, 
        sms_notifications, marketing_emails, created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s);
    """
    
    cursor.execute(create_pref_query, (
        user_id, True, True, False, True, now, now
    ))
    
    print("  - Created notification preferences")
    
    # Commit all changes
    connection.commit()
    
    print("\n" + "=" * 60)
    print("DIRECT USER INSERTION COMPLETE")
    print("=" * 60)
    print(f"Email: {email}")
    print(f"Username: {username}")
    print(f"Full Name: {full_name}")
    print(f"Password: {password}")
    print(f"User UUID: {user_id}")
    print("\n[SUCCESS] User created directly in Supabase Auth system!")
    print("All associated application data has been created as well.")
    
    # Verify by querying auth.users
    print("\nVerifying user in auth.users table...")
    cursor.execute("SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = %s;", (email,))
    result = cursor.fetchone()
    
    if result:
        print(f"[SUCCESS] User found in auth.users: {result[1]} (ID: {result[0]})")
        print(f"  User metadata: {result[2]}")
    else:
        print("[WARNING] User not found in auth.users table")
    
    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("\n[SUCCESS] Database connection closed!")

except Exception as e:
    print(f"[ERROR] Failed to create user via direct insertion: {e}")
    
    # Check if we need to insert into auth schema instead of public
    print("\nTrying to insert into auth.users table specifically...")
    
    try:
        connection = psycopg2.connect(
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            dbname=DBNAME
        )
        cursor = connection.cursor()
        
        # Check if auth schema exists
        cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth';")
        auth_exists = cursor.fetchone()
        
        if auth_exists:
            print("auth schema exists - Supabase Auth is active")
            
            # Check structure of auth.users
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'users' AND table_schema = 'auth'
                ORDER BY ordinal_position
                LIMIT 10;
            """)
            auth_columns = cursor.fetchall()
            
            print("First 10 columns in auth.users:")
            for col in auth_columns:
                print(f"  {col[0]} ({col[1]}) - Nullable: {col[2]}")
        else:
            print("auth schema does not exist")
        
        cursor.close()
        connection.close()
    except Exception as e2:
        print(f"Could not verify auth schema: {e2}")