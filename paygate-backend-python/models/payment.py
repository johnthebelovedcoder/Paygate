from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, Text, DateTime, JSON, Index, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False, index=True)  # Added NOT NULL and index
    currency = Column(String(3), default="NGN", nullable=False, index=True)  # Added proper length and NOT NULL
    status = Column(String(20), default="pending", nullable=False, index=True)  # pending, completed, failed, refunded, added proper length and NOT NULL
    paywall_id = Column(Integer, ForeignKey("paywalls.id"), nullable=True, index=True)  # Added index
    customer_email = Column(String(255), nullable=False, index=True)  # Added proper length and NOT NULL
    customer_name = Column(String(100), nullable=True, index=True)  # Added proper length
    reference = Column(String(100), unique=True, nullable=False, index=True)  # Added proper length, NOT NULL and unique
    payment_method = Column(String(50), nullable=True, index=True)  # Added proper length
    channel = Column(String(50), nullable=True, index=True)  # Added proper length
    gateway_response = Column(JSON, nullable=True)  # Store gateway response as JSON
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # Added index
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)  # Added NOT NULL and index
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)  # Added index

    paywall = relationship("Paywall")
    owner = relationship("User")

    # Compound indexes for common queries
    __table_args__ = (
        Index('idx_payment_status_created', 'status', 'created_at'),  # For status and time queries
        Index('idx_payment_owner_status', 'owner_id', 'status'),  # For user payment queries
        Index('idx_payment_customer_status', 'customer_email', 'status'),  # For customer payment queries
        Index('idx_payment_amount_currency', 'amount', 'currency'),  # For amount/currency queries
        # Check constraints
        CheckConstraint("amount >= 0.01", name="payment_amount_positive_check"),
        CheckConstraint("LENGTH(currency) = 3", name="payment_currency_length_check"),
        CheckConstraint("status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')", name="payment_status_check"),
        CheckConstraint("LENGTH(reference) >= 1", name="payment_reference_length_check"),
    )