from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Notification schemas
class NotificationBase(BaseModel):
    user_id: int
    title: str
    message: str
    notification_type: str = "info"
    priority: str = "normal"
    is_read: bool = False
    is_sent: bool = False
    sent_via: Optional[str] = None
    data: Optional[str] = None


class NotificationCreate(NotificationBase):
    pass


class Notification(NotificationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationPreferenceBase(BaseModel):
    user_id: int
    email_notifications: bool = True
    push_notifications: bool = True
    in_app_notifications: bool = True
    marketing_emails: bool = True
    newsletter: bool = True


class NotificationPreferenceCreate(NotificationPreferenceBase):
    pass


class NotificationPreference(NotificationPreferenceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationPreferenceUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    in_app_notifications: Optional[bool] = None
    marketing_emails: Optional[bool] = None
    newsletter: Optional[bool] = None