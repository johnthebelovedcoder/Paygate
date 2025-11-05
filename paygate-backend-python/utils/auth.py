from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from services import user_service

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    print(f"[AUTH] Received token: {credentials.credentials[:10]}...")
    
    token_data = await user_service.verify_access_token(credentials.credentials, db)
    if token_data is None:
        print("[AUTH] Token validation failed")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username = token_data.email
    if username is None:
        print("[AUTH] No username in token data")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[AUTH] Looking up user: {username}")
    user = await user_service.get_user_by_email(db, email=username)
    if user is None:
        print(f"[AUTH] User not found: {username}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        print(f"[AUTH] User account is inactive: {username}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[AUTH] User authenticated: {username}")
    return user