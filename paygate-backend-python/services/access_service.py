from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
from models import ContentAccess, Content, User
from schemas.access import ContentAccessCreate, ContentAccessUpdate, ContentAccessCheck, ContentAccess as ContentAccessSchema


async def get_content_access_by_id(db: AsyncSession, access_id: int) -> Optional[ContentAccess]:
    result = await db.execute(
        select(ContentAccess)
        .options(selectinload(ContentAccess.content), selectinload(ContentAccess.user))
        .filter(ContentAccess.id == access_id)
    )
    return result.scalar_one_or_none()


async def get_content_access(db: AsyncSession, content_id: int, user_id: int) -> Optional[ContentAccess]:
    result = await db.execute(
        select(ContentAccess)
        .options(selectinload(ContentAccess.content), selectinload(ContentAccess.user))
        .filter(ContentAccess.content_id == content_id)
        .filter(ContentAccess.user_id == user_id)
        .filter(ContentAccess.is_active == True)
    )
    return result.scalar_one_or_none()


async def get_content_access_by_user(db: AsyncSession, user_id: int) -> List[ContentAccess]:
    result = await db.execute(
        select(ContentAccess)
        .options(selectinload(ContentAccess.content), selectinload(ContentAccess.user))
        .filter(ContentAccess.user_id == user_id)
        .filter(ContentAccess.is_active == True)
    )
    return result.scalars().all()


async def check_content_access(db: AsyncSession, content_id: int, user_id: int) -> ContentAccessCheck:
    access = await get_content_access(db, content_id, user_id)
    if access:
        # Check if access has expired
        if access.expires_at and access.expires_at < datetime.utcnow():
            # Mark access as inactive if expired
            access.is_active = False
            await db.commit()
            return ContentAccessCheck(has_access=False)
        
        return ContentAccessCheck(
            has_access=True,
            expires_at=access.expires_at,
            access_type=access.granted_by
        )
    
    return ContentAccessCheck(has_access=False)


async def create_content_access(db: AsyncSession, access: ContentAccessCreate) -> ContentAccess:
    db_access = ContentAccess(
        content_id=access.content_id,
        user_id=access.user_id,
        granted_by=access.granted_by,
        expires_at=access.expires_at
    )
    db.add(db_access)
    await db.commit()
    await db.refresh(db_access)
    return db_access


async def update_content_access(db: AsyncSession, access_id: int, access_update: ContentAccessUpdate) -> Optional[ContentAccess]:
    db_access = await get_content_access_by_id(db, access_id)
    if not db_access:
        return None
    
    for field, value in access_update.dict(exclude_unset=True).items():
        setattr(db_access, field, value)
    
    await db.commit()
    await db.refresh(db_access)
    return db_access


async def revoke_content_access(db: AsyncSession, content_id: int, user_id: int) -> bool:
    result = await db.execute(
        select(ContentAccess)
        .filter(ContentAccess.content_id == content_id)
        .filter(ContentAccess.user_id == user_id)
    )
    access = result.scalar_one_or_none()
    
    if not access:
        return False
    
    access.is_active = False
    await db.commit()
    return True


async def track_content_access(db: AsyncSession, content_id: int, user_id: int, access_type: str):
    # For now, we'll just log the access event
    # In a real implementation, we might want to track analytics
    pass