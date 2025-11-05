"""
CORS configuration for the FastAPI application.
"""
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from typing import List, Optional, Union
from starlette.types import ASGIApp
from .settings import settings

# List of allowed methods
ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]

# List of allowed headers
ALLOWED_HEADERS = [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Expose-Headers",
    "X-CSRF-Token",
    "X-File-Name",
    "X-File-Size",
    "X-File-Type",
    "X-Requested-With",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
]

def setup_cors(app: ASGIApp) -> None:
    """
    Configure CORS for the FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    # Use the property to properly handle string or list format
    origins = settings.cors_origins_list
    
    # Print CORS configuration for debugging
    environment = getattr(settings, 'ENVIRONMENT', 'development')
    print("\n=== CORS Configuration ===")
    print(f"Environment: {environment}")
    print(f"Allowed Origins: {origins}")
    print(f"Allowed Methods: {ALLOWED_METHODS}")
    print(f"Allowed Headers: {ALLOWED_HEADERS}")
    print("======================\n")
    
    # Add CORS middleware - this handles both preflight requests and adds headers automatically
    # FastAPI's CORSMiddleware properly handles multiple origins by matching the Origin header
    # of the request with the allowed origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=ALLOWED_METHODS,
        allow_headers=ALLOWED_HEADERS,
        expose_headers=["*"],  # Expose all headers to the browser
        max_age=600,  # 10 minutes
    )
