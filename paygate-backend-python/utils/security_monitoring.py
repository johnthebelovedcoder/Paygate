"""
Security monitoring utilities for PayGate API
"""
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import Request
from utils.enhanced_logging import log_security_event


class SecurityMonitor:
    """
    Class to handle security monitoring and threat detection
    """
    
    def __init__(self):
        self.logger = logging.getLogger("security")
        self.failed_login_attempts = {}  # Track failed login attempts by IP
        self.brute_force_threshold = 5  # Max attempts before blocking
        self.brute_force_window = 300  # Time window in seconds (5 minutes)
    
    def log_failed_login_attempt(self, request: Request, email: Optional[str] = None):
        """
        Log failed login attempts and detect potential brute force attacks
        """
        client_ip = request.client.host if request.client else "unknown"
        current_time = datetime.utcnow().timestamp()
        
        # Initialize tracking for this IP if not already done
        if client_ip not in self.failed_login_attempts:
            self.failed_login_attempts[client_ip] = []
        
        # Add the current attempt
        self.failed_login_attempts[client_ip].append(current_time)
        
        # Clean up old attempts (older than the window)
        self.failed_login_attempts[client_ip] = [
            timestamp for timestamp in self.failed_login_attempts[client_ip]
            if current_time - timestamp <= self.brute_force_window
        ]
        
        # Check if we've exceeded the threshold
        if len(self.failed_login_attempts[client_ip]) > self.brute_force_threshold:
            self.log_security_event(
                "BRUTE_FORCE_ATTEMPT",
                request,
                {"email_attempted": email, "attempts_count": len(self.failed_login_attempts[client_ip])}
            )
            return True  # Indicates potential brute force attack
        
        return False  # Not a brute force attack yet
    
    def log_security_event(self, event_type: str, request: Request, details: Dict[str, Any] = None):
        """
        Log a security event using the enhanced logging
        """
        log_security_event(event_type, request, details)
    
    def log_suspicious_activity(self, request: Request, activity_type: str, details: Dict[str, Any] = None):
        """
        Log suspicious activity
        """
        self.log_security_event(
            f"SUSPICIOUS_ACTIVITY_{activity_type.upper()}",
            request,
            details
        )
    
    def validate_request_integrity(self, request: Request) -> bool:
        """
        Basic request integrity checks
        """
        # Check for suspicious headers
        suspicious_headers = [
            'x-forwarded-for', 'x-real-ip', 'x-client-ip', 'x-originating-ip'
        ]
        
        for header in suspicious_headers:
            if header in request.headers:
                # This could be an attempt to spoof the IP
                value = request.headers[header]
                if isinstance(value, str) and len(value.split(',')) > 3:
                    # Multiple IPs in the header could be suspicious
                    self.log_suspicious_activity(
                        request,
                        "IP_SPOOFING_ATTEMPT",
                        {"header": header, "value": value}
                    )
                    return False
        
        # Check for content length anomalies
        content_length = request.headers.get('content-length')
        if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB
            self.log_suspicious_activity(
                request,
                "LARGE_REQUEST_SIZE",
                {"content_length": content_length}
            )
            # Consider allowing larger payloads only for specific endpoints
            if not any(endpoint in request.url.path for endpoint in ['/api/upload', '/api/uploads']):
                return False
        
        return True


# Create a global instance
security_monitor = SecurityMonitor()


def is_request_safe(request: Request) -> bool:
    """
    Check if the request passes basic security checks
    """
    return security_monitor.validate_request_integrity(request)


def monitor_failed_login(request: Request, email: Optional[str] = None):
    """
    Monitor and log failed login attempts
    """
    return security_monitor.log_failed_login_attempt(request, email)