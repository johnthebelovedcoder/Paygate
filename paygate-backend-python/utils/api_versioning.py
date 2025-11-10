"""
API Versioning utilities for PayGate
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Optional, Callable, Any
import time
import uuid


class APIVersionMiddleware:
    """
    Middleware to handle API versioning
    """
    
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = Request(scope)

        # Extract version from header or path
        version = self._get_api_version(request)
        
        # Add version to request state
        request.state.api_version = version
        request.state.request_id = str(uuid.uuid4())
        
        await self.app(scope, receive, send)

    def _get_api_version(self, request: Request) -> str:
        """
        Get API version from header or URL path
        """
        # Check for version in header first
        api_version = request.headers.get("API-Version")
        
        if not api_version:
            # Check URL path for version
            path = request.url.path
            # Look for patterns like /api/v1/, /api/v2/, etc.
            import re
            match = re.search(r'/api/v(\d+)/', path)
            if match:
                api_version = f"v{match.group(1)}"
            else:
                # Default to v1 if no version is specified
                api_version = "v1"
        
        return api_version


def add_version_prefix(version: str = "v1"):
    """
    Decorator to add version prefix to routes
    """
    def decorator(func: Callable) -> Callable:
        # This decorator can be used to ensure routes are versioned
        return func
    return decorator


def validate_api_version(request: Request, supported_versions: list = ["v1"]) -> bool:
    """
    Validate if requested API version is supported
    """
    requested_version = getattr(request.state, 'api_version', 'v1')
    
    if requested_version not in supported_versions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"API version {requested_version} is not supported. Supported versions: {supported_versions}"
        )
    
    return True


def get_request_context(request: Request) -> dict:
    """
    Get request context including version and request ID
    """
    return {
        "api_version": getattr(request.state, 'api_version', 'v1'),
        "request_id": getattr(request.state, 'request_id', str(uuid.uuid4())),
        "timestamp": time.time(),
        "path": request.url.path,
        "method": request.method,
        "client": request.client.host if request.client else "unknown"
    }