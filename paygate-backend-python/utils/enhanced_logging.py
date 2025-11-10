"""
Enhanced logging configuration for PayGate API
"""
import logging
import json
import sys
from datetime import datetime
from typing import Dict, Any
from fastapi import Request, Response
from config.settings import settings


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging
    """
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcfromtimestamp(record.created).isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }

        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        # Add extra fields if present
        if hasattr(record, 'request_id'):
            log_entry["request_id"] = record.request_id
        if hasattr(record, 'user_id'):
            log_entry["user_id"] = record.user_id
        if hasattr(record, 'api_version'):
            log_entry["api_version"] = record.api_version

        return json.dumps(log_entry)


def setup_logging():
    """
    Set up logging configuration
    """
    # Create a custom logger
    logger = logging.getLogger()
    
    # Remove default handlers to avoid duplicate logs
    logger.handlers.clear()
    
    # Set level based on settings
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # Create console handler with a higher log level
    console_handler = logging.StreamHandler(sys.stdout)
    
    # Create formatter based on settings
    if settings.LOG_FORMAT == "json":
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    console_handler.setFormatter(formatter)
    
    # Add handlers to the logger
    logger.addHandler(console_handler)
    
    # Prevent propagation to avoid duplicate logs
    logger.propagate = False
    
    return logger


def log_api_request(request: Request, response: Response = None, extra: Dict[str, Any] = None):
    """
    Log API request details
    """
    logger = logging.getLogger("api")
    
    if extra is None:
        extra = {}
    
    # Add request context to extra if available
    if hasattr(request.state, 'request_id'):
        extra['request_id'] = request.state.request_id
    if hasattr(request.state, 'api_version'):
        extra['api_version'] = request.state.api_version
    
    logger.info(
        f"API Request: {request.method} {request.url.path}",
        extra=extra
    )


def log_api_response(request: Request, response: Response, execution_time: float):
    """
    Log API response details
    """
    logger = logging.getLogger("api")
    
    extra = {
        'request_id': getattr(request.state, 'request_id', None),
        'api_version': getattr(request.state, 'api_version', None),
        'status_code': response.status_code,
        'execution_time_ms': round(execution_time * 1000, 2)
    }
    
    logger.info(
        f"API Response: {response.status_code} for {request.method} {request.url.path}",
        extra=extra
    )


def log_error(request: Request, error: Exception, is_internal: bool = False):
    """
    Log error with request context
    """
    logger = logging.getLogger("errors")
    
    extra = {
        'request_id': getattr(request.state, 'request_id', None),
        'api_version': getattr(request.state, 'api_version', None),
        'error_type': type(error).__name__,
        'is_internal': is_internal
    }
    
    logger.error(
        f"API Error: {str(error)} in {request.method} {request.url.path}",
        extra=extra,
        exc_info=True  # Include exception info
    )


def log_security_event(event_type: str, request: Request = None, details: Dict[str, Any] = None):
    """
    Log security-related events
    """
    logger = logging.getLogger("security")
    
    extra = {
        'event_type': event_type,
        'request_id': getattr(request.state, 'request_id', None) if request else None,
        'client_ip': request.client.host if request else None
    }
    
    if details:
        extra.update(details)
    
    logger.warning(f"Security event: {event_type}", extra=extra)


def log_user_action(action: str, user_id: str, request: Request = None, details: Dict[str, Any] = None):
    """
    Log user actions for audit trail
    """
    logger = logging.getLogger("audit")
    
    extra = {
        'action': action,
        'user_id': user_id,
        'request_id': getattr(request.state, 'request_id', None) if request else None,
        'api_version': getattr(request.state, 'api_version', None) if request else None
    }
    
    if details:
        extra.update(details)
    
    logger.info(f"User action: {action} by user {user_id}", extra=extra)