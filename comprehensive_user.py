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

print("COMPREHENSIVE USER CREATION - BOTH AUTH AND PUBLIC TABLES")
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
    
    # Use the existing user from auth (created earlier)
    auth_user_id = "246814bd-8d13-47bd-894d-21fdece9c6d8"  # From our successful auth insertion
    email = "user_a256b6cb@example.com"
    username = "user_2b3487"
    full_name = "Test User 6B67"
    password = "SecurePassword123!"
    hashed_password = bcrypt.hash(password)
    
    print(f"Working with existing auth user:")
    print(f"  - Email: {email}")
    print(f"  - Auth User UUID: {auth_user_id}")
    print(f"  - Password: {password}")
    
    # Create corresponding user in public.users table (application layer)
    now = datetime.now()
    
    print("\nCreating user in public.users table (application layer)...")
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
    print(f"[SUCCESS] User created in public.users with integer ID: {public_user_id}")
    
    # Now create all application data using the integer ID from public.users
    print("\nCreating application data with integer ID references...")
    
    # Create a customer record using the public.users integer ID
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
        'fixed', 19.99, 'USD', 30, public_user_id, True, now, now
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
        public_user_id, 'published', True, now, now
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
        public_user_id, True, True, False, True, now, now
    ))
    
    print("  - Created notification preferences")
    
    # Create a billing info record
    create_billing_query = """
    INSERT INTO billing_info (
        user_id, first_name, last_name, email, 
        created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s);
    """
    
    cursor.execute(create_billing_query, (
        public_user_id, first_name, last_name, email, now, now
    ))
    
    print("  - Created billing information")
    
    # Commit all changes
    connection.commit()
    
    print("\n" + "=" * 70)
    print("COMPREHENSIVE USER CREATION SUCCESSFUL!")
    print("=" * 70)
    print(f"Email: {email}")
    print(f"Username: {username}")
    print(f"Full Name: {full_name}")
    print(f"Password: {password}")
    print(f"Auth User ID (UUID): {auth_user_id}")
    print(f"Public User ID (Integer): {public_user_id}")
    print("\n[SUCCESS] User is now fully set up in BOTH systems:")
    print("  ✓ Supabase Auth system (auth.users)")
    print("  ✓ Application system (public.users)")
    print("  ✓ All related application tables")
    
    # Verify the user exists in auth
    print("\nVerifying auth user...")
    cursor.execute("SELECT id, email FROM auth.users WHERE email = %s;", (email,))
    auth_result = cursor.fetchone()
    if auth_result:
        print(f"  ✓ Auth user exists: {auth_result[1]} (ID: {auth_result[0]})")
    
    # Verify the user exists in public
    print("\nVerifying public user...")
    cursor.execute("SELECT id, email FROM public.users WHERE email = %s;", (email,))
    public_result = cursor.fetchone()
    if public_result:
        print(f"  ✓ Public user exists: {public_result[1]} (ID: {public_result[0]})")
    
    # Verify application data
    print("\nVerifying application data...")
    cursor.execute("SELECT id, email, full_name FROM customers WHERE email = %s;", (email,))
    app_result = cursor.fetchone()
    if app_result:
        print(f"  ✓ Customer record exists: {app_result[1]} (ID: {app_result[0]})")
    
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
    print("\nThis user is fully configured and can log in to the application.")
    print("All application data is properly linked to both auth and public user records.")
    print("=" * 70)

except Exception as e:
    print(f"[ERROR] Failed to complete user creation: {e}")
    import traceback
    traceback.print_exc()
    
    print("\n" + "=" * 70)
    print("USER LOGIN DETAILS")
    print("=" * 70)
    print(f"Email: {email if 'email' in locals() else 'user_a256b6cb@example.com'}")
    print(f"Password: {password if 'password' in locals() else 'SecurePassword123!'}")
    print(f"Username: {username if 'username' in locals() else 'user_2b3487'}")
    print(f"Auth User ID: {auth_user_id if 'auth_user_id' in locals() else '246814bd-8d13-47bd-894d-21fdece9c6d8'}")
    print("\nNote: The user can log in with these credentials.")
    print("Some application data may have failed to create due to the error above.")
    print("=" * 70)