from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class PaymentBase(BaseModel):
    amount: float
    currency: str = "NGN"
    status: str = "pending"  # pending, completed, failed, refunded
    paywall_id: Optional[int] = None
    customer_email: str
    customer_name: Optional[str] = None
    reference: str
    payment_method: Optional[str] = None
    channel: Optional[str] = None
    gateway_response: Optional[Dict[str, Any]] = None


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
    paywall_id: int
    amount: float
    currency: str
    customer_email: str
    customer_name: Optional[str] = None
    payment_method: Optional[str] = None
    channel: Optional[str] = None


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