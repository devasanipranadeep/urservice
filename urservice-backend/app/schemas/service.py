from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class ServiceCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: float = Field(..., ge=0.0)

class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[float] = Field(None, ge=0.0)
    is_active: Optional[bool] = None

class ServiceResponse(BaseModel):
    id: UUID
    vendor_id: UUID
    name: str
    description: Optional[str] = None
    price: float
    is_active: bool
    created_at: datetime
