from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CustomerBase(BaseModel):
    name: str
    email: str
    total_spent: float = 0
    total_purchases: int = 0
    last_purchase: Optional[datetime] = None
    join_date: datetime
    status: str = "active"  # active, inactive


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None


class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CustomerSegment(BaseModel):
    id: str
    name: str
    description: str
    customer_count: int


class CustomerAnalytics(BaseModel):
    total_customers: int
    new_customers: int
    customer_growth_rate: float
    churn_rate: float
    average_customer_lifetime: float
    customer_segment_distribution: List[dict]


class PurchaseTimelineItem(BaseModel):
    id: str
    amount: float
    currency: str
    paywall_title: str
    paywall_price: float
    paywall_currency: str
    date: str


class CustomerResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Customer] = None


class CustomerListResponse(BaseModel):
    success: bool
    message: str
    data: List[Customer]
    count: Optional[int] = None