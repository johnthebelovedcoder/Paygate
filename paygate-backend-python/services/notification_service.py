from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime
from models import Notification, NotificationPreference
from schemas.notification import NotificationCreate, NotificationPreferenceCreate


# Notification Services
async def get_notification_by_id(db: AsyncSession, notification_id: int) -> Optional[Notification]:
    result = await db.execute(select(Notification).filter(Notification.id == notification_id))
    return result.scalar_one_or_none()


async def get_notifications_by_user(db: AsyncSession, user_id: int, limit: int = 50, offset: int = 0) -> List[Notification]:
    result = await db.execute(
        select(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()


async def create_notification(db: AsyncSession, notification: NotificationCreate) -> Notification:
    db_notification = Notification(**notification.model_dump())
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    return db_notification


async def mark_notification_as_read(db: AsyncSession, notification_id: int) -> Optional[Notification]:
    notification = await get_notification_by_id(db, notification_id)
    if notification:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        await db.commit()
        await db.refresh(notification)
    return notification


async def mark_all_notifications_as_read(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        select(Notification)
        .filter(Notification.user_id == user_id)
        .filter(Notification.is_read == False)
    )
    notifications = result.scalars().all()
    
    for notification in notifications:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
    
    await db.commit()
    return len(notifications)


# Notification Preferences Services
async def get_notification_preferences(db: AsyncSession, user_id: int) -> Optional[NotificationPreference]:
    result = await db.execute(select(NotificationPreference).filter(NotificationPreference.user_id == user_id))
    return result.scalar_one_or_none()


async def create_or_update_notification_preferences(db: AsyncSession, preferences: NotificationPreferenceCreate) -> NotificationPreference:
    # Check if preferences already exist for user
    existing = await get_notification_preferences(db, preferences.user_id)
    if existing:
        # Update existing record
        for field, value in preferences.model_dump().items():
            setattr(existing, field, value)
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        # Create new record
        db_preferences = NotificationPreference(**preferences.model_dump())
        db.add(db_preferences)
        await db.commit()
        await db.refresh(db_preferences)
        return db_preferences