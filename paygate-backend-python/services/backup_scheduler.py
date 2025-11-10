import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from utils.database_backup import scheduled_backup

logger = logging.getLogger(__name__)

class BackupScheduler:
    """
    Service to manage automated database backups
    """
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
    
    def start(self):
        """
        Start the backup scheduler
        """
        # Schedule daily backups at 2 AM
        self.scheduler.add_job(
            scheduled_backup,
            CronTrigger(hour=2, minute=0),  # Daily at 2:00 AM
            id='daily_backup',
            name='Daily Database Backup'
        )
        
        # Schedule weekly backups on Sundays at 1 AM
        self.scheduler.add_job(
            scheduled_backup,
            CronTrigger(day_of_week='sun', hour=1, minute=0),  # Weekly on Sunday at 1:00 AM
            id='weekly_backup',
            name='Weekly Database Backup'
        )
        
        self.scheduler.start()
        logger.info("Backup scheduler started")
    
    def stop(self):
        """
        Stop the backup scheduler
        """
        self.scheduler.shutdown()
        logger.info("Backup scheduler stopped")
    
    def add_backup_job(self, cron_expression: str, job_id: str, job_name: str = None):
        """
        Add a custom backup job with cron expression
        Example: "0 3 * * *" for daily at 3 AM
        """
        self.scheduler.add_job(
            scheduled_backup,
            CronTrigger.from_crontab(cron_expression),
            id=job_id,
            name=job_name or f'Backup job {job_id}'
        )
        logger.info(f"Added custom backup job: {job_name or job_id} with schedule: {cron_expression}")


# Global scheduler instance
backup_scheduler = BackupScheduler()