from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, DateTime
from config.database import Base

class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    blacklisted_on = Column(DateTime, default=datetime.utcnow, index=True)  # Added index
    expires_at = Column(DateTime, nullable=False, index=True)  # Added index