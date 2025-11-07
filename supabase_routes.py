from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from supabase_client import supabase
from models.user import User
from utils.auth import get_current_user
from schemas.user import UserInDB

router = APIRouter(prefix="/api/supabase", tags=["supabase"])

@router.get("/health")
async def supabase_health_check():
    """
    Check if Supabase service is accessible
    """
    if supabase is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured. Check environment variables."
        )
    
    try:
        # Test the Supabase client by calling a basic function
        result = await supabase.rpc('version').execute()
        return {
            "status": "healthy",
            "message": "Successfully connected to Supabase",
            "connected": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not connect to Supabase: {str(e)}"
        )


@router.get("/users/{user_id}")
async def get_user_from_supabase(user_id: str):
    """
    Example: Get user data directly from Supabase auth
    """
    if supabase is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured. Check environment variables."
        )
    
    try:
        # Query user data from Supabase
        result = await supabase.table('users').select('*').eq('id', user_id).single().execute()
        user_data = result.data
        return {"user": user_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found: {str(e)}"
        )


@router.get("/storage-url")
async def get_storage_url():
    """
    Get the Supabase storage URL for file uploads
    """
    try:
        # Get the storage client URL from configuration
        from config.settings import settings
        if not settings.is_supabase_configured or supabase is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase is not properly configured"
            )
        
        return {
            "storage_url": f"{settings.NEXT_PUBLIC_SUPABASE_URL}/storage/v1",
            "config_status": settings.is_supabase_configured
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving storage URL: {str(e)}"
        )