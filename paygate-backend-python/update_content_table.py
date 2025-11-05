import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment or use default SQLite URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

async def check_and_update_content_table():
    # Create async engine
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    # Create async session
    async_session = sessionmaker(
        engine, expire_on_commit=False, class_=AsyncSession
    )
    
    async with async_session() as session:
        try:
            # Check if content table exists
            result = await session.execute(
                text("SELECT name FROM sqlite_master WHERE type='table' AND name='content'")
            )
            if not result.scalar():
                print("Content table does not exist. Please run your database migrations first.")
                return
            
            # Check if created_at column exists
            result = await session.execute(
                text("PRAGMA table_info(content)")
            )
            columns = [row[1] for row in result.fetchall()]
            
            if 'created_at' not in columns:
                print("Adding created_at column to content table...")
                await session.execute(
                    text("ALTER TABLE content ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
                )
            
            if 'updated_at' not in columns:
                print("Adding updated_at column to content table...")
                await session.execute(
                    text("""
                    ALTER TABLE content 
                    ADD COLUMN updated_at TIMESTAMP 
                    DEFAULT CURRENT_TIMESTAMP
                    """)
                )
            
            # Commit the changes
            await session.commit()
            print("Successfully updated content table!")
            
        except Exception as e:
            print(f"Error updating content table: {e}")
            await session.rollback()
            raise
        finally:
            await session.close()

if __name__ == "__main__":
    print("Starting database update...")
    asyncio.run(check_and_update_content_table())
