import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from main import app
from config.database import get_db
from models import Base

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

@pytest.fixture
def client():
    """
    Create a test client for the FastAPI app
    """
    with TestClient(app) as test_client:
        yield test_client