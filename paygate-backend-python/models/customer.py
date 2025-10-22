from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    total_spent = Column(Float, default=0, index=True)  # Added index
    total_purchases = Column(Integer, default=0, index=True)  # Added index
    last_purchase = Column(DateTime, nullable=True, index=True)  # Added index
    join_date = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Added index
    status = Column(String, default="active", index=True)  # active, inactive, added index
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)  # Added index
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Added index
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User")