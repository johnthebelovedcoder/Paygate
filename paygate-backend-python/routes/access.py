from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import Content, ContentAccess
from schemas import *
from services import access_service, content_service, paywall_service, payment_service
from utils.auth import get_current_user
from typing import Optional
import uuid
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/access/request", response_model=AccessResponse)
async def request_content_access(
    access_request: AccessRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if content exists and if it's protected
    content = await content_service.get_content_by_id(db, access_request.content_id)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Check if user already has access
    existing_access = await access_service.get_content_access(db, access_request.content_id, current_user.id)
    if existing_access:
        # Check if access is still valid
        if not existing_access.expires_at or existing_access.expires_at >= datetime.utcnow():
            return AccessResponse(
                success=True,
                message="Access already granted",
                access_granted=True,
                expires_at=existing_access.expires_at
            )
    
    # If content is not protected, grant access
    if not content.is_protected:
        access_create = ContentAccessCreate(
            content_id=content.id,
            user_id=current_user.id,
            granted_by="free_content"
        )
        await access_service.create_content_access(db, access_create)
        return AccessResponse(
            success=True,
            message="Access granted",
            access_granted=True
        )
    
    # If content is protected, check if user has purchased it
    # This would require linking content to paywalls and checking payments
    # For now, we'll do a basic check based on if there are any completed payments
    # associated with paywalls that include this content
    
    # In a real implementation, we would check if the user has:
    # 1. Purchased an item that includes this content
    # 2. Has an active subscription that includes this content
    # 3. Has been granted admin/creator access to this content
    # 4. Has access through some other mechanism
    
    return AccessResponse(
        success=True,
        message="Access request processed",
        access_granted=False,
        signed_url=None
    )


@router.get("/access/check/{content_id}", response_model=ContentAccessCheck)
async def check_content_access(
    content_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    access_check = await access_service.check_content_access(db, content_id, current_user.id)
    return access_check


@router.get("/access/signed-url/{content_id}", response_model=AccessResponse)
async def get_signed_url(
    content_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if user has access to the content
    access_check = await access_service.check_content_access(db, content_id, current_user.id)
    
    if not access_check.has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # In a real implementation, this would generate a signed URL for the content
    # For now, we'll return the content URL as is
    content = await content_service.get_content_by_id(db, content_id)
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # In a real implementation, we'd generate a time-limited signed URL
    # For now, just return the original URL
    return AccessResponse(
        success=True,
        message="Signed URL generated",
        access_granted=True,
        signed_url=content.url,
        expires_at=access_check.expires_at
    )


@router.post("/access/track")
async def track_content_access(
    track_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    content_id = track_data.get('contentId')
    access_type = track_data.get('accessType', 'view')
    
    if not content_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="contentId is required"
        )
    
    # Track the access event
    await access_service.track_content_access(db, content_id, current_user.id, access_type)
    return {"message": "Access tracked successfully"}


@router.post("/access/revoke/{content_id}")
async def revoke_content_access(
    content_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await access_service.revoke_content_access(db, content_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access not found or already revoked"
        )
    return {"message": "Access revoked successfully"}