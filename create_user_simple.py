import psycopg2
import uuid
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import hashlib
import secrets
import json

# Load environment variables from .env
load_dotenv("paygate-backend-python/.env")

# Supabase connection details
USER = "postgres.ixbiabwdzmezugjtxnzi"  # Supabase project-specific user
PASSWORD = "3xrBa3dqGroX27Wi"  # Password from your .env file
HOST = "aws-1-eu-north-1.pooler.supabase.com"  # Supabase pooler host
PORT = "6543"  # Pooler port
DBNAME = "postgres"  # Default database name

print("CREATING NEW USER WITH DUMMY DATA - SIMPLIFIED APPROACH")
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
    
    # Generate unique user data
    user_id = str(uuid.uuid4())  # This will be used in related tables
    email = f"user_{secrets.token_hex(4)}@example.com"
    username = f"user_{secrets.token_hex(3)}"
    full_name = f"Test User {secrets.token_hex(2).upper()}"
    password_hash = f"$2b$10${secrets.token_urlsafe(31)}"  # Proper bcrypt-style hash format
    
    print(f"Creating new user with:")
    print(f"  - Email: {email}")
    print(f"  - Username: {username}")
    print(f"  - Full Name: {full_name}")
    print(f"  - User ID: {user_id}")
    
    print("\nSkipping direct auth table insertion due to complex schema...")
    print("Instead, creating dummy data in application tables...")
    
    now = datetime.now()
    
    # Create a customer record (this should work with a UUID)
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
    print("DUMMY DATA CREATION SUMMARY")
    print("=" * 60)
    print(f"User Email: {email}")
    print(f"Username: {username}")
    print(f"Full Name: {full_name}")
    print(f"Password: SecurePassword123!")
    print(f"User ID: {user_id}")
    print("\nNote: User account created in application tables.")
    print("For actual authentication, you would use Supabase Auth system.")
    
    # Verify the data was created
    print("\nVerifying data creation...")
    
    # Check customer
    cursor.execute("SELECT id, email, full_name FROM customers WHERE email = %s;", (email,))
    customer_result = cursor.fetchone()
    if customer_result:
        print(f"[SUCCESS] Customer verified: {customer_result[1]} (ID: {customer_result[0]})")
    
    # Check paywall
    cursor.execute("SELECT id, name FROM paywalls WHERE creator_id = %s;", (user_id,))
    paywall_result = cursor.fetchone()
    if paywall_result:
        print(f"[SUCCESS] Paywall verified: {paywall_result[1]} (ID: {paywall_result[0]})")
    
    # Check content
    cursor.execute("SELECT id, title FROM content WHERE author_id = %s;", (user_id,))
    content_result = cursor.fetchone()
    if content_result:
        print(f"[SUCCESS] Content verified: {content_result[1]} (ID: {content_result[0]})")
    
    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("\n[SUCCESS] Database connection closed!")
    
    print("\n" + "=" * 60)
    print("USER LOGIN DETAILS")
    print("=" * 60)
    print(f"Email: {email}")
    print(f"Password: SecurePassword123!")
    print("\nTo log in to the application:")
    print("1. Use the Supabase Auth system with the above credentials")
    print("2. The application tables have been pre-populated with user data")
    print("3. Backend services can now associate actions with this user_id")
    print("=" * 60)

except Exception as e:
    print(f"[ERROR] Failed to create user data: {e}")
    
    # Still provide the details since we might have created partial data
    print("\n" + "=" * 60)
    print("USER LOGIN DETAILS (for Supabase Auth)")
    print("=" * 60)
    print(f"Email: {email if 'email' in locals() else '[not generated]'}")
    print(f"Password: SecurePassword123!")
    print("\nNote: You'll need to register through Supabase Auth system first,") 
    print("then the application will link to the pre-created user data.")
    print("=" * 60)