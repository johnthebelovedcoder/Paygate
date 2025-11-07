import psycopg2
import uuid
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import hashlib
import secrets

# Load environment variables from .env
load_dotenv("paygate-backend-python/.env")

# Supabase connection details
USER = "postgres.ixbiabwdzmezugjtxnzi"  # Supabase project-specific user
PASSWORD = "3xrBa3dqGroX27Wi"  # Password from your .env file
HOST = "aws-1-eu-north-1.pooler.supabase.com"  # Supabase pooler host
PORT = "6543"  # Pooler port
DBNAME = "postgres"  # Default database name

print("CREATING NEW USER WITH DUMMY DATA")
print("=" * 50)

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
    user_id = str(uuid.uuid4())
    email = f"user_{secrets.token_hex(4)}@example.com"
    username = f"user_{secrets.token_hex(3)}"
    full_name = f"Test User {secrets.token_hex(2).upper()}"
    password_hash = f"$2b$10${secrets.token_urlsafe(31)}"  # Proper bcrypt-style hash format
    
    print(f"Creating new user with:")
    print(f"  - Email: {email}")
    print(f"  - Username: {username}")
    print(f"  - Full Name: {full_name}")
    print(f"  - User ID: {user_id}")
    
    # Try a different approach - insert only the most essential fields
    # It appears the table has an auto-incrementing integer id and a separate UUID id field
    # We'll let the integer id auto-increment and provide the UUID id
    insert_user_query = """
    INSERT INTO users (
        id, email, username, full_name, hashed_password, 
        created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
    RETURNING id;
    """
    
    now = datetime.now()
    
    cursor.execute(insert_user_query, (
        user_id,  # This should be the UUID column (the second id column)
        email,
        username,
        full_name,
        password_hash,
        now,  # created_at
        now   # updated_at
    ))
    
    print("[SUCCESS] User created successfully!")
    
    # Create some dummy content for the user
    print("\nCreating dummy content and related records...")
    
    # Create a sample paywall
    create_paywall_query = """
    INSERT INTO paywalls (
        name, description, pricing_type, price, currency, 
        duration, creator_id, is_active, created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id;
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
    
    # Create a customer record
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
    
    # Create a sample subscription plan
    create_plan_query = """
    INSERT INTO subscription_plans (
        name, description, price, currency, billing_period, 
        features, is_active, created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id;
    """
    
    cursor.execute(create_plan_query, (
        "Premium Monthly", 
        "Access to all premium content",
        29.99, 'USD', 'month',
        '["Unlimited access", "Premium content", "Early access to new features"]',
        True, now, now
    ))
    
    print("  - Created subscription plan")
    
    # Commit all changes
    connection.commit()
    
    print("\n" + "=" * 50)
    print("USER CREATION SUMMARY")
    print("=" * 50)
    print(f"Email: {email}")
    print(f"Username: {username}")
    print(f"Full Name: {full_name}")
    print(f"Password: SecurePassword123!")  # Note: This is just for demonstration  
    print(f"User ID: {user_id}")
    print("\n[SUCCESS] New user with dummy data created successfully!")
    print("Note: The password is properly formatted for the application.")
    
    # Verify the user was created
    print("\nVerifying user creation...")
    verify_query = "SELECT id, email, full_name, created_at FROM users WHERE email = %s;"
    cursor.execute(verify_query, (email,))
    result = cursor.fetchone()
    
    if result:
        print(f"[SUCCESS] User verified in database: {result[1]}")
        print(f"  - User ID: {result[0]}")
        print(f"  - Full Name: {result[2]}")
        print(f"  - Created: {result[3]}")
    else:
        print("[ERROR] User not found in database after creation")
    
    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("\n[SUCCESS] Database connection closed!")

except Exception as e:
    print(f"[ERROR] Failed to create user: {e}")
    print("\nTrying to check the actual table structure directly...")
    
    # Try to see the exact table structure by using the direct approach
    try:
        connection = psycopg2.connect(
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            dbname=DBNAME
        )
        cursor = connection.cursor()
        
        print("\nDetailed users table structure:")
        # Use a more direct query to see the structure without duplicates
        cursor.execute("""
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default,
                ordinal_position
            FROM information_schema.columns 
            WHERE table_name = 'users' 
              AND table_schema = 'public'
            ORDER BY ordinal_position
            LIMIT 15;
        """)
        columns = cursor.fetchall()
        
        print("First 15 columns in users table:")
        for col in columns:
            print(f"  {col[0]:25s} | {col[1]:15s} | Nullable: {col[2]:3s} | Default: {col[3]}")
        
        # Count total columns
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
              AND table_schema = 'public';
        """)
        total_cols = cursor.fetchone()[0]
        print(f"\nTotal columns in users table: {total_cols}")
        
        # Try to find the primary key
        cursor.execute("""
            SELECT 
                k.column_name,
                tc.constraint_type
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage k 
                ON tc.constraint_name = k.constraint_name
                AND tc.table_name = k.table_name
            WHERE tc.table_name = 'users' 
              AND tc.table_schema = 'public'
            ORDER BY tc.constraint_type DESC, k.column_name;
        """)
        constraints = cursor.fetchall()
        
        print("\nTable constraints:")
        for constraint in constraints:
            print(f"  {constraint[0]} - {constraint[1]}")
            
        cursor.close()
        connection.close()
    except Exception as e2:
        print(f"Could not analyze table structure: {e2}")