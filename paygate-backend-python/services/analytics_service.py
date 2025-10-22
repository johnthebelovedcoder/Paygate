from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, extract
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from models import Payment, Paywall, User, Customer, Content
from schemas.analytics import (
    DashboardStats, RevenueData, DailyRevenueData, TopPaywall,
    RevenueSummary, PaywallPerformance, TopCustomer, RevenueForecast
)
from decimal import Decimal
from utils.cache import cache
import json


async def get_dashboard_stats(db: AsyncSession, owner_id: int) -> DashboardStats:
    # Try to get cached data first
    cache_key = f"dashboard_stats:{owner_id}"
    cached_data = await cache.get(cache_key)
    
    if cached_data:
        data = json.loads(cached_data)
        return DashboardStats(**data)
    
    # Total revenue calculation
    revenue_result = await db.execute(
        select(func.sum(Payment.amount))
        .filter(and_(Payment.owner_id == owner_id, Payment.status == "completed"))
    )
    total_revenue = revenue_result.scalar() or 0
    
    # Total sales
    sales_result = await db.execute(
        select(func.count(Payment.id))
        .filter(and_(Payment.owner_id == owner_id, Payment.status == "completed"))
    )
    total_sales = sales_result.scalar() or 0
    
    # Total paywalls
    paywalls_result = await db.execute(
        select(func.count(Paywall.id))
        .filter(Paywall.owner_id == owner_id)
    )
    active_paywalls = paywalls_result.scalar() or 0
    
    # Total customers
    customers_result = await db.execute(
        select(func.count(Customer.id))
        .filter(Customer.owner_id == owner_id)
    )
    total_customers = customers_result.scalar() or 0
    
    # Recent payments (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_payments_result = await db.execute(
        select(func.count(Payment.id))
        .filter(and_(
            Payment.owner_id == owner_id,
            Payment.status == "completed",
            Payment.created_at >= seven_days_ago
        ))
    )
    recent_payments = recent_payments_result.scalar() or 0
    
    # Calculate conversion rate and average order value
    conversion_rate = 0
    avg_order_value = 0
    
    if total_sales > 0:
        # Calculate based on views and conversions (if we have such data)
        # For now, this is a placeholder
        conversion_rate = 0  # This would need actual view data
        avg_order_value = total_revenue / total_sales if total_sales > 0 else 0
    
    # Total visitors is not tracked in our current model, so using a placeholder
    total_visitors = 0  # Would need a page view tracking model
    
    result = DashboardStats(
        total_revenue=total_revenue,
        total_sales=total_sales,
        total_visitors=total_visitors,
        conversion_rate=conversion_rate,
        avg_order_value=avg_order_value,
        active_paywalls=active_paywalls,
        recent_payments=recent_payments,
        total_customers=total_customers
    )
    
    # Cache the result for 5 minutes (300 seconds)
    await cache.set(cache_key, result.model_dump_json(), expire=300)
    
    return result


async def get_revenue_data(db: AsyncSession, owner_id: int, time_range: str = "this_month") -> List[DailyRevenueData]:
    # Try to get cached data first
    cache_key = f"revenue_data:{owner_id}:{time_range}"
    cached_data = await cache.get(cache_key)
    
    if cached_data:
        data = json.loads(cached_data)
        return [DailyRevenueData(**item) for item in data]
    
    # Calculate date range based on time_range
    now = datetime.utcnow()
    start_date = now
    
    if time_range == "this_week":
        start_date = now - timedelta(days=7)
    elif time_range == "this_month":
        start_date = now - timedelta(days=30)
    elif time_range == "this_year":
        start_date = now - timedelta(days=365)
    # For "last_year" and "custom", we'd need custom start/end dates
    
    # Get revenue data grouped by day
    result = await db.execute(
        select(
            func.date(Payment.created_at).label('date'),
            func.sum(Payment.amount).label('revenue'),
            func.count(Payment.id).label('sales')
        )
        .filter(and_(
            Payment.owner_id == owner_id,
            Payment.status == "completed",
            Payment.created_at >= start_date
        ))
        .group_by(func.date(Payment.created_at))
        .order_by(func.date(Payment.created_at))
    )
    
    rows = result.all()
    result_data = [
        DailyRevenueData(
            date=str(row.date),
            revenue=float(row.revenue or 0),
            sales=row.sales
        )
        for row in rows
    ]
    
    # Cache the result for 15 minutes (900 seconds) - appropriate for revenue data
    await cache.set(cache_key, json.dumps([item.model_dump() for item in result_data]), expire=900)
    
    return result_data


async def get_top_paywalls(db: AsyncSession, owner_id: int, limit: int = 5) -> List[TopPaywall]:
    # Try to get cached data first
    cache_key = f"top_paywalls:{owner_id}:{limit}"
    cached_data = await cache.get(cache_key)
    
    if cached_data:
        data = json.loads(cached_data)
        return [TopPaywall(**item) for item in data]
    
    # Get paywalls with their conversion stats
    result = await db.execute(
        select(
            Paywall.id,
            Paywall.title,
            func.sum(Payment.amount).label('revenue'),
            func.count(Payment.id).label('conversions')
        )
        .join(Payment, Paywall.id == Payment.paywall_id, isouter=True)
        .filter(Paywall.owner_id == owner_id)
        .filter(Payment.status == "completed" if Payment.id is not None else True)
        .group_by(Paywall.id, Paywall.title)
        .order_by(func.sum(Payment.amount).desc())
        .limit(limit)
    )
    
    rows = result.all()
    top_paywalls = []
    
    for row in rows:
        conversion_rate = 0
        if row.views and row.views > 0:
            conversion_rate = (row.conversions / row.views) * 100
        
        top_paywalls.append(
            TopPaywall(
                id=str(row.id),
                title=row.title,
                revenue=float(row.revenue or 0),
                conversions=row.conversions,
                conversion_rate=round(conversion_rate, 2)
            )
        )
    
    # Cache the result for 10 minutes (600 seconds)
    await cache.set(cache_key, json.dumps([pw.model_dump() for pw in top_paywalls]), expire=600)
    
    return top_paywalls


async def get_customer_data(db: AsyncSession, owner_id: int) -> Dict[str, Any]:
    # Get total customers
    customers_result = await db.execute(
        select(func.count(Customer.id))
        .filter(Customer.owner_id == owner_id)
    )
    total_customers = customers_result.scalar() or 0
    
    # Get customer growth over time (by month)
    growth_result = await db.execute(
        select(
            extract('year', Customer.created_at).label('year'),
            extract('month', Customer.created_at).label('month'),
            func.count(Customer.id).label('count')
        )
        .filter(Customer.owner_id == owner_id)
        .group_by(
            extract('year', Customer.created_at),
            extract('month', Customer.created_at)
        )
        .order_by('year', 'month')
    )
    
    growth_data = [
        {
            "month": f"{int(row.month)}/{int(row.year)}",
            "new_customers": row.count,
            "total_customers": 0  # This would need cumulative calculation
        }
        for row in growth_result.all()
    ]
    
    return {
        "total_customers": total_customers,
        "customer_growth": growth_data
    }


async def get_revenue_summary(db: AsyncSession, owner_id: int) -> RevenueSummary:
    # Total earned (completed payments)
    total_earned_result = await db.execute(
        select(func.sum(Payment.amount))
        .filter(and_(Payment.owner_id == owner_id, Payment.status == "completed"))
    )
    total_earned = total_earned_result.scalar() or 0
    
    # Total sales (completed payments)
    total_sales_result = await db.execute(
        select(func.count(Payment.id))
        .filter(and_(Payment.owner_id == owner_id, Payment.status == "completed"))
    )
    total_sales = total_sales_result.scalar() or 0
    
    # Pending payouts (assuming this refers to payments that are not yet transferred)
    # For now, using a placeholder - in real implementation you'd have a separate status for payouts
    pending_payouts = 0  # Placeholder
    
    # Average order value
    avg_order_value = 0
    if total_sales > 0:
        avg_order_value = total_earned / total_sales
    
    return RevenueSummary(
        total_earned=total_earned,
        total_sales=total_sales,
        pending_payouts=pending_payouts,
        avg_order_value=avg_order_value
    )


async def get_paywall_performance(db: AsyncSession, owner_id: int, limit: int = 10) -> List[PaywallPerformance]:
    # Get paywall performance data
    result = await db.execute(
        select(
            Paywall.id,
            Paywall.title,
            func.sum(Payment.amount).label('total_revenue'),
            func.count(Payment.id).label('total_sales')
        )
        .join(Payment, Paywall.id == Payment.paywall_id, isouter=True)
        .filter(and_(
            Paywall.owner_id == owner_id,
            Payment.status == "completed" if Payment.id is not None else True
        ))
        .group_by(Paywall.id, Paywall.title)
        .order_by(func.sum(Payment.amount).desc())
        .limit(limit)
    )
    
    rows = result.all()
    paywall_performance = []
    
    for row in rows:
        # Calculate conversion rate for each paywall
        # This requires knowing the number of views for each paywall
        # For now, using a mock calculation based on paywall views
        conversion_rate = 0
        if row.total_sales > 0 and row.views > 0:
            conversion_rate = (row.total_sales / row.views) * 100
        elif row.total_sales > 0:
            # If we don't have view data, we can calculate a different metric
            # For now, we'll just use 0 for conversion rate
            conversion_rate = 0
        
        paywall_performance.append(
            PaywallPerformance(
                id=str(row.id),
                title=row.title,
                total_revenue=float(row.total_revenue or 0),
                total_sales=row.total_sales,
                conversion_rate=round(conversion_rate, 2)
            )
        )
    
    return paywall_performance


async def get_top_customers(db: AsyncSession, owner_id: int, limit: int = 10) -> List[TopCustomer]:
    # Get top customers by total spent
    # This requires joining payments and customers
    result = await db.execute(
        select(
            Customer.id,
            Customer.email,
            Customer.name,
            func.count(Payment.id).label('purchase_count'),
            func.sum(Payment.amount).label('total_spent')
        )
        .join(Payment, Customer.email == Payment.customer_email)
        .filter(and_(
            Payment.owner_id == owner_id,
            Payment.status == "completed"
        ))
        .group_by(Customer.id, Customer.email, Customer.name)
        .order_by(func.sum(Payment.amount).desc())
        .limit(limit)
    )
    
    rows = result.all()
    top_customers = []
    
    for row in rows:
        top_customers.append(
            TopCustomer(
                id=str(row.id),
                email=row.email,
                name=row.name,
                purchase_count=row.purchase_count,
                total_spent=float(row.total_spent or 0)
            )
        )
    
    return top_customers


async def get_content_analytics(db: AsyncSession, owner_id: int) -> Dict[str, Any]:
    from sqlalchemy import text
    
    # Get total content count
    content_count_result = await db.execute(
        select(func.count(Content.id))
        .filter(Content.owner_id == owner_id)
    )
    total_content = content_count_result.scalar() or 0
    
    # Get content count by type
    content_by_type_result = await db.execute(
        select(
            Content.type,
            func.count(Content.id)
        )
        .filter(Content.owner_id == owner_id)
        .group_by(Content.type)
    )
    content_by_type = dict(content_by_type_result.all())
    
    # For download trends, we'll need to implement access tracking
    # For now, returning empty trend data
    download_trends = []
    
    # Top performing content (by number of access records, if available)
    # Since we don't have access tracking implemented yet, we'll return empty
    # In a real implementation, we'd have an access_log table to track content views/downloads
    top_performers = []
    
    return {
        "total_content": total_content,
        "content_by_type": content_by_type,
        "download_trends": download_trends,
        "top_performers": top_performers,
        "total_downloads": 0,  # Placeholder until we have access tracking
        "popular_content": []  # Placeholder until we have access tracking
    }


async def get_popular_content(db: AsyncSession, owner_id: int, limit: int = 10) -> List[Content]:
    # This would return content ordered by access count
    # Since we don't have access tracking implemented yet, we'll return recently created content
    result = await db.execute(
        select(Content)
        .filter(Content.owner_id == owner_id)
        .order_by(Content.created_at.desc())
        .limit(limit)
    )
    
    return result.scalars().all()


async def get_content_protection_settings(db: AsyncSession, owner_id: int) -> Dict[str, Any]:
    # In a real implementation, this would fetch the user's content protection settings
    # from a dedicated settings table.
    # For now, returning default settings
    return {
        "drm": {
            "enableDrm": False,
            "drmProvider": "widevine",
            "licenseServer": "",
            "encryptionKey": ""
        },
        "watermark": {
            "enableWatermark": False,
            "watermarkType": "text",
            "watermarkText": "Confidential",
            "position": "bottom-right",
            "opacity": 50
        },
        "accessControls": {
            "ipRestrictions": False,
            "allowedIps": [],
            "geographicBlocking": False,
            "blockedCountries": [],
            "deviceLimit": False,
            "maxDevices": 3,
            "sessionTimeout": False,
            "timeoutMinutes": 60
        }
    }


async def update_content_protection_settings(db: AsyncSession, owner_id: int, protection_data: Dict[str, Any]) -> Dict[str, Any]:
    # In a real implementation, this would update the user's content protection settings
    # in a dedicated settings table.
    # For now, just returning the provided data
    return protection_data


async def get_revenue_forecast(db: AsyncSession, owner_id: int) -> RevenueForecast:
    # Implement revenue forecasting logic
    # For now, creating a mock forecast based on historical data
    from datetime import datetime, timedelta
    from decimal import Decimal
    
    # Get historical revenue data for the past 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    result = await db.execute(
        select(
            func.date(Payment.created_at).label('date'),
            func.sum(Payment.amount).label('revenue')
        )
        .filter(and_(
            Payment.owner_id == owner_id,
            Payment.status == "completed",
            Payment.created_at >= thirty_days_ago
        ))
        .group_by(func.date(Payment.created_at))
        .order_by(func.date(Payment.created_at))
    )
    
    historical_data = result.all()
    
    # Generate forecast for the next 30 days based on historical trend
    forecast_data = []
    current_date = datetime.utcnow().date()
    
    for i in range(30):
        forecast_date = current_date + timedelta(days=i+1)
        # Simple forecasting algorithm - in reality, this would use more complex algorithms
        base_revenue = sum([float(row.revenue or 0) for row in historical_data[-7:]]) / 7  # Average of last 7 days
        # Add some random fluctuation
        import random
        forecast_revenue = base_revenue * (1 + random.uniform(-0.1, 0.2))
        
        forecast_data.append({
            'date': forecast_date.isoformat(),
            'forecasted_revenue': forecast_revenue,
            'confidence_interval_low': forecast_revenue * 0.8,  # 80% of forecast
            'confidence_interval_high': forecast_revenue * 1.2  # 120% of forecast
        })
    
    # Calculate trend based on historical data
    trend = "stable"
    if len(historical_data) >= 2:
        recent_avg = sum([float(row.revenue or 0) for row in historical_data[-7:]]) / 7
        previous_avg = sum([float(row.revenue or 0) for row in historical_data[-14:-7]]) / 7
        if recent_avg > previous_avg * 1.1:
            trend = "increasing"
        elif recent_avg < previous_avg * 0.9:
            trend = "decreasing"
    
    return RevenueForecast(
        forecast=[RevenueForecastData(**item) for item in forecast_data],
        trend=trend,
        confidence=0.85  # 85% confidence level
    )