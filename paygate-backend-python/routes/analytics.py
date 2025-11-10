import logging
from typing import List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from config.database import get_db
from models.user import User
from schemas.analytics import (
    DashboardStats, RevenueData, DailyRevenueData, TopPaywall,
    RevenueSummary, PaywallPerformance, TopCustomer, RevenueForecastData
)

# Define the RevenueForecast model if it doesn't exist
from pydantic import BaseModel
from typing import List
from datetime import date

class RevenueForecast(BaseModel):
    date: date
    predicted_revenue: float
    confidence_lower: float
    confidence_upper: float
from services import analytics_service
from utils.auth import get_current_user
from utils.websocket_broadcast import register_websocket_connection, unregister_websocket_connection, broadcast_to_websocket_clients
import json
import asyncio

router = APIRouter()

@router.get("/analytics/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stats = await analytics_service.get_dashboard_stats(db, current_user.id)
    return stats


@router.get("/analytics/revenue", response_model=List[DailyRevenueData])
async def get_revenue_data(
    time_range: str = "this_month",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    revenue_data = await analytics_service.get_revenue_data(db, current_user.id, time_range)
    return revenue_data


@router.get("/analytics/top-paywalls", response_model=List[TopPaywall])
async def get_top_paywalls(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    top_paywalls = await analytics_service.get_top_paywalls(db, current_user.id, limit)
    return top_paywalls


@router.get("/analytics/customers", response_model=dict)
async def get_customer_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    customer_data = await analytics_service.get_customer_data(db, current_user.id)
    return customer_data


# Creator-specific analytics endpoints
@router.get("/analytics/creator/revenue-summary", response_model=RevenueSummary)
async def get_creator_revenue_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    summary = await analytics_service.get_revenue_summary(db, current_user.id)
    return summary


@router.get("/analytics/creator/paywall-performance", response_model=List[PaywallPerformance])
async def get_creator_paywall_performance(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    performance = await analytics_service.get_paywall_performance(db, current_user.id, limit)
    return performance


@router.get("/analytics/creator/top-customers", response_model=List[TopCustomer])
async def get_creator_top_customers(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    top_customers = await analytics_service.get_top_customers(db, current_user.id, limit)
    return top_customers


@router.get("/analytics/creator/content-analytics", response_model=dict)
async def get_creator_content_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    analytics = await analytics_service.get_content_analytics(db, current_user.id)
    return analytics


@router.get("/analytics/creator/popular-content", response_model=List[dict])
async def get_creator_popular_content(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    popular_content = await analytics_service.get_popular_content(db, current_user.id, limit)
    return popular_content


@router.get("/analytics/creator/content-protection-settings", response_model=dict)
async def get_creator_content_protection_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    settings = await analytics_service.get_content_protection_settings(db, current_user.id)
    return settings


@router.put("/analytics/creator/content-protection-settings", response_model=dict)
async def update_creator_content_protection_settings(
    protection_data: dict,  # Define proper schema in real implementation
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    updated_settings = await analytics_service.update_content_protection_settings(
        db, current_user.id, protection_data
    )
    return {"status": "success", "settings": updated_settings}


@router.get("/analytics/creator/revenue-forecast", response_model=List[RevenueForecast])
async def get_creator_revenue_forecast(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    forecast = await analytics_service.get_revenue_forecast(db, current_user.id)
    return forecast


@router.get("/analytics/revenue-forecast", response_model=List[RevenueForecast])
async def get_revenue_forecast(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get revenue forecast data for the authenticated user
    This is the main endpoint serving /api/analytics/revenue-forecast requests
    """
    forecast = await analytics_service.get_revenue_forecast(db, current_user.id)
    return forecast


@router.get("/analytics/traffic-sources", response_model=List[TrafficSource])
async def get_traffic_sources(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    traffic_sources = await analytics_service.get_traffic_sources(db, current_user.id)
    return traffic_sources


@router.get("/analytics/traffic-data", response_model=List[dict])
async def get_traffic_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    traffic_data = await analytics_service.get_traffic_data(db, current_user.id)
    return traffic_data


@router.get("/analytics/performance-data", response_model=List[dict])
async def get_performance_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    performance_data = await analytics_service.get_performance_data(db, current_user.id)
    return performance_data


@router.get("/analytics/geographic-data", response_model=List[GeographicData])
async def get_geographic_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    geographic_data = await analytics_service.get_geographic_data(db, current_user.id)
    return geographic_data


@router.get("/analytics/revenue-breakdown", response_model=RevenueBreakdown)
async def get_revenue_breakdown(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    revenue_breakdown = await analytics_service.get_revenue_breakdown(db, current_user.id)
    return revenue_breakdown


@router.get("/analytics/conversion-funnel", response_model=dict)
async def get_conversion_funnel(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    conversion_funnel = await analytics_service.get_conversion_funnel(db, current_user.id)
    return conversion_funnel


@router.get("/analytics/customer-lifetime-values", response_model=List[dict])
async def get_customer_lifetime_values(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    clv_data = await analytics_service.get_customer_lifetime_values(db, current_user.id)
    return clv_data


@router.websocket("/ws/analytics")
async def websocket_analytics_endpoint(websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    await websocket.accept()
    
    # Extract token from query parameters or headers
    query_params = dict(websocket.query_params)
    token = query_params.get("token")
    
    if not token:
        # Try to extract from headers
        headers = dict(websocket.headers)
        auth_header = headers.get("authorization", headers.get("Authorization", ""))
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    # Validate the token to get current user
    current_user = None
    if token:
        try:
            from services.user_service import verify_access_token, get_user_by_email
            token_data = await verify_access_token(token, db)
            if token_data:
                # Get the full user from database
                db_user = await get_user_by_email(db, email=token_data.email)
                if db_user and db_user.is_active:
                    current_user = {
                        "email": db_user.email,
                        "id": db_user.id,
                        "role": db_user.role,
                        "is_active": db_user.is_active
                    }
        except Exception as e:
            logging.error(f"Error authenticating WebSocket: {str(e)}")
            await websocket.close(code=1008, reason="Invalid token")
            return
    
    if not current_user:
        # No valid token provided, reject the connection
        await websocket.close(code=1008, reason="Authentication required")
        return
    
    register_websocket_connection(websocket)
    logging.info(f"New WebSocket connection: {websocket.client} for user: {current_user.get('email', 'unknown')}")
    
    try:
        # Send a welcome message to confirm connection
        await websocket.send_text(json.dumps({
            "event": "connection_established",
            "message": "WebSocket connection to analytics established",
            "user_id": current_user.get('id')
        }))
        
        # Keep connection alive
        while True:
            # Wait for any message from client (with timeout)
            data = await websocket.receive()
            
            # If we receive a text message
            if data["type"] == "websocket.receive.text":
                # Process client message if needed
                message = data["text"]
                # In this case, we're not expecting client messages, so ignore
                continue
            # If we receive a disconnect message
            elif data["type"] == "websocket.disconnect":
                break
                
    except WebSocketDisconnect:
        logging.info(f"WebSocket disconnected: {websocket.client}")
    finally:
        unregister_websocket_connection(websocket)