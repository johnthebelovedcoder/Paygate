from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, extract, text, case, literal_column
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from models.customer import Customer
from models import Payment, Paywall, User, Customer, Content, ContentAccess as AccessGrant
from schemas.analytics import (
    DashboardStats, RevenueData, DailyRevenueData, TopPaywall,
    RevenueSummary, PaywallPerformance, TopCustomer, RevenueForecast, RevenueForecastData
)
from decimal import Decimal
from utils.cache import cache
from utils.websocket_broadcast import broadcast_analytics_event
import json
import logging
import asyncio

# Configure logging
logger = logging.getLogger(__name__)

# Cache TTLs (in seconds)
CACHE_TTL = {
    'dashboard_stats': 300,  # 5 minutes
    'revenue_data': 300,
    'top_paywalls': 600,    # 10 minutes
    'customer_data': 600,
}

# Helper function for cache key generation
def get_cache_key(prefix: str, **kwargs) -> str:
    """Generate a consistent cache key from prefix and key-value pairs"""
    key_parts = [f"{k}:{v}" for k, v in sorted(kwargs.items())]
    return f"{prefix}:{":".join(key_parts)}"


async def get_dashboard_stats(db: AsyncSession, owner_id: int) -> DashboardStats:
    """Get dashboard statistics with optimized queries and caching"""
    cache_key = get_cache_key("dashboard:stats", owner_id=owner_id)
    
    # Try to get from cache first
    try:
        cached_data = await cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache hit for {cache_key}")
            return DashboardStats.model_validate_json(cached_data)
    except Exception as e:
        logger.warning(f"Cache get failed: {str(e)}")
    
    logger.debug(f"Cache miss for {cache_key}, querying database...")
    
    try:
        # Wrap the operation with a timeout to prevent hanging
        async def fetch_dashboard_data():
            from sqlalchemy import func, and_
            
            # Get total revenue and sales
            payment_query = await db.execute(
                select(
                    func.coalesce(func.sum(Payment.amount), 0).label('total_revenue'),
                    func.count(Payment.id).label('total_sales')
                )
                .filter(and_(Payment.owner_id == owner_id, Payment.status == "completed"))
            )
            payment_result = payment_query.first()
            total_revenue = float(payment_result[0]) if payment_result[0] else 0
            total_sales = payment_result[1] if payment_result[1] else 0

            # Get recent payments (last 7 days)
            from datetime import datetime, timedelta
            start_date = datetime.utcnow() - timedelta(days=7)
            recent_payments_query = await db.execute(
                select(func.count(Payment.id))
                .filter(and_(
                    Payment.owner_id == owner_id,
                    Payment.status == "completed",
                    Payment.created_at >= start_date
                ))
            )
            recent_payments = recent_payments_query.scalar() or 0

            # Get active paywalls
            active_paywalls_query = await db.execute(
                select(func.count(Paywall.id))
                .filter(and_(Paywall.owner_id == owner_id, Paywall.status == "active"))
            )
            active_paywalls = active_paywalls_query.scalar() or 0

            # Get total customers
            total_customers_query = await db.execute(
                select(func.count(func.distinct(Customer.email)))
                .filter(Customer.owner_id == owner_id)
            )
            total_customers = total_customers_query.scalar() or 0

            # Calculate average order value
            avg_order_value = 0
            if total_sales > 0:
                avg_order_value = total_revenue / total_sales

            # Create the response
            stats = DashboardStats(
                total_revenue=total_revenue,
                total_sales=total_sales,
                total_visitors=0,  # Would need page view tracking
                conversion_rate=0,  # Placeholder - needs view data
                avg_order_value=avg_order_value,
                active_paywalls=active_paywalls,
                recent_payments=recent_payments,
                total_customers=total_customers
            )
            
            return stats
        
        # Execute the function with a timeout
        stats = await asyncio.wait_for(fetch_dashboard_data(), timeout=10.0)  # 10 second timeout
        
        # Cache the result
        try:
            await asyncio.wait_for(
                cache.set(
                    cache_key, 
                    stats.model_dump_json(), 
                    expire=CACHE_TTL['dashboard_stats']
                ), 
                timeout=2.0  # 2 second timeout for cache operations
            )
        except (asyncio.TimeoutError, Exception) as e:
            logger.error(f"Failed to cache dashboard stats: {str(e)}")
        
        return stats
        
    except asyncio.TimeoutError:
        logger.error(f"Timeout occurred while fetching dashboard stats for owner_id: {owner_id}")
        # Return cached data if available, even if stale
        try:
            stale_data = await cache.get(cache_key, ignore_expire=True)
            if stale_data:
                logger.warning("Returning stale data from cache due to timeout")
                return DashboardStats.model_validate_json(stale_data)
        except:
            pass
        
        # Return empty stats if no cache available
        return DashboardStats(
            total_revenue=0,
            total_sales=0,
            total_visitors=0,
            conversion_rate=0,
            avg_order_value=0,
            active_paywalls=0,
            recent_payments=0,
            total_customers=0
        )
    except Exception as e:
        logger.error(f"Error in get_dashboard_stats: {str(e)}")
        # Return cached data if available, even if stale
        try:
            stale_data = await cache.get(cache_key, ignore_expire=True)
            if stale_data:
                logger.warning("Returning stale data from cache")
                return DashboardStats.model_validate_json(stale_data)
        except:
            pass
            
        # If no cache, return empty stats
        return DashboardStats(
            total_revenue=0,
            total_sales=0,
            total_visitors=0,
            conversion_rate=0,
            avg_order_value=0,
            active_paywalls=0,
            recent_payments=0,
            total_customers=0
        )


async def get_revenue_data(db: AsyncSession, owner_id: int, time_range: str = "this_month") -> List[DailyRevenueData]:
    """Get revenue data with optimized query and caching"""
    cache_key = get_cache_key("revenue:data", owner_id=owner_id, time_range=time_range)
    
    # Try to get from cache first
    try:
        cached_data = await cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache hit for {cache_key}")
            return [DailyRevenueData.model_validate(item) for item in json.loads(cached_data)]
    except Exception as e:
        logger.warning(f"Cache get failed: {str(e)}")
    
    logger.debug(f"Cache miss for {cache_key}, querying database...")
    
    try:
        # Calculate date ranges
        now = datetime.utcnow()
        start_date, end_date = _get_date_range(time_range, now)
        
        # Build the query based on time range for SQLite
        if time_range == 'this_year' or time_range == 'last_year':
            # Group by month for yearly view
            date_part = "strftime('%Y-%m', created_at)"
        else:
            # Group by day for monthly/weekly view
            date_part = "strftime('%Y-%m-%d', created_at)"
        
        # Wrap the operation with a timeout to prevent hanging
        async def fetch_revenue_data():
            from sqlalchemy import func, and_
            from datetime import datetime, timedelta

            # Format the date based on the required grouping
            if time_range in ['this_year', 'last_year']:
                # Group by month for yearly view (format: YYYY-MM)
                from sqlalchemy import case
                # For SQLite, directly using strftime
                revenue_query = text(f"""
                    SELECT 
                        strftime('%Y-%m', created_at) as date_label,
                        COALESCE(SUM(amount), 0) as revenue,
                        COUNT(id) as sales_count
                    FROM payments 
                    WHERE owner_id = :owner_id
                        AND status = 'completed'
                        AND created_at >= :start_date
                        AND created_at <= :end_date
                    GROUP BY strftime('%Y-%m', created_at)
                    ORDER BY strftime('%Y-%m', created_at)
                """)
            else:
                # Group by day for monthly/weekly view (format: YYYY-MM-DD)
                revenue_query = text(f"""
                    SELECT 
                        strftime('%Y-%m-%d', created_at) as date_label,
                        COALESCE(SUM(amount), 0) as revenue,
                        COUNT(id) as sales_count
                    FROM payments 
                    WHERE owner_id = :owner_id
                        AND status = 'completed'
                        AND created_at >= :start_date
                        AND created_at <= :end_date
                    GROUP BY strftime('%Y-%m-%d', created_at)
                    ORDER BY strftime('%Y-%m-%d', created_at)
                """)
            
            # Execute the query
            result = await db.execute(
                revenue_query,
                {
                    'owner_id': owner_id,
                    'start_date': start_date,
                    'end_date': end_date
                }
            )
            
            # Process results
            revenue_data = []
            for row in result:
                revenue_data.append(DailyRevenueData(
                    date=row[0],
                    revenue=float(row[1]) if row[1] else 0,
                    sales_count=row[2] if row[2] else 0
                ))
            
            return revenue_data
        
        # Execute the function with a timeout
        revenue_data = await asyncio.wait_for(fetch_revenue_data(), timeout=10.0)  # 10 second timeout
        
        # Cache the result
        try:
            await asyncio.wait_for(
                cache.set(
                    cache_key, 
                    json.dumps([item.model_dump() for item in revenue_data]),
                    expire=CACHE_TTL['revenue_data']
                ), 
                timeout=2.0  # 2 second timeout for cache operations
            )
        except (asyncio.TimeoutError, Exception) as e:
            logger.error(f"Failed to cache revenue data: {str(e)}")
        
        return revenue_data
        
    except asyncio.TimeoutError:
        logger.error(f"Timeout occurred while fetching revenue data for owner_id: {owner_id}, time_range: {time_range}")
        # Return cached data if available, even if stale
        try:
            stale_data = await cache.get(cache_key, ignore_expire=True)
            if stale_data:
                logger.warning("Returning stale data from cache due to timeout")
                return [DailyRevenueData.model_validate(item) for item in json.loads(stale_data)]
        except:
            pass
        
        # Return empty array if no cache available
        return []
    except Exception as e:
        logger.error(f"Error in get_revenue_data: {str(e)}")
        # Return empty array on error
        return []

def _get_date_range(time_range: str, now: datetime) -> Tuple[datetime, datetime]:
    """Helper to get date range based on time range string"""
    if time_range == 'this_week':
        start_date = now - timedelta(days=now.weekday() + 1)  # Start of current week
        end_date = now
    elif time_range == 'last_week':
        start_date = now - timedelta(days=now.weekday() + 8)  # Start of last week
        end_date = start_date + timedelta(days=6)  # End of last week
    elif time_range == 'this_month':
        start_date = now.replace(day=1)  # First day of current month
        end_date = now
    elif time_range == 'last_month':
        first_day_current_month = now.replace(day=1)
        end_date = first_day_current_month - timedelta(days=1)  # Last day of last month
        start_date = end_date.replace(day=1)  # First day of last month
    elif time_range == 'this_year':
        start_date = now.replace(month=1, day=1)  # First day of current year
        end_date = now
    elif time_range == 'last_year':
        start_date = now.replace(year=now.year-1, month=1, day=1)  # First day of last year
        end_date = start_date.replace(month=12, day=31)  # Last day of last year
    elif time_range == 'this_week':
        start_date = now - timedelta(days=7)
        end_date = now
    else:  # Default to this month
        start_date = now.replace(day=1)
        end_date = now
        
    return start_date, end_date


async def get_top_paywalls(db: AsyncSession, owner_id: int, limit: int = 5) -> List[TopPaywall]:
    """Get top performing paywalls with optimized query and caching"""
    cache_key = get_cache_key("top:paywalls", owner_id=owner_id, limit=limit)
    
    # Try to get from cache first
    try:
        cached_data = await cache.get(cache_key)
        if cached_data:
            logger.debug(f"Cache hit for {cache_key}")
            return [TopPaywall.model_validate(item) for item in json.loads(cached_data)]
    except Exception as e:
        logger.warning(f"Cache get failed: {str(e)}")
    
    logger.debug(f"Cache miss for {cache_key}, querying database...")
    
    try:
        # Wrap the operation with a timeout to prevent hanging
        async def fetch_top_paywalls():
            # Simplified query using direct joins to avoid complex CTEs that may not work well with SQLite
            # First get the paywall data
            result = await db.execute(
                text("""
                    SELECT 
                        p.id,
                        p.title,
                        p.description,
                        p.created_at,
                        COALESCE(SUM(pm.amount), 0) as total_revenue,
                        COALESCE(COUNT(pm.id), 0) as total_sales,
                        COALESCE(COUNT(DISTINCT pm.customer_email), 0) as unique_customers,
                        COALESCE(AVG(pm.amount), 0) as avg_sale_amount
                    FROM paywalls p
                    LEFT JOIN payments pm ON p.id = pm.paywall_id AND pm.status = 'completed'
                    WHERE p.owner_id = :owner_id
                    GROUP BY p.id, p.title, p.description, p.created_at
                    ORDER BY total_revenue DESC, total_sales DESC
                    LIMIT :limit
                """),
                {'owner_id': owner_id, 'limit': limit}
            )
            
            # Process results
            paywalls = []
            for row in result:
                paywalls.append(TopPaywall(
                    id=str(row[0]) if row[0] else "",  # Convert to string for consistency
                    name=row[1] if row[1] else "Unknown Paywall",
                    description=row[2] if row[2] else "",
                    total_revenue=float(row[4]) if row[4] else 0,
                    total_sales=row[5] if row[5] else 0,
                    unique_customers=row[6] if row[6] else 0,
                    avg_sale_amount=float(row[7]) if row[7] else 0,
                    created_at=row[3] if row[3] else datetime.utcnow()
                ))
            
            return paywalls
        
        # Execute the function with a timeout
        paywalls = await asyncio.wait_for(fetch_top_paywalls(), timeout=10.0)  # 10 second timeout
        
        # Cache the result
        try:
            await asyncio.wait_for(
                cache.set(
                    cache_key, 
                    json.dumps([p.model_dump() for p in paywalls]),
                    expire=CACHE_TTL['top_paywalls']
                ), 
                timeout=2.0  # 2 second timeout for cache operations
            )
        except (asyncio.TimeoutError, Exception) as e:
            logger.error(f"Failed to cache top paywalls: {str(e)}")
        
        return paywalls
        
    except asyncio.TimeoutError:
        logger.error(f"Timeout occurred while fetching top paywalls for owner_id: {owner_id}, limit: {limit}")
        # Return cached data if available, even if stale
        try:
            stale_data = await cache.get(cache_key, ignore_expire=True)
            if stale_data:
                logger.warning("Returning stale data from cache due to timeout")
                return [TopPaywall.model_validate(item) for item in json.loads(stale_data)]
        except:
            pass
        
        # Return empty array if no cache available
        return []
    except Exception as e:
        logger.error(f"Error in get_top_paywalls: {str(e)}")
        # Return empty array on error
        return []


async def get_customer_data(db: AsyncSession, owner_id: int) -> Dict[str, Any]:
    try:
        # Get total customers
        customers_result = await db.execute(
            select(func.count(Customer.id))
            .filter(Customer.owner_id == owner_id)
        )
        total_customers = customers_result.scalar() or 0
        
        # Wrap the operation with a timeout to prevent hanging
        async def fetch_customer_data():
            # For SQLite compatibility, use strftime to extract year-month
            growth_result = await db.execute(
                text("""
                    SELECT 
                        strftime('%Y-%m', created_at) as month_year,
                        COUNT(id) as count
                    FROM customers
                    WHERE owner_id = :owner_id
                    GROUP BY strftime('%Y-%m', created_at)
                    ORDER BY strftime('%Y-%m', created_at)
                """),
                {'owner_id': owner_id}
            )
            
            growth_data = []
            for row in growth_result:
                growth_data.append({
                    "month": row[0],  # Month in YYYY-MM format
                    "new_customers": row[1],  # Count of customers for this month
                    "total_customers": 0  # This would need cumulative calculation
                })
            
            return {
                "total_customers": total_customers,
                "customer_growth": growth_data
            }
        
        # Execute the function with a timeout
        customer_data = await asyncio.wait_for(fetch_customer_data(), timeout=10.0)  # 10 second timeout
        
        return customer_data
        
    except asyncio.TimeoutError:
        logger.error(f"Timeout occurred while fetching customer data for owner_id: {owner_id}")
        # Return cached data if available, even if stale
        try:
            cache_key = get_cache_key("customer:data", owner_id=owner_id)
            stale_data = await cache.get(cache_key, ignore_expire=True)
            if stale_data:
                logger.warning("Returning stale data from cache due to timeout")
                return json.loads(stale_data)
        except:
            pass
        
        # Return empty data structure if no cache available
        return {
            "total_customers": 0,
            "customer_growth": []
        }
    except Exception as e:
        logger.error(f"Error in get_customer_data: {str(e)}")
        # Return empty data structure on error to prevent frontend issues
        return {
            "total_customers": 0,
            "customer_growth": []
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


async def trigger_realtime_analytics_update(event_type: str, data: Dict[str, Any], owner_id: int = None):
    """
    Trigger a real-time analytics update that will be broadcast to connected WebSocket clients
    """
    try:
        # Prepare the analytics event message
        analytics_event = {
            "event_type": event_type,
            "data": data,
            "owner_id": owner_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Broadcast to all connected WebSocket clients
        await broadcast_analytics_event(event_type, analytics_event)
        logger.info(f"Broadcast analytics event: {event_type}")
    except Exception as e:
        logger.error(f"Error broadcasting analytics event: {str(e)}")