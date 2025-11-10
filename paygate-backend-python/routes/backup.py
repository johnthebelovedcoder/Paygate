from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from utils.database_backup import backup_manager
from services.backup_scheduler import backup_scheduler
from config.database import get_db
from utils.auth import get_current_user
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/backup", tags=["backup"])

@router.post("/create", summary="Create a database backup")
async def create_backup(
    current_user: dict = Depends(get_current_user),
):
    """
    Create a database backup manually.
    Requires admin privileges.
    """
    # Check if user has admin privileges
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create backups"
        )
    
    try:
        backup_file = await backup_manager.create_backup()
        return {
            "success": True,
            "message": "Backup created successfully",
            "backup_file": backup_file
        }
    except Exception as e:
        logger.error(f"Backup creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Backup creation failed: {str(e)}"
        )


@router.get("/list", summary="List all available backups")
async def list_backups(
    current_user: dict = Depends(get_current_user),
):
    """
    List all available database backups.
    Requires admin privileges.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can list backups"
        )
    
    try:
        backups = await backup_manager.list_backups()
        return {
            "success": True,
            "backups": backups
        }
    except Exception as e:
        logger.error(f"Failed to list backups: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list backups: {str(e)}"
        )


@router.post("/restore/{backup_filename}", summary="Restore database from backup")
async def restore_backup(
    backup_filename: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Restore database from a specific backup file.
    Requires admin privileges.
    WARNING: This will overwrite the current database!
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can restore backups"
        )
    
    try:
        # Verify backup file exists
        import os
        backup_path = f"backups/{backup_filename}"
        if not os.path.exists(backup_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Backup file not found: {backup_filename}"
            )
        
        success = await backup_manager.restore_backup(backup_path)
        if success:
            return {
                "success": True,
                "message": f"Database restored successfully from {backup_filename}"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Restore operation failed"
            )
    except Exception as e:
        logger.error(f"Restore failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Restore failed: {str(e)}"
        )


@router.delete("/{backup_filename}", summary="Delete a backup file")
async def delete_backup(
    backup_filename: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a specific backup file.
    Requires admin privileges.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete backups"
        )
    
    try:
        import os
        backup_path = f"backups/{backup_filename}"
        if os.path.exists(backup_path):
            os.remove(backup_path)
            return {
                "success": True,
                "message": f"Backup {backup_filename} deleted successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Backup file not found: {backup_filename}"
            )
    except Exception as e:
        logger.error(f"Failed to delete backup: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete backup: {str(e)}"
        )


@router.post("/schedule", summary="Start/stop backup scheduler")
async def manage_backup_scheduler(
    action: str,  # "start" or "stop"
    current_user: dict = Depends(get_current_user),
):
    """
    Start or stop the automated backup scheduler.
    Requires admin privileges.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage backup scheduler"
        )
    
    try:
        if action.lower() == "start":
            backup_scheduler.start()
            return {
                "success": True,
                "message": "Backup scheduler started"
            }
        elif action.lower() == "stop":
            backup_scheduler.stop()
            return {
                "success": True,
                "message": "Backup scheduler stopped"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action must be 'start' or 'stop'"
            )
    except Exception as e:
        logger.error(f"Failed to manage backup scheduler: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to manage backup scheduler: {str(e)}"
        )