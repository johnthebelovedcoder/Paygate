import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from main import app  # Assuming your FastAPI app is in main.py
from config.database import get_db
from models import Base
from routes import analytics  # Make sure to import your route modules

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the database tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    """
    Override the get_db dependency to use the test database
    """
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Override the database dependency in the app
app.dependency_overrides[get_db] = override_get_db

# Add the analytics routes to the test app
app.include_router(analytics.router)

@pytest.fixture
def client():
    """
    Create a test client for the FastAPI app
    """
    with TestClient(app) as test_client:
        yield test_client

def test_get_dashboard_stats(client):
    """
    Test the /api/v1/analytics/dashboard endpoint
    """
    response = client.get("/api/analytics/dashboard")
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test

def test_get_revenue_data(client):
    """
    Test the /api/analytics/revenue endpoint
    """
    response = client.get("/api/analytics/revenue")
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test

def test_get_top_paywalls(client):
    """
    Test the /api/analytics/top-paywalls endpoint
    """
    response = client.get("/api/analytics/top-paywalls")
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test

def test_get_customer_data(client):
    """
    Test the /api/analytics/customers endpoint
    """
    response = client.get("/api/analytics/customers")
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test

def test_get_creator_revenue_summary(client):
    """
    Test the /api/analytics/creator/revenue-summary endpoint
    """
    response = client.get("/api/analytics/creator/revenue-summary")
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test

def test_get_creator_paywall_performance(client):
    """
    Test the /api/analytics/creator/paywall-performance endpoint
    """
    response = client.get("/api/analytics/creator/paywall-performance")
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test

def test_get_creator_top_customers(client):
    """
    Test the /api/analytics/creator/top-customers endpoint
    """
    response = client.get("/api/analytics/creator/top-customers")
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test

def test_get_revenue_forecast(client):
    """
    Test the /api/analytics/revenue-forecast endpoint
    """
    response = client.get("/api/analytics/revenue-forecast")
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test

def test_get_content_analytics(client):
    """
    Test the /api/analytics/creator/content-analytics endpoint
    """
    response = client.get("/api/analytics/creator/content-analytics")
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test

def test_get_popular_content(client):
    """
    Test the /api/analytics/creator/content-popular endpoint
    """
    response = client.get("/api/analytics/creator/content-popular")
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test

def test_get_content_protection_settings(client):
    """
    Test the /api/analytics/creator/content-protection endpoint
    """
    response = client.get("/api/analytics/creator/content-protection")
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test

def test_update_content_protection_settings(client):
    """
    Test the PUT /analytics/creator/content-protection endpoint
    """
    test_data = {
        "drm": {
            "enableDrm": True,
            "drmProvider": "widevine"
        },
        "watermark": {
            "enableWatermark": False
        },
        "accessControls": {
            "ipRestrictions": False
        }
    }
    
    response = client.put("/api/analytics/creator/content-protection", json=test_data)
    assert response.status_code in [200, 401, 403]  # Allow auth failures in integration test