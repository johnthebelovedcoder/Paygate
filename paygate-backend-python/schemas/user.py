from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime
import re
from utils.validation import sanitize_string, is_valid_name, is_valid_email

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr = Field(..., max_length=255)
    role: Optional[str] = Field("user", min_length=1, max_length=50)
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    currency: Optional[str] = Field(None, min_length=1, max_length=10)

    @validator('name')
    def validate_and_sanitize_name(cls, v):
        if not v:
            raise ValueError('Name is required')
        if not is_valid_name(v):
            raise ValueError('Invalid name format')
        return sanitize_string(v)

    @validator('email')
    def validate_and_sanitize_email(cls, v):
        if not v:
            raise ValueError('Email is required')
        if not is_valid_email(v):
            raise ValueError('Invalid email format')
        return sanitize_string(v)

    @validator('role', 'country', 'currency', pre=True)
    def validate_and_sanitize_optional_fields(cls, v):
        if v is None:
            return v
        return sanitize_string(v)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    user_type: Optional[str] = Field(None, min_length=1, max_length=50)
    content_types: Optional[list] = []

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

    @validator('user_type', pre=True)
    def validate_and_sanitize_user_type(cls, v):
        if v is None:
            return v
        return sanitize_string(v)

    @validator('content_types', pre=True)
    def validate_and_sanitize_content_types(cls, v):
        if not v:
            return v
        # Sanitize each content type string
        sanitized = []
        for item in v:
            if isinstance(item, str):
                sanitized.append(sanitize_string(item))
            else:
                sanitized.append(item)
        return sanitized


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    country: Optional[str] = None
    currency: Optional[str] = None

    @validator('name', 'email', 'country', 'currency', pre=True)
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
    mfa_enabled: Optional[bool] = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

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