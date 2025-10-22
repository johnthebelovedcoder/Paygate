"""
Security test utilities for verifying the implemented security measures
"""
from utils.validation import sanitize_string, is_valid_email, is_valid_name, sanitize_input
from utils.middleware.advanced_rate_limit import AdvancedRateLimiter

def test_input_sanitization():
    """Test input sanitization functions"""
    # Test basic string sanitization
    malicious_input = "<script>alert('xss')</script>Hello World"
    sanitized = sanitize_string(malicious_input)
    assert "<script>" not in sanitized
    assert "alert('xss')" not in sanitized
    assert "Hello World" in sanitized
    
    # Test email validation
    assert is_valid_email("test@example.com") == True
    assert is_valid_email("<script>") == False
    assert is_valid_email("") == False
    
    # Test name validation
    assert is_valid_name("John Doe") == True
    assert is_valid_name("<script>") == False
    
    # Test recursive sanitization
    test_data = {
        "name": "<script>test</script>",
        "email": "test@example.com",
        "list": ["<script>item</script>", "safe_item"]
    }
    sanitized_data = sanitize_input(test_data)
    assert "<script>" not in sanitized_data["name"]
    assert "<script>" not in sanitized_data["list"][0]
    assert sanitized_data["list"][1] == "safe_item"
    
    print("✓ Input sanitization tests passed")


def test_rate_limiting():
    """Test rate limiting functionality"""
    limiter = AdvancedRateLimiter()
    
    # Test default limits
    client_ip = "192.168.1.1"
    endpoint = "/api/v1/paywalls"
    
    # Fill up the rate limit quota
    limits = limiter.get_endpoint_limits(endpoint)
    for i in range(limits["limit"]):
        assert limiter.check_rate_limit(client_ip, endpoint) == True
    
    # Next request should be blocked
    assert limiter.check_rate_limit(client_ip, endpoint) == False
    
    print("✓ Rate limiting tests passed")


def test_endpoint_specific_limits():
    """Test that different endpoints have different rate limits"""
    limiter = AdvancedRateLimiter()
    
    # Authentication endpoints should have stricter limits
    auth_limits = limiter.get_endpoint_limits("/auth/login")
    assert auth_limits["limit"] == 5  # 5 requests per 5 minutes
    assert auth_limits["window"] == 300  # 5 minutes in seconds
    
    # General API endpoints should have looser limits
    api_limits = limiter.get_endpoint_limits("/api/v1/paywalls")
    assert api_limits["limit"] == 100  # 100 requests per minute
    assert api_limits["window"] == 60  # 1 minute in seconds
    
    print("✓ Endpoint-specific limits tests passed")


def run_security_tests():
    """Run all security tests"""
    print("Running security implementation tests...\n")
    
    test_input_sanitization()
    test_rate_limiting() 
    test_endpoint_specific_limits()
    
    print("\n✓ All security tests passed!")


if __name__ == "__main__":
    run_security_tests()