from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List
import asyncio
import time

logger = logging.getLogger(__name__)

class DatabaseMonitor:
    """
    Comprehensive database monitoring utilities
    """
    
    def __init__(self):
        self.monitoring_enabled = True
    
    async def get_db_stats(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Get basic database statistics
        """
        try:
            # Get total number of records in key tables
            stats = {}
            
            # Count users
            result = await db.execute(text("SELECT COUNT(*) FROM users"))
            stats['total_users'] = result.scalar()
            
            # Count content items
            result = await db.execute(text("SELECT COUNT(*) FROM content"))
            stats['total_content'] = result.scalar()
            
            # Count payments
            result = await db.execute(text("SELECT COUNT(*) FROM payments"))
            stats['total_payments'] = result.scalar()
            
            # Count audit logs
            result = await db.execute(text("SELECT COUNT(*) FROM audit_logs"))
            stats['total_audit_logs'] = result.scalar()
            
            return {
                "status": "success",
                "timestamp": datetime.utcnow().isoformat(),
                "database_stats": stats
            }
        except Exception as e:
            logger.error(f"Failed to get database stats: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def get_db_performance_metrics(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Get database performance metrics
        """
        try:
            metrics = {}
            
            # Test query performance
            start_time = time.time()
            result = await db.execute(text("SELECT 1"))
            result.scalar()
            metrics['ping_time_ms'] = round((time.time() - start_time) * 1000, 2)
            
            # Get average query response time (this is simulated since we don't have query log)
            # In a real system, you'd track this via query logging
            metrics['avg_query_time_ms'] = 0  # Placeholder
            
            # Get connection pool stats (this requires access to the engine)
            from config.database import engine
            # For SQLAlchemy, we can't directly access pool stats without special configuration
            # So we'll just return a basic status
            metrics['connection_status'] = 'available'
            
            # Get database size (implementation varies by database type)
            if str(db.bind.url).startswith('postgresql'):
                result = await db.execute(text("""
                    SELECT pg_size_pretty(pg_database_size(current_database())) as size
                """))
                size_result = result.fetchone()
                if size_result:
                    metrics['database_size'] = size_result[0]
            elif str(db.bind.url).startswith('sqlite'):
                import os
                db_path = str(db.bind.url).replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")
                if os.path.exists(db_path):
                    size_mb = round(os.path.getsize(db_path) / (1024 * 1024), 2)
                    metrics['database_size'] = f"{size_mb} MB"
            
            return {
                "status": "success", 
                "timestamp": datetime.utcnow().isoformat(),
                "performance_metrics": metrics
            }
        except Exception as e:
            logger.error(f"Failed to get database performance metrics: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def get_slow_queries(self, db: AsyncSession, threshold_ms: float = 1000.0) -> List[Dict[str, Any]]:
        """
        Get slow queries (simulated - in real implementation you'd track this)
        """
        # This is a placeholder - in a real system you'd implement actual slow query tracking
        return []
    
    async def get_table_sizes(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Get individual table sizes
        """
        try:
            table_sizes = {}
            table_names = ['users', 'content', 'payments', 'audit_logs', 'data_change_logs']
            
            for table_name in table_names:
                try:
                    result = await db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                    count = result.scalar()
                    table_sizes[table_name] = count
                except Exception:
                    # Table might not exist
                    continue
            
            return {
                "status": "success",
                "timestamp": datetime.utcnow().isoformat(),
                "table_sizes": table_sizes
            }
        except Exception as e:
            logger.error(f"Failed to get table sizes: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def check_foreign_key_integrity(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Check foreign key integrity
        """
        try:
            issues = []
            
            # Check content owner references
            result = await db.execute(text("""
                SELECT c.id, c.owner_id 
                FROM content c 
                LEFT JOIN users u ON c.owner_id = u.id 
                WHERE u.id IS NULL AND c.owner_id IS NOT NULL
            """))
            orphaned_content = result.fetchall()
            if orphaned_content:
                issues.append({
                    "table": "content",
                    "issue": f"{len(orphaned_content)} orphaned records with invalid owner_id"
                })
            
            # Check payment owner references
            result = await db.execute(text("""
                SELECT p.id, p.owner_id 
                FROM payments p 
                LEFT JOIN users u ON p.owner_id = u.id 
                WHERE u.id IS NULL AND p.owner_id IS NOT NULL
            """))
            orphaned_payments = result.fetchall()
            if orphaned_payments:
                issues.append({
                    "table": "payments", 
                    "issue": f"{len(orphaned_payments)} orphaned records with invalid owner_id"
                })
            
            return {
                "status": "success" if not issues else "warning",
                "timestamp": datetime.utcnow().isoformat(),
                "integrity_issues": issues,
                "total_issues": len(issues)
            }
        except Exception as e:
            logger.error(f"Failed to check foreign key integrity: {e}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def run_comprehensive_db_check(self, db: AsyncSession) -> Dict[str, Any]:
        """
        Run comprehensive database health check
        """
        results = {}
        
        results['stats'] = await self.get_db_stats(db)
        results['performance'] = await self.get_db_performance_metrics(db)
        results['table_sizes'] = await self.get_table_sizes(db)
        results['integrity'] = await self.check_foreign_key_integrity(db)
        
        # Overall status
        overall_status = "healthy"
        for check_name, result in results.items():
            if result.get('status') == 'error':
                overall_status = "error"
                break
            elif result.get('status') == 'warning' and overall_status != "error":
                overall_status = "warning"
        
        return {
            "overall_status": overall_status,
            "timestamp": datetime.utcnow().isoformat(),
            "checks": results
        }


# Global database monitor instance
db_monitor = DatabaseMonitor()