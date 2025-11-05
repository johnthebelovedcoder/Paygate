from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, declarative_base
from config.settings import settings
from sqlalchemy.pool import AsyncAdaptedQueuePool
import urllib.parse

# Determine if we're using SQLite or PostgreSQL
is_sqlite = settings.DATABASE_URL.startswith('sqlite')
is_postgresql = settings.DATABASE_URL.startswith('postgresql')

# Prepare connect_args based on the database type
if is_sqlite:
    connect_args = {
        "check_same_thread": False,  # Needed for SQLite
        "timeout": 30  # Connection timeout in seconds
    }
elif is_postgresql:
    connect_args = {}
else:
    connect_args = {}

# Create async engine with optimized connection pooling
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # Set to False in production
    poolclass=AsyncAdaptedQueuePool,
    pool_size=20,  # Number of connections to maintain in the pool
    max_overflow=30,  # Number of additional connections beyond pool_size
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args=connect_args
)

# Create async session factory
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

# For backward compatibility
AsyncSessionLocal = async_session

Base = declarative_base()

# Dependency to get DB session
async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()
