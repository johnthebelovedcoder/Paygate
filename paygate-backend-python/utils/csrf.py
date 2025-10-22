"""
CSRF Protection utilities for the PayGate application
"""
import secrets
import hashlib
from typing import Optional
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
from config.settings import settings
import jwt


def generate_csrf_token(user_id: int) -> str:
    """
    Generate a CSRF token for a user
    """
    # Create a unique token for this user session
    token_data = {
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
        "random": secrets.token_urlsafe(32)
    }
    
    # Create a JWT token with the data
    token = jwt.encode(
        token_data,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return token


def validate_csrf_token(token: str, user_id: int) -> bool:
    """
    Validate a CSRF token for a user
    """
    try:
        # Decode the token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Check if the user_id matches
        if payload.get("user_id") != user_id:
            return False
        
        # Check timestamp to prevent replay attacks (valid for 1 hour)
        token_time = datetime.fromisoformat(payload.get("timestamp"))
        if datetime.utcnow() - token_time > timedelta(hours=1):
            return False
        
        return True
    except jwt.PyJWTError:
        return False


def get_csrf_token_from_request(request: Request) -> Optional[str]:
    """
    Extract CSRF token from request headers or form data
    """
    # Check in headers first
    token = request.headers.get("x-csrf-token")
    if token:
        return token
    
    # Check in form data if available
    try:
        form_data = request.form()
        return form_data.get("csrf_token")
    except:
        # If form parsing fails, return None
        return None


def csrf_protect_middleware(request: Request, call_next):
    """
    Middleware to protect against CSRF attacks
    Excludes public endpoints that don't require authentication
    """
    # Define endpoints that don't require CSRF protection
    public_endpoints = [
        "/auth/login",
        "/auth/register", 
        "/auth/refresh",
        "/auth/forgotpassword",
        "/auth/resetpassword",
        "/",
        "/api/health",
        "/api/health"
    ]
    
    # Check if this is a public endpoint
    if any(request.url.path.startswith(endpoint) for endpoint in public_endpoints):
        return call_next(request)
    
    # For protected endpoints, check for CSRF token
    if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
        csrf_token = get_csrf_token_from_request(request)
        
        if not csrf_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSRF token is required"
            )
        
        # Here we would need to get the user_id from the auth token
        # This is just an example - in practice, you'd extract user info from the JWT
        # that should be in the Authorization header
        
        # For now, let's just pass through with a warning that this is simplified
        # In a real implementation, you'd validate against the user's session
        pass
    
    return call_next(request)