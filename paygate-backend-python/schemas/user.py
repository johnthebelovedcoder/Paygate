from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime
import re
from utils.validation import sanitize_string, is_valid_name, is_valid_email

class UserBase(BaseModel):
    email: EmailStr = Field(..., max_length=255)
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)  # Changed from 'name' to 'full_name'
    role: Optional[str] = Field("user", min_length=1, max_length=50)  # Changed default from "admin" to "user"

    @validator('full_name', pre=True)
    def validate_and_sanitize_full_name(cls, v):
        if v is None:
            return v
        if not is_valid_name(v):
            raise ValueError('Invalid full name format')
        return sanitize_string(v)

    @validator('email')
    def validate_and_sanitize_email(cls, v):
        if not v:
            raise ValueError('Email is required')
        if not is_valid_email(v):
            raise ValueError('Invalid email format')
        return sanitize_string(v)

    @validator('role', pre=True)
    def validate_and_sanitize_optional_fields(cls, v):
        if v is None:
            return v
        return sanitize_string(v)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    username: Optional[str] = Field(None, min_length=1, max_length=50)  # Added username
    name: Optional[str] = Field(None, min_length=1, max_length=100)  # For backward compatibility
    country: Optional[str] = Field(None, max_length=100)  # Added for registration
    currency: Optional[str] = Field(None, max_length=10)  # Added for registration
    user_type: Optional[str] = Field(None, max_length=50)  # Added for registration

    @validator('password')
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v
        
    @validator('full_name', pre=True, always=True)
    def set_full_name_from_name(cls, v, values):
        # If full_name is not provided but name is, use name as full_name
        if v is None and 'name' in values and values['name'] is not None:
            return values['name']
        return v

    @validator('username', pre=True)
    def validate_and_sanitize_username(cls, v):
        if v is None:
            return v
        return sanitize_string(v)

    @validator('country', 'currency', 'user_type', pre=True)
    def validate_and_sanitize_optional_fields(cls, v):
        if v is None:
            return v
        return sanitize_string(v)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None

    @validator('full_name', 'email', 'role', 'avatar_url', 'bio', 'phone', 'company', 'job_title', pre=True)
    def validate_and_sanitize_update_fields(cls, v):
        if v is None:
            return v
        return sanitize_string(v)


class UserLogin(BaseModel):
    email: str
    password: str

    @validator('email')
    def validate_and_sanitize_email(cls, v):
        if not v:
            raise ValueError('Email is required')
        if not is_valid_email(v):
            raise ValueError('Invalid email format')
        return sanitize_string(v)


class UserInDB(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    country: Optional[str] = None
    currency: Optional[str] = None
    user_type: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserInDB


class ForgotPasswordRequest(BaseModel):
    email: str

    @validator('email')
    def validate_and_sanitize_email(cls, v):
        if not v:
            raise ValueError('Email is required')
        if not is_valid_email(v):
            raise ValueError('Invalid email format')
        return sanitize_string(v)


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str

    @validator('reset_token', pre=True)
    def validate_and_sanitize_reset_token(cls, v):
        if not v:
            raise ValueError('Reset token is required')
        return sanitize_string(v)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class MFASetupResponse(BaseModel):
    secret: str
    otp_uri: str


class MFAVerifyRequest(BaseModel):
    totp_code: str


class VerifyEmailRequest(BaseModel):
    token: str


class RefreshTokenRequest(BaseModel):
    refreshToken: str