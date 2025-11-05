from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ContentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    type: str = Field(..., min_length=1, max_length=50)
    url: Optional[str] = Field(None, max_length=500)
    is_protected: bool = False
    price: Optional[float] = Field(None, ge=0.0)  # greater than or equal to 0
    currency: Optional[str] = Field("USD", min_length=3, max_length=3)
    owner_id: int = Field(..., gt=0)


class ContentCreateRequest(BaseModel):  # New schema for request input (without owner_id)
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    type: str = Field(..., min_length=1, max_length=50)
    url: Optional[str] = Field(None, max_length=500)
    is_protected: bool = False
    price: Optional[float] = Field(None, ge=0.0)  # greater than or equal to 0
    currency: Optional[str] = Field("USD", min_length=3, max_length=3)


class ContentCreate(ContentBase):
    pass


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    url: Optional[str] = None
    is_protected: Optional[bool] = None
    price: Optional[float] = None
    currency: Optional[str] = None


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