from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings
import os
from typing import List, Optional, Union
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./paygate.db")
    
    # Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Email
    EMAIL_HOST: Optional[str] = os.getenv("EMAIL_HOST")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "587"))
    EMAIL_USERNAME: Optional[str] = os.getenv("EMAIL_USERNAME")
    EMAIL_PASSWORD: Optional[str] = os.getenv("EMAIL_PASSWORD")
    EMAIL_SENDER: str = os.getenv("EMAIL_SENDER", "noreply@paygate.com")
    EMAIL_USE_TLS: bool = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Paystack
    PAYSTACK_SECRET_KEY: Optional[str] = os.getenv("PAYSTACK_SECRET_KEY")
    PAYSTACK_PUBLIC_KEY: Optional[str] = os.getenv("PAYSTACK_PUBLIC_KEY")
    
    # Supabase configuration
    NEXT_PUBLIC_SUPABASE_URL: Optional[str] = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Optional[str] = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    # CORS - Handle both string (comma-separated) and list formats
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,http://localhost:5173,http://127.0.0.1:5173"
    
    # Frontend URLs
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    RESET_PASSWORD_URL: str = os.getenv("RESET_PASSWORD_URL", f"{FRONTEND_URL}/reset-password")
    VERIFY_EMAIL_URL: str = os.getenv("VERIFY_EMAIL_URL", f"{FRONTEND_URL}/verify-email")
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields that are not defined in the model
    
    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(',')]
        return self.CORS_ORIGINS
    
    @property
    def is_supabase_configured(self) -> bool:
        """Check if Supabase is properly configured"""
        return bool(self.NEXT_PUBLIC_SUPABASE_URL and 
                   (self.NEXT_PUBLIC_SUPABASE_ANON_KEY or self.SUPABASE_SERVICE_ROLE_KEY))

# Create settings instance
@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()