from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import date
import re

class VendorPersonalInfo(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    dob: date
    gender: str = Field(..., min_length=2, max_length=20)

    @field_validator("dob")
    @classmethod
    def validate_age(cls, v: date) -> date:
        from datetime import date as dt_date
        today = dt_date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 18:
            raise ValueError("Vendor must be at least 18 years old to register.")
        return v

class VendorBusinessInfo(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=100)
    business_category: str = Field(..., min_length=2, max_length=100)
    business_description: Optional[str] = None
    years_experience: int = Field(..., ge=0)
    service_radius_km: int = Field(..., ge=0)
    house_number: Optional[str] = None
    street: Optional[str] = None
    area: Optional[str] = None
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=5, max_length=10)

class VendorBankDetails(BaseModel):
    account_holder_name: str = Field(..., min_length=2, max_length=100)
    bank_name: str = Field(..., min_length=2, max_length=100)
    account_number: str = Field(..., min_length=5, max_length=30)
    ifsc_code: str = Field(..., min_length=11, max_length=11)
    upi_id: Optional[str] = Field(None, max_length=50)

    @field_validator("ifsc_code")
    @classmethod
    def validate_ifsc(cls, v: str) -> str:
        # Regex: 4 letters, 0, 6 alphanumeric
        pattern = r"^[A-Z]{4}0[A-Z0-9]{6}$"
        if not re.match(pattern, v.upper()):
            raise ValueError("Invalid IFSC code format. It must start with 4 uppercase letters, followed by a '0', and end with 6 alphanumeric characters.")
        return v.upper()

class VendorAvailability(BaseModel):
    working_days: List[str]
    working_hours_start: str = Field(..., pattern=r"^\d{2}:\d{2}(:\d{2})?$")
    working_hours_end: str = Field(..., pattern=r"^\d{2}:\d{2}(:\d{2})?$")
    emergency_availability: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class VendorRegistrationResponse(BaseModel):
    vendor_id: UUID
    verification_status: str

from datetime import datetime

class VendorMeResponse(BaseModel):
    id: UUID
    user_id: UUID
    business_name: str
    business_category: str
    business_description: Optional[str] = None
    years_experience: int
    service_radius_km: int
    date_of_birth: date
    gender: str
    house_number: Optional[str] = None
    street: Optional[str] = None
    area: Optional[str] = None
    city: str
    state: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    business_logo_url: Optional[str] = None
    verification_status: str
    rejection_reason: Optional[str] = None
    suspension_reason: Optional[str] = None
    working_days: List[str]
    working_hours_start: str
    working_hours_end: str
    emergency_availability: bool
    created_at: datetime
    updated_at: datetime

class VendorAnalyticsResponse(BaseModel):
    total_bookings: int
    completed_bookings: int
    pending_bookings: int
    cancelled_bookings: int

