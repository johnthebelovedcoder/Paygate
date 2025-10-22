from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from config.database import engine
from models import Base
from routes import auth, users, paywall, content, payment, customer, analytics, upload, access, billing, notification, support, marketing
from utils.middleware.advanced_rate_limit import rate_limit_middleware
from utils.middleware.security_headers import SecurityHeadersMiddleware
from utils.cache import cache

# Import all models to ensure they're registered with SQLAlchemy
import models

app = FastAPI(
    title="Paygate API", 
    version="1.0.0",
    docs_url="/docs",  # Enable Swagger UI
    redoc_url="/redoc"  # Enable ReDoc
)

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        # Create all tables defined in models
        await conn.run_sync(Base.metadata.create_all)
    await cache.init_cache()
    
    # Log that startup is complete
    print("Database tables created successfully")

# CORS middleware - specify origins for security
# In production, update these to match your actual frontend domains
frontend_origins = [
    "http://localhost:3000",    # React default
    "http://localhost:5173",    # Vite default
    "http://localhost:8080",    # Vue dev server
    "https://localhost:3000",
    "https://localhost:5173",
    "https://paygate.com",      # Production domain (example)
    "https://www.paygate.com",  # Production domain (example)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

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

@app.get("/")
def read_root():
    return {"message": "Welcome to the Paygate API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Paygate API is running"}


@app.get("/api/health")
def health_check_v1():
    return {"status": "healthy", "message": "Paygate API v1 is running"}