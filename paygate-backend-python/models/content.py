from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from config.database import Base

class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True, index=True)  # Added index
    type = Column(String, index=True)  # Added index
    url = Column(String, nullable=True, index=True)  # Added index
    file_path = Column(String, nullable=True, index=True)  # Added index
    is_protected = Column(Boolean, default=False, index=True)  # Added index
    price = Column(Float, nullable=True, index=True)  # Added index
    currency = Column(String, nullable=True, index=True)  # Added index
    paywall_title = Column(String, nullable=True)
    paywall_description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)  # Added index

    owner = relationship("User")
