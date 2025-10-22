from typing import Generic, TypeVar, List, Optional, Tuple
from pydantic import BaseModel, Field
from math import ceil

T = TypeVar('T')

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number (1-indexed)")
    limit: int = Field(20, ge=1, le=100, description="Items per page")
    offset: Optional[int] = Field(None, description="Offset for pagination (overrides page)")

    def calculate_offset(self) -> int:
        if self.offset is not None:
            return self.offset
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int
    has_next: bool
    has_prev: bool

    class Config:
        from_attributes = True


def create_paginated_response(
    items: List[T], 
    total: int, 
    page: int, 
    limit: int
) -> PaginatedResponse[T]:
    """
    Create a paginated response from items and metadata
    """
    pages = ceil(total / limit) if limit > 0 else 0
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1
    )