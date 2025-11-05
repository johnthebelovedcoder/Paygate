from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import User
from schemas import *
from services import user_service
from utils.auth import get_current_user
from typing import Dict, Any, Optional
import shutil
import os
import uuid

router = APIRouter()

@router.get("/users/me", response_model=UserInDB)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the current user's profile"""
    user = await user_service.get_user(db, current_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/users/me", response_model=UserInDB)
async def update_current_user(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the current user's profile"""
    updated_user = await user_service.update_user(
        db, 
        current_user.id,
        user_update.dict(exclude_unset=True)
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user

@router.patch("/users/me/avatar", response_model=UserInDB)
async def update_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update the current user's avatar"""
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed"
        )
    
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads/avatars"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        filename = f"{current_user.id}_{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create a URL for the uploaded file
        avatar_url = f"/api/uploads/avatars/{filename}"
        
        # Update user's avatar URL
        updated_user = await user_service.update_user(
            db,
            current_user.id,
            {"avatar": avatar_url}
        )
        
        return updated_user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )

@router.get("/users/me/preferences")
async def get_user_preferences(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get user preferences - in a real implementation this would fetch from a user preferences table
    # For now, returning default preferences
    preferences = {
        "theme": "light",
        "language": "en",
        "notifications_enabled": True,
        "email_notifications": True,
        "dashboard_layout": "grid",
        "auto_save": True
    }
    return {"data": preferences, "success": True, "message": "Preferences retrieved successfully"}


@router.delete("/users/me", response_model=dict)
async def delete_user_account(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete the current user's account"""
    success = await user_service.delete_user(db, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # In a real app, you might want to:
    # 1. Send a confirmation email
    # 2. Schedule account deletion after a grace period
    # 3. Anonymize user data instead of hard deletion
    
    return {
        "success": True,
        "message": "Account has been scheduled for deletion"
    }