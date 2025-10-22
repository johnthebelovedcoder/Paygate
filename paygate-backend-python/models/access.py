from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base

class ContentAccess(Base):
    __tablename__ = "content_access"

    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content.id"), index=True)  # Added index
    user_id = Column(Integer, ForeignKey("users.id"), index=True)  # Added index
    granted_by = Column(String, index=True)  # Could be 'payment', 'subscription', 'admin', etc., added index
    granted_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Added index
    expires_at = Column(DateTime(timezone=True), nullable=True, index=True)  # Added index
    is_active = Column(Boolean, default=True, index=True)  # Added index

    content = relationship("Content")
    user = relationship("User")