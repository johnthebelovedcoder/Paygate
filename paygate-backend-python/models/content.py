from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, Text, DateTime, func, Index, CheckConstraint
from sqlalchemy.orm import relationship
from config.database import Base

class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)  # Added proper length and NOT NULL
    description = Column(Text, nullable=True, index=True)  # Added index
    type = Column(String(50), nullable=False, index=True)  # Added proper length and NOT NULL
    url = Column(String(500), nullable=True, index=True)  # Added proper length
    file_path = Column(String(500), nullable=True, index=True)  # Added proper length
    is_protected = Column(Boolean, default=False, nullable=False, index=True)  # Added index
    price = Column(Float, nullable=True, index=True)  # Added index
    currency = Column(String(3), default="USD", nullable=False, index=True)  # Added proper length and NOT NULL
    paywall_title = Column(String(200), nullable=True)  # Added proper length
    paywall_description = Column(Text, nullable=True)  # Added proper length
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # Added NOT NULL and index
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)  # Added NOT NULL and index
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), index=True)  # Added index

    owner = relationship("User")

    # Compound indexes for common queries
    __table_args__ = (
        Index('idx_content_owner_protected', 'owner_id', 'is_protected'),  # For user content queries
        Index('idx_content_type_active', 'type', 'is_protected'),  # For content type queries
        Index('idx_content_price_currency', 'price', 'currency'),  # For price-based queries
        Index('idx_content_created_at', 'created_at'),  # For time-based queries
        # Check constraints
        CheckConstraint("LENGTH(title) >= 1", name="content_title_length_check"),
        CheckConstraint("LENGTH(title) <= 200", name="content_title_max_length_check"),
        CheckConstraint("type IN ('text', 'image', 'video', 'audio', 'document', 'link', 'other')", name="content_type_check"),
        CheckConstraint("price >= 0", name="content_price_positive_check"),
        CheckConstraint("LENGTH(currency) = 3", name="content_currency_length_check"),
        CheckConstraint("LENGTH(url) <= 500", name="content_url_length_check"),
    )
