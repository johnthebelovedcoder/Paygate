import time
import redis
from typing import Dict
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from config.settings import settings
import logging
import hashlib

logger = logging.getLogger(__name__)

class RedisRateLimiter:
    def __init__(self):
        try:
            self.redis_client = redis.from_url(settings.REDIS_URL)
            # Test Redis connection
            self.redis_client.ping()
            self.use_redis = True
            logger.info("Redis rate limiter initialized successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}, falling back to in-memory rate limiting")
            self.use_redis = False
            # Initialize fallback in-memory storage
            from collections import defaultdict
            self.requests = defaultdict(lambda: defaultdict(list))

        # Define rate limits for different endpoints (requests per time window)
        # Adjust limits based on environment for development vs. production
        if settings.ENVIRONMENT == "development":
            # More lenient limits for development
            register_limit = 10  # 10 requests per hour in development
            register_window = 3600
            login_limit = 20  # 20 requests per 5 minutes in development
            login_window = 300
        else:
            # Stricter limits for production
            register_limit = 3  # 3 requests per hour in production
            register_window = 3600
            login_limit = 5  # 5 requests per 5 minutes in production
            login_window = 300

        self.limits = {
            # Authentication endpoints (more strict)
            "/api/auth/login": {"limit": login_limit, "window": login_window},
            "/api/auth/register": {"limit": register_limit, "window": register_window},  # Adjusted for environment
            "/api/auth/request-password-reset": {"limit": 3, "window": 3600},  # 3 requests per hour
            "/api/auth/reset-password": {"limit": 5, "window": 300},  # 5 requests per 5 minutes

            # General API endpoints (less strict)
            "/api/paywalls": {"limit": 100, "window": 60},  # 100 requests per minute
            "/api/content": {"limit": 100, "window": 60},
            "/api/analytics": {"limit": 50, "window": 60},
            "/api/users": {"limit": 100, "window": 60},
            "/api/payments": {"limit": 100, "window": 60},

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

    def is_allowed(self, identifier: str, path: str) -> tuple[bool, int, int]:
        """
        Check if request is allowed, returns (allowed, remaining, reset_time)
        """
        limits = self.get_endpoint_limits(path)
        current_time = int(time.time())

        if self.use_redis:
            # Use Redis for rate limiting
            key = f"rate_limit:{identifier}:{path}"
            window_start = current_time - limits["window"]
            
            # Remove old entries outside the window
            try:
                # Use ZREMRANGEBYSCORE to remove old entries
                self.redis_client.zremrangebyscore(key, 0, window_start)
                
                # Get current count
                current_requests = self.redis_client.zcard(key)
                
                if current_requests < limits["limit"]:
                    # Add current request with timestamp
                    self.redis_client.zadd(key, {str(current_time): current_time})
                    # Set expiration for the key
                    self.redis_client.expire(key, limits["window"])
                    
                    remaining = limits["limit"] - current_requests - 1
                    reset_time = current_time + limits["window"]
                    
                    return True, remaining, reset_time
                else:
                    # Calculate when the rate limit will reset
                    oldest_request = self.redis_client.zrange(key, 0, 0, withscores=True)
                    if oldest_request:
                        oldest_time = int(oldest_request[0][1])
                        reset_time = oldest_time + limits["window"]
                    else:
                        reset_time = current_time + limits["window"]
                    
                    return False, 0, reset_time
            except Exception as e:
                logger.error(f"Redis rate limit error: {e}, falling back to in-memory")
                # Fall back to in-memory implementation
                return self._in_memory_rate_limit(identifier, path, limits, current_time)
        else:
            # Use in-memory storage as fallback
            return self._in_memory_rate_limit(identifier, path, limits, current_time)

    def _in_memory_rate_limit(self, identifier: str, path: str, limits: dict, current_time: int) -> tuple[bool, int, int]:
        """Fallback in-memory rate limiting"""
        # Remove old requests outside the window for this identifier and endpoint
        self.requests[identifier][path] = [
            req_time for req_time in self.requests[identifier][path]
            if current_time - req_time < limits["window"]
        ]

        # Check if rate limit exceeded
        current_requests = len(self.requests[identifier][path])
        if current_requests < limits["limit"]:
            # Add current request
            self.requests[identifier][path].append(current_time)
            remaining = limits["limit"] - current_requests - 1
            reset_time = current_time + limits["window"]
            return True, remaining, reset_time
        else:
            # Calculate when the oldest request will expire
            if self.requests[identifier][path]:
                oldest_req = min(self.requests[identifier][path])
                reset_time = oldest_req + limits["window"]
            else:
                reset_time = current_time + limits["window"]
            
            return False, 0, reset_time

# Create instance of advanced rate limiter
advanced_limiter = RedisRateLimiter()

def get_client_identifier(request: Request) -> str:
    """Get client identifier from request (IP + User-Agent combination)"""
    # Check for forwarded IP headers first
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        ip = forwarded_for.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else "unknown"
    
    # Add User-Agent to create a more specific identifier
    user_agent = request.headers.get("User-Agent", "unknown")[:100]  # Limit length
    
    # Create a hash-based identifier to avoid storing sensitive data
    identifier = f"{ip}:{user_agent}"
    return hashlib.md5(identifier.encode()).hexdigest()

async def rate_limit_middleware(request: Request, call_next):
    """Advanced rate limiting middleware with Redis support"""
    identifier = get_client_identifier(request)

    # Skip rate limiting for health checks and static files
    if request.url.path in ["/", "/health", "/api/health", "/api/health/full", "/api/health/database", "/api/health/supabase", "/docs", "/redoc", "/openapi.json"]:
        response = await call_next(request)
        return response

    # Check rate limit
    allowed, remaining, reset_time = advanced_limiter.is_allowed(identifier, request.url.path)

    if not allowed:
        # Use JSONResponse to ensure proper response format
        from fastapi.responses import JSONResponse
        response = JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "Rate limit exceeded",
                "message": "Too many requests. Please try again later.",
                "reset_time": reset_time,
                "path": request.url.path
            }
        )
        # Add appropriate CORS headers to ensure they match the CORS configuration
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")  # Use the requested origin to match CORS policy
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Expose-Headers, X-CSRF-Token, X-File-Name, X-File-Size, X-File-Type"
        return response

    response = await call_next(request)

    # Add rate limit headers to response
    limits = advanced_limiter.get_endpoint_limits(request.url.path)
    
    response.headers["X-RateLimit-Limit"] = str(limits["limit"])
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset_time)
    response.headers["X-Client-Identifier"] = identifier[:16]  # Only send first 16 chars for security

    return response