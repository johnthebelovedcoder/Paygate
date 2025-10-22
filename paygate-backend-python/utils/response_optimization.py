from typing import Any, Dict, List, Optional
from pydantic import BaseModel
import json

def optimize_response_data(data: Any, fields: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Optimize response data by selecting only required fields
    """
    if isinstance(data, BaseModel):
        data_dict = data.model_dump()
    elif isinstance(data, list):
        return [optimize_response_data(item, fields) for item in data]
    elif isinstance(data, dict):
        data_dict = data
    else:
        return data
    
    # If specific fields are requested, return only those fields
    if fields:
        return {k: v for k, v in data_dict.items() if k in fields}
    
    return data_dict


def minimal_user_response(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Return minimal user information for contexts where full user data isn't needed
    """
    return {
        "id": user_data.get("id"),
        "name": user_data.get("name"),
        "email": user_data.get("email"),
        "created_at": user_data.get("created_at")
    }


def minimal_content_response(content_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Return minimal content information for list views
    """
    return {
        "id": content_data.get("id"),
        "title": content_data.get("title"),
        "type": content_data.get("type"),
        "is_protected": content_data.get("is_protected"),
        "price": content_data.get("price"),
        "currency": content_data.get("currency"),
        "created_at": content_data.get("created_at")
    }