from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import Notification, NotificationPreference, User
from schemas import *
from services import communication_service
from utils.auth import get_current_user
from typing import List

router = APIRouter()


# Base communications route - returns notifications by default
@router.get("/communications", response_model=List[Notification])
async def get_communications(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's communications (notifications)"""
    notifications = await communication_service.get_notifications_by_user(db, current_user.id)
    return notifications


# Communication Preferences
@router.get("/communications/preferences", response_model=NotificationPreference)
async def get_communication_preferences(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    preferences = await communication_service.get_notification_preferences_by_user(db, current_user.id)
    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification preferences not found"
        )
    return preferences


@router.put("/communications/preferences", response_model=NotificationPreference)
async def update_communication_preferences(
    preferences: NotificationPreferenceUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    updated_preferences = await communication_service.update_notification_preferences(
        db, current_user.id, preferences
    )
    return updated_preferences


# Notifications
@router.get("/communications/notifications", response_model=List[Notification])
async def get_user_notifications(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notifications = await communication_service.get_notifications_by_user(db, current_user.id)
    return notifications


@router.get("/communications/notifications/unread", response_model=List[Notification])
async def get_unread_notifications(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notifications = await communication_service.get_unread_notifications_by_user(db, current_user.id)
    return notifications


@router.post("/communications/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await communication_service.mark_notification_as_read(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or does not belong to user"
        )
    return {"message": "Notification marked as read", "success": True}


@router.post("/communications/notifications/mark-all-read")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    count = await communication_service.mark_all_notifications_as_read(db, current_user.id)
    return {"message": f"{count} notifications marked as read", "count": count}


@router.delete("/communications/notifications/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await communication_service.delete_notification(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or does not belong to user"
        )
    return {"message": "Notification deleted successfully", "success": True}