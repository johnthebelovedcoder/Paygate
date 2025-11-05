from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from config.database import engine
from models import Base
from routes import auth, users, paywall, content, payment, customer, analytics, upload, access, billing, notification, support, marketing, communication
from utils.middleware.advanced_rate_limit import rate_limit_middleware
from utils.middleware.security_headers import SecurityHeadersMiddleware
from utils.cache import cache
from config.cors import setup_cors
from contextlib import asynccontextmanager

# Import all models to ensure they're registered with SQLAlchemy
import models

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup on shutdown if needed

# Create FastAPI application
app = FastAPI(
    title="Paygate API", 
    version="1.0.0",
    docs_url="/docs",  # Enable Swagger UI
    redoc_url="/redoc",  # Enable ReDoc
    # Disable default CORS middleware
    openapi_url="/openapi.json",
    servers=[
        {"url": "http://localhost:8000", "description": "Local development server"},
    ],
    lifespan=lifespan
)

# Configure CORS - This must be called before adding other middleware
setup_cors(app)



# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add trusted host middleware to prevent host header attacks
app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=["paygate.com", "www.paygate.com", "localhost", "127.0.0.1", "[::1]"]
)

# Add rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Include all route modules
app.include_router(auth.router, prefix="/api", tags=["authentication"])
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(paywall.router, prefix="/api", tags=["paywalls"])
app.include_router(content.router, prefix="/api", tags=["content"])
app.include_router(payment.router, prefix="/api", tags=["payments"])
app.include_router(customer.router, prefix="/api", tags=["customers"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(access.router, prefix="/api", tags=["access"])
app.include_router(billing.router, prefix="/api", tags=["billing"])
app.include_router(notification.router, prefix="/api", tags=["notifications"])
app.include_router(support.router, prefix="/api", tags=["support"])
app.include_router(marketing.router, prefix="/api", tags=["marketing"])
app.include_router(communication.router, prefix="/api", tags=["communication"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Paygate API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Paygate API is running"}


@app.get("/api/health")
def health_check_v1():
    return {"status": "healthy", "message": "Paygate API v1 is running"}


# Create uploads directory if it doesn't exist
import os
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/avatars", exist_ok=True)

# Mount static files directory to serve uploaded avatars
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")