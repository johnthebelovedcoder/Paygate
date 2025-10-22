from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


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