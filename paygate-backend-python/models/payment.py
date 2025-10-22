from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, Text, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, index=True)  # Added index
    currency = Column(String, default="NGN", index=True)  # Added index
    status = Column(String, default="pending", index=True)  # pending, completed, failed, refunded, added index
    paywall_id = Column(Integer, ForeignKey("paywalls.id"), nullable=True, index=True)  # Added index
    customer_email = Column(String, index=True)  # Added index
    customer_name = Column(String, nullable=True, index=True)  # Added index
    reference = Column(String, unique=True, index=True)  # Added index
    payment_method = Column(String, nullable=True, index=True)  # Added index
    channel = Column(String, nullable=True, index=True)  # Added index
    gateway_response = Column(JSON, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)  # Added index
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Added index
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    paywall = relationship("Paywall")
    owner = relationship("User")