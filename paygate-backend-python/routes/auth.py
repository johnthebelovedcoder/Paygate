from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import User
from schemas import *
from services import user_service, content_service, token_service
from utils.auth import get_current_user, security
from config.settings import settings
from datetime import timedelta, datetime
import uuid
import re
import jwt
from jwt import PyJWTError as JWTError
import secrets

# Import security monitoring
from utils.security_monitoring import security_monitor, monitor_failed_login

router = APIRouter()

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

@router.post("/auth/register", response_model=dict)
async def register_user(user: UserCreate, request: Request, db: AsyncSession = Depends(get_db)):
    # Log the incoming request
    print("\n=== Registration Request ===")
    
    # Log headers
    print("\n--- Headers ---")
    for name, value in request.headers.items():
        print(f"{name}: {value}")
    
    # Log raw request body
    print("\n--- Raw Request Body ---")
    try:
        body = await request.body()
        print(body.decode())
    except Exception as e:
        print(f"Error reading request body: {str(e)}")
    
    # Log parsed user data
    print("\n--- Parsed User Data ---")
    try:
        user_dict = user.dict()
        print(f"User data: {user_dict}")
        print(f"User model fields: {user.__fields__.keys()}")
    except Exception as e:
        print(f"Error parsing user data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error parsing request data: {str(e)}"
        )
    
    # Validate email format
    if not EMAIL_REGEX.match(user.email):
        error_msg = f"Invalid email format: {user.email}"
        print(f"\n--- Validation Error ---\n{error_msg}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
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
        "email": db_user.email,
        "full_name": db_user.full_name,
        "is_active": db_user.is_active,
        "is_verified": db_user.is_verified,
        "role": db_user.role,
        "username": db_user.username,
        "avatar_url": db_user.avatar_url if hasattr(db_user, 'avatar_url') else None,
        "bio": db_user.bio if hasattr(db_user, 'bio') else None,
        "phone": db_user.phone if hasattr(db_user, 'phone') and db_user.phone else None,
        "company": db_user.company if hasattr(db_user, 'company') else None,
        "job_title": db_user.job_title if hasattr(db_user, 'job_title') else None,
        "country": db_user.country if hasattr(db_user, 'country') else None,
        "currency": db_user.currency if hasattr(db_user, 'currency') else None,
        "user_type": db_user.user_type if hasattr(db_user, 'user_type') else None,
        "created_at": db_user.created_at,
        "updated_at": db_user.updated_at,
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
    
    access_token_expires = timedelta(minutes=30)
    access_token = user_service.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    refresh_token = user_service.create_access_token(
        data={"sub": user.email, "type": "refresh"},
        expires_delta=timedelta(days=7)
    )
    
    # Update last login time
    current_time = datetime.utcnow()
    user.last_login = current_time
    
    # Add user to session and commit
    db.add(user)
    await db.commit()
    
    # Get a fresh copy of the user to ensure we have all attributes
    db_user = await user_service.get_user_by_email(db, user.email)
    
    # Convert SQLAlchemy model to dictionary with proper datetime handling
    user_data = {
        "id": db_user.id,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "is_active": db_user.is_active,
        "is_verified": db_user.is_verified,
        "role": db_user.role,
        "username": db_user.username,
        "avatar_url": db_user.avatar_url if hasattr(db_user, 'avatar_url') else None,
        "bio": db_user.bio if hasattr(db_user, 'bio') else None,
        "phone": db_user.phone if hasattr(db_user, 'phone') and db_user.phone else None,
        "company": db_user.company if hasattr(db_user, 'company') else None,
        "job_title": db_user.job_title if hasattr(db_user, 'job_title') else None,
        "country": db_user.country if hasattr(db_user, 'country') else None,
        "currency": db_user.currency if hasattr(db_user, 'currency') else None,
        "user_type": db_user.user_type if hasattr(db_user, 'user_type') else None,
        "created_at": db_user.created_at,  # Keep as datetime object
        "updated_at": db_user.updated_at,  # Keep as datetime object
    }
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserInDB(**user_data)
    )


@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(refresh_request: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    refresh_token_str = refresh_request.refreshToken
    
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
        "email": user.email,
        "full_name": user.full_name,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "role": user.role,
        "username": user.username,
        "avatar_url": user.avatar_url if hasattr(user, 'avatar_url') else None,
        "bio": user.bio if hasattr(user, 'bio') else None,
        "phone": user.phone if hasattr(user, 'phone') and user.phone else None,
        "company": user.company if hasattr(user, 'company') else None,
        "job_title": user.job_title if hasattr(user, 'job_title') else None,
        "country": user.country if hasattr(user, 'country') else None,
        "currency": user.currency if hasattr(user, 'currency') else None,
        "user_type": user.user_type if hasattr(user, 'user_type') else None,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
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
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "role": current_user.role,
        "username": current_user.username,
        "avatar_url": current_user.avatar_url if hasattr(current_user, 'avatar_url') else None,
        "bio": current_user.bio if hasattr(current_user, 'bio') else None,
        "phone": current_user.phone if hasattr(current_user, 'phone') and current_user.phone else None,
        "company": current_user.company if hasattr(current_user, 'company') else None,
        "job_title": current_user.job_title if hasattr(current_user, 'job_title') else None,
        "country": current_user.country if hasattr(current_user, 'country') else None,
        "currency": current_user.currency if hasattr(current_user, 'currency') else None,
        "user_type": current_user.user_type if hasattr(current_user, 'user_type') else None,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
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
        "email": updated_user.email,
        "full_name": updated_user.full_name,
        "is_active": updated_user.is_active,
        "is_verified": updated_user.is_verified,
        "role": updated_user.role,
        "username": updated_user.username,
        "avatar_url": updated_user.avatar_url if hasattr(updated_user, 'avatar_url') else None,
        "bio": updated_user.bio if hasattr(updated_user, 'bio') else None,
        "phone": updated_user.phone if hasattr(updated_user, 'phone') and updated_user.phone else None,
        "company": updated_user.company if hasattr(updated_user, 'company') else None,
        "job_title": updated_user.job_title if hasattr(updated_user, 'job_title') else None,
        "country": updated_user.country if hasattr(updated_user, 'country') else None,
        "currency": updated_user.currency if hasattr(updated_user, 'currency') else None,
        "user_type": updated_user.user_type if hasattr(updated_user, 'user_type') else None,
        "created_at": updated_user.created_at,
        "updated_at": updated_user.updated_at,
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


@router.post("/auth/request-password-reset", response_model=dict)
async def request_password_reset(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Request a password reset for the given email"""
    user = await user_service.get_user_by_email(db, request.email)
    if user:
        # Generate a password reset token
        reset_token = user_service.create_access_token(
            data={"sub": user.email, "type": "reset"},
            expires_delta=timedelta(hours=24)
        )
        
        # In a real app, send email with reset link
        # For now, we'll just return the token for testing
        return {
            "success": True,
            "message": "Password reset link sent to your email",
            "reset_token": reset_token  # Remove in production
        }
    
    # Always return success to prevent email enumeration
    return {
        "success": True,
        "message": "If your email is registered, you'll receive a password reset link"
    }

@router.post("/auth/reset-password", response_model=dict)
async def reset_password(
    reset_data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Reset user's password using a valid token"""
    try:
        # Verify the reset token
        token_data = user_service.verify_token(reset_data.token)
        if token_data.get("type") != "reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )
            
        # Get user by email from token
        user = await user_service.get_user_by_email(db, token_data.get("sub"))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        # Update the password
        await user_service.update_user_password(
            db, 
            user.id, 
            reset_data.new_password
        )
        
        return {
            "success": True,
            "message": "Password has been reset successfully"
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset link has expired"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

@router.post("/auth/mfa/setup", response_model=MFASetupResponse)
async def setup_mfa(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate MFA secret and provisioning URI"""
    # Check if MFA is already enabled
    if current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already enabled for this account"
        )
    
    # Generate a new MFA secret
    secret = user_service.generate_mfa_secret()
    
    # Generate provisioning URI
    email = current_user.email
    issuer_name = "Paygate"
    otp_uri = user_service.get_otp_uri(secret, email, issuer_name)
    
    # Save the secret to the user's record (temporarily, until verified)
    await user_service.update_user(
        db, 
        current_user.id,
        {"mfa_secret": secret, "mfa_enabled": False}
    )
    
    return {
        "secret": secret,
        "otp_uri": otp_uri,
        "message": "Scan the QR code with your authenticator app"
    }

@router.post("/auth/mfa/verify", response_model=dict)
async def verify_mfa(
    mfa_data: MFAVerifyRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify MFA setup with a TOTP code"""
    # Get the user with the latest data
    user = await user_service.get_user(db, current_user.id)
    if not user or not user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA setup not started or invalid user"
        )
    
    # Verify the TOTP code
    is_valid = user_service.verify_totp(user.mfa_secret, mfa_data.totp_code)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Enable MFA for the user
    await user_service.update_user(
        db, 
        user.id, 
        {"mfa_enabled": True}
    )
    
    return {
        "success": True,
        "message": "MFA has been enabled successfully"
    }

@router.get("/auth/verify-email/{token}", response_model=dict)
async def verify_email_token(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Verify the JWT token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token"
            )
            
        # Get user by email using the user service
        user = await user_service.get_user_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        # Update user's email verification status - need to update directly since UserUpdate schema doesn't include email_verified
        user.is_verified = True
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return {
            "success": True,
            "message": "Email verified successfully"
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )





