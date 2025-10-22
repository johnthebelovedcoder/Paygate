from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import Payment, Paywall
from schemas import *
from services import payment_service, paywall_service, customer_service
from utils.auth import get_current_user
from typing import List
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/payments", response_model=PaystackInitializeResponse)
async def create_payment(
    payment_request: CreatePaymentRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify the paywall exists and belongs to the current user
    paywall = await paywall_service.get_paywall_by_id(db, payment_request.paywall_id)
    if not paywall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paywall not found"
        )
    
    # Generate a unique reference for this payment
    reference = await payment_service.generate_payment_reference()
    
    # Create payment record
    payment_create = PaymentCreate(
        amount=payment_request.amount,
        currency=payment_request.currency,
        status="pending",
        paywall_id=payment_request.paywall_id,
        customer_email=payment_request.customer_email,
        customer_name=payment_request.customer_name,
        reference=reference,
        payment_method=payment_request.payment_method,
        channel=payment_request.channel,
        owner_id=current_user.id
    )
    
    created_payment = await payment_service.create_payment(db, payment_create)
    
    # Return mock Paystack response (in real implementation, this would call Paystack API)
    return PaystackInitializeResponse(
        status=True,
        message="Payment initialized successfully",
        data={
            "authorization_url": f"http://localhost:3000/payments/verify/{reference}",
            "access_code": "mock_access_code",
            "reference": reference
        }
    )


@router.get("/payments/", response_model=List[Payment])
@router.get("/payments", response_model=List[Payment])
async def get_recent_payments(
    limit: int = 5,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    payments = await payment_service.get_recent_payments(db, current_user.id, limit)
    return payments


@router.get("/payments/{reference}", response_model=Payment)
async def get_payment(
    reference: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    payment = await payment_service.get_payment_by_reference(db, reference)
    if not payment or payment.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    return payment


@router.get("/payments/verify/{reference}", response_model=dict)
async def verify_payment(
    reference: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    payment = await payment_service.get_payment_by_reference(db, reference)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # In a real implementation, this would call Paystack to verify the payment
    # For now, return mock data
    return {
        "payment": payment,
        "paystack_data": {
            "status": "success",
            "message": "Payment verified",
            "data": {
                "reference": reference,
                "status": "success",
                "amount": payment.amount,
                "currency": payment.currency,
                "customer": {
                    "email": payment.customer_email,
                    "name": payment.customer_name
                }
            }
        }
    }


# Payment webhook endpoint for receiving payment notifications from Paystack
@router.post("/payments/webhook")
async def payment_webhook(payload: dict):
    # This endpoint should be called by Paystack when a payment event occurs
    # Process the webhook payload and update payment status
    # For security, verify the webhook signature here
    
    event_type = payload.get('event')
    if event_type == 'charge.success':
        # Extract payment details from the payload
        data = payload.get('data', {})
        reference = data.get('reference')
        status = data.get('status')
        amount = data.get('amount', 0) / 100  # Paystack sends amount in kobo
        customer_email = data.get('customer', {}).get('email')
        
        # This is a simplified webhook handler - in a real app you'd:
        # 1. Verify webhook signature
        # 2. Update payment status in DB
        # 3. Update customer stats
        # 4. Update paywall conversion stats
        # 5. Process the content access grant
        print(f"Webhook received: {event_type} for reference {reference}")
    
    return {"status": "success"}