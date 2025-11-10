"""
Advanced rate limiting with account-based limits
"""
import time
import redis
from typing import Dict, Tuple, Optional
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from config.settings import settings
import logging
import hashlib
from datetime import datetime

logger = logging.getLogger(__name__)

class AdvancedRateLimiter:
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
        self.limits = {
            # Authentication endpoints (more strict)
            "/api/auth/login": {"limit": 5, "window": 300},  # 5 requests per 5 minutes
            "/api/auth/register": {"limit": 3, "window": 3600},  # 3 requests per hour
            "/api/auth/request-password-reset": {"limit": 3, "window": 3600},  # 3 requests per hour
            "/api/auth/reset-password": {"limit": 5, "window": 300},  # 5 requests per 5 minutes

            # General API endpoints (varied limits)
            "/api/paywalls": {"limit": 100, "window": 60},  # 100 requests per minute
            "/api/content": {"limit": 100, "window": 60},
            "/api/analytics": {"limit": 50, "window": 60},
            "/api/users": {"limit": 100, "window": 60},
            "/api/payments": {"limit": 50, "window": 60},  # More restrictive for payment endpoints
            "/api/upload": {"limit": 20, "window": 60},  # More restrictive for upload endpoints

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

    def get_client_identifier(self, request: Request) -> str:
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

    def get_user_based_identifier(self, request: Request, user_id: Optional[str] = None) -> str:
        """Get rate limit identifier based on user ID if authenticated, otherwise IP"""
        if user_id:
            # Use user ID for authenticated requests
            return f"user:{user_id}"
        else:
            # Use IP-based identifier for unauthenticated requests
            return self.get_client_identifier(request)

    def is_allowed(self, identifier: str, path: str, user_id: Optional[str] = None) -> Tuple[bool, int, int]:
        """
        Check if request is allowed, returns (allowed, remaining, reset_time)
        """
        limits = self.get_endpoint_limits(path)
        current_time = int(time.time())

        # Use different rate limits for authenticated vs unauthenticated users
        if user_id:
            # For authenticated users, apply normal limits
            pass
        else:
            # For unauthenticated users, apply stricter limits for sensitive endpoints
            if path.startswith("/api/auth/") or path in ["/api/users", "/api/payments"]:
                limits = {
                    "limit": max(1, limits["limit"] // 2),  # Halve the limit for unauthenticated requests to sensitive endpoints
                    "window": limits["window"]
                }

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
                return self._in_memory_rate_limit(identifier, path, limits, current_time, user_id)
        else:
            # Use in-memory storage as fallback
            return self._in_memory_rate_limit(identifier, path, limits, current_time, user_id)

    def _in_memory_rate_limit(self, identifier: str, path: str, limits: dict, current_time: int, user_id: Optional[str] = None) -> Tuple[bool, int, int]:
        """Fallback in-memory rate limiting"""
        # Remove old requests outside the window for this identifier and endpoint
        self.requests[identifier][path] = [
            req_time for req_time in self.requests[identifier][path]
            if current_time - req_time < limits["window"]
        ]

        # Apply stricter limits for unauthenticated requests to sensitive endpoints
        adjusted_limits = limits
        if not user_id and (path.startswith("/api/auth/") or path in ["/api/users", "/api/payments"]):
            adjusted_limits = {
                "limit": max(1, limits["limit"] // 2),
                "window": limits["window"]
            }

        # Check if rate limit exceeded
        current_requests = len(self.requests[identifier][path])
        if current_requests < adjusted_limits["limit"]:
            # Add current request
            self.requests[identifier][path].append(current_time)
            remaining = adjusted_limits["limit"] - current_requests - 1
            reset_time = current_time + adjusted_limits["window"]
            return True, remaining, reset_time
        else:
            # Calculate when the oldest request will expire
            if self.requests[identifier][path]:
                oldest_req = min(self.requests[identifier][path])
                reset_time = oldest_req + adjusted_limits["window"]
            else:
                reset_time = current_time + adjusted_limits["window"]

            return False, 0, reset_time

    def get_rate_limit_headers(self, identifier: str, path: str, user_id: Optional[str] = None) -> Dict[str, str]:
        """Get rate limit headers to add to response"""
        limits = self.get_endpoint_limits(path)
        
        # Apply adjusted limits for unauthenticated requests
        if not user_id and (path.startswith("/api/auth/") or path in ["/api/users", "/api/payments"]):
            adjusted_limit = max(1, limits["limit"] // 2)
        else:
            adjusted_limit = limits["limit"]
            
        is_allowed, remaining, reset_time = self.is_allowed(identifier, path, user_id)
        
        return {
            "X-RateLimit-Limit": str(adjusted_limit),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(reset_time)
        }


# Create instance of advanced rate limiter
advanced_limiter = AdvancedRateLimiter()