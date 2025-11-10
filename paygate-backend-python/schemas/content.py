from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from utils.validation import sanitize_string, is_valid_title, is_valid_description, is_valid_url


class ContentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=10000)  # Increased max length
    type: str = Field(..., min_length=1, max_length=50)
    url: Optional[str] = Field(None, max_length=500)
    is_protected: bool = False
    price: Optional[float] = Field(None, ge=0.0, le=1000000.0)  # Limited max price
    currency: Optional[str] = Field("USD", min_length=3, max_length=3)
    owner_id: int = Field(..., gt=0)

    @validator('title', pre=True)
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
            raise ValueError('Invalid description format')
        return sanitize_string(v)

    @validator('url', pre=True)
    def validate_and_sanitize_url(cls, v):
        if v is None:
            return v
        if not is_valid_url(v):
            raise ValueError('Invalid URL format')
        return sanitize_string(v)

    @validator('type', pre=True)
    def validate_content_type(cls, v):
        allowed_types = ['text', 'image', 'video', 'audio', 'document', 'link', 'other']
        if v.lower() not in allowed_types:
            raise ValueError(f'Content type must be one of: {", ".join(allowed_types)}')
        return sanitize_string(v.lower())

    @validator('currency', pre=True)
    def validate_currency_format(cls, v):
        # Basic ISO 4217 currency code validation
        if not v.isalpha() or len(v) != 3:
            raise ValueError('Currency must be a valid 3-letter ISO code')
        return v.upper()


class ContentCreateRequest(BaseModel):  # New schema for request input (without owner_id)
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=10000)  # Increased max length
    type: str = Field(..., min_length=1, max_length=50)
    url: Optional[str] = Field(None, max_length=500)
    is_protected: bool = False
    price: Optional[float] = Field(None, ge=0.0, le=1000000.0)  # Limited max price
    currency: Optional[str] = Field("USD", min_length=3, max_length=3)

    @validator('title', pre=True)
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
            raise ValueError('Invalid description format')
        return sanitize_string(v)

    @validator('url', pre=True)
    def validate_and_sanitize_url(cls, v):
        if v is None:
            return v
        if not is_valid_url(v):
            raise ValueError('Invalid URL format')
        return sanitize_string(v)

    @validator('type', pre=True)
    def validate_content_type(cls, v):
        allowed_types = ['text', 'image', 'video', 'audio', 'document', 'link', 'other']
        if v.lower() not in allowed_types:
            raise ValueError(f'Content type must be one of: {", ".join(allowed_types)}')
        return sanitize_string(v.lower())

    @validator('currency', pre=True)
    def validate_currency_format(cls, v):
        # Basic ISO 4217 currency code validation
        if not v.isalpha() or len(v) != 3:
            raise ValueError('Currency must be a valid 3-letter ISO code')
        return v.upper()


class ContentCreate(ContentBase):
    pass


class ContentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=10000)  # Increased max length
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    url: Optional[str] = Field(None, max_length=500)
    is_protected: Optional[bool] = None
    price: Optional[float] = Field(None, ge=0.0, le=1000000.0)  # Limited max price
    currency: Optional[str] = Field(None, min_length=3, max_length=3)

    @validator('title', pre=True)
    def validate_and_sanitize_title(cls, v):
        if v is None:
            return v
        if not is_valid_title(v):
            raise ValueError('Invalid title format')
        return sanitize_string(v)

    @validator('description', pre=True)
    def validate_and_sanitize_description(cls, v):
        if v is None:
            return v
        if not is_valid_description(v):
            raise ValueError('Invalid description format')
        return sanitize_string(v)

    @validator('url', pre=True)
    def validate_and_sanitize_url(cls, v):
        if v is None:
            return v
        if not is_valid_url(v):
            raise ValueError('Invalid URL format')
        return sanitize_string(v)

    @validator('type', pre=True)
    def validate_content_type(cls, v):
        if v is None:
            return v
        allowed_types = ['text', 'image', 'video', 'audio', 'document', 'link', 'other']
        if v.lower() not in allowed_types:
            raise ValueError(f'Content type must be one of: {", ".join(allowed_types)}')
        return sanitize_string(v.lower())

    @validator('currency', pre=True)
    def validate_currency_format(cls, v):
        if v is None:
            return v
        # Basic ISO 4217 currency code validation
        if not v.isalpha() or len(v) != 3:
            raise ValueError('Currency must be a valid 3-letter ISO code')
        return v.upper()


class ContentUpdateProtection(BaseModel):
    is_protected: bool
    price: Optional[float] = None
    currency: Optional[str] = None
    paywall_title: Optional[str] = None
    paywall_description: Optional[str] = None


class Content(ContentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContentResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Content] = None


class ContentListResponse(BaseModel):
    success: bool
    message: str
    data: list[Content]
    count: Optional[int] = None


class FileUploadResponse(BaseModel):
    success: bool
    message: str
    url: str
    size: int
    original_name: str
    mime_type: str