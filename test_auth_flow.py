import requests
import json

def test_with_auth_token():
    base_url = "http://localhost:8000"
    
    print("Testing authentication flow step by step...")
    
    # Step 1: Login to get token
    print("\n1. Logging in to get authentication token...")
    login_data = {
        "email": "admin@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/login", json=login_data, timeout=10)
        print(f"Login status: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access_token', '')
            print(f"[SUCCESS] Got access token: {access_token[:20]}..." if access_token else "[ERROR] No access token in response")
        else:
            print(f"[ERROR] Login failed: {response.text}")
            return
    except Exception as e:
        print(f"[ERROR] Error during login: {str(e)}")
        return
    
    # Step 2: Test paywalls endpoint without token (should fail)
    print("\n2. Testing paywalls endpoint without token (should fail)...")
    try:
        response = requests.get(f"{base_url}/api/paywalls", timeout=10)
        print(f"Paywalls without token status: {response.status_code}")
        if response.status_code != 200:
            print("[SUCCESS] Correctly rejected without token")
        else:
            print("[UNEXPECTED] Unexpected: accepted without token")
    except Exception as e:
        print(f"[ERROR] Error during paywalls test without token: {str(e)}")
    
    # Step 3: Test paywalls endpoint with token (should succeed)
    print("\n3. Testing paywalls endpoint with token (should succeed)...")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{base_url}/api/paywalls", headers=headers, timeout=10)
        print(f"Paywalls with token status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and 'data' in data:
                paywall_count = len(data.get('data', []))
                print(f"[SUCCESS] Successfully retrieved {paywall_count} paywalls")
                print(f"Response keys: {list(data.keys())}")
            else:
                print(f"[SUCCESS] Success but unexpected response format: {type(data)}")
                print(f"Response: {data}")
        else:
            print(f"[ERROR] Failed with token: {response.text}")
    except Exception as e:
        print(f"[ERROR] Error during paywalls test with token: {str(e)}")
    
    # Step 4: Test other endpoints to ensure general functionality
    print("\n4. Testing other protected endpoints...")
    protected_endpoints = [
        "/api/auth/me",
        "/api/users/me",
        "/api/content"
    ]
    
    for endpoint in protected_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", headers=headers, timeout=10)
            print(f"  {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"  {endpoint}: Error - {str(e)}")

if __name__ == "__main__":
    test_with_auth_token()