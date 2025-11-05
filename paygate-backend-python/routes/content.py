from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import Content
from schemas import *
from services import content_service
from utils.auth import get_current_user
from utils.pagination import PaginationParams, create_paginated_response
from utils.response_optimization import minimal_content_response
from typing import List, Optional, Dict, Any
import os

router = APIRouter()

@router.get("/content", response_model=Dict[str, List[Content]])
async def get_content(
    pagination: PaginationParams = Depends(),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    content_items, total = await content_service.get_content_by_owner(db, current_user.id, pagination)
    return {"data": content_items}


@router.get("/content/{content_id}", response_model=Content)
async def get_content_by_id(
    content_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    content_item = await content_service.get_content_by_id(db, content_id)
    if not content_item or content_item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return content_item


@router.post("/content", response_model=Content)
async def create_content(
    content: ContentCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Create the complete content data dict with owner_id from current user
    content_data = {
        "title": content.title,
        "description": content.description,
        "type": content.type,
        "url": content.url,
        "is_protected": content.is_protected,
        "price": content.price,
        "currency": content.currency,
        "owner_id": current_user.id  # Set owner_id from authenticated user
    }
    print(f"Creating content with data: {content_data}")  # Debug print
    created_content = await content_service.create_content(db, content_data)
    return created_content


@router.put("/content/{content_id}", response_model=Content)
async def update_content(
    content_id: int,
    content_update: ContentUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    content_item = await content_service.get_content_by_id(db, content_id)
    if not content_item or content_item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    updated_content = await content_service.update_content(db, content_id, content_update)
    if not updated_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return updated_content


@router.put("/content/{content_id}/protection", response_model=Content)
async def update_content_protection(
    content_id: int,
    protection_data: ContentUpdateProtection,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    content_item = await content_service.get_content_by_id(db, content_id)
    if not content_item or content_item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    updated_content = await content_service.update_content_protection(db, content_id, protection_data)
    if not updated_content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return updated_content


@router.delete("/content/{content_id}")
async def delete_content(
    content_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    content_item = await content_service.get_content_by_id(db, content_id)
    if not content_item or content_item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    success = await content_service.delete_content(db, content_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return {"message": "Content deleted successfully"}


# File upload endpoint that returns URL (for UploadInterface component)
@router.post("/content/upload")
async def content_upload(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Read file content
    file_content = await file.read()
    
    # Save file to uploads directory
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Trigger background file processing
    from tasks.file_processing import process_uploaded_file
    processing_options = {"thumbnail_size": (200, 200)}
    task = process_uploaded_file.delay(file_path, file.content_type, processing_options)
    
    # In a real implementation, this would upload to S3 and return the S3 URL
    # For now, we'll return a local URL
    file_url = f"http://localhost:8000/uploads/{file.filename}"
    
    return {
        "success": True,
        "url": file_path,  # Return the local file path
        "message": "File uploaded successfully",
        "original_name": file.filename,
        "size": len(file_content),
        "task_id": task.id  # Return task ID for tracking
    }


# Content creation after file upload (for UploadInterface component)
@router.post("/content", response_model=Content)
async def create_content_after_upload(
    content: ContentCreateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Create the complete content data dict with owner_id from current user
    content_data = {
        "title": content.title,
        "description": content.description,
        "type": content.type,
        "url": content.url,
        "is_protected": content.is_protected,
        "price": content.price,
        "currency": content.currency,
        "owner_id": current_user.id  # Set owner_id from authenticated user
    }
    created_content = await content_service.create_content(db, content_data)
    return created_content


# The upload route already exists in routes/upload.py
# For backward compatibility
@router.post("/upload", response_model=Content)
async def legacy_upload_content(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Save file to uploads directory
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    file_content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Trigger background file processing
    from tasks.file_processing import process_uploaded_file
    processing_options = {"thumbnail_size": (200, 200)}
    process_uploaded_file.delay(file_path, file.content_type, processing_options)
    
    # Create content record
    content_create = ContentCreate(
        title=file.filename,
        description=f"Uploaded file: {file.filename}",
        type=file.content_type or "file",
        url=file_path,  # Store the file path as URL for now
        owner_id=current_user.id
    )
    
    content = await content_service.create_content(db, content_create)
    return content