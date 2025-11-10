"""
AB Testing Schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
from enum import Enum


class ABTestStatus(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"


class ABTestObjective(str, Enum):
    CONVERSION = "conversion"
    REVENUE = "revenue"
    ENGAGEMENT = "engagement"


class ABTestType(str, Enum):
    PRICING = "pricing"
    CONTENT = "content"
    DESIGN = "design"
    MESSAGING = "messaging"


class ABTestVariantCreate(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    weight: float = Field(..., ge=0.0, le=1.0)  # Traffic weight (0.0 to 1.0)


class ABTestVariant(BaseModel):
    id: int
    test_id: int
    name: str
    description: Optional[str] = None
    weight: float
    converted_count: int = 0
    total_visitors: int = 0

    class Config:
        from_attributes = True


class ABTestCreate(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    type: ABTestType
    objective: ABTestObjective
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    variants: List[ABTestVariantCreate] = Field(default_factory=list)


class ABTestUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ABTestStatus] = None
    type: Optional[ABTestType] = None
    objective: Optional[ABTestObjective] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ABTest(BaseModel):
    id: int
    owner_id: int
    name: str
    description: Optional[str] = None
    status: ABTestStatus
    type: ABTestType
    objective: ABTestObjective
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    current_sample: int
    is_winner_determined: bool
    winner_variant_id: Optional[int] = None
    created_at: str
    updated_at: str
    variants: List[ABTestVariant] = []

    class Config:
        from_attributes = True


class ABTestResults(BaseModel):
    test_id: int
    winner_variant_id: Optional[int] = None
    statistical_significance: float  # p-value or confidence level
    conversion_rates: List[dict]  # List of {variant_id: int, conversion_rate: float, sample_size: int}
    revenue_impact: Optional[float] = None  # Estimated revenue impact