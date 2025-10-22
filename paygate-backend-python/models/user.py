from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from config.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)  # Added index
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True, index=True)  # Added index
    is_verified = Column(Boolean, default=False, index=True)  # Added index
    mfa_enabled = Column(Boolean, default=False, index=True)  # Added index
    mfa_secret = Column(String, nullable=True)
    role = Column(String, default="user", index=True)  # Added index
    country = Column(String, nullable=True, index=True)  # Added index
    currency = Column(String, nullable=True, index=True)  # Added index
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Added index
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True, index=True)  # Added index
    username = Column(String, nullable=True, index=True)  # Added index
    avatar = Column(String, nullable=True)
    user_type = Column(String, nullable=True, index=True)  # Added index
