from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class ProfileCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    city: str = Field(..., min_length=2, max_length=100)

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = Field(None, min_length=2, max_length=100)

class ProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    full_name: str
    phone: Optional[str] = None
    city: str
    profile_photo_url: Optional[str] = None
    created_at: datetime

class GoogleUserEnsure(BaseModel):
    role: str = Field(..., pattern=r'^(client|vendor)$')
    full_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field('', max_length=20)
    city: Optional[str] = Field('', max_length=100)
