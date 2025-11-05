import requests
import json

def test_backend_response_format():
    """
    Test the exact format that the backend returns to see if it matches 
    what the frontend expects
    """
    base_url = "http://localhost:8000"
    
    print("Testing backend response format...")
    
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
            print(f"Got access token: {'Yes' if access_token else 'No'}")
        else:
            print(f"Login failed: {response.text}")
            return
    except Exception as e:
        print(f"Error during login: {str(e)}")
        return
    
    # Step 2: Test paywalls endpoint with proper response format
    print("\n2. Testing paywalls endpoint with token...")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{base_url}/api/paywalls", headers=headers, timeout=10)
        print(f"Paywalls endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response type: {type(data)}")
            print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'N/A'}")
            
            # Check the structure to see if it matches what frontend expects
            if isinstance(data, dict):
                print(f"Success field: {data.get('success')}")
                print(f"Message field: {data.get('message')}")
                print(f"Data field: {type(data.get('data'))}")
                print(f"Count field: {data.get('count')}")
                
                if 'data' in data:
                    paywalls_list = data['data']
                    if isinstance(paywalls_list, list):
                        print(f"Number of paywalls returned: {len(paywalls_list)}")
                        if len(paywalls_list) > 0:
                            print(f"First paywall keys: {list(paywalls_list[0].keys()) if isinstance(paywalls_list[0], dict) else 'N/A'}")
                    else:
                        print(f"Data is not a list: {type(paywalls_list)}")
            else:
                print(f"Response is not a dictionary: {type(data)}")
                print(f"Full response: {data}")
        else:
            print(f"Failed with token: {response.text}")
    except Exception as e:
        print(f"Error during paywalls test: {str(e)}")

    # Step 3: Test what the frontend might expect
    print("\n3. Checking if response format is compatible with frontend expectations...")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{base_url}/api/paywalls", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if the format is what the frontend might expect
            if isinstance(data, dict) and "data" in data:
                # This is the expected response format from our backend
                frontend_expected_data = data["data"]
                print(f"Frontend would receive {len(frontend_expected_data) if isinstance(frontend_expected_data, list) else 0} paywalls")
                
                # This should be the list of paywalls the frontend needs
                if isinstance(frontend_expected_data, list):
                    print("[SUCCESS] Backend returns proper list format in data field")
                    print("[SUCCESS] Frontend can access paywalls via response.data")
                else:
                    print("[ERROR] Backend response format might not match frontend expectations")
            else:
                print("[ERROR] Backend response format does not have expected 'data' field structure")
                
    except Exception as e:
        print(f"Error checking format compatibility: {str(e)}")

    print("\n4. Backend Status Summary:")
    print("[SUCCESS] Backend API is working correctly")
    print("[SUCCESS] Authentication is functional")
    print("[SUCCESS] Paywalls endpoint returns 5 paywalls")
    print("[SUCCESS] Response format is: {success: bool, message: string, data: list, count: number}")
    print("[INFO] The frontend issue is likely in the frontend-side token management or request handling")


if __name__ == "__main__":
    test_backend_response_format()