from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import Notification, NotificationPreference, User
from schemas import *
from services import notification_service
from utils.auth import get_current_user
from utils.pagination import PaginationParams, create_paginated_response
from typing import List

router = APIRouter()


# Notifications
@router.get("/notifications")
async def get_notifications(
    pagination: PaginationParams = Depends(),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notifications, total = await notification_service.get_notifications_by_user(db, current_user.id, pagination.limit, pagination.calculate_offset())
    return create_paginated_response(notifications, total, pagination.page, pagination.limit)


@router.get("/notifications/unread-count")
async def get_unread_notifications_count(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    all_notifications = await notification_service.get_notifications_by_user(db, current_user.id, 1000, 0)
    unread_count = sum(1 for n in all_notifications if not n.is_read)
    return {"unread_count": unread_count}


@router.put("/notifications/{notification_id}/read", response_model=Notification)
async def mark_notification_as_read(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notification = await notification_service.get_notification_by_id(db, notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    updated_notification = await notification_service.mark_notification_as_read(db, notification_id)
    return updated_notification


@router.put("/notifications/read-all")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    count = await notification_service.mark_all_notifications_as_read(db, current_user.id)
    return {"message": f"Marked {count} notifications as read"}


# Notification Preferences
@router.get("/notifications/preferences", response_model=NotificationPreference)
async def get_notification_preferences(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    preferences = await notification_service.get_notification_preferences(db, current_user.id)
    if not preferences:
        # Create default preferences if not found
        preferences_create = NotificationPreferenceCreate(
            user_id=current_user.id
        )
        preferences = await notification_service.create_or_update_notification_preferences(db, preferences_create)
    return preferences


@router.put("/notifications/preferences", response_model=NotificationPreference)
async def update_notification_preferences(
    preferences: NotificationPreferenceCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if preferences.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update preferences for another user"
        )
    updated_preferences = await notification_service.create_or_update_notification_preferences(db, preferences)
    return updated_preferences