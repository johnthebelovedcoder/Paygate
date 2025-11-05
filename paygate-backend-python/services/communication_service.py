from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime
from models import Notification, NotificationPreference
from schemas import NotificationPreferenceUpdate


# Notification Preference Services
async def get_notification_preferences_by_user(db: AsyncSession, user_id: int) -> Optional[NotificationPreference]:
    result = await db.execute(
        select(NotificationPreference).filter(NotificationPreference.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def create_notification_preferences(db: AsyncSession, user_id: int) -> NotificationPreference:
    """Create default notification preferences for a user"""
    default_preferences = NotificationPreference(
        user_id=user_id,
        email_notifications=True,
        push_notifications=True,
        in_app_notifications=True,
        marketing_emails=False,
        newsletter=False
    )
    db.add(default_preferences)
    await db.commit()
    await db.refresh(default_preferences)
    return default_preferences


async def update_notification_preferences(
    db: AsyncSession, 
    user_id: int, 
    preferences_update: NotificationPreferenceUpdate
) -> NotificationPreference:
    # Get existing preferences or create default ones
    preferences = await get_notification_preferences_by_user(db, user_id)
    if not preferences:
        # Create default preferences if none exist
        preferences = await create_notification_preferences(db, user_id)
    
    # Update preferences with provided values
    for field, value in preferences_update.model_dump(exclude_unset=True).items():
        setattr(preferences, field, value)
    
    await db.commit()
    await db.refresh(preferences)
    return preferences


# Notification Services
async def get_notifications_by_user(db: AsyncSession, user_id: int) -> List[Notification]:
    result = await db.execute(
        select(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    return result.scalars().all()


async def get_unread_notifications_by_user(db: AsyncSession, user_id: int) -> List[Notification]:
    result = await db.execute(
        select(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
        .order_by(Notification.created_at.desc())
    )
    return result.scalars().all()


async def mark_notification_as_read(db: AsyncSession, notification_id: int, user_id: int) -> bool:
    result = await db.execute(
        select(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
    )
    notification = result.scalar_one_or_none()
    
    if notification:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        await db.commit()
        return True
    
    return False


async def mark_all_notifications_as_read(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        select(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
    )
    notifications = result.scalars().all()
    
    count = 0
    for notification in notifications:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        count += 1
    
    if count > 0:
        await db.commit()
    
    return count


async def delete_notification(db: AsyncSession, notification_id: int, user_id: int) -> bool:
    result = await db.execute(
        select(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
    )
    notification = result.scalar_one_or_none()
    
    if notification:
        await db.delete(notification)
        await db.commit()
        return True
    
    return False