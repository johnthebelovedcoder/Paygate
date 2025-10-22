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


# Notification schemas
class NotificationBase(BaseModel):
    user_id: int
    title: str
    message: str
    notification_type: str = "info"
    priority: str = "normal"
    is_read: bool = False
    is_sent: bool = False
    sent_via: Optional[str] = None
    data: Optional[str] = None


class NotificationCreate(NotificationBase):
    pass


class Notification(NotificationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationPreferenceBase(BaseModel):
    user_id: int
    email_notifications: bool = True
    push_notifications: bool = True
    in_app_notifications: bool = True
    marketing_emails: bool = True
    newsletter: bool = True


class NotificationPreferenceCreate(NotificationPreferenceBase):
    pass


class NotificationPreference(NotificationPreferenceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Support schemas
class SupportCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class SupportCategoryCreate(SupportCategoryBase):
    pass


class SupportCategory(SupportCategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SupportTicketBase(BaseModel):
    user_id: int
    category_id: int
    title: str
    description: str
    priority: str = "medium"
    status: str = "open"
    assigned_to: Optional[int] = None
    resolution: Optional[str] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None


class SupportTicketCreate(SupportTicketBase):
    pass


class SupportTicket(SupportTicketBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SupportTicketResponseBase(BaseModel):
    ticket_id: int
    user_id: int
    message: str
    is_internal: bool = False


class SupportTicketResponseCreate(SupportTicketResponseBase):
    pass


class SupportTicketResponse(SupportTicketResponseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Marketing schemas
class DiscountCodeBase(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str = "percentage"
    discount_value: float
    usage_limit: Optional[int] = None
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True


class DiscountCodeCreate(DiscountCodeBase):
    pass


class DiscountCode(DiscountCodeBase):
    id: int
    used_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AffiliateBase(BaseModel):
    user_id: int
    commission_rate: float = 10.0
    affiliate_code: str
    earnings: float = 0.0
    paid_earnings: float = 0.0
    is_active: bool = True


class AffiliateCreate(AffiliateBase):
    pass


class Affiliate(AffiliateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AffiliateReferralBase(BaseModel):
    affiliate_id: int
    referred_user_id: Optional[int] = None
    referral_code: str
    commission_amount: float = 0.0
    commission_status: str = "pending"
    order_id: Optional[int] = None
    is_paid: bool = False


class AffiliateReferralCreate(AffiliateReferralBase):
    pass


class AffiliateReferral(AffiliateReferralBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MarketingCampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    campaign_type: str = "email"
    status: str = "draft"
    start_date: datetime
    end_date: Optional[datetime] = None
    target_audience: Optional[str] = None
    metrics: Optional[str] = None


class MarketingCampaignCreate(MarketingCampaignBase):
    pass


class MarketingCampaign(MarketingCampaignBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmailListBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class EmailListCreate(EmailListBase):
    pass


class EmailList(EmailListBase):
    id: int
    subscriber_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmailSubscriberBase(BaseModel):
    email_list_id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_subscribed: bool = True
    is_confirmed: bool = False
    unsubscribe_reason: Optional[str] = None


class EmailSubscriberCreate(EmailSubscriberBase):
    pass


class EmailSubscriber(EmailSubscriberBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True