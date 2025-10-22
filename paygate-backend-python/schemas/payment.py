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