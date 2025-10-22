from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base

class SupportCategory(Base):
    __tablename__ = "support_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # e.g. "Billing", "Technical", "General"
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    category_id = Column(Integer, ForeignKey("support_categories.id"), index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="medium", index=True)  # low, medium, high, urgent
    status = Column(String, default="open", index=True)  # open, in_progress, resolved, closed
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # Support agent
    resolution = Column(Text, nullable=True)  # Resolution notes
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id])
    category = relationship("SupportCategory")
    assigned_user = relationship("User", foreign_keys=[assigned_to])


class SupportTicketResponse(Base):
    __tablename__ = "support_ticket_responses"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)  # Either customer or agent
    message = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)  # Internal notes vs customer-facing
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    ticket = relationship("SupportTicket")
    user = relationship("User")