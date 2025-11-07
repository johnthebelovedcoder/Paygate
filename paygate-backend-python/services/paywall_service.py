from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
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
        select(func.count(Paywall.id))
        .filter(Paywall.owner_id == owner_id)
    )
    total = count_result.scalar_one_or_none() or 0
    
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
        select(func.count(Paywall.id))
    )
    total_count = count_result.scalar_one_or_none() or 0
    
    # Get paginated results with eager loading
    result = await db.execute(
        select(Paywall)
        .options(selectinload(Paywall.owner))
        .offset(pagination.calculate_offset())
        .limit(pagination.limit)
    )
    items = result.scalars().all()
    
    return items, total_count


async def create_paywall(db: AsyncSession, paywall_data) -> Paywall:
    try:
        # Handle both dict and Pydantic model for content_ids
        if isinstance(paywall_data, dict):
            content_ids = paywall_data.get('content_ids', [])
            download_limit = paywall_data.get('download_limit', 0)
            expiration_days = paywall_data.get('expiration_days', 0)
            customer_restrictions = paywall_data.get('customer_restrictions', [])
        else:
            content_ids = getattr(paywall_data, 'content_ids', [])
            download_limit = getattr(paywall_data, 'download_limit', 0)
            expiration_days = getattr(paywall_data, 'expiration_days', 0)
            customer_restrictions = getattr(paywall_data, 'customer_restrictions', [])
        
        # Convert content_ids to JSON string, ensuring we always have a valid JSON array
        try:
            content_ids_json = json.dumps(content_ids) if content_ids is not None else "[]"
        except (TypeError, ValueError) as e:
            content_ids_json = "[]"  # Fallback to empty array
            
        # Convert customer_restrictions to JSON string
        try:
            customer_restrictions_json = json.dumps(customer_restrictions) if customer_restrictions is not None else "[]"
        except (TypeError, ValueError) as e:
            customer_restrictions_json = "[]"  # Fallback to empty array
            
        # Handle both dict and Pydantic model for all other fields
        if isinstance(paywall_data, dict):
            db_paywall = Paywall(
                title=paywall_data.get('title', ''),
                description=paywall_data.get('description'),
                content_ids=content_ids_json,
                price=paywall_data.get('price', 0.0),
                currency=paywall_data.get('currency', 'USD'),
                duration=paywall_data.get('duration'),
                status=paywall_data.get('status', 'draft'),
                success_redirect_url=paywall_data.get('success_redirect_url'),
                cancel_redirect_url=paywall_data.get('cancel_redirect_url'),
                webhook_url=paywall_data.get('webhook_url'),
                download_limit=download_limit,
                expiration_days=expiration_days,
                customer_restrictions=customer_restrictions_json,
                owner_id=paywall_data.get('owner_id')
            )
        else:
            db_paywall = Paywall(
                title=getattr(paywall_data, 'title', ''),
                description=getattr(paywall_data, 'description', None),
                content_ids=content_ids_json,
                price=getattr(paywall_data, 'price', 0.0),
                currency=getattr(paywall_data, 'currency', 'USD'),
                duration=getattr(paywall_data, 'duration', None),
                status=getattr(paywall_data, 'status', 'draft'),
                success_redirect_url=getattr(paywall_data, 'success_redirect_url', None),
                cancel_redirect_url=getattr(paywall_data, 'cancel_redirect_url', None),
                webhook_url=getattr(paywall_data, 'webhook_url', None),
                download_limit=getattr(paywall_data, 'download_limit', 0),
                expiration_days=getattr(paywall_data, 'expiration_days', 0),
                customer_restrictions=customer_restrictions_json,
                owner_id=getattr(paywall_data, 'owner_id')
            )
        
        db.add(db_paywall)
        await db.commit()
        await db.refresh(db_paywall)
        return db_paywall
    except Exception as e:
        # Log the error for debugging
        print(f"Error creating paywall: {str(e)}")
        raise  # Re-raise the exception so it can be handled upstream


async def update_paywall(db: AsyncSession, paywall_id: int, paywall_update: PaywallUpdate) -> Optional[Paywall]:
    db_paywall = await get_paywall_by_id(db, paywall_id)
    if not db_paywall:
        return None
    
    for field, value in paywall_update.dict(exclude_unset=True).items():
        if field == "content_ids":
            setattr(db_paywall, field, json.dumps(value) if value else "[]")
        elif field == "customer_restrictions":
            setattr(db_paywall, field, json.dumps(value) if value is not None else "[]")
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