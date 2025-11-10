from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
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
    print("\n[PWD_VERIFY] === Password Verification ===")
    print(f"[PWD_VERIFY] Plain password: {plain_password}")
    print(f"[PWD_VERIFY] Hashed password: {hashed_password}")
    print(f"[PWD_VERIFY] Hashed password type: {type(hashed_password)}")
    print(f"[PWD_VERIFY] Hashed password length: {len(hashed_password) if hashed_password else 0}")
    
    try:
        is_valid = pwd_context.verify(plain_password, hashed_password)
        print(f"[PWD_VERIFY] Password verification result: {is_valid}")
        if not is_valid:
            print("[PWD_VERIFY] Possible reasons:")
            print("[PWD_VERIFY] 1. Password doesn't match the hash")
            print("[PWD_VERIFY] 2. Hash format is invalid")
            print("[PWD_VERIFY] 3. Hash was truncated or corrupted")
        return is_valid
    except Exception as e:
        print(f"[ERROR] Error in verify_password: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

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
        print(f"[DEBUG] Verifying token: {token[:10]}...")
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            print(f"[DEBUG] Token payload: {payload}")
            email: str = payload.get("sub")
            
            if email is None:
                print("[DEBUG] Token missing 'sub' claim")
                return None
                
            # Check if token is blacklisted
            from .token_service import is_token_blacklisted
            is_blacklisted = await is_token_blacklisted(db, token)
            if is_blacklisted:
                print("[DEBUG] Token is blacklisted")
                return None
                
            token_data = TokenData(email=email)
            print(f"[DEBUG] Token validation successful for user: {email}")
            return token_data
            
        except jwt.ExpiredSignatureError:
            print("[DEBUG] Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"[DEBUG] Invalid token: {str(e)}")
            return None
            
    except Exception as e:
        print(f"[DEBUG] Error verifying token: {str(e)}")
        import traceback
        traceback.print_exc()
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
    # First, try to get the user from the database
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalar_one_or_none()
    
    # If user is found, update the cache and return the SQLAlchemy model instance
    if user:
        # Update cache for future requests
        cache_key = f"user:email:{email}"
        user_dict = _user_to_dict(user)
        await cache.set(cache_key, json.dumps(user_dict), expire=600)
        return user
    
    return None

async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    # First, try to get the user from the database
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    
    # If user is found, update the cache and return the SQLAlchemy model instance
    if user:
        # Update cache for future requests
        cache_key = f"user:id:{user_id}"
        user_dict = _user_to_dict(user)
        await cache.set(cache_key, json.dumps(user_dict), expire=600)
        return user
    
    return None

async def create_user(db: AsyncSession, user: UserCreate) -> User:
    from supabase_client import supabase
    
    # First, try to create the user in Supabase Auth if configured
    try:
        if supabase is not None:
            # Create the user in Supabase Auth
            auth_response = await supabase.auth.admin.create_user({
                "email": user.email,
                "password": user.password,
                "email_confirm": True  # Automatically confirm email
            })
            print(f"[INFO] User created in Supabase Auth: {user.email}")
        else:
            print("[WARNING] Supabase not configured, creating local user only")
    except Exception as e:
        print(f"[ERROR] Failed to create user in Supabase Auth: {str(e)}")
        # If Supabase registration fails, we'll still create the local user
        # Don't raise an exception here since local user creation can proceed

    # Create local user record regardless of Supabase success/failure
    from models import User
    hashed_password = get_password_hash(user.password)
    db_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        role="user",  # Set new users as regular users by default, not admin
        country=getattr(user, 'country', None),  # Get country from user if available
        currency=getattr(user, 'currency', None),  # Get currency from user if available
        user_type=getattr(user, 'user_type', None)  # Get user_type from user if available
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    # Trigger welcome email in background, with error handling for Redis availability
    try:
        from tasks.email import send_welcome_email
        send_welcome_email.delay(user.email, user.full_name)
    except Exception as e:
        # Log the error but don't fail the registration if email sending fails
        print(f"[WARNING] Could not send welcome email: {str(e)}. Registration will proceed anyway.")
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Failed to queue welcome email for {user.email}: {str(e)}")
    
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
    if not db_user:
        return False

    # Check which authentication method to use
    from supabase_client import supabase
    if supabase is not None:
        # For Supabase, the password change might need to be handled differently
        # Supabase might not allow changing passwords this way; usually done through reset flow
        try:
            # This would be part of a more complex flow with Supabase
            # For now, we'll just return success as Supabase would handle this differently
            print(f"[INFO] Password change for Supabase user ID: {user_id}")
            return True
        except Exception as e:
            print(f"[ERROR] Error updating password for Supabase user: {str(e)}")
            return False
    else:
        # Use local authentication method
        if not verify_password(current_password, db_user.hashed_password):
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
    try:
        print(f"[AUTH] Attempting to authenticate user: {email}")
        
        # First, try to authenticate with Supabase Auth if configured
        from supabase_client import supabase
        if supabase is not None:
            try:
                # Attempt to sign in with Supabase Auth
                # Note: This call returns immediately, no await needed for the response object itself
                auth_response = await supabase.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                print(f"[AUTH] User authenticated successfully with Supabase: {email}")
                
                # If Supabase auth is successful, get the user from our local DB
                user = await get_user_by_email(db, email)
                if not user:
                    print(f"[ERROR] User authenticated with Supabase but not found in local DB: {email}")
                    return None
                
                return user
            except Exception as supabase_error:
                print(f"[ERROR] Supabase authentication failed: {str(supabase_error)}")
                # If Supabase fails, we can still try local auth as fallback
                pass  # Continue to local auth fallback

        # Fallback to local authentication if Supabase is not configured or failed
        user = await get_user_by_email(db, email)
        if not user:
            print(f"[ERROR] User with email {email} not found")
            return None

        print(f"[AUTH] User found: ID={user.id}, Email={user.email}")
        print(f"[AUTH] Stored hash: {user.hashed_password[:10]}...")

        # Verify the password using local hash
        is_password_valid = verify_password(password, user.hashed_password)
        print(f"[AUTH] Password valid: {is_password_valid}")

        if not is_password_valid:
            print("[ERROR] Invalid password")
            return None

        print("[SUCCESS] Authentication successful")
        return user

    except Exception as e:
        print(f"[ERROR] Error in authenticate_user: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

async def update_last_login(db: AsyncSession, user_id: int):
    db_user = await get_user_by_id(db, user_id)
    if db_user:
        db_user.last_login = datetime.utcnow()
        await db.commit()