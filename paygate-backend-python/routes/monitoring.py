from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from utils.auth import get_current_user
from utils.database_monitor import db_monitor
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])

@router.get("/database/stats", summary="Get database statistics")
async def get_database_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get comprehensive database statistics.
    Requires admin privileges.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access database statistics"
        )
    
    try:
        stats = await db_monitor.get_db_stats(db)
        return stats
    except Exception as e:
        logger.error(f"Failed to get database stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get database stats: {str(e)}"
        )


@router.get("/database/performance", summary="Get database performance metrics")
async def get_database_performance(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get database performance metrics.
    Requires admin privileges.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access database performance metrics"
        )
    
    try:
        performance = await db_monitor.get_db_performance_metrics(db)
        return performance
    except Exception as e:
        logger.error(f"Failed to get database performance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get database performance: {str(e)}"
        )


@router.get("/database/table-sizes", summary="Get database table sizes")
async def get_table_sizes(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get individual table sizes and row counts.
    Requires admin privileges.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access table size information"
        )
    
    try:
        table_sizes = await db_monitor.get_table_sizes(db)
        return table_sizes
    except Exception as e:
        logger.error(f"Failed to get table sizes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get table sizes: {str(e)}"
        )


@router.get("/database/integrity", summary="Check database integrity")
async def check_database_integrity(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Check database integrity and foreign key constraints.
    Requires admin privileges.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can check database integrity"
        )
    
    try:
        integrity_check = await db_monitor.check_foreign_key_integrity(db)
        return integrity_check
    except Exception as e:
        logger.error(f"Failed to check database integrity: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check database integrity: {str(e)}"
        )


@router.get("/database/health", summary="Run comprehensive database health check")
async def database_health_check(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Run comprehensive database health check.
    Requires admin privileges.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can run comprehensive health checks"
        )
    
    try:
        health_check = await db_monitor.run_comprehensive_db_check(db)
        return health_check
    except Exception as e:
        logger.error(f"Failed to run database health check: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run database health check: {str(e)}"
        )


@router.get("/system/metrics", summary="Get system metrics")
async def get_system_metrics(
    current_user: dict = Depends(get_current_user)
):
    """
    Get system performance metrics.
    Requires admin privileges.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access system metrics"
        )
    
    import psutil
    import os
    
    try:
        # Get system metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory_info = psutil.virtual_memory()
        disk_usage = psutil.disk_usage('/')
        
        # Get process-specific metrics
        process = psutil.Process(os.getpid())
        process_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        metrics = {
            "timestamp": datetime.utcnow().isoformat(),
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory_info.percent,
                "memory_available_mb": round(memory_info.available / 1024 / 1024, 2),
                "disk_percent": disk_usage.percent,
                "disk_free_gb": round(disk_usage.free / 1024**3, 2)
            },
            "process": {
                "memory_usage_mb": round(process_memory, 2),
                "num_threads": process.num_threads(),
                "num_fds": process.num_fds() if hasattr(process, 'num_fds') else 'N/A'
            }
        }
        
        return {
            "status": "success",
            "metrics": metrics
        }
    except Exception as e:
        logger.error(f"Failed to get system metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system metrics: {str(e)}"
        )


