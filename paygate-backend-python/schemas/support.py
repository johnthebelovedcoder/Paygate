from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Support schemas
class SupportCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class SupportCategoryCreate(SupportCategoryBase):
    pass


class SupportCategory(SupportCategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SupportTicketBase(BaseModel):
    user_id: int
    category_id: int
    title: str
    description: str
    priority: str = "medium"
    status: str = "open"
    assigned_to: Optional[int] = None
    resolution: Optional[str] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None


class SupportTicketCreate(SupportTicketBase):
    pass


class SupportTicket(SupportTicketBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SupportTicketResponseBase(BaseModel):
    ticket_id: int
    user_id: int
    message: str
    is_internal: bool = False


class SupportTicketResponseCreate(SupportTicketResponseBase):
    pass


class SupportTicketResponse(SupportTicketResponseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True