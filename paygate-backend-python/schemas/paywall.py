from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from utils.validation import sanitize_string, sanitize_text, is_valid_title, is_valid_description, is_valid_url
import json
from pydantic import field_validator

class PaywallBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=10000)
    content_ids: List[int] = []
    price: float = Field(..., ge=0)
    currency: str = Field("USD", min_length=3, max_length=3)
    duration: Optional[int] = Field(None, ge=1)  # Duration in days
    status: str = Field("draft", min_length=1, max_length=20)  # draft, active, inactive
    success_redirect_url: Optional[str] = Field(None, max_length=2048)
    cancel_redirect_url: Optional[str] = Field(None, max_length=2048)
    webhook_url: Optional[str] = Field(None, max_length=2048)
    owner_id: int
    # Access settings
    download_limit: Optional[int] = Field(0, ge=0)  # 0 means unlimited
    expiration_days: Optional[int] = Field(0, ge=0)  # 0 means never expires
    customer_restrictions: Optional[List[str]] = []  # List of email restrictions

    @validator('title')
    def validate_and_sanitize_title(cls, v):
        if not v:
            raise ValueError('Title is required')
        if not is_valid_title(v):
            raise ValueError('Invalid title format')
        return sanitize_string(v)

    @validator('description', pre=True)
    def validate_and_sanitize_description(cls, v):
        if v is None:
            return v
        if not is_valid_description(v):
            raise ValueError('Invalid description')
        return sanitize_text(v)

    @validator('currency')
    def validate_currency_format(cls, v):
        if len(v) != 3 or not v.isalpha():
            raise ValueError('Currency must be a 3-letter code')
        return v.upper()

    @validator('success_redirect_url', 'cancel_redirect_url', 'webhook_url', pre=True)
    def validate_and_sanitize_url(cls, v):
        if v is None:
            return v
        if not is_valid_url(v):
            raise ValueError('Invalid URL format')
        return sanitize_string(v)

    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ['draft', 'active', 'inactive', 'archived']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of {valid_statuses}')
        return v


class PaywallCreateRequest(BaseModel):  # New schema for request input
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=10000)
    content_ids: List[int] = []
    price: float = Field(..., ge=0)
    currency: str = Field("USD", min_length=3, max_length=3)
    duration: Optional[int] = Field(None, ge=1)  # Duration in days
    status: str = Field("draft", min_length=1, max_length=20)  # draft, active, inactive
    success_redirect_url: Optional[str] = Field(None, max_length=2048)
    cancel_redirect_url: Optional[str] = Field(None, max_length=2048)
    webhook_url: Optional[str] = Field(None, max_length=2048)
    # Access settings
    download_limit: Optional[int] = Field(0, ge=0)  # 0 means unlimited
    expiration_days: Optional[int] = Field(0, ge=0)  # 0 means never expires
    customer_restrictions: Optional[List[str]] = []  # List of email restrictions

    @validator('title')
    def validate_and_sanitize_title(cls, v):
        if not v:
            raise ValueError('Title is required')
        if not is_valid_title(v):
            raise ValueError('Invalid title format')
        return sanitize_string(v)

    @validator('description', pre=True)
    def validate_and_sanitize_description(cls, v):
        if v is None:
            return v
        if not is_valid_description(v):
            raise ValueError('Invalid description')
        return sanitize_text(v)

    @validator('currency')
    def validate_currency_format(cls, v):
        if len(v) != 3 or not v.isalpha():
            raise ValueError('Currency must be a 3-letter code')
        return v.upper()

    @validator('success_redirect_url', 'cancel_redirect_url', 'webhook_url', pre=True)
    def validate_and_sanitize_url(cls, v):
        if v is None:
            return v
        if not is_valid_url(v):
            raise ValueError('Invalid URL format')
        return sanitize_string(v)

    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ['draft', 'active', 'inactive', 'archived']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of {valid_statuses}')
        return v


class PaywallCreate(PaywallBase):
    pass


class PaywallUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content_ids: Optional[List[int]] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    duration: Optional[int] = None
    status: Optional[str] = None
    success_redirect_url: Optional[str] = None
    cancel_redirect_url: Optional[str] = None
    webhook_url: Optional[str] = None
    # Access settings
    download_limit: Optional[int] = None
    expiration_days: Optional[int] = None
    customer_restrictions: Optional[List[str]] = None

    @validator('title', 'description', 'currency', 'success_redirect_url', 'cancel_redirect_url', 'webhook_url', pre=True)
    def validate_and_sanitize_update_fields(cls, v):
        if v is None:
            return v
        return sanitize_string(v)

    @validator('status', pre=True)
    def validate_status_update(cls, v):
        if v is None:
            return v
        valid_statuses = ['draft', 'active', 'inactive', 'archived']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of {valid_statuses}')
        return v
    
    @validator('price', 'duration', pre=True)
    def validate_numeric_fields(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError('Value must be non-negative')
        return v


class Paywall(PaywallBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @field_validator('content_ids', mode='before')
    @classmethod
    def validate_content_ids(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        return v if v is not None else []

    @field_validator('customer_restrictions', mode='before')
    @classmethod
    def validate_customer_restrictions(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        return v if v is not None else []


class PaywallStats(BaseModel):
    id: int
    views: int
    conversions: int
    conversion_rate: float
    revenue: float
    currency: str


class PaywallResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Paywall] = None


class PaywallListResponse(BaseModel):
    success: bool
    message: str
    data: List[Paywall]
    count: Optional[int] = None


class PaywallStatsResponse(BaseModel):
    success: bool
    message: str
    data: Optional[PaywallStats] = None