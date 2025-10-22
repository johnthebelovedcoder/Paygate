#!/usr/bin/env python3
"""
Test script to verify authentication is working properly
"""
import requests
import json

# Base URL of your running backend server
BASE_URL = "http://localhost:8000/api/v1"

def test_login():
    # Test login with the test user we just created
    login_data = {
        "email": "testuser@paygate.com",
        "password": "securepassword123"
    }
    
    print(f"Attempting to login with {login_data['email']}")
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Login status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("Login successful!")
        print(f"Access token: {data.get('access_token', '')[:20]}...")  # Print first 20 chars
        print(f"User: {data.get('user', {}).get('email', 'N/A')}")
        
        # Test accessing protected endpoint with token
        headers = {
            "Authorization": f"Bearer {data['access_token']}"
        }
        me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"\n/auth/me status: {me_response.status_code}")
        if me_response.status_code == 200:
            print("Successfully accessed /auth/me with token")
            
            # Test other protected endpoints
            endpoints = [
                "/analytics/revenue",
                "/analytics/top-paywalls", 
                "/analytics/customers",
                "/payments?limit=5&sort=createdAt:desc"
            ]
            
            for endpoint in endpoints:
                protected_response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
                print(f"{endpoint} status: {protected_response.status_code}")
        else:
            print(f"Failed to access /auth/me: {me_response.text}")
    else:
        print(f"Login failed: {response.text}")
        
        # Also try with the admin user
        print("\nTrying with admin user...")
        admin_login_data = {
            "email": "admin@example.com",
            "password": "password123"
        }
        admin_response = requests.post(f"{BASE_URL}/auth/login", json=admin_login_data)
        print(f"Admin login status: {admin_response.status_code}")
        if admin_response.status_code != 200:
            print("Admin login also failed")

if __name__ == "__main__":
    print("Testing Paygate authentication...")
    test_login()