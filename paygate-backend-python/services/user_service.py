from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import secrets
import string
import jwt
from config.database import get_db
from models import User
from schemas.user import UserCreate, UserUpdate, UserInDB, TokenData
from config.settings import settings
from .token_service import blacklist_token
from utils.cache import cache
import json
import time

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def verify_access_token(token: str, db: AsyncSession) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        
        # Check if token is blacklisted
        from .token_service import is_token_blacklisted
        is_blacklisted = await is_token_blacklisted(db, token)
        if is_blacklisted:
            return None
            
        if email is None:
            return None
        token_data = TokenData(email=email)
        return token_data
    except jwt.PyJWTError:
        return None

# For backward compatibility
def verify_access_token_sync(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        token_data = TokenData(email=email)
        return token_data
    except jwt.PyJWTError:
        return None

# Export settings for other modules
from config.settings import settings as settings_module
settings = settings_module

def generate_reset_token():
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

def _user_to_dict(user: User) -> dict:
    """Converts a User object to a dictionary, serializing datetime objects."""
    user_dict = {}
    for c in user.__table__.columns:
        value = getattr(user, c.name)
        if isinstance(value, datetime):
            user_dict[c.name] = value.isoformat()
        else:
            user_dict[c.name] = value
    return user_dict

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    # Try to get cached user first
    cache_key = f"user:email:{email}"
    cached_user_data = await cache.get(cache_key)
    
    if cached_user_data:
        user_dict = json.loads(cached_user_data)
        # Convert ISO date strings back to datetime objects
        for key, value in user_dict.items():
            if key in ['created_at', 'updated_at', 'last_login'] and value:
                user_dict[key] = datetime.fromisoformat(value)
        return User(**user_dict)
    
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalar_one_or_none()
    
    # Cache the user for 10 minutes if found
    if user:
        user_dict = _user_to_dict(user)
        await cache.set(cache_key, json.dumps(user_dict), expire=600)
    
    return user

async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    # Try to get cached user first
    cache_key = f"user:id:{user_id}"
    cached_user_data = await cache.get(cache_key)
    
    if cached_user_data:
        user_dict = json.loads(cached_user_data)
        # Convert ISO date strings back to datetime objects
        for key, value in user_dict.items():
            if key in ['created_at', 'updated_at', 'last_login'] and value:
                user_dict[key] = datetime.fromisoformat(value)
        return User(**user_dict)
    
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    
    # Cache the user for 10 minutes if found
    if user:
        user_dict = _user_to_dict(user)
        await cache.set(cache_key, json.dumps(user_dict), expire=600)
    
    return user

async def create_user(db: AsyncSession, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        country=user.country,
        currency=user.currency,
        role=user.user_type or "user"
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    # Trigger welcome email in background
    from tasks.email import send_welcome_email
    send_welcome_email.delay(user.email, user.name)
    
    return db_user

async def update_user(db: AsyncSession, user_id: int, user_update: UserUpdate) -> Optional[User]:
    db_user = await get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(db_user, field, value)
    
    db_user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def change_user_password(db: AsyncSession, user_id: int, current_password: str, new_password: str) -> bool:
    db_user = await get_user_by_id(db, user_id)
    if not db_user or not verify_password(current_password, db_user.hashed_password):
        return False
    
    hashed_new_password = get_password_hash(new_password)
    db_user.hashed_password = hashed_new_password
    db_user.updated_at = datetime.utcnow()
    await db.commit()
    return True

async def delete_user(db: AsyncSession, user_id: int) -> bool:
    db_user = await get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    await db.delete(db_user)
    await db.commit()
    return True

async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    user = await get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

async def update_last_login(db: AsyncSession, user_id: int):
    db_user = await get_user_by_id(db, user_id)
    if db_user:
        db_user.last_login = datetime.utcnow()
        await db.commit()