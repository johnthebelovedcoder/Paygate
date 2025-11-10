from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Index, CheckConstraint, UniqueConstraint
from sqlalchemy.sql import func
from config.database import Base
from .encrypted_field import EncryptedString

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)  # Added NOT NULL and proper length
    username = Column(String(50), nullable=True, unique=True, index=True)  # Added unique constraint and proper length
    full_name = Column(String(100), nullable=True, index=True)  # Changed from 'name' to 'full_name', proper length
    hashed_password = Column(String(255), nullable=False)  # Added NOT NULL and proper length for bcrypt
    is_active = Column(Boolean, default=True, nullable=False, index=True)  # Added index
    is_verified = Column(Boolean, default=False, nullable=False, index=True)  # Added index
    role = Column(String(50), default="user", nullable=False, index=True)  # Changed default from "admin" to "user", proper length
    avatar_url = Column(Text, nullable=True)  # Changed from 'avatar' to 'avatar_url'
    bio = Column(Text, nullable=True)  # Proper length for bio
    phone = Column(EncryptedString(255), nullable=True)  # Encrypt phone numbers
    company = Column(String(100), nullable=True, index=True)  # Added proper length and index
    job_title = Column(String(100), nullable=True, index=True)  # Added proper length and index
    country = Column(String(100), nullable=True, index=True)  # Added country field
    currency = Column(String(10), nullable=True, index=True)  # Added currency field
    user_type = Column(String(50), nullable=True, index=True)  # Added user_type field
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)  # Added index
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)  # Added index

    # Relationships
    ab_tests = relationship("ABTest", back_populates="owner", cascade="all, delete-orphan")
    ab_test_variants = relationship("ABTestVariant", back_populates="test")

    # Compound indexes for common queries
    __table_args__ = (
        Index('idx_user_email_active', 'email', 'is_active'),  # For auth queries
        Index('idx_user_created_at', 'created_at'),  # For time-based queries
        Index('idx_user_role_active', 'role', 'is_active'),  # For role-based queries
        # Add check constraints
        CheckConstraint("LENGTH(email) > 0", name="user_email_length_check"),
        CheckConstraint("LENGTH(full_name) <= 100", name="user_full_name_length_check"),
        CheckConstraint("role IN ('admin', 'moderator', 'user', 'guest')", name="user_role_check"),
        CheckConstraint("LENGTH(phone) <= 20", name="user_phone_length_check"),
    )
