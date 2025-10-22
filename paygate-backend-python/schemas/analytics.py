from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class DashboardStats(BaseModel):
    total_revenue: float
    total_sales: int
    total_visitors: int
    conversion_rate: float
    avg_order_value: float
    active_paywalls: int
    recent_payments: int
    total_customers: int


class RevenueData(BaseModel):
    date: str
    revenue: float
    sales: int


class DailyRevenueData(BaseModel):
    date: str
    revenue: float
    sales: int


class TopPaywall(BaseModel):
    id: str
    title: str
    revenue: float
    conversions: int
    conversion_rate: float


class TrafficSource(BaseModel):
    id: str
    name: str
    visits: int
    conversions: int
    revenue: float
    conversion_rate: float


class CustomerData(BaseModel):
    total_customers: int
    customer_growth: List[dict]


class GeographicData(BaseModel):
    country: str
    country_code: str
    sales: int
    revenue: float
    currency: str
    percentage: float


class RevenueBreakdown(BaseModel):
    revenue_by_time: List[dict]
    revenue_by_product: List[dict]
    revenue_by_segment: List[dict]


class ConversionFunnel(BaseModel):
    total_views: int
    total_purchases: int
    conversion_rate: float
    drop_off_points: List[dict]


class CustomerLifetimeValue(BaseModel):
    id: str
    customer_name: str
    email: str
    lifetime_value: float
    total_purchases: int
    avg_order_value: float


class RevenueForecastData(BaseModel):
    date: str
    forecasted_revenue: float
    confidence_interval_low: float
    confidence_interval_high: float


class RevenueForecast(BaseModel):
    forecast: List[RevenueForecastData]
    trend: str
    confidence: float


class CustomerGrowthData(BaseModel):
    month: str
    new_customers: int
    total_customers: int


class RevenueSummary(BaseModel):
    total_earned: float
    total_sales: int
    pending_payouts: float
    avg_order_value: float


class PaywallPerformance(BaseModel):
    id: str
    title: str
    total_revenue: float
    total_sales: int
    conversion_rate: float


class TopCustomer(BaseModel):
    id: str
    email: str
    name: str
    purchase_count: int
    total_spent: float


class AnalyticsResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None