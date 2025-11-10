from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from config.database import engine
from models import Base
from routes import auth, users, paywall, content, payment, customer, analytics, upload, access, billing, notification, support, marketing, communication, supabase, backup, monitoring
from utils.middleware.advanced_rate_limit import rate_limit_middleware
from utils.middleware.security_headers import SecurityHeadersMiddleware
from utils.cache import cache
from config.cors import setup_cors
from contextlib import asynccontextmanager
from utils.logging_config import setup_logging
from utils.exceptions import handle_error
import logging

# Import new modules
from utils.api_versioning import APIVersionMiddleware, validate_api_version
from utils.enhanced_logging import setup_logging as setup_enhanced_logging, log_api_request, log_api_response, log_error
import time

# Import all models to ensure they're registered with SQLAlchemy
import models
from services.backup_scheduler import backup_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start backup scheduler
    backup_scheduler.start()
    
    yield
    
    # Cleanup on shutdown
    backup_scheduler.stop()

# Create FastAPI application
app = FastAPI(
    title="PayGate API",
    description="PayGate Backend API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/openapi.json",
    servers=[
        {"url": "http://localhost:8000", "description": "Local development server"},
    ],
    lifespan=lifespan
)

# Configure CORS - This must be called before adding other middleware
setup_cors(app)

# Add API versioning middleware
app.add_middleware(APIVersionMiddleware)

# Add security headers
app.add_middleware(SecurityHeadersMiddleware)

# Add trusted host middleware to prevent host header attacks
app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=["paygate.com", "www.paygate.com", "localhost", "127.0.0.1", "[::1]"]
)

# Add rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    from fastapi.responses import JSONResponse
    from fastapi.exceptions import RequestValidationError
    from starlette.exceptions import HTTPException as StarletteHTTPException
    
    # Handle different types of exceptions
    if isinstance(exc, StarletteHTTPException):
        # This is already a HTTP exception, just log it
        logging.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "error_code": getattr(exc, 'error_code', 'HTTP_ERROR')}
        )
    elif isinstance(exc, RequestValidationError):
        # Validation error from FastAPI
        logging.error(f"Validation Error: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": "Validation error",
                "errors": exc.errors(),
                "error_code": "VALIDATION_ERROR"
            }
        )
    else:
        # General error handler
        handled_error = handle_error(exc, f"Unhandled error in request: {request.method} {request.url}")
        
        return JSONResponse(
            status_code=getattr(handled_error, 'status_code', 500),
            content={
                "detail": getattr(handled_error, 'detail', str(exc)),
                "error_code": getattr(handled_error, 'error_code', 'INTERNAL_ERROR')
            }
        )


# Add request/response logging middleware
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Log the incoming request
    log_api_request(request, extra={
        'method': request.method,
        'path': request.url.path,
        'client': request.client.host if request.client else "unknown"
    })
    
    try:
        response = await call_next(request)
    except Exception as e:
        # Log the error and re-raise
        log_error(request, e)
        raise
    finally:
        # Log the response
        execution_time = time.time() - start_time
        log_api_response(request, response, execution_time)
    
    return response

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
app.include_router(supabase.router, prefix="/api", tags=["supabase"])
app.include_router(backup.router, prefix="/api", tags=["backup"])
app.include_router(monitoring.router, prefix="/api", tags=["monitoring"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Paygate API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Paygate API is running", "version": "1.0.0"}


@app.get("/api/health")
def health_check_v1():
    return {"status": "healthy", "message": "Paygate API v1 is running", "version": "1.0.0"}


@app.get("/api/health/database")
async def database_health():
    """Check database connectivity"""
    try:
        async with engine.connect() as conn:
            # Execute a simple query to test connection
            await conn.execute("SELECT 1")
        return {"status": "healthy", "message": "Database connection is healthy"}
    except Exception as e:
        return {"status": "unhealthy", "message": f"Database connection failed: {str(e)}"}


@app.get("/api/health/supabase")
async def supabase_health():
    """Check Supabase connectivity"""
    from supabase_client import supabase
    if supabase is None:
        return {"status": "unconfigured", "message": "Supabase is not configured"}
    
    try:
        # Test the Supabase client by calling a basic function
        result = await supabase.rpc('version').execute()
        return {"status": "healthy", "message": "Supabase connection is healthy"}
    except Exception as e:
        return {"status": "unhealthy", "message": f"Supabase connection failed: {str(e)}"}


@app.get("/api/health/full")
async def full_health_check():
    """Comprehensive health check including all services"""
    import time
    start_time = time.time()
    
    # Check database
    db_status = "unknown"
    db_message = "Not checked"
    try:
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        db_status = "healthy"
        db_message = "Database connection is healthy"
    except Exception as e:
        db_status = "unhealthy"
        db_message = f"Database connection failed: {str(e)}"
    
    # Check Supabase
    from supabase_client import supabase
    supabase_status = "unknown"
    supabase_message = "Not checked"
    if supabase is None:
        supabase_status = "unconfigured"
        supabase_message = "Supabase is not configured"
    else:
        try:
            await supabase.rpc('version').execute()
            supabase_status = "healthy"
            supabase_message = "Supabase connection is healthy"
        except Exception as e:
            supabase_status = "unhealthy"
            supabase_message = f"Supabase connection failed: {str(e)}"
    
    response_time = round((time.time() - start_time) * 1000, 2)  # in milliseconds
    
    return {
        "status": "healthy" if db_status == "healthy" and supabase_status in ["healthy", "unconfigured"] else "unhealthy",
        "message": "Full system health check completed",
        "checks": {
            "database": {"status": db_status, "message": db_message},
            "supabase": {"status": supabase_status, "message": supabase_message}
        },
        "response_time_ms": response_time,
        "timestamp": time.time()
    }


# Create uploads directory if it doesn't exist
import os
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/avatars", exist_ok=True)

# Mount static files directory to serve uploaded avatars
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")