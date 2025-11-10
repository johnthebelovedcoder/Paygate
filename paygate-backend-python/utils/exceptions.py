from fastapi import HTTPException, status
from typing import Optional
import logging

# Get a logger for this module
logger = logging.getLogger(__name__)

class CustomException(HTTPException):
    """Custom exception class for the application"""
    
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST, error_code: Optional[str] = None):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        logger.error(f"CustomException: {detail} (Status: {status_code}, Code: {error_code})")


class DatabaseException(CustomException):
    """Exception for database-related errors"""
    def __init__(self, detail: str, error_code: Optional[str] = "DATABASE_ERROR"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code=error_code
        )


class AuthenticationException(CustomException):
    """Exception for authentication-related errors"""
    def __init__(self, detail: str, error_code: Optional[str] = "AUTH_ERROR"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code=error_code
        )


class AuthorizationException(CustomException):
    """Exception for authorization-related errors"""
    def __init__(self, detail: str, error_code: Optional[str] = "AUTHZ_ERROR"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code=error_code
        )


class ValidationException(CustomException):
    """Exception for validation-related errors"""
    def __init__(self, detail: str, error_code: Optional[str] = "VALIDATION_ERROR"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code=error_code
        )


class RateLimitException(CustomException):
    """Exception for rate limiting errors"""
    def __init__(self, detail: str = "Rate limit exceeded", error_code: Optional[str] = "RATE_LIMIT_ERROR"):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_code=error_code
        )


def handle_error(error: Exception, context: str = ""):
    """
    Generic error handler that logs the error and potentially transforms it
    """
    error_msg = f"{context}: {str(error)}" if context else str(error)
    logger.error(error_msg, exc_info=True)  # Include traceback
    
    # Return appropriate exception based on error type
    if isinstance(error, HTTPException):
        return error
    
    # For database errors (like SQLAlchemy errors)
    if "database" in str(error).lower() or "sql" in str(error).lower():
        return DatabaseException(f"Database error occurred: {str(error)}")
    
    # For general exceptions, return a 500 error
    return CustomException(
        detail=f"An unexpected error occurred: {str(error)}", 
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code="INTERNAL_ERROR"
    )