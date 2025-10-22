from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ContentAccessBase(BaseModel):
    content_id: int
    user_id: int
    granted_by: str
    expires_at: Optional[datetime] = None


class ContentAccessCreate(ContentAccessBase):
    pass


class ContentAccessUpdate(BaseModel):
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None


class ContentAccess(ContentAccessBase):
    id: int
    granted_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class AccessRequest(BaseModel):
    content_id: int
    access_type: str = "view"  # view, download, etc.


class AccessResponse(BaseModel):
    success: bool
    message: str
    access_granted: bool
    expires_at: Optional[datetime] = None
    signed_url: Optional[str] = None


class ContentAccessCheck(BaseModel):
    has_access: bool
    expires_at: Optional[datetime] = None
    access_type: str = "view"