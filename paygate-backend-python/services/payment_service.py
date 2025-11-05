from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
import uuid
from models import Payment, User, Paywall
from schemas.payment import PaymentCreate, PaymentUpdate


async def get_payment_by_reference(db: AsyncSession, reference: str) -> Optional[Payment]:
    result = await db.execute(
        select(Payment)
        .options(selectinload(Payment.owner), selectinload(Payment.paywall))
        .filter(Payment.reference == reference)
    )
    return result.scalar_one_or_none()


async def get_payments_by_owner(db: AsyncSession, owner_id: int) -> List[Payment]:
    result = await db.execute(
        select(Payment)
        .options(selectinload(Payment.owner), selectinload(Payment.paywall))
        .filter(Payment.owner_id == owner_id)
        .order_by(Payment.created_at.desc())
    )
    return result.scalars().all()


async def get_recent_payments(db: AsyncSession, owner_id: int, limit: int = 5) -> List[Payment]:
    result = await db.execute(
        select(Payment)
        .options(selectinload(Payment.owner), selectinload(Payment.paywall))
        .filter(Payment.owner_id == owner_id)
        .order_by(Payment.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


async def create_payment(db: AsyncSession, payment: PaymentCreate) -> Payment:
    db_payment = Payment(
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        paywall_id=payment.paywall_id,
        customer_email=payment.customer_email,
        customer_name=payment.customer_name,
        reference=payment.reference,
        payment_method=payment.payment_method,
        channel=payment.channel,
        gateway_response=payment.gateway_response,
        owner_id=payment.owner_id
    )
    db.add(db_payment)
    await db.commit()
    await db.refresh(db_payment)
    
    # Trigger payment confirmation email in background
    from tasks.email import send_payment_confirmation_email
    payment_details = {
        "amount": payment.amount,
        "currency": payment.currency,
        "reference": payment.reference,
        "date": datetime.utcnow().isoformat()
    }
    send_payment_confirmation_email.delay(payment.customer_email, payment_details)
    
    # Trigger real-time analytics event for new payment
    try:
        from .analytics_service import trigger_realtime_analytics_update
        analytics_data = {
            "payment_id": db_payment.id,
            "amount": payment.amount,
            "currency": payment.currency,
            "paywall_id": payment.paywall_id,
            "customer_email": payment.customer_email,
            "status": payment.status
        }
        await trigger_realtime_analytics_update("new_sale", analytics_data, payment.owner_id)
    except Exception as e:
        # Log error but don't fail the payment creation if analytics broadcast fails
        import logging
        logging.error(f"Failed to broadcast analytics event: {str(e)}")
    
    return db_payment


async def update_payment_status(db: AsyncSession, reference: str, status: str, gateway_response: Optional[dict] = None) -> Optional[Payment]:
    db_payment = await get_payment_by_reference(db, reference)
    if not db_payment:
        return None
    
    old_status = db_payment.status
    db_payment.status = status
    if gateway_response:
        db_payment.gateway_response = gateway_response
    
    db_payment.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(db_payment)
    
    # Trigger real-time analytics event if payment status changes significantly
    try:
        from .analytics_service import trigger_realtime_analytics_update
        if old_status != status and db_payment.owner_id:  # Only if there was a change and we have an owner
            analytics_data = {
                "payment_id": db_payment.id,
                "reference": reference,
                "old_status": old_status,
                "new_status": status,
                "amount": db_payment.amount,
                "customer_email": db_payment.customer_email,
                "paywall_id": db_payment.paywall_id
            }
            await trigger_realtime_analytics_update("payment_status_updated", analytics_data, db_payment.owner_id)
    except Exception as e:
        # Log error but don't fail the payment update if analytics broadcast fails
        import logging
        logging.error(f"Failed to broadcast analytics event: {str(e)}")
    
    return db_payment


async def get_payment_by_id(db: AsyncSession, payment_id: int) -> Optional[Payment]:
    result = await db.execute(
        select(Payment)
        .options(selectinload(Payment.owner), selectinload(Payment.paywall))
        .filter(Payment.id == payment_id)
    )
    return result.scalar_one_or_none()


async def generate_payment_reference() -> str:
    return f"PAY-{str(uuid.uuid4()).split('-')[0].upper()}-{int(datetime.now().timestamp())}"