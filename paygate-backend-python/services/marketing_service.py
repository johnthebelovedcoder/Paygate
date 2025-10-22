from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime, timedelta
from models import DiscountCode, Affiliate, AffiliateReferral, MarketingCampaign, EmailList, EmailSubscriber
from schemas.marketing_schemas import (
    DiscountCodeCreate, AffiliateCreate, AffiliateReferralCreate, 
    MarketingCampaignCreate, EmailListCreate, EmailSubscriberCreate
)


# Discount Code Services
async def get_discount_code_by_code(db: AsyncSession, code: str) -> Optional[DiscountCode]:
    result = await db.execute(select(DiscountCode).filter(DiscountCode.code == code))
    return result.scalar_one_or_none()


async def is_discount_code_valid(db: AsyncSession, code: str) -> bool:
    discount_code = await get_discount_code_by_code(db, code)
    if not discount_code:
        return False
    if not discount_code.is_active:
        return False
    if discount_code.valid_from > datetime.utcnow():
        return False
    if discount_code.valid_until < datetime.utcnow():
        return False
    if discount_code.usage_limit and discount_code.used_count >= discount_code.usage_limit:
        return False
    return True


async def create_discount_code(db: AsyncSession, discount_code: DiscountCodeCreate) -> DiscountCode:
    db_discount_code = DiscountCode(**discount_code.model_dump())
    db.add(db_discount_code)
    await db.commit()
    await db.refresh(db_discount_code)
    return db_discount_code


# Affiliate Services
async def get_affiliate_by_user_id(db: AsyncSession, user_id: int) -> Optional[Affiliate]:
    result = await db.execute(select(Affiliate).filter(Affiliate.user_id == user_id))
    return result.scalar_one_or_none()


async def get_affiliate_by_code(db: AsyncSession, affiliate_code: str) -> Optional[Affiliate]:
    result = await db.execute(select(Affiliate).filter(Affiliate.affiliate_code == affiliate_code))
    return result.scalar_one_or_none()


async def create_affiliate(db: AsyncSession, affiliate: AffiliateCreate) -> Affiliate:
    db_affiliate = Affiliate(**affiliate.model_dump())
    db.add(db_affiliate)
    await db.commit()
    await db.refresh(db_affiliate)
    return db_affiliate


# Affiliate Referral Services
async def create_affiliate_referral(db: AsyncSession, referral: AffiliateReferralCreate) -> AffiliateReferral:
    db_referral = AffiliateReferral(**referral.model_dump())
    db.add(db_referral)
    await db.commit()
    await db.refresh(db_referral)
    return db_referral


# Marketing Campaign Services
async def get_marketing_campaign_by_id(db: AsyncSession, campaign_id: int) -> Optional[MarketingCampaign]:
    result = await db.execute(select(MarketingCampaign).filter(MarketingCampaign.id == campaign_id))
    return result.scalar_one_or_none()


async def get_active_marketing_campaigns(db: AsyncSession) -> List[MarketingCampaign]:
    result = await db.execute(
        select(MarketingCampaign)
        .filter(MarketingCampaign.status == "active")
        .filter(MarketingCampaign.start_date <= datetime.utcnow())
        .filter(MarketingCampaign.end_date >= datetime.utcnow())
        .order_by(MarketingCampaign.start_date)
    )
    return result.scalars().all()


async def create_marketing_campaign(db: AsyncSession, campaign: MarketingCampaignCreate) -> MarketingCampaign:
    db_campaign = MarketingCampaign(**campaign.model_dump())
    db.add(db_campaign)
    await db.commit()
    await db.refresh(db_campaign)
    return db_campaign


# Email List Services
async def get_email_list_by_id(db: AsyncSession, list_id: int) -> Optional[EmailList]:
    result = await db.execute(select(EmailList).filter(EmailList.id == list_id))
    return result.scalar_one_or_none()


async def get_email_list_by_name(db: AsyncSession, name: str) -> Optional[EmailList]:
    result = await db.execute(select(EmailList).filter(EmailList.name == name))
    return result.scalar_one_or_none()


async def create_email_list(db: AsyncSession, email_list: EmailListCreate) -> EmailList:
    db_list = EmailList(**email_list.model_dump())
    db.add(db_list)
    await db.commit()
    await db.refresh(db_list)
    return db_list


# Email Subscriber Services
async def get_subscriber_by_email(db: AsyncSession, email: str, email_list_id: int) -> Optional[EmailSubscriber]:
    result = await db.execute(
        select(EmailSubscriber)
        .filter(EmailSubscriber.email == email)
        .filter(EmailSubscriber.email_list_id == email_list_id)
    )
    return result.scalar_one_or_none()


async def add_subscriber_to_list(db: AsyncSession, subscriber: EmailSubscriberCreate) -> EmailSubscriber:
    db_subscriber = EmailSubscriber(**subscriber.model_dump())
    db.add(db_subscriber)
    await db.commit()
    await db.refresh(db_subscriber)
    
    # Update subscriber count for the list
    email_list = await get_email_list_by_id(db, subscriber.email_list_id)
    if email_list:
        email_list.subscriber_count += 1
        await db.commit()
    
    return db_subscriber