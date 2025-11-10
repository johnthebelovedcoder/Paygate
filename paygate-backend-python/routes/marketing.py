from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import DiscountCode, Affiliate, AffiliateReferral, MarketingCampaign, EmailSubscriber
from schemas import *
from services import marketing_service
from utils.auth import get_current_user
from typing import List

router = APIRouter()


# Discount Codes
@router.get("/promo-codes", response_model=List[DiscountCode])
async def get_discount_codes(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admin can access all discount codes
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view all discount codes"
        )
    # In a real implementation, we would fetch discount codes from the database
    # For now, this is a placeholder to match the frontend service call
    return []


@router.post("/promo-codes", response_model=DiscountCode)
async def create_discount_code(
    discount_code: DiscountCodeCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admin can create discount codes
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create discount codes"
        )
    created_code = await marketing_service.create_discount_code(db, discount_code)
    return created_code


@router.put("/promo-codes/{code_id}", response_model=DiscountCode)
async def update_discount_code(
    code_id: int,
    discount_code: DiscountCodeCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admin can update discount codes
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update discount codes"
        )
    # In a real implementation, we would update the code in the database
    # For now, return an error as this endpoint structure is for compatibility
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Update discount code endpoint not fully implemented"
    )


@router.delete("/promo-codes/{code_id}")
async def delete_discount_code(
    code_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admin can delete discount codes
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete discount codes"
        )
    # In a real implementation, we would delete the code from the database
    # For now, return a success message
    return {"message": "Discount code deleted successfully"}


@router.get("/promo-codes/{code_id}", response_model=DiscountCode)
async def get_discount_code(
    code_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # In a real implementation, we would fetch the code from the database
    # For now, return an error as this endpoint structure is for compatibility
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Get discount code endpoint not fully implemented"
    )


# Affiliate Management
@router.get("/marketing/affiliates", response_model=List[Affiliate])
async def get_affiliates(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admin can access all affiliates
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view affiliates"
        )
    # In a real implementation, we would fetch affiliates from the database
    # For now, this is a placeholder to match the frontend service call
    return []


@router.get("/marketing/my-affiliate", response_model=Affiliate)
async def get_my_affiliate(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get the affiliate data for the current user
    affiliate = await marketing_service.get_affiliate_by_user_id(db, current_user.id)
    if not affiliate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Affiliate data not found for this user"
        )
    return affiliate


@router.post("/marketing/my-affiliate", response_model=Affiliate)
async def create_my_affiliate(
    affiliate: AffiliateCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Create affiliate data for the current user
    # First check if user already has affiliate data
    existing_affiliate = await marketing_service.get_affiliate_by_user_id(db, current_user.id)
    if existing_affiliate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have affiliate data"
        )
    
    # Set the user_id to the current user
    affiliate_dict = affiliate.model_dump()
    affiliate_dict['user_id'] = current_user.id
    affiliate_create = AffiliateCreate(**affiliate_dict)
    
    created_affiliate = await marketing_service.create_affiliate(db, affiliate_create)
    return created_affiliate


@router.post("/marketing/affiliates", response_model=Affiliate)
async def create_affiliate(
    affiliate: AffiliateCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admin can create affiliates
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create affiliates"
        )
    created_affiliate = await marketing_service.create_affiliate(db, affiliate)
    return created_affiliate


@router.put("/marketing/affiliates/{affiliate_id}", response_model=Affiliate)
async def update_affiliate(
    affiliate_id: int,
    affiliate: AffiliateCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admin can update affiliates
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update affiliates"
        )
    # In a real implementation, we would update the affiliate in the database
    # For now, return an error as this endpoint structure is for compatibility
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Update affiliate endpoint not fully implemented"
    )


@router.delete("/marketing/affiliates/{affiliate_id}")
async def delete_affiliate(
    affiliate_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admin can delete affiliates
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete affiliates"
        )
    # In a real implementation, we would delete the affiliate from the database
    # For now, return a success message
    return {"message": "Affiliate deleted successfully"}


@router.get("/marketing/affiliates/{affiliate_code}", response_model=Affiliate)
async def get_affiliate_by_code(
    affiliate_code: str,
    db: AsyncSession = Depends(get_db)
):
    affiliate = await marketing_service.get_affiliate_by_code(db, affiliate_code)
    if not affiliate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Affiliate not found"
        )
    return affiliate


# Marketing Campaigns
@router.get("/marketing/campaigns", response_model=List[MarketingCampaign])
async def get_marketing_campaigns(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admin can access marketing campaigns
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view marketing campaigns"
        )
    campaigns = await marketing_service.get_active_marketing_campaigns(db)
    return campaigns