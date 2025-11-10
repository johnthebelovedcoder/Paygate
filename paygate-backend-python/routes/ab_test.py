"""
AB Testing Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from config.database import get_db
from models.user import User
from models.ab_test import ABTest as ABTestModel
from schemas.ab_test_schema import ABTestCreate, ABTestUpdate, ABTest as ABTestSchema, ABTestResults
from services import ab_test_service
from services.ab_test_service import (
    get_ab_tests_by_owner,
    get_ab_test_by_id,
    create_ab_test,
    update_ab_test,
    delete_ab_test,
    activate_ab_test,
    pause_ab_test,
    complete_ab_test,
    update_variant_metrics as update_variant_metrics_service,
    get_ab_test_results as get_test_results_service
)
from utils.auth import get_current_user

router = APIRouter()


@router.get("/ab-tests", response_model=List[ABTestSchema])
async def get_ab_tests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all AB tests for the current user
    """
    tests = await ab_test_service.get_ab_tests_by_owner(db, current_user.id)
    return tests


@router.get("/ab-tests/{test_id}", response_model=ABTestSchema)
async def get_ab_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific AB test
    """
    test = await ab_test_service.get_ab_test_by_id(db, test_id, current_user.id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AB test not found or you don't have access to it"
        )
    return test


@router.post("/ab-tests", response_model=ABTestSchema)
async def create_ab_test(
    test: ABTestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new AB test
    """
    created_test = await ab_test_service.create_ab_test(db, test, current_user.id)
    return created_test


@router.put("/ab-tests/{test_id}", response_model=ABTestSchema)
async def update_ab_test(
    test_id: int,
    test_update: ABTestUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing AB test
    """
    updated_test = await ab_test_service.update_ab_test(db, test_id, current_user.id, test_update)
    if not updated_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AB test not found or you don't have access to update it"
        )
    return updated_test


@router.delete("/ab-tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ab_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an AB test
    """
    deleted = await ab_test_service.delete_ab_test(db, test_id, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AB test not found or you don't have access to delete it"
        )


@router.post("/ab-tests/{test_id}/activate", response_model=ABTestSchema)
async def activate_ab_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Activate an AB test (set status to running)
    """
    activated_test = await ab_test_service.activate_ab_test(db, test_id, current_user.id)
    if not activated_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AB test not found or you don't have access to activate it"
        )
    return activated_test


@router.post("/ab-tests/{test_id}/pause", response_model=ABTestSchema)
async def pause_ab_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Pause an AB test
    """
    paused_test = await ab_test_service.pause_ab_test(db, test_id, current_user.id)
    if not paused_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AB test not found or you don't have access to pause it"
        )
    return paused_test


@router.post("/ab-tests/{test_id}/complete", response_model=ABTestSchema)
async def complete_ab_test(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Complete an AB test
    """
    completed_test = await ab_test_service.complete_ab_test(db, test_id, current_user.id)
    if not completed_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AB test not found or you don't have access to complete it"
        )
    return completed_test


@router.get("/ab-tests/{test_id}/results", response_model=ABTestResults)
async def get_ab_test_results(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get results for an AB test
    """
    results = await get_test_results_service(db, test_id, current_user.id)
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AB test not found or you don't have access to view results"
        )
    return results


@router.post("/ab-tests/{test_id}/track-visit")
async def track_ab_test_visit(
    test_id: int,
    variant_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Track a visit to an AB test variant
    """
    updated_variant = await update_variant_metrics_service(
        db, test_id, variant_id, current_user.id, 
        increment_visitors=1, increment_conversions=0
    )
    if not updated_variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AB test or variant not found or you don't have access to track for it"
        )
    return {"message": "Visit tracked successfully"}


@router.post("/ab-tests/{test_id}/track-conversion")
async def track_ab_test_conversion(
    test_id: int,
    variant_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Track a conversion for an AB test variant
    """
    updated_variant = await update_variant_metrics_service(
        db, test_id, variant_id, current_user.id, 
        increment_visitors=0, increment_conversions=1
    )
    if not updated_variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AB test or variant not found or you don't have access to track for it"
        )
    return {"message": "Conversion tracked successfully"}