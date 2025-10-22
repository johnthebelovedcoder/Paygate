import time
from typing import Dict
from collections import defaultdict
from fastapi import Request, HTTPException, status
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    # Check for forwarded IP headers first
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to the default limiter function
    return get_remote_address(request)

# Create a more sophisticated rate limiter class
class CustomLimiter:
    def __init__(self):
        self.requests = defaultdict(list)  # Store request timestamps by IP
        self.limit = 100  # requests per minute
        self.window = 60  # seconds

    def check_rate_limit(self, ip: str) -> bool:
        """Check if IP has exceeded rate limit"""
        now = time.time()
        # Remove old requests outside the window
        self.requests[ip] = [req_time for req_time in self.requests[ip] 
                             if now - req_time < self.window]
        
        # Check if rate limit exceeded
        if len(self.requests[ip]) >= self.limit:
            return False
        
        # Add current request
        self.requests[ip].append(now)
        return True

# Create instance of custom limiter
custom_limiter = CustomLimiter()

async def rate_limit_middleware(request: Request, call_next):
    """Custom rate limiting middleware"""
    client_ip = get_client_ip(request)
    
    if not custom_limiter.check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later."
        )
    
    response = await call_next(request)
    return response