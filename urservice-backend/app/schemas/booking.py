from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class BookingResponse(BaseModel):
    id: UUID
    client_id: UUID
    vendor_id: UUID
    service_id: UUID
    status: str
    scheduled_at: datetime
    created_at: datetime

class BookingServiceDetail(BaseModel):
    id: UUID
    name: str
    price: float

class BookingClientDetail(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone: Optional[str] = None

class VendorBookingResponse(BaseModel):
    id: UUID
    client_id: UUID
    vendor_id: UUID
    service_id: UUID
    status: str
    scheduled_at: datetime
    created_at: datetime
    service: Optional[BookingServiceDetail] = None
    client: Optional[BookingClientDetail] = None
