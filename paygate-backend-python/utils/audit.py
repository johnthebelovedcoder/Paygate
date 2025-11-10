from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.audit import AuditLog, DataChangeLog
from datetime import datetime
import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

async def log_audit_action(
    db: AsyncSession,
    user_id: Optional[int],
    action: str,
    resource_type: str,
    resource_id: Optional[int] = None,
    old_values: Optional[Dict[str, Any]] = None,
    new_values: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    success: bool = True,
    details: Optional[str] = None
) -> AuditLog:
    """
    Log an audit action to the database
    """
    try:
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=json.dumps(old_values) if old_values else None,
            new_values=json.dumps(new_values) if new_values else None,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            details=details
        )
        
        db.add(audit_log)
        await db.commit()
        await db.refresh(audit_log)
        
        return audit_log
    except Exception as e:
        logger.error(f"Failed to log audit action: {e}")
        # Still try to commit the session to avoid leaving it in a bad state
        try:
            await db.rollback()
        except:
            pass
        raise e


async def log_data_change(
    db: AsyncSession,
    table_name: str,
    record_id: int,
    field_name: str,
    old_value: Optional[str],
    new_value: Optional[str],
    changed_by: Optional[int] = None,
    change_type: str = "UPDATE",  # INSERT, UPDATE, DELETE
    ip_address: Optional[str] = None,
    reason: Optional[str] = None
) -> DataChangeLog:
    """
    Log a data change to the change log table
    """
    try:
        change_log = DataChangeLog(
            table_name=table_name,
            record_id=record_id,
            field_name=field_name,
            old_value=old_value,
            new_value=new_value,
            changed_by=changed_by,
            change_type=change_type,
            ip_address=ip_address,
            reason=reason
        )
        
        db.add(change_log)
        await db.commit()
        await db.refresh(change_log)
        
        return change_log
    except Exception as e:
        logger.error(f"Failed to log data change: {e}")
        try:
            await db.rollback()
        except:
            pass
        raise e


async def get_user_audit_trail(
    db: AsyncSession,
    user_id: int,
    limit: int = 50,
    offset: int = 0
) -> list[AuditLog]:
    """
    Get audit trail for a specific user
    """
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.user_id == user_id)
        .order_by(AuditLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()


async def get_resource_audit_trail(
    db: AsyncSession,
    resource_type: str,
    resource_id: int,
    limit: int = 50,
    offset: int = 0
) -> list[AuditLog]:
    """
    Get audit trail for a specific resource
    """
    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.resource_type == resource_type)
        .where(AuditLog.resource_id == resource_id)
        .order_by(AuditLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()


class AuditLogger:
    """
    A utility class to provide easy audit logging functionality
    """
    
    @staticmethod
    async def log_user_action(
        db: AsyncSession,
        user_id: Optional[int],
        action: str,
        resource_type: str,
        resource_id: Optional[int] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        request = None,  # FastAPI request object (optional)
        success: bool = True,
        details: Optional[str] = None
    ):
        """
        Log a user action with optional request context
        """
        ip_address = None
        user_agent = None
        
        if request:
            # Get IP address from request
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                ip_address = forwarded_for.split(",")[0].strip()
            else:
                ip_address = request.client.host if hasattr(request, 'client') and request.client else None
            
            user_agent = request.headers.get("User-Agent")
        
        return await log_audit_action(
            db, user_id, action, resource_type, resource_id,
            old_values, new_values, ip_address, user_agent, success, details
        )
    
    @staticmethod
    async def log_user_login(db: AsyncSession, user_id: int, request = None):
        """Log user login action"""
        return await AuditLogger.log_user_action(
            db, user_id, "LOGIN", "USER", user_id, 
            request=request, details="User login successful"
        )
    
    @staticmethod
    async def log_user_logout(db: AsyncSession, user_id: int, request = None):
        """Log user logout action"""
        return await AuditLogger.log_user_action(
            db, user_id, "LOGOUT", "USER", user_id,
            request=request, details="User logout"
        )
    
    @staticmethod
    async def log_user_registration(db: AsyncSession, user_id: int, request = None):
        """Log user registration action"""
        return await AuditLogger.log_user_action(
            db, user_id, "REGISTER", "USER", user_id,
            request=request, details="New user registration"
        )
    
    @staticmethod
    async def log_password_change(db: AsyncSession, user_id: int, request = None):
        """Log password change action"""
        return await AuditLogger.log_user_action(
            db, user_id, "PASSWORD_CHANGE", "USER", user_id,
            request=request, details="User changed password"
        )
    
    @staticmethod
    async def log_content_access(db: AsyncSession, user_id: int, content_id: int, request = None):
        """Log content access action"""
        return await AuditLogger.log_user_action(
            db, user_id, "CONTENT_ACCESS", "CONTENT", content_id,
            request=request, details="User accessed protected content"
        )