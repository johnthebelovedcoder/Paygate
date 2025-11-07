import psycopg2
from dotenv import load_dotenv
import os
import socket

def test_dns_resolution(hostname):
    """Test if the hostname can be resolved"""
    try:
        print(f"Testing DNS resolution for: {hostname}")
        resolved_ip = socket.gethostbyname(hostname)
        print(f"[SUCCESS] DNS Resolution SUCCESS: {hostname} -> {resolved_ip}")
        return True, resolved_ip
    except socket.gaierror as e:
        print(f"[ERROR] DNS Resolution FAILED: {e}")
        return False, None

# Use the pooler URL which should work with IPv4
USER = "postgres"
PASSWORD = "3xrBa3dqGroX27Wi"
HOST = "aws-1-eu-north-1.pooler.supabase.com"  # Pooler URL for IPv4 compatibility
PORT = "5432"
DBNAME = "postgres"

print("Testing Supabase Pooler Connection")
print("="*40)
print(f"Host: {HOST}")
print(f"Port: {PORT}")
print(f"Database: {DBNAME}")
print(f"User: {USER}")

# First, test DNS resolution
dns_success, resolved_ip = test_dns_resolution(HOST)

if not dns_success:
    print("\nDNS resolution still failing with pooler URL. This could indicate:")
    print("1. Network/firewall blocking all Supabase connections")
    print("2. The Supabase project may be paused or deactivated")
else:
    print("\nDNS resolution successful, trying database connection with pooler...")
    # Try to connect to the database using the pooler
    try:
        connection = psycopg2.connect(
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            dbname=DBNAME
        )
        print("[SUCCESS] Database connection through pooler successful!")
        
        # Create a cursor to execute SQL queries
        cursor = connection.cursor()
        
        # Example query
        cursor.execute("SELECT NOW();")
        result = cursor.fetchone()
        print(f"Current Time: {result[0]}")

        # Close the cursor and connection
        cursor.close()
        connection.close()
        print("Connection closed successfully.")

    except Exception as e:
        print(f"[ERROR] Database connection through pooler failed: {e}")
        print("\nThe pooler connection may fail due to:")
        print("- Incorrect password")
        print("- Network firewall blocking the connection")
        print("- Supabase project network restrictions")
        print("- Database being paused or inactive")
        print("\nNote: The pooler requires your Supabase project to be active.")