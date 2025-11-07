from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, declarative_base
from config.settings import settings
from sqlalchemy.pool import AsyncAdaptedQueuePool

# Check if we need to remove pgbouncer parameter as it causes issues with SQLAlchemy
database_url = settings.DATABASE_URL

# Remove pgbouncer parameter if present (since we'll handle pgbouncer compatibility via connect_args)
if 'pgbouncer=true' in database_url:
    database_url = database_url.replace('?pgbouncer=true', '').replace('&pgbouncer=true', '')

# Determine if we're using SQLite or PostgreSQL
is_sqlite = database_url.startswith('sqlite')
is_postgresql = database_url.startswith('postgresql')

# Prepare connect_args based on the database type
if is_sqlite:
    connect_args = {
        "check_same_thread": False,  # Needed for SQLite
        "timeout": 30  # Connection timeout in seconds
    }
elif is_postgresql:
    # For pgbouncer compatibility, pass asyncpg-specific parameters directly
    # These parameters must be passed as actual Python objects, not as strings in the URL
    connect_args = {
        "ssl": "require",  # Require SSL for PostgreSQL connections (needed for Supabase)
        "statement_cache_size": 0,  # Disable statement caching for pgbouncer compatibility
        "max_cached_statement_lifetime": 0,  # Disable statement caching lifetime
        "max_cacheable_statement_size": 0,  # Disable maximum cacheable statement size
    }
else:
    connect_args = {}

# Create async engine with optimized connection pooling
engine = create_async_engine(
    database_url,
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
