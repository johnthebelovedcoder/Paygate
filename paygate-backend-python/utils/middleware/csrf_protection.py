"""
CSRF Protection utilities for the PayGate API
In a token-based API like this one, traditional CSRF protection works differently.
This implementation provides guidance and utilities for token validation.
"""

from fastapi import Request, HTTPException, status
from typing import Optional


def is_safe_method(method: str) -> bool:
    """
    Check if the HTTP method is considered safe (doesn't modify state)
    """
    return method.upper() in ["GET", "HEAD", "OPTIONS", "TRACE"]


def validate_content_type_header(request: Request) -> bool:
    """
    Ensure requests have proper content-type for security
    """
    content_type = request.headers.get("content-type", "").lower()
    
    # For JSON requests, ensure the content type is application/json
    if request.method in ["POST", "PUT", "PATCH"] and content_type:
        if "application/json" in content_type or "multipart/form-data" in content_type:
            return True
        # If content is being sent but wrong content type, reject
        elif content_type != "":
            return False
    
    return True


def check_origin_header(request: Request) -> bool:
    """
    Basic check for suspicious origin headers
    """
    origin = request.headers.get("origin", "")
    referer = request.headers.get("referer", "")
    
    # In a real application, you would check these against a whitelist
    # This is a simplified check
    if "javascript:" in origin.lower() or "javascript:" in referer.lower():
        return False
    
    return True


def csrf_protect_middleware(request: Request, call_next):
    """
    Middleware to provide basic CSRF protection for API
    In a token-based API, true CSRF protection involves:
    1. Using proper authentication tokens
    2. Validating content-type headers
    3. Ensuring requests come from valid origins
    """
    # Allow safe methods without CSRF checks
    if is_safe_method(request.method):
        return call_next(request)
    
    # Validate content-type for state-changing requests
    if not validate_content_type_header(request):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Content-Type header"
        )
    
    # Check for potentially malicious headers
    if not check_origin_header(request):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Potentially malicious request headers detected"
        )
    
    # For API requests, ensure they have proper authentication
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        # For non-auth endpoints that modify data, we might want to have CSRF tokens
        # But since this is an API with JWT auth, the auth header is the security mechanism
        
        # In a real implementation, you may want to check for CSRF tokens
        # in specific scenarios, but for a JWT-based API this is typically not needed
        # as the JWT token itself provides protection
    
        pass
    
    response = await call_next(request)
    return response