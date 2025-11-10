"""
AB Test Experiment Model
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Numeric, Text, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
from typing import TYPE_CHECKING, Optional
from datetime import datetime
import enum

if TYPE_CHECKING:
    from models.user import User
    from models.paywall import Paywall
    from models.ab_test import ABTestVariant  # Add this line


class ABTestStatus(str, enum.Enum):
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"


class ABTestType(str, enum.Enum):
    PRICING = "pricing"
    CONTENT = "content"
    DESIGN = "design"
    MESSAGING = "messaging"


class ABTestObjective(str, enum.Enum):
    CONVERSION = "conversion"
    REVENUE = "revenue"
    ENGAGEMENT = "engagement"


class ABTestStatus(str, enum.Enum):
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"


class ABTestType(str, enum.Enum):
    PRICING = "pricing"
    CONTENT = "content"
    DESIGN = "design"
    MESSAGING = "messaging"


class ABTestObjective(str, enum.Enum):
    CONVERSION = "conversion"
    REVENUE = "revenue"
    ENGAGEMENT = "engagement"


class ABTestObjective(str, enum.Enum):
    CONVERSION = "conversion"
    REVENUE = "revenue"
    ENGAGEMENT = "engagement"


class ABTestType(str, enum.Enum):
    PRICING = "pricing"
    CONTENT = "content"
    DESIGN = "design"
    MESSAGING = "messaging"


class ABTestVariant(Base):
    __tablename__ = "ab_test_variants"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("ab_tests.id"), nullable=False)
    name = Column(String(255), nullable=False)  # e.g. "A (Control)", "B (Test)"
    description = Column(Text)  # Description of the variant
    weight = Column(Numeric(5, 4))  # Traffic weight (0.0 to 1.0)
    converted_count = Column(Integer, default=0)  # Number of conversions
    total_visitors = Column(Integer, default=0)  # Total visitors to this variant
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship to parent test
    test = relationship("ABTest", back_populates="variants")


class ABTest(Base):
    __tablename__ = "ab_tests"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Who owns this experiment
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(ABTestStatus), default=ABTestStatus.DRAFT)
    type = Column(Enum(ABTestType), default=ABTestType.CONTENT)
    objective = Column(Enum(ABTestObjective), default=ABTestObjective.CONVERSION)
    start_date = Column(Date)
    end_date = Column(Date)
    current_sample = Column(Integer, default=0)
    is_winner_determined = Column(Boolean, default=False)
    winner_variant_id = Column(Integer, ForeignKey("ab_test_variants.id"))  # Foreign key to the winning variant
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="ab_tests")
    variants = relationship("ABTestVariant", back_populates="test", cascade="all, delete-orphan")
    winner_variant = relationship("ABTestVariant", foreign_keys=[winner_variant_id])

    def add_variant(self, name: str, description: str, weight: float):
        """Add a new variant to this test"""
        variant = ABTestVariant(
            test_id=self.id,
            name=name,
            description=description,
            weight=weight
        )
        self.variants.append(variant)
        return variant