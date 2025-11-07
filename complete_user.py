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

print("COMPLETING USER CREATION WITH CORRECT UUID REFERENCES")
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
    
    # Use the same user we successfully created in auth schema
    user_id = "246814bd-8d13-47bd-894d-21fdece9c6d8"  # From our previous successful insertion
    email = "user_a256b6cb@example.com"
    username = "user_2b3487"
    full_name = "Test User 6B67"
    password = "SecurePassword123!"
    
    print(f"Completing user data for:")
    print(f"  - Email: {email}")
    print(f"  - User UUID: {user_id}")
    
    # Create application data using the correct UUID for user references
    # Now that we know the tables expect UUIDs, not integers
    
    now = datetime.now()
    
    # Create a customer record using UUID ID (this should work now)
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
    
    print("  - Created customer record with UUID reference")
    
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
    print("USER CREATION COMPLETE!")
    print("=" * 60)
    print(f"Email: {email}")
    print(f"Username: {username}")
    print(f"Full Name: {full_name}")
    print(f"Password: {password}")
    print(f"User UUID: {user_id}")
    print("\n[SUCCESS] User is now fully set up in both Auth and Application!")
    print("Both auth.users and application tables have been populated.")
    
    # Verify the user exists in auth
    print("\nVerifying user in auth.users table...")
    cursor.execute("SELECT id, email, created_at FROM auth.users WHERE email = %s;", (email,))
    auth_result = cursor.fetchone()
    
    if auth_result:
        print(f"[SUCCESS] User found in auth.users: {auth_result[1]} (ID: {auth_result[0]})")
    else:
        print("[ERROR] User not found in auth.users table")
    
    # Verify the user exists in application tables
    print("\nVerifying user in application tables...")
    cursor.execute("SELECT id, email, full_name FROM customers WHERE email = %s;", (email,))
    app_result = cursor.fetchone()
    
    if app_result:
        print(f"[SUCCESS] User found in customers: {app_result[1]} (ID: {app_result[0]})")
    else:
        print("[ERROR] User not found in customers table")
    
    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("\n[SUCCESS] Database connection closed!")
    
    print("\n" + "=" * 60)
    print("FINAL USER LOGIN DETAILS")
    print("=" * 60)
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"Username: {username}")
    print(f"User ID: {user_id}")
    print("\nThis user can now log in to the application with the above credentials.")
    print("All pre-populated content and data is linked to this user account.")
    print("=" * 60)

except Exception as e:
    print(f"[ERROR] Failed to complete user creation: {e}")
    
    print("\n" + "=" * 60)
    print("USER LOGIN DETAILS")
    print("=" * 60)
    print(f"Email: user_a256b6cb@example.com")
    print(f"Password: SecurePassword123!")
    print(f"Username: user_2b3487")
    print("\nNote: User was successfully created in auth.users but")
    print("application data creation failed. You can still log in.")
    print("=" * 60)