import asyncio
import os
import subprocess
import shutil
from datetime import datetime, timedelta
from pathlib import Path
import logging
from config.settings import settings
import zipfile
import glob
from typing import Optional, List

logger = logging.getLogger(__name__)

class DatabaseBackupManager:
    """
    Manager for database backups with support for different database types
    """
    
    def __init__(self):
        self.backup_dir = Path("backups")
        self.backup_dir.mkdir(exist_ok=True)
        self.retention_days = 30  # Keep backups for 30 days
    
    async def create_backup(self, backup_name: Optional[str] = None) -> str:
        """
        Create a database backup based on the database type
        """
        if not backup_name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"paygate_backup_{timestamp}"
        
        backup_path = self.backup_dir / f"{backup_name}.sql"
        
        try:
            if settings.DATABASE_URL.startswith("postgresql"):
                await self._create_postgres_backup(backup_path, backup_name)
            elif settings.DATABASE_URL.startswith("sqlite"):
                await self._create_sqlite_backup(backup_path)
            else:
                raise ValueError(f"Unsupported database type for backup: {settings.DATABASE_URL}")
            
            # Create a zip file of the backup for better compression
            zip_path = str(backup_path) + ".zip"
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(backup_path, backup_path.name)
            
            # Remove original SQL file after zipping
            backup_path.unlink()
            
            logger.info(f"Backup created successfully: {zip_path}")
            return zip_path
            
        except Exception as e:
            logger.error(f"Backup creation failed: {e}")
            raise
    
    async def _create_sqlite_backup(self, backup_path: Path):
        """
        Create a backup of SQLite database using direct file copy
        """
        # Extract database path from URL
        db_path = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")
        db_file = Path(db_path)
        
        if not db_file.exists():
            raise FileNotFoundError(f"Database file does not exist: {db_file}")
        
        # Copy the database file
        shutil.copy2(db_file, backup_path)
        logger.info(f"SQLite backup created: {backup_path}")
    
    async def _create_postgres_backup(self, backup_path: Path, backup_name: str):
        """
        Create a backup of PostgreSQL database using pg_dump
        """
        # Extract connection parameters from DATABASE_URL
        import re
        match = re.search(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', settings.DATABASE_URL)
        if not match:
            raise ValueError("Invalid PostgreSQL DATABASE_URL format")
        
        username, password, host, port, database = match.groups()
        
        # Create the backup using pg_dump
        cmd = [
            'pg_dump',
            '-h', host,
            '-p', port,
            '-U', username,
            '-d', database,
            '-f', str(backup_path),
            '--no-password'  # We'll set the password via environment
        ]
        
        env = os.environ.copy()
        env['PGPASSWORD'] = password
        
        try:
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"pg_dump failed: {result.stderr}")
            logger.info(f"PostgreSQL backup created: {backup_path}")
        except FileNotFoundError:
            # If pg_dump is not available, try using Python psycopg2
            await self._create_postgres_backup_python(backup_path)
    
    async def _create_postgres_backup_python(self, backup_path: Path):
        """
        Alternative backup method using Python library if pg_dump is not available
        """
        # For now, we'll just log this as it requires additional dependency setup
        logger.warning("pg_dump not found, backup skipped. Install PostgreSQL client tools for proper backup.")
        raise Exception("pg_dump not found. Install PostgreSQL client tools for proper backup.")
    
    async def restore_backup(self, backup_file: str) -> bool:
        """
        Restore database from backup
        """
        backup_path = Path(backup_file)
        
        if backup_path.suffix == '.zip':
            # Extract the backup file first
            extract_dir = backup_path.parent / "temp_restore"
            extract_dir.mkdir(exist_ok=True)
            
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(extract_dir)
            
            # Find the extracted SQL file
            sql_files = list(extract_dir.glob("*.sql"))
            if not sql_files:
                raise FileNotFoundError("No SQL file found in backup archive")
            
            sql_file = sql_files[0]
        else:
            sql_file = backup_path
        
        try:
            if settings.DATABASE_URL.startswith("postgresql"):
                await self._restore_postgres_backup(sql_file)
            elif settings.DATABASE_URL.startswith("sqlite"):
                await self._restore_sqlite_backup(sql_file)
            else:
                raise ValueError(f"Unsupported database type for restore: {settings.DATABASE_URL}")
            
            logger.info(f"Database restored successfully from: {backup_file}")
            return True
        except Exception as e:
            logger.error(f"Restore failed: {e}")
            raise
        finally:
            # Clean up extracted files
            if backup_path.suffix == '.zip':
                shutil.rmtree(extract_dir, ignore_errors=True)
    
    async def _restore_sqlite_backup(self, backup_path: Path):
        """
        Restore SQLite database from backup
        """
        # For SQLite, we'll restore by replacing the database file
        db_path = Path(settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", ""))
        
        # Make sure the directory exists
        db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy the backup file to the database location
        shutil.copy2(backup_path, db_path)
    
    async def _restore_postgres_backup(self, backup_path: Path):
        """
        Restore PostgreSQL database from backup
        """
        import re
        match = re.search(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', settings.DATABASE_URL)
        if not match:
            raise ValueError("Invalid PostgreSQL DATABASE_URL format")
        
        username, password, host, port, database = match.groups()
        
        cmd = [
            'psql',
            '-h', host,
            '-p', port,
            '-U', username,
            '-d', database,
            '-f', str(backup_path),
            '--no-password'
        ]
        
        env = os.environ.copy()
        env['PGPASSWORD'] = password
        
        try:
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"psql restore failed: {result.stderr}")
        except FileNotFoundError:
            logger.warning("psql not found, using Python library for restore.")
            await self._restore_postgres_backup_python(backup_path)
    
    async def _restore_postgres_backup_python(self, backup_path: Path):
        """
        Alternative restore method using Python library
        """
        logger.warning("psql not found, restore skipped. Install PostgreSQL client tools for proper restore.")
        raise Exception("psql not found. Install PostgreSQL client tools for proper restore.")
    
    async def cleanup_old_backups(self):
        """
        Remove backup files older than retention period
        """
        cutoff_date = datetime.now() - timedelta(days=self.retention_days)
        old_backups = []
        
        for backup_file in self.backup_dir.glob("*.sql*"):
            if datetime.fromtimestamp(backup_file.stat().st_mtime) < cutoff_date:
                old_backups.append(backup_file)
        
        for old_backup in old_backups:
            old_backup.unlink()
            logger.info(f"Removed old backup: {old_backup}")
        
        return len(old_backups)
    
    async def list_backups(self) -> List[dict]:
        """
        List all available backups
        """
        backups = []
        for backup_file in self.backup_dir.glob("*.sql*"):
            stat = backup_file.stat()
            backups.append({
                "filename": backup_file.name,
                "size": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_mtime),
                "path": str(backup_file)
            })
        
        # Sort by creation time, newest first
        backups.sort(key=lambda x: x['created'], reverse=True)
        return backups


# Global backup manager instance
backup_manager = DatabaseBackupManager()


async def scheduled_backup():
    """
    Function to run scheduled backups
    """
    try:
        backup_file = await backup_manager.create_backup()
        await backup_manager.cleanup_old_backups()
        logger.info("Scheduled backup completed successfully")
    except Exception as e:
        logger.error(f"Scheduled backup failed: {e}")


async def run_backup_task():
    """
    Run the backup task with proper error handling
    """
    await scheduled_backup()