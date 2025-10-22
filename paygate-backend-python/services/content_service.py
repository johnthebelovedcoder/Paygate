from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Optional, Tuple
from datetime import datetime
from models import Content, User
from schemas.content import ContentCreate, ContentUpdate, ContentUpdateProtection
from fastapi import HTTPException, status
from utils.pagination import create_paginated_response, PaginationParams


async def get_content_by_id(db: AsyncSession, content_id: int) -> Optional[Content]:
    result = await db.execute(
        select(Content)
        .options(selectinload(Content.owner))
        .filter(Content.id == content_id)
    )
    return result.scalar_one_or_none()


async def get_content_by_owner(db: AsyncSession, owner_id: int, pagination: PaginationParams) -> Tuple[List[Content], int]:
    # Get total count efficiently
    count_result = await db.execute(
        select(Content.id)
        .filter(Content.owner_id == owner_id)
    )
    total = len(count_result.scalars().all())
    
    # Get paginated results with eager loading
    result = await db.execute(
        select(Content)
        .options(selectinload(Content.owner))
        .filter(Content.owner_id == owner_id)
        .order_by(Content.created_at.desc())
        .offset(pagination.calculate_offset())
        .limit(pagination.limit)
    )
    items = result.scalars().all()
    
    return items, total


async def get_all_content(db: AsyncSession, pagination: PaginationParams) -> Tuple[List[Content], int]:
    # Get total count efficiently
    count_result = await db.execute(
        select(Content.id)
    )
    total_count = len(count_result.scalars().all())
    
    # Get paginated results with eager loading
    result = await db.execute(
        select(Content)
        .options(selectinload(Content.owner))
        .offset(pagination.calculate_offset())
        .limit(pagination.limit)
    )
    items = result.scalars().all()
    
    return items, total_count


async def get_all_content(db: AsyncSession) -> List[Content]:
    result = await db.execute(
        select(Content)
        .options(selectinload(Content.owner))
    )
    return result.scalars().all()


async def create_content(db: AsyncSession, content: ContentCreate) -> Content:
    db_content = Content(
        title=content.title,
        description=content.description,
        type=content.type,
        url=content.url,
        is_protected=content.is_protected,
        price=content.price,
        currency=content.currency,
        owner_id=content.owner_id
    )
    db.add(db_content)
    await db.commit()
    await db.refresh(db_content)
    return db_content


async def update_content(db: AsyncSession, content_id: int, content_update: ContentUpdate) -> Optional[Content]:
    db_content = await get_content_by_id(db, content_id)
    if not db_content:
        return None
    
    for field, value in content_update.dict(exclude_unset=True).items():
        setattr(db_content, field, value)
    
    db_content.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(db_content)
    return db_content


async def update_content_protection(db: AsyncSession, content_id: int, protection_data: ContentUpdateProtection) -> Optional[Content]:
    db_content = await get_content_by_id(db, content_id)
    if not db_content:
        return None
    
    db_content.is_protected = protection_data.is_protected
    if protection_data.price is not None:
        db_content.price = protection_data.price
    if protection_data.currency is not None:
        db_content.currency = protection_data.currency
    if protection_data.paywall_title is not None:
        db_content.paywall_title = protection_data.paywall_title
    if protection_data.paywall_description is not None:
        db_content.paywall_description = protection_data.paywall_description
    
    db_content.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(db_content)
    return db_content


async def delete_content(db: AsyncSession, content_id: int) -> bool:
    db_content = await get_content_by_id(db, content_id)
    if not db_content:
        return False
    
    await db.delete(db_content)
    await db.commit()
    return True