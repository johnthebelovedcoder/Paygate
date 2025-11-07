from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from config.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)  # Added index
    username = Column(String, nullable=True, index=True)  # Added index
    full_name = Column(String, nullable=True, index=True)  # Changed from 'name' to 'full_name'
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True, index=True)  # Added index
    is_verified = Column(Boolean, default=False, index=True)  # Added index
    role = Column(String, default="user", index=True)  # Changed default from "admin" to "user"
    avatar_url = Column(Text, nullable=True)  # Changed from 'avatar' to 'avatar_url'
    bio = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    company = Column(String, nullable=True)
    job_title = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Added index
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
