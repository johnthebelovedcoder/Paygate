from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Billing schemas
class SubscriptionPlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    currency: str = "USD"
    billing_period: str = "month"
    features: Optional[str] = None
    is_active: bool = True


class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass


class SubscriptionPlan(SubscriptionPlanBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    billing_period: Optional[str] = None
    features: Optional[str] = None
    is_active: Optional[bool] = None


class SubscriptionBase(BaseModel):
    user_id: int
    plan_id: int
    status: str = "active"
    start_date: datetime
    end_date: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None
    auto_renew: bool = True
    payment_method: Optional[str] = None


class SubscriptionCreate(SubscriptionBase):
    pass


class Subscription(SubscriptionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubscriptionUpdate(BaseModel):
    user_id: Optional[int] = None
    plan_id: Optional[int] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    next_billing_date: Optional[datetime] = None
    auto_renew: Optional[bool] = None
    payment_method: Optional[str] = None


class InvoiceBase(BaseModel):
    user_id: int
    subscription_id: Optional[int] = None
    amount: float
    currency: str = "USD"
    status: str = "pending"
    invoice_number: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    paid_at: Optional[datetime] = None


class InvoiceCreate(InvoiceBase):
    pass


class Invoice(InvoiceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvoiceUpdate(BaseModel):
    user_id: Optional[int] = None
    subscription_id: Optional[int] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    invoice_number: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    paid_at: Optional[datetime] = None


class CouponBase(BaseModel):
    code: str
    discount_type: str = "percentage"
    discount_value: float
    usage_limit: Optional[int] = None
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True


class CouponCreate(CouponBase):
    pass


class Coupon(CouponBase):
    id: int
    used_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CouponUpdate(BaseModel):
    code: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    usage_limit: Optional[int] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: Optional[bool] = None


class BillingInfoBase(BaseModel):
    user_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None


class BillingInfoCreate(BillingInfoBase):
    pass


class BillingInfo(BillingInfoBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BillingInfoUpdate(BaseModel):
    user_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None