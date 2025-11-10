from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from utils.validation import sanitize_string, is_valid_email


class PaymentBase(BaseModel):
    amount: float = Field(..., ge=0.01, le=1000000.0)  # Minimum 0.01, maximum 1,000,000
    currency: str = Field("NGN", min_length=3, max_length=3)
    status: str = "pending"  # pending, completed, failed, refunded
    paywall_id: Optional[int] = Field(None, ge=1)  # Must be a positive integer if provided
    customer_email: str = Field(..., max_length=255)
    customer_name: Optional[str] = Field(None, max_length=100)
    reference: str = Field(..., min_length=1, max_length=100)
    payment_method: Optional[str] = Field(None, max_length=50)
    channel: Optional[str] = Field(None, max_length=50)
    gateway_response: Optional[Dict[str, Any]] = None

    @validator('customer_email')
    def validate_email(cls, v):
        if not is_valid_email(v):
            raise ValueError('Invalid email format')
        return v

    @validator('customer_name', 'payment_method', 'channel', pre=True)
    def validate_and_sanitize_strings(cls, v):
        if v is None:
            return v
        return sanitize_string(v)

    @validator('currency', pre=True)
    def validate_currency_format(cls, v):
        # Basic ISO 4217 currency code validation
        if not v.isalpha() or len(v) != 3:
            raise ValueError('Currency must be a valid 3-letter ISO code')
        return v.upper()

    @validator('status', pre=True)
    def validate_payment_status(cls, v):
        allowed_statuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled']
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v.lower()


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None


class Payment(PaymentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CreatePaymentRequest(BaseModel):
    paywall_id: int = Field(..., gt=0)
    amount: float = Field(..., ge=0.01, le=1000000.0)
    currency: str = Field("NGN", min_length=3, max_length=3)
    customer_email: str = Field(..., max_length=255)
    customer_name: Optional[str] = Field(None, max_length=100)
    payment_method: Optional[str] = Field(None, max_length=50)
    channel: Optional[str] = Field(None, max_length=50)

    @validator('customer_email')
    def validate_email(cls, v):
        if not is_valid_email(v):
            raise ValueError('Invalid email format')
        return v

    @validator('customer_name', 'payment_method', 'channel', pre=True)
    def validate_and_sanitize_strings(cls, v):
        if v is None:
            return v
        return sanitize_string(v)

    @validator('currency', pre=True)
    def validate_currency_format(cls, v):
        # Basic ISO 4217 currency code validation
        if not v.isalpha() or len(v) != 3:
            raise ValueError('Currency must be a valid 3-letter ISO code')
        return v.upper()


class PaystackInitializeResponse(BaseModel):
    status: bool
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class PaystackVerifyResponse(BaseModel):
    status: bool
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class PaymentResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Payment] = None


class PaymentMethodBase(BaseModel):
    type: str  # "card", "bank", "wallet", etc.
    provider: str  # "stripe", "paystack", "paypal", etc.
    provider_customer_id: str
    provider_payment_method_id: str
    brand: Optional[str] = None  # Card brand (Visa, Mastercard, etc.)
    last4: Optional[str] = None  # Last 4 digits of card
    expiry_month: Optional[int] = None  # Expiry month for cards
    expiry_year: Optional[int] = None  # Expiry year for cards
    is_default: bool = False  # Whether this is the default payment method
    is_active: bool = True  # Whether the payment method is active


class PaymentMethodCreate(PaymentMethodBase):
    user_id: int


class PaymentMethodUpdate(BaseModel):
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None


class PaymentMethod(PaymentMethodBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True