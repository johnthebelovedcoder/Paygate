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

# Create a more sophisticated rate limiter class with different limits per endpoint
class AdvancedRateLimiter:
    def __init__(self):
        # Store request timestamps by IP and endpoint
        self.requests = defaultdict(lambda: defaultdict(list))
        
        # Define rate limits for different endpoints (requests per time window)
        self.limits = {
            # Authentication endpoints (more strict)
            "/auth/login": {"limit": 5, "window": 300},  # 5 requests per 5 minutes
            "/auth/register": {"limit": 3, "window": 3600},  # 3 requests per hour
            "/auth/forgotpassword": {"limit": 3, "window": 3600},  # 3 requests per hour
            "/auth/resetpassword": {"limit": 5, "window": 300},  # 5 requests per 5 minutes
            
            # General API endpoints (less strict)
            "/api/paywalls": {"limit": 100, "window": 60},  # 100 requests per minute
            "/api/content": {"limit": 100, "window": 60},
            "/api/analytics": {"limit": 50, "window": 60},
            
            # Default limit for other endpoints
            "default": {"limit": 1000, "window": 60},  # 1000 requests per minute
        }

    def get_endpoint_limits(self, path: str) -> dict:
        """Get rate limits for a specific endpoint"""
        # Look for exact match first
        if path in self.limits:
            return self.limits[path]
        
        # Look for partial matches in the path
        for limit_path, limits in self.limits.items():
            if limit_path != "default" and path.startswith(limit_path):
                return limits
        
        # Return default limits
        return self.limits["default"]

    def check_rate_limit(self, ip: str, path: str) -> bool:
        """Check if IP has exceeded rate limit for a specific endpoint"""
        limits = self.get_endpoint_limits(path)
        now = time.time()
        
        # Remove old requests outside the window for this IP and endpoint
        self.requests[ip][path] = [
            req_time for req_time in self.requests[ip][path] 
            if now - req_time < limits["window"]
        ]
        
        # Check if rate limit exceeded
        if len(self.requests[ip][path]) >= limits["limit"]:
            return False
        
        # Add current request
        self.requests[ip][path].append(now)
        return True

    def get_reset_time(self, ip: str, path: str) -> int:
        """Get the time when the rate limit will reset"""
        limits = self.get_endpoint_limits(path)
        if self.requests[ip][path]:
            oldest_req = min(self.requests[ip][path])
            return int(oldest_req + limits["window"])
        return int(time.time() + limits["window"])

# Create instance of advanced rate limiter
advanced_limiter = AdvancedRateLimiter()

async def rate_limit_middleware(request: Request, call_next):
    """Advanced rate limiting middleware with different limits per endpoint"""
    client_ip = get_client_ip(request)
    
    # Skip rate limiting for health checks and static files
    if request.url.path in ["/", "/api/health"]:
        response = await call_next(request)
        return response
    
    if not advanced_limiter.check_rate_limit(client_ip, request.url.path):
        reset_time = advanced_limiter.get_reset_time(client_ip, request.url.path)
        
        # Add rate limit headers to response
        response = HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "message": "Too many requests. Please try again later.",
                "reset_time": reset_time,
                "path": request.url.path
            }
        )
        # For FastAPI to properly handle headers with HTTPException, 
        # we need to handle this differently in the actual implementation
        raise response
    
    response = await call_next(request)
    
    # Add rate limit headers to response
    limits = advanced_limiter.get_endpoint_limits(request.url.path)
    remaining_requests = max(0, limits["limit"] - len(advanced_limiter.requests[client_ip][request.url.path]))
    reset_time = advanced_limiter.get_reset_time(client_ip, request.url.path)
    
    response.headers["X-RateLimit-Limit"] = str(limits["limit"])
    response.headers["X-RateLimit-Remaining"] = str(remaining_requests)
    response.headers["X-RateLimit-Reset"] = str(reset_time)
    
    return response