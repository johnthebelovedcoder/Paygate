from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base

class Paywall(Base):
    __tablename__ = "paywalls"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True, index=True)  # Added index
    content_ids = Column(String, nullable=True)  # Store as JSON string
    price = Column(Float, index=True)  # Added index
    currency = Column(String, default="USD", index=True)  # Added index
    duration = Column(Integer, nullable=True, index=True)  # Duration in days, added index
    status = Column(String, default="active", index=True)  # active, inactive, draft, added index
    success_redirect_url = Column(String, nullable=True)
    cancel_redirect_url = Column(String, nullable=True)
    webhook_url = Column(String, nullable=True)
    views = Column(Integer, default=0, index=True)  # Added index
    conversions = Column(Integer, default=0, index=True)  # Added index
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)  # Added index
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Added index
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User")