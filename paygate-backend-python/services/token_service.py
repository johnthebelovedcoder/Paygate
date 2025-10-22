from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
from models import TokenBlacklist
from typing import Optional


async def blacklist_token(db: AsyncSession, token: str, expires_at: datetime) -> bool:
    """Add a token to the blacklist"""
    try:
        blacklisted_token = TokenBlacklist(
            token=token,
            expires_at=expires_at
        )
        db.add(blacklisted_token)
        await db.commit()
        return True
    except Exception:
        await db.rollback()
        return False


async def is_token_blacklisted(db: AsyncSession, token: str) -> bool:
    """Check if a token is blacklisted"""
    result = await db.execute(
        select(TokenBlacklist)
        .filter(TokenBlacklist.token == token)
        .filter(TokenBlacklist.expires_at > datetime.utcnow())
    )
    token_blacklisted = result.scalar_one_or_none()
    return token_blacklisted is not None


async def cleanup_expired_tokens(db: AsyncSession) -> int:
    """Remove expired tokens from blacklist"""
    result = await db.execute(
        select(TokenBlacklist)
        .filter(TokenBlacklist.expires_at <= datetime.utcnow())
    )
    expired_tokens = result.scalars().all()
    
    for token in expired_tokens:
        await db.delete(token)
    
    await db.commit()
    return len(expired_tokens)