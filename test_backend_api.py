import requests
import json

def test_backend_api():
    base_url = "http://localhost:8000"
    
    print("Testing backend API endpoints...")
    
    try:
        # Test basic connectivity
        print("\n1. Testing server connectivity...")
        response = requests.get(f"{base_url}", timeout=10)
        print(f"Server status: {response.status_code}")
        if response.status_code == 200:
            print("[OK] Server is running")
            print(f"Response: {response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:100]}")
        else:
            print(f"[ERROR] Server returned status: {response.status_code}")
            return
    except Exception as e:
        print(f"[ERROR] Cannot connect to server: {str(e)}")
        print("Make sure the backend server is running on http://localhost:8000")
        return
    
    try:
        # Test health endpoint
        print("\n2. Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"Health endpoint status: {response.status_code}")
        if response.status_code == 200:
            print("[OK] Health endpoint is working")
    except Exception as e:
        print(f"[ERROR] Cannot reach health endpoint: {str(e)}")
    
    try:
        # Test API health endpoint
        print("\n3. Testing API health endpoint...")
        response = requests.get(f"{base_url}/api/health", timeout=10)
        print(f"API health endpoint status: {response.status_code}")
        if response.status_code == 200:
            print("[OK] API health endpoint is working")
    except Exception as e:
        print(f"[ERROR] Cannot reach API health endpoint: {str(e)}")
    
    try:
        # Test paywalls endpoint (this might require auth)
        print("\n4. Testing paywalls endpoint...")
        response = requests.get(f"{base_url}/api/paywalls", timeout=10)
        print(f"Paywalls endpoint status: {response.status_code}")
        print(f"Response: {response.text[:200]}..." if len(response.text) > 200 else f"Response: {response.text}")
    except Exception as e:
        print(f"[ERROR] Cannot reach paywalls endpoint: {str(e)}")
    
    try:
        # Test auth endpoints
        print("\n5. Testing auth endpoints...")
        response = requests.get(f"{base_url}/api/auth/me", timeout=10)
        print(f"Auth/me endpoint status: {response.status_code}")
        if response.status_code == 401 or response.status_code == 403:
            print("  - Expected: Unauthorized (no token provided)")
        
        # Test login endpoint
        login_data = {
            "email": "admin@example.com",
            "password": "password123"  # Default password we set
        }
        response = requests.post(f"{base_url}/api/auth/login", json=login_data, timeout=10)
        print(f"Login endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            print("[OK] Login successful")
            token_data = response.json()
            access_token = token_data.get('access_token', '')
            
            if access_token:
                # Test authenticated paywalls endpoint
                print("\n6. Testing authenticated paywalls endpoint...")
                headers = {"Authorization": f"Bearer {access_token}"}
                response = requests.get(f"{base_url}/api/paywalls", headers=headers, timeout=10)
                print(f"Authenticated paywalls endpoint status: {response.status_code}")
                if response.status_code == 200:
                    print("[OK] Authenticated paywalls endpoint working")
                    try:
                        data = response.json()
                        if isinstance(data, list):
                            print(f"Returned {len(data)} paywall items")
                            if len(data) > 0:
                                print(f"First item keys: {list(data[0].keys()) if isinstance(data[0], dict) else 'N/A'}")
                        else:
                            print(f"Returned data: {data}")
                    except json.JSONDecodeError:
                        print(f"Non-JSON response: {response.text[:200]}...")
                else:
                    print(f"[ERROR] Authenticated paywalls endpoint failed: {response.text[:200]}..." if len(response.text) > 200 else f"Response: {response.text}")
        else:
            print(f"[ERROR] Login failed: {response.text[:200]}..." if len(response.text) > 200 else f"Response: {response.text}")
            print("This could be because the admin user doesn't exist or has a different password")
            
    except Exception as e:
        print(f"[ERROR] Error during authentication tests: {str(e)}")

if __name__ == "__main__":
    print("Testing backend API connectivity...")
    test_backend_api()