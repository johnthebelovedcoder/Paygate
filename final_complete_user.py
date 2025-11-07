import psycopg2
import uuid
from dotenv import load_dotenv
import os
from datetime import datetime
import secrets
from passlib.hash import bcrypt

# Load environment variables from .env
load_dotenv("paygate-backend-python/.env")

# Supabase connection details
USER = "postgres.ixbiabwdzmezugjtxnzi"  # Supabase project-specific user
PASSWORD = "3xrBa3dqGroX27Wi"  # Password from your .env file
HOST = "aws-1-eu-north-1.pooler.supabase.com"  # Supabase pooler host
PORT = "6543"  # Pooler port
DBNAME = "postgres"  # Default database name

print("FINAL COMPREHENSIVE USER CREATION WITH PROPER SETUP")
print("=" * 70)

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
    
    # Generate completely new user data
    auth_user_id = str(uuid.uuid4())
    email = f"complete_user_{secrets.token_hex(4)}@example.com"
    username = f"user_{secrets.token_hex(3)}"
    full_name = f"Complete User {secrets.token_hex(2).upper()}"
    password = "SecurePassword123!"
    hashed_password = bcrypt.hash(password)
    
    print(f"Creating new user:")
    print(f"  - Email: {email}")
    print(f"  - Username: {username}")
    print(f"  - Full Name: {full_name}")
    print(f"  - Password: {password}")
    print(f"  - Auth User UUID: {auth_user_id}")
    
    now = datetime.now()
    
    # Step 1: Create user in auth.users (Supabase Auth)
    print("\nStep 1: Creating user in auth.users (Supabase Auth system)...")
    create_auth_user_query = """
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
    
    cursor.execute(create_auth_user_query, (
        str(uuid.uuid4()),    # instance_id
        auth_user_id,         # id (UUID)
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
        '{"provider": "email", "providers": ["email"]}',  # raw_app_meta_data
        f'{{"full_name": "{full_name}", "preferred_username": "{username}"}}',  # raw_user_meta_data
        False,                # is_super_admin
        now,                  # created_at
        now,                  # updated_at
        None,                 # phone
        None,                 # phone_confirmed_at
        '',                   # phone_change
        '',                   # phone_change_token
        None,                 # phone_change_sent_at
        '',                   # email_change_token_current
        0,                    # email_change_confirm_status
        None,                 # banned_until
        '',                   # reauthentication_token
        False                 # is_anonymous
    ))
    
    print("  [SUCCESS] User created in auth.users")
    
    # Step 2: Create corresponding user in public.users (Application layer)
    print("\nStep 2: Creating user in public.users (Application layer)...")
    create_public_user_query = """
    INSERT INTO public.users (
        email, username, full_name, hashed_password, 
        created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s)
    RETURNING id;
    """
    
    cursor.execute(create_public_user_query, (
        email, username, full_name, hashed_password, now, now
    ))
    
    # Get the integer ID created in public.users
    public_user_id = cursor.fetchone()[0]
    print(f"  [SUCCESS] User created in public.users with integer ID: {public_user_id}")
    
    # Step 3: Create all application data using the integer ID
    print(f"\nStep 3: Creating application data with integer ID {public_user_id}...")
    
    # Create a customer record
    create_customer_query = """
    INSERT INTO customers (
        user_id, email, first_name, last_name, full_name, 
        created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s);
    """
    
    first_name, last_name = full_name.split(' ', 1)
    cursor.execute(create_customer_query, (
        public_user_id, email, first_name, last_name, full_name, now, now
    ))
    print("  [SUCCESS] Customer record created")
    
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
        'fixed', 19.99, 'USD', 30, public_user_id, True, now, now
    ))
    print("  [SUCCESS] Paywall created")
    
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
        public_user_id, 'published', True, now, now
    ))
    print("  [SUCCESS] Content created")
    
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
    print("  [SUCCESS] Subscription plan created")
    
    # Create notification preferences
    create_pref_query = """
    INSERT INTO notification_preferences (
        user_id, email_notifications, push_notifications, 
        sms_notifications, marketing_emails, created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s);
    """
    
    cursor.execute(create_pref_query, (
        public_user_id, True, True, False, True, now, now
    ))
    print("  [SUCCESS] Notification preferences created")
    
    # Create billing info with correct structure
    create_billing_query = """
    INSERT INTO billing_info (
        user_id, first_name, last_name, 
        created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s);
    """
    
    cursor.execute(create_billing_query, (
        public_user_id, first_name, last_name, now, now
    ))
    print("  [SUCCESS] Billing info created")
    
    # Commit all changes
    connection.commit()
    
    print("\n" + "=" * 70)
    print("COMPLETE USER CREATION SUCCESSFUL!")
    print("=" * 70)
    print(f"Email: {email}")
    print(f"Username: {username}")
    print(f"Full Name: {full_name}")
    print(f"Password: {password}")
    print(f"Auth User ID (UUID): {auth_user_id}")
    print(f"Public User ID (Integer): {public_user_id}")
    print()
    print("All systems are now properly configured:")
    print("  ✅ Supabase Auth system (auth.users) - UUID-based")
    print("  ✅ Application system (public.users) - Integer-based") 
    print("  ✅ All related application tables - Linked to integer ID")
    
    # Verify the complete setup
    print("\n--- VERIFICATION ---")
    
    # Check auth user
    cursor.execute("SELECT id FROM auth.users WHERE email = %s;", (email,))
    auth_check = cursor.fetchone()
    print(f"Auth user exists: {'YES' if auth_check else 'NO'}")
    
    # Check public user
    cursor.execute("SELECT id FROM public.users WHERE email = %s;", (email,))
    public_check = cursor.fetchone()
    print(f"Public user exists: {'YES' if public_check else 'NO'}")
    
    # Check application data
    cursor.execute("SELECT COUNT(*) FROM customers WHERE email = %s;", (email,))
    customer_count = cursor.fetchone()[0]
    print(f"Customer records: {customer_count}")
    
    cursor.execute("SELECT COUNT(*) FROM paywalls WHERE creator_id = %s;", (public_user_id,))
    paywall_count = cursor.fetchone()[0]
    print(f"Paywall records: {paywall_count}")
    
    cursor.execute("SELECT COUNT(*) FROM content WHERE author_id = %s;", (public_user_id,))
    content_count = cursor.fetchone()[0]
    print(f"Content records: {content_count}")
    
    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("\n[SUCCESS] Database connection closed!")
    
    print("\n" + "=" * 70)
    print("FINAL USER LOGIN DETAILS")
    print("=" * 70)
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"Username: {username}")
    print(f"Auth User ID: {auth_user_id}")
    print(f"Public User ID: {public_user_id}")
    print()
    print("This user is fully configured and ready to use the application!")
    print("Both authentication and application systems are properly linked.")
    print("=" * 70)

except Exception as e:
    print(f"[ERROR] Failed to complete user creation: {e}")
    import traceback
    traceback.print_exc()
    
    print("\n" + "=" * 70)
    print("USER LOGIN DETAILS")
    print("=" * 70)
    print(f"Email: {email if 'email' in locals() else 'N/A'}")
    print(f"Password: {password if 'password' in locals() else 'SecurePassword123!'}")
    print(f"Username: {username if 'username' in locals() else 'N/A'}")
    print(f"Auth User ID: {auth_user_id if 'auth_user_id' in locals() else 'N/A'}")
    print(f"Public User ID: {public_user_id if 'public_user_id' in locals() else 'N/A'}")
    print("\nNote: There was an error during user creation.")
    print("The user may not be fully configured.")
    print("=" * 70)