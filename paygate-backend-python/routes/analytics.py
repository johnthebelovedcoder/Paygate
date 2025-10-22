from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from models import User
from schemas import *
from services import analytics_service
from utils.auth import get_current_user
from typing import List

router = APIRouter()

@router.get("/analytics/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stats = await analytics_service.get_dashboard_stats(db, current_user.id)
    return stats


@router.get("/analytics/revenue", response_model=List[DailyRevenueData])
async def get_revenue_data(
    time_range: str = "this_month",
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    revenue_data = await analytics_service.get_revenue_data(db, current_user.id, time_range)
    return revenue_data


@router.get("/analytics/top-paywalls", response_model=List[TopPaywall])
async def get_top_paywalls(
    limit: int = 5,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    top_paywalls = await analytics_service.get_top_paywalls(db, current_user.id, limit)
    return top_paywalls


@router.get("/analytics/customers", response_model=dict)
async def get_customer_data(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    customer_data = await analytics_service.get_customer_data(db, current_user.id)
    return customer_data


# Creator-specific analytics endpoints
@router.get("/analytics/creator/revenue-summary", response_model=RevenueSummary)
async def get_creator_revenue_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    revenue_summary = await analytics_service.get_revenue_summary(db, current_user.id)
    return revenue_summary


@router.get("/analytics/creator/paywall-performance", response_model=List[PaywallPerformance])
async def get_creator_paywall_performance(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    paywall_performance = await analytics_service.get_paywall_performance(db, current_user.id, limit)
    return paywall_performance


@router.get("/analytics/creator/top-customers", response_model=List[TopCustomer])
async def get_creator_top_customers(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    top_customers = await analytics_service.get_top_customers(db, current_user.id, limit)
    return top_customers


@router.get("/analytics/creator/content-analytics", response_model=dict)
async def get_creator_content_analytics(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    content_analytics = await analytics_service.get_content_analytics(db, current_user.id)
    return content_analytics


@router.get("/analytics/creator/content-popular", response_model=List[Content])
async def get_creator_popular_content(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    popular_content = await analytics_service.get_popular_content(db, current_user.id, limit)
    return popular_content


@router.get("/analytics/creator/content-protection", response_model=dict)
async def get_creator_content_protection_settings(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    protection_settings = await analytics_service.get_content_protection_settings(db, current_user.id)
    return protection_settings


@router.put("/analytics/creator/content-protection", response_model=dict)
async def update_creator_content_protection_settings(
    protection_data: dict,  # Define proper schema in real implementation
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    updated_settings = await analytics_service.update_content_protection_settings(db, current_user.id, protection_data)
    return updated_settings


@router.get("/analytics/revenue-forecast", response_model=RevenueForecast)
async def get_revenue_forecast(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    forecast = await analytics_service.get_revenue_forecast(db, current_user.id)
    return forecast