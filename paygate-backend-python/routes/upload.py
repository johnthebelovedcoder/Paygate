from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import Content, User
from schemas import *
from services import content_service, user_service
from utils.auth import get_current_user
import os

router = APIRouter()
security = HTTPBearer()

@router.post("/upload", response_model=Content)
async def upload_content(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Save file to uploads directory
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Create content record
    content_create = ContentCreate(
        title=file.filename,
        description=f"Uploaded file: {file.filename}",
        type=file.content_type or "file",
        url=file_path,  # Using url field to store file path
        owner_id=current_user.id
    )
    
    content = await content_service.create_content(db, content_create)
    return content
