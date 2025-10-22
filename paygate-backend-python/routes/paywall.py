from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import Paywall
from schemas import *
from services import paywall_service
from utils.auth import get_current_user
from utils.pagination import PaginationParams, create_paginated_response
from typing import List
import json

router = APIRouter()

@router.get("/paywalls")
async def get_paywalls(
    pagination: PaginationParams = Depends(),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    paywalls, total = await paywall_service.get_paywalls_by_owner(db, current_user.id, pagination)
    return create_paginated_response(paywalls, total, pagination.page, pagination.limit)


@router.get("/paywalls/{paywall_id}", response_model=Paywall)
async def get_paywall(
    paywall_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    paywall = await paywall_service.get_paywall_by_id(db, paywall_id)
    if not paywall or paywall.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paywall not found"
        )
    return paywall


@router.post("/paywalls", response_model=Paywall)
async def create_paywall(
    paywall: PaywallCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Set the owner ID to the current user
    paywall_with_owner = paywall.copy(update={"owner_id": current_user.id})
    created_paywall = await paywall_service.create_paywall(db, paywall_with_owner)
    return created_paywall


@router.put("/paywalls/{paywall_id}", response_model=Paywall)
async def update_paywall(
    paywall_id: int,
    paywall_update: PaywallUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    paywall = await paywall_service.get_paywall_by_id(db, paywall_id)
    if not paywall or paywall.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paywall not found"
        )
    
    updated_paywall = await paywall_service.update_paywall(db, paywall_id, paywall_update)
    if not updated_paywall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paywall not found"
        )
    return updated_paywall


@router.delete("/paywalls/{paywall_id}")
async def delete_paywall(
    paywall_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    paywall = await paywall_service.get_paywall_by_id(db, paywall_id)
    if not paywall or paywall.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paywall not found"
        )
    
    success = await paywall_service.delete_paywall(db, paywall_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paywall not found"
        )
    return {"message": "Paywall deleted successfully"}


@router.get("/paywalls/{paywall_id}/stats", response_model=PaywallStats)
async def get_paywall_stats(
    paywall_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    paywall = await paywall_service.get_paywall_by_id(db, paywall_id)
    if not paywall or paywall.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paywall not found"
        )
    
    stats = await paywall_service.get_paywall_stats(db, paywall_id)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stats not available"
        )
    
    return PaywallStats(**stats)