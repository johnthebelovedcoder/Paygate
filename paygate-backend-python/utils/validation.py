"""
Input sanitization utilities for the PayGate application
"""
import html
import re
from typing import Union, List, Dict, Any

def sanitize_string(input_str: str) -> str:
    """
    Sanitize a string by removing potentially dangerous content
    """
    if not isinstance(input_str, str):
        return ""
    
    # Remove potential script tags and other dangerous content
    sanitized = input_str.strip()
    
    # Remove script tags (case insensitive)
    sanitized = re.sub(r'<script[^>]*>.*?</script>', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
    sanitized = re.sub(r'<iframe[^>]*>.*?</iframe>', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove javascript:, vbscript:, data: protocols
    sanitized = re.sub(r'javascript:', '', sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(r'vbscript:', '', sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(r'data:', '', sanitized, flags=re.IGNORECASE)
    
    # Remove event handlers (onerror, onclick, etc.)
    sanitized = re.sub(r'on\w+\s*=', '', sanitized, flags=re.IGNORECASE)
    
    # Remove expression() CSS construct
    sanitized = re.sub(r'expression\(', '', sanitized, flags=re.IGNORECASE)
    
    # Escape HTML characters
    sanitized = html.escape(sanitized)
    
    return sanitized.strip()


def sanitize_email(email: str) -> str:
    """
    Sanitize an email address
    """
    if not isinstance(email, str):
        return ""
    
    # Basic sanitization - only allow email-compatible characters
    sanitized = re.sub(r'[^a-zA-Z0-9@._-]', '', email)
    
    # Ensure it has the basic email format
    if '@' in sanitized and '.' in sanitized.split('@')[-1]:
        return sanitized
    return ""


def sanitize_url(url: str) -> str:
    """
    Sanitize a URL
    """
    if not isinstance(url, str):
        return ""
    
    # Only allow HTTP/HTTPS URLs
    if not re.match(r'^https?://', url, re.IGNORECASE):
        return ""
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\']', '', url)
    
    return sanitized


def sanitize_text(text: str) -> str:
    """
    Sanitize a text field (like description, title, etc.)
    """
    if not isinstance(text, str):
        return ""
    
    # Use the general sanitizer
    sanitized = sanitize_string(text)
    
    # Additional sanitization for text content
    # Remove any remaining script-like content
    sanitized = re.sub(r'<script[^>]*>.*?</script>', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
    
    return sanitized


def sanitize_input(data: Union[str, List, Dict[str, Any], Any]) -> Union[str, List, Dict[str, Any], Any]:
    """
    Recursively sanitize input data
    """
    if isinstance(data, str):
        return sanitize_string(data)
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    elif isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    else:
        return data


def is_valid_email(email: str) -> bool:
    """
    Validate email format
    """
    if not isinstance(email, str):
        return False
    
    # Basic email regex
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email))


def is_valid_url(url: str) -> bool:
    """
    Validate URL format
    """
    if not isinstance(url, str):
        return False
    
    # Basic URL regex
    url_pattern = r'^https?://(?:[-\w.])+(?:\:[0-9]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$'
    return bool(re.match(url_pattern, url))


def is_valid_name(name: str) -> bool:
    """
    Validate name format
    """
    if not isinstance(name, str):
        return False
    
    # Check for valid name characters (letters, spaces, hyphens, apostrophes)
    # Length between 2 and 100 characters
    if len(name) < 2 or len(name) > 100:
        return False
    
    name_pattern = r"^[a-zA-Z\s\-']{2,100}$"
    return bool(re.match(name_pattern, name))


def is_valid_title(title: str) -> bool:
    """
    Validate title format
    """
    if not isinstance(title, str):
        return False
    
    # Check length (2-200 chars)
    if len(title) < 2 or len(title) > 200:
        return False
    
    # Allow letters, numbers, spaces, punctuation but not HTML/script content
    title_pattern = r"^[a-zA-Z0-9\s\-\_\.!@#$%^&*(),?\":{}|<>'+=\[\];~`]{2,200}$"
    return bool(re.match(title_pattern, title))


def is_valid_description(desc: str) -> bool:
    """
    Validate description format
    """
    if not isinstance(desc, str):
        return False
    
    # Check length (max 10,000 chars)
    if len(desc) > 10000:
        return False
    
    return True  # Basic length validation