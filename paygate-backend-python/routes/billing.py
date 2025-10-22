from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import SubscriptionPlan, Subscription, Invoice, BillingInfo, User
from schemas import *
from services import billing_service, user_service
from utils.auth import get_current_user
from typing import List
import uuid

router = APIRouter()


# Subscription Plans
@router.get("/subscription-plans", response_model=List[SubscriptionPlan])
async def get_subscription_plans(db: AsyncSession = Depends(get_db)):
    plans = await billing_service.get_active_subscription_plans(db)
    return plans


@router.post("/subscription-plans", response_model=SubscriptionPlan)
async def create_subscription_plan(
    plan: SubscriptionPlanCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admins can create plans
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create subscription plans"
        )
    created_plan = await billing_service.create_subscription_plan(db, plan)
    return created_plan


# Subscriptions
@router.get("/subscriptions", response_model=List[Subscription])
async def get_user_subscriptions(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    subscriptions = await billing_service.get_subscriptions_by_user(db, current_user.id)
    return subscriptions


@router.post("/subscriptions", response_model=Subscription)
async def create_subscription(
    subscription: SubscriptionCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only allow user to create subscription for themselves
    if subscription.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create subscription for another user"
        )
    created_subscription = await billing_service.create_subscription(db, subscription)
    return created_subscription


# Invoices
@router.get("/invoices", response_model=List[Invoice])
async def get_user_invoices(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    invoices = await billing_service.get_invoices_by_user(db, current_user.id)
    return invoices


@router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(
    invoice_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    invoice = await billing_service.get_invoice_by_id(db, invoice_id)
    if not invoice or invoice.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    return invoice


@router.get("/invoices/{invoice_id}/download")
async def download_invoice(
    invoice_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    invoice = await billing_service.get_invoice_by_id(db, invoice_id)
    if not invoice or invoice.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    # In a real implementation, this would generate and return an invoice PDF
    # For now, return a placeholder
    return {"message": f"Invoice {invoice_id} would be downloaded"}


# Coupons
@router.post("/coupons/validate")
async def validate_coupon(
    code: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    is_valid = await billing_service.is_discount_code_valid(db, code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon code is invalid or expired"
        )
    coupon = await billing_service.get_discount_code_by_code(db, code)
    return {
        "valid": True,
        "discount_type": coupon.discount_type,
        "discount_value": coupon.discount_value
    }


# Billing Information
@router.get("/billing-info", response_model=BillingInfo)
async def get_billing_info(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    billing_info = await billing_service.get_billing_info_by_user(db, current_user.id)
    if not billing_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Billing information not found"
        )
    return billing_info


@router.put("/billing-info", response_model=BillingInfo)
async def update_billing_info(
    billing_info: BillingInfoCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Ensure user can only update their own billing info
    if billing_info.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update billing info for another user"
        )
    updated_info = await billing_service.create_or_update_billing_info(db, billing_info)
    return updated_info