from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import Customer
from schemas import *
from services import customer_service
from utils.auth import get_current_user
from typing import List

router = APIRouter()

@router.get("/customers", response_model=List[Customer])
async def get_customers(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    customers = await customer_service.get_customers_by_owner(db, current_user.id)
    return customers


@router.get("/customers/segments", response_model=List[CustomerSegment])
async def get_customer_segments(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # In a real implementation, this would return customer segments
    # For now, return mock data
    return [
        CustomerSegment(
            id="1",
            name="High Value",
            description="Customers with high lifetime value",
            customer_count=10
        ),
        CustomerSegment(
            id="2",
            name="New",
            description="Recent customers",
            customer_count=25
        ),
        CustomerSegment(
            id="3",
            name="Loyal",
            description="Repeat customers",
            customer_count=15
        )
    ]


@router.get("/customers/analytics", response_model=CustomerAnalytics)
async def get_customer_analytics(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # In a real implementation, this would calculate and return customer analytics
    # For now, return mock data
    return CustomerAnalytics(
        total_customers=50,
        new_customers=25,
        customer_growth_rate=15.5,
        churn_rate=2.0,
        average_customer_lifetime=180.0,
        customer_segment_distribution=[
            {"segment": "High Value", "count": 10},
            {"segment": "New", "count": 25},
            {"segment": "Loyal", "count": 15}
        ]
    )


@router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(
    customer_id: int,
    customer_update: CustomerUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    customer = await customer_service.get_customer_by_id(db, customer_id)
    if not customer or customer.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    updated_customer = await customer_service.update_customer(db, customer_id, customer_update)
    if not updated_customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return updated_customer


@router.get("/customers/{customer_id}/purchase-timeline", response_model=List[PurchaseTimelineItem])
async def get_customer_purchase_timeline(
    customer_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # In a real implementation, this would return the purchase history for a customer
    # For now, return mock data
    return [
        PurchaseTimelineItem(
            id="1",
            amount=99.99,
            currency="USD",
            paywall_title="Premium Content Access",
            paywall_price=99.99,
            paywall_currency="USD",
            date="2023-05-15T10:30:00Z"
        ),
        PurchaseTimelineItem(
            id="2",
            amount=49.99,
            currency="USD",
            paywall_title="Basic Content Package",
            paywall_price=49.99,
            paywall_currency="USD",
            date="2023-04-22T14:15:00Z"
        )
    ]


@router.get("/customers/export")
async def export_customers(
    current_user: dict = Depends(get_current_user)
):
    # In a real implementation, this would generate a CSV export
    # For now, return a mock response
    return {"message": "Customers export would be generated here"}