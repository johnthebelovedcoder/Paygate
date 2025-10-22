from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple
from datetime import datetime
import json
from models import Paywall, User
from schemas.paywall import PaywallCreate, PaywallUpdate
from utils.pagination import PaginationParams


async def get_paywall_by_id(db: AsyncSession, paywall_id: int) -> Optional[Paywall]:
    result = await db.execute(
        select(Paywall)
        .options(selectinload(Paywall.owner))
        .filter(Paywall.id == paywall_id)
    )
    return result.scalar_one_or_none()


async def get_paywalls_by_owner(db: AsyncSession, owner_id: int, pagination: PaginationParams) -> Tuple[List[Paywall], int]:
    # Get total count efficiently
    count_result = await db.execute(
        select(Paywall.id)
        .filter(Paywall.owner_id == owner_id)
    )
    total = len(count_result.scalars().all())
    
    # Get paginated results with eager loading
    result = await db.execute(
        select(Paywall)
        .options(selectinload(Paywall.owner))
        .filter(Paywall.owner_id == owner_id)
        .order_by(Paywall.created_at.desc())
        .offset(pagination.calculate_offset())
        .limit(pagination.limit)
    )
    items = result.scalars().all()
    
    return items, total


async def get_all_paywalls(db: AsyncSession, pagination: PaginationParams) -> Tuple[List[Paywall], int]:
    # Get total count efficiently
    count_result = await db.execute(
        select(Paywall.id)
    )
    total_count = len(count_result.scalars().all())
    
    # Get paginated results with eager loading
    result = await db.execute(
        select(Paywall)
        .options(selectinload(Paywall.owner))
        .offset(pagination.calculate_offset())
        .limit(pagination.limit)
    )
    items = result.scalars().all()
    
    return items, total_count


async def create_paywall(db: AsyncSession, paywall: PaywallCreate) -> Paywall:
    # Convert content_ids to JSON string
    content_ids_json = json.dumps(paywall.content_ids) if paywall.content_ids else "[]"
    
    db_paywall = Paywall(
        title=paywall.title,
        description=paywall.description,
        content_ids=content_ids_json,
        price=paywall.price,
        currency=paywall.currency,
        duration=paywall.duration,
        status=paywall.status,
        success_redirect_url=paywall.success_redirect_url,
        cancel_redirect_url=paywall.cancel_redirect_url,
        webhook_url=paywall.webhook_url,
        owner_id=paywall.owner_id
    )
    db.add(db_paywall)
    await db.commit()
    await db.refresh(db_paywall)
    return db_paywall


async def update_paywall(db: AsyncSession, paywall_id: int, paywall_update: PaywallUpdate) -> Optional[Paywall]:
    db_paywall = await get_paywall_by_id(db, paywall_id)
    if not db_paywall:
        return None
    
    for field, value in paywall_update.dict(exclude_unset=True).items():
        if field == "content_ids":
            setattr(db_paywall, field, json.dumps(value) if value else "[]")
        else:
            setattr(db_paywall, field, value)
    
    db_paywall.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(db_paywall)
    return db_paywall


async def delete_paywall(db: AsyncSession, paywall_id: int) -> bool:
    db_paywall = await get_paywall_by_id(db, paywall_id)
    if not db_paywall:
        return False
    
    await db.delete(db_paywall)
    await db.commit()
    return True


async def increment_paywall_views(db: AsyncSession, paywall_id: int) -> Optional[Paywall]:
    db_paywall = await get_paywall_by_id(db, paywall_id)
    if not db_paywall:
        return None
    
    db_paywall.views = db_paywall.views + 1
    await db.commit()
    await db.refresh(db_paywall)
    return db_paywall


async def increment_paywall_conversions(db: AsyncSession, paywall_id: int) -> Optional[Paywall]:
    db_paywall = await get_paywall_by_id(db, paywall_id)
    if not db_paywall:
        return None
    
    db_paywall.conversions = db_paywall.conversions + 1
    await db.commit()
    await db.refresh(db_paywall)
    return db_paywall


async def get_paywall_stats(db: AsyncSession, paywall_id: int) -> Optional[dict]:
    db_paywall = await get_paywall_by_id(db, paywall_id)
    if not db_paywall:
        return None
    
    conversion_rate = 0
    if db_paywall.views > 0:
        conversion_rate = (db_paywall.conversions / db_paywall.views) * 100
    
    # Calculate revenue based on conversions and price
    revenue = db_paywall.conversions * db_paywall.price
    
    return {
        "id": db_paywall.id,
        "views": db_paywall.views,
        "conversions": db_paywall.conversions,
        "conversion_rate": round(conversion_rate, 2),
        "revenue": revenue,
        "currency": db_paywall.currency
    }