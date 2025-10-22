from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
import json
from models import SubscriptionPlan, Subscription, Invoice, Coupon, BillingInfo
from schemas.billing import (
    SubscriptionPlanCreate, SubscriptionPlanUpdate, 
    SubscriptionCreate, SubscriptionUpdate,
    InvoiceCreate, InvoiceUpdate,
    CouponCreate, CouponUpdate,
    BillingInfoCreate, BillingInfoUpdate
)
from utils.cache import cache


# Subscription Plan Services
async def get_subscription_plan_by_id(db: AsyncSession, plan_id: int) -> Optional[SubscriptionPlan]:
    # Try to get cached plan first
    cache_key = f"subscription_plan:{plan_id}"
    cached_plan_data = await cache.get(cache_key)
    
    if cached_plan_data:
        plan_dict = json.loads(cached_plan_data)
        return SubscriptionPlan(**plan_dict)
    
    result = await db.execute(select(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    
    # Cache the plan for 1 hour if found
    if plan:
        await cache.set(cache_key, plan.model_dump_json(), expire=3600)
    
    return plan


async def get_active_subscription_plans(db: AsyncSession) -> List[SubscriptionPlan]:
    # Try to get cached plans first
    cache_key = "active_subscription_plans"
    cached_plans_data = await cache.get(cache_key)
    
    if cached_plans_data:
        plans_data = json.loads(cached_plans_data)
        return [SubscriptionPlan(**plan_data) for plan_data in plans_data]
    
    result = await db.execute(
        select(SubscriptionPlan)
        .filter(SubscriptionPlan.is_active == True)
        .order_by(SubscriptionPlan.price)
    )
    plans = result.scalars().all()
    
    # Cache the plans for 1 hour
    await cache.set(cache_key, json.dumps([plan.model_dump() for plan in plans]), expire=3600)
    
    return plans


async def create_subscription_plan(db: AsyncSession, plan: SubscriptionPlanCreate) -> SubscriptionPlan:
    db_plan = SubscriptionPlan(**plan.model_dump())
    db.add(db_plan)
    await db.commit()
    await db.refresh(db_plan)
    return db_plan


# Subscription Services
async def get_subscription_by_id(db: AsyncSession, subscription_id: int) -> Optional[Subscription]:
    result = await db.execute(select(Subscription).filter(Subscription.id == subscription_id))
    return result.scalar_one_or_none()


async def get_subscriptions_by_user(db: AsyncSession, user_id: int) -> List[Subscription]:
    result = await db.execute(
        select(Subscription)
        .filter(Subscription.user_id == user_id)
        .order_by(Subscription.created_at.desc())
    )
    return result.scalars().all()


async def create_subscription(db: AsyncSession, subscription: SubscriptionCreate) -> Subscription:
    db_subscription = Subscription(**subscription.model_dump())
    db.add(db_subscription)
    await db.commit()
    await db.refresh(db_subscription)
    return db_subscription


# Invoice Services
async def get_invoice_by_id(db: AsyncSession, invoice_id: int) -> Optional[Invoice]:
    result = await db.execute(select(Invoice).filter(Invoice.id == invoice_id))
    return result.scalar_one_or_none()


async def get_invoices_by_user(db: AsyncSession, user_id: int) -> List[Invoice]:
    result = await db.execute(
        select(Invoice)
        .filter(Invoice.user_id == user_id)
        .order_by(Invoice.created_at.desc())
    )
    return result.scalars().all()


async def create_invoice(db: AsyncSession, invoice: InvoiceCreate) -> Invoice:
    db_invoice = Invoice(**invoice.model_dump())
    db.add(db_invoice)
    await db.commit()
    await db.refresh(db_invoice)
    return db_invoice


# Coupon Services
async def get_coupon_by_code(db: AsyncSession, code: str) -> Optional[Coupon]:
    result = await db.execute(select(Coupon).filter(Coupon.code == code))
    return result.scalar_one_or_none()


async def create_coupon(db: AsyncSession, coupon: CouponCreate) -> Coupon:
    db_coupon = Coupon(**coupon.model_dump())
    db.add(db_coupon)
    await db.commit()
    await db.refresh(db_coupon)
    return db_coupon


# Billing Info Services
async def get_billing_info_by_user(db: AsyncSession, user_id: int) -> Optional[BillingInfo]:
    result = await db.execute(select(BillingInfo).filter(BillingInfo.user_id == user_id))
    return result.scalar_one_or_none()


async def create_or_update_billing_info(db: AsyncSession, billing_info: BillingInfoCreate) -> BillingInfo:
    # Check if billing info already exists for user
    existing = await get_billing_info_by_user(db, billing_info.user_id)
    if existing:
        # Update existing record
        for field, value in billing_info.model_dump().items():
            setattr(existing, field, value)
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        # Create new record
        db_billing_info = BillingInfo(**billing_info.model_dump())
        db.add(db_billing_info)
        await db.commit()
        await db.refresh(db_billing_info)
        return db_billing_info