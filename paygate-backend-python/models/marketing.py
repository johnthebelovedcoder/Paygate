from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base

class DiscountCode(Base):
    __tablename__ = "discount_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)  # e.g. "SAVE20"
    description = Column(Text, nullable=True)
    discount_type = Column(String, default="percentage")  # "percentage", "fixed"
    discount_value = Column(Float, nullable=False)  # e.g. 20.0 for 20% or $20
    usage_limit = Column(Integer, nullable=True)  # Max usage count, NULL for unlimited
    used_count = Column(Integer, default=0)  # How many times it's been used
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_until = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Affiliate(Base):
    __tablename__ = "affiliates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)  # Affiliate user
    commission_rate = Column(Float, default=10.0)  # Percentage
    affiliate_code = Column(String, unique=True, index=True)  # Unique referral code
    earnings = Column(Float, default=0.0)  # Total earnings
    paid_earnings = Column(Float, default=0.0)  # Earnings that have been paid out
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")


class AffiliateReferral(Base):
    __tablename__ = "affiliate_referrals"

    id = Column(Integer, primary_key=True, index=True)
    affiliate_id = Column(Integer, ForeignKey("affiliates.id"), index=True)
    referred_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # User who was referred
    referral_code = Column(String, index=True)  # Code used for referral
    commission_amount = Column(Float, default=0.0)  # Amount of commission earned
    commission_status = Column(String, default="pending", index=True)  # pending, approved, paid, rejected
    order_id = Column(Integer, nullable=True, index=True)  # ID of purchase that generated commission
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    affiliate = relationship("Affiliate")
    referred_user = relationship("User", foreign_keys=[referred_user_id])


class MarketingCampaign(Base):
    __tablename__ = "marketing_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    campaign_type = Column(String, default="email", index=True)  # email, sms, social, etc.
    status = Column(String, default="draft", index=True)  # draft, active, paused, completed
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    target_audience = Column(String, nullable=True)  # JSON with targeting criteria
    metrics = Column(Text, nullable=True)  # JSON with campaign metrics
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class EmailList(Base):
    __tablename__ = "email_lists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subscriber_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class EmailSubscriber(Base):
    __tablename__ = "email_subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email_list_id = Column(Integer, ForeignKey("email_lists.id"), index=True)
    email = Column(String, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    is_subscribed = Column(Boolean, default=True, index=True)
    is_confirmed = Column(Boolean, default=False)  # Double opt-in confirmation
    unsubscribe_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    email_list = relationship("EmailList")