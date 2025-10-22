from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import User
from schemas import *
from services import user_service, content_service, token_service
from utils.auth import get_current_user, security
from datetime import timedelta, datetime
import uuid
import re
import jwt
import secrets

router = APIRouter()

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

@router.post("/auth/register", response_model=TokenResponse)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Validate email format
    if not EMAIL_REGEX.match(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Check if user already exists
    existing_user = await user_service.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    db_user = await user_service.create_user(db, user)
    
    # Create access and refresh tokens
    access_token_expires = timedelta(minutes=30)
    access_token = user_service.create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    refresh_token = user_service.create_access_token(
        data={"sub": db_user.email, "type": "refresh"},
        expires_delta=timedelta(days=7)
    )
    
    # Convert SQLAlchemy model to dictionary to avoid async attribute access issues
    user_data = {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "is_active": db_user.is_active,
        "is_verified": db_user.is_verified,
        "mfa_enabled": db_user.mfa_enabled if db_user.mfa_enabled is not None else False,
        "role": db_user.role,
        "country": db_user.country,
        "currency": db_user.currency,
        "created_at": db_user.created_at,
        "updated_at": db_user.updated_at,
        "last_login": db_user.last_login,
        "username": db_user.username,
        "avatar": db_user.avatar,
        "user_type": db_user.user_type,
    }
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserInDB(**user_data)
    )


@router.post("/auth/login", response_model=TokenResponse)
async def login_user(user_credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    # Validate email format
    if not EMAIL_REGEX.match(user_credentials.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Authenticate user
    user = await user_service.authenticate_user(
        db, user_credentials.email, user_credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Update last login
    await user_service.update_last_login(db, user.id)
    
    # Create access and refresh tokens
    access_token_expires = timedelta(minutes=30)
    access_token = user_service.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    refresh_token = user_service.create_access_token(
        data={"sub": user.email, "type": "refresh"},
        expires_delta=timedelta(days=7)
    )
    
    # Convert SQLAlchemy model to dictionary to avoid async attribute access issues
    user_data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "mfa_enabled": user.mfa_enabled if user.mfa_enabled is not None else False,
        "role": user.role,
        "country": user.country,
        "currency": user.currency,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "last_login": user.last_login,
        "username": user.username,
        "avatar": user.avatar,
        "user_type": user.user_type,
    }
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserInDB(**user_data)
    )


@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(credentials: dict, db: AsyncSession = Depends(get_db)):
    # In a real app, you'd validate the refresh token from the request
    # For now, simulating the refresh process
    refresh_token_str = credentials.get('refreshToken')
    
    if not refresh_token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided"
        )
    
    # Decode the refresh token to get user info
    token_data = await user_service.verify_access_token(refresh_token_str, db)
    if not token_data or not token_data.email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = await user_service.get_user_by_email(db, email=token_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new access and refresh tokens
    access_token_expires = timedelta(minutes=30)
    access_token = user_service.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    new_refresh_token = user_service.create_access_token(
        data={"sub": user.email, "type": "refresh"},
        expires_delta=timedelta(days=7)
    )
    
    # Convert SQLAlchemy model to dictionary to avoid async attribute access issues
    user_data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "mfa_enabled": user.mfa_enabled if user.mfa_enabled is not None else False,
        "role": user.role,
        "country": user.country,
        "currency": user.currency,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "last_login": user.last_login,
        "username": user.username,
        "avatar": user.avatar,
        "user_type": user.user_type,
    }
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        user=UserInDB(**user_data)
    )


@router.post("/auth/logout")
async def logout_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    # Add the token to the blacklist
    try:
        # Decode the token to get its expiration time
        payload = jwt.decode(credentials.credentials, user_service.settings.SECRET_KEY, algorithms=[user_service.settings.ALGORITHM])
        exp = payload.get('exp')
        if exp:
            expires_at = datetime.fromtimestamp(exp)
            await token_service.blacklist_token(db, credentials.credentials, expires_at)
        return {"message": "Successfully logged out"}
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


@router.get("/auth/me", response_model=UserInDB)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    # Convert SQLAlchemy model to dictionary to avoid async attribute access issues
    user_data = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "mfa_enabled": current_user.mfa_enabled if current_user.mfa_enabled is not None else False,
        "role": current_user.role,
        "country": current_user.country,
        "currency": current_user.currency,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "last_login": current_user.last_login,
        "username": current_user.username,
        "avatar": current_user.avatar,
        "user_type": current_user.user_type,
    }
    
    return UserInDB(**user_data)


@router.put("/auth/me", response_model=UserInDB)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    updated_user = await user_service.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    # Convert SQLAlchemy model to dictionary to avoid async attribute access issues
    user_data = {
        "id": updated_user.id,
        "name": updated_user.name,
        "email": updated_user.email,
        "is_active": updated_user.is_active,
        "is_verified": updated_user.is_verified,
        "mfa_enabled": updated_user.mfa_enabled if updated_user.mfa_enabled is not None else False,
        "role": updated_user.role,
        "country": updated_user.country,
        "currency": updated_user.currency,
        "created_at": updated_user.created_at,
        "updated_at": updated_user.updated_at,
        "last_login": updated_user.last_login,
        "username": updated_user.username,
        "avatar": updated_user.avatar,
        "user_type": updated_user.user_type,
    }
    
    return UserInDB(**user_data)


@router.post("/auth/changepassword")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await user_service.change_user_password(
        db, current_user.id, password_data.current_password, password_data.new_password
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    return {"message": "Password changed successfully"}


@router.post("/auth/forgotpassword")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    user = await user_service.get_user_by_email(db, request.email)
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If email exists, reset instructions will be sent"}
    
    # Generate a reset token (in a real app, this should be a secure random token)
    reset_token = secrets.token_urlsafe(32)
    
    # Trigger password reset email in background
    from tasks.email import send_password_reset_email
    send_password_reset_email.delay(user.email, reset_token)
    
    return {"message": "If email exists, reset instructions will be sent"}


@router.post("/auth/resetpassword", response_model=TokenResponse)
async def reset_password(
    reset_data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    # In a real app, verify the reset token and reset the password
    # For now, just return a success message
    # This is a simplified implementation - in practice you'd validate tokens
    
    # Find user by email (decoded from reset token in real implementation)
    user = await user_service.get_user_by_email(db, reset_data.reset_token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user password
    # In a real implementation, reset_data.reset_token would contain the email or user ID
    # and reset_data.new_password would be the new password
    
    return {"message": "Password reset successfully"}


@router.post("/auth/mfa/setup", response_model=MFASetupResponse)
async def setup_mfa(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # In a real app, this would generate MFA setup information
    # For now, return mock data
    return MFASetupResponse(
        secret="mock_secret",
        otp_uri="otpauth://totp/Paygate:user@example.com?secret=mock_secret"
    )


@router.post("/auth/mfa/verify")
async def verify_mfa(
    mfa_data: MFAVerifyRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # In a real app, this would verify the MFA code
    # For now, just return success
    return {"message": "MFA verified successfully"}


@router.get("/auth/verify-email/{token}")
async def verify_email_token(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    # In a real app, this would verify the email token
    # For now, just return success
    return {"message": "Email verified successfully"}