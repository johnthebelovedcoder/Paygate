from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import Content, User
from schemas import *
from services import content_service, user_service
from utils.auth import get_current_user
import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi.responses import JSONResponse

router = APIRouter()
security = HTTPBearer()

# Allowed file types and their corresponding directories
ALLOWED_EXTENSIONS = {
    'image/jpeg': 'images',
    'image/png': 'images',
    'image/gif': 'images',
    'application/pdf': 'documents',
    'application/msword': 'documents',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documents',
}

# Maximum file size (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def get_file_extension(content_type: str) -> str:
    """Get file extension from content type"""
    return {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    }.get(content_type, '.bin')

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import Content, User
from schemas import *
from services import content_service, user_service
from utils.auth import get_current_user
import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi.responses import JSONResponse

router = APIRouter()
security = HTTPBearer()

# Allowed file types and their corresponding directories
ALLOWED_EXTENSIONS = {
    'image/jpeg': 'images',
    'image/png': 'images',
    'image/gif': 'images',
    'application/pdf': 'documents',
    'application/msword': 'documents',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documents',
}

# Maximum file size (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def get_file_extension(content_type: str) -> str:
    """Get file extension from content type"""
    return {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    }.get(content_type, '.bin')

# Test endpoint to verify the route is working
@router.get("/upload/test")
async def test_upload():
    return {"message": "Upload route is working"}

@router.post("/upload")
async def upload_content(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Minimal test upload endpoint that returns frontend-expected format"""
    try:
        # Read file content
        contents = await file.read()
        
        # Return response in format expected by frontend
        return {
            "success": True,
            "message": "File uploaded successfully",
            "data": {
                "filename": file.filename,
                "content_type": file.content_type or "application/octet-stream",
                "size": len(contents),
                "url": f"/api/uploads/mock/{uuid.uuid4()}_{file.filename}",  # Mock URL with unique ID
                "id": 1,  # Mock ID
                "title": file.filename,
                "description": f"Uploaded file: {file.filename}",
                "type": file.content_type or "application/octet-stream",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    except Exception as e:
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

# Test endpoint to verify CORS headers
@router.options("/upload-test", status_code=status.HTTP_200_OK)
async def upload_options():
    return {"message": "CORS preflight successful"}

@router.post("/upload-test", status_code=status.HTTP_200_OK)
async def upload_test(
    response: Response,
    file: UploadFile = File(...)
):
    """
    Test endpoint to verify CORS is working for file uploads.
    Returns the file metadata without saving it.
    """
    # Set CORS headers
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(await file.read())
    }
