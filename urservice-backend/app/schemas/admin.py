from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import List, Dict, Optional

class AdminStatsResponse(BaseModel):
    total_clients: int
    total_vendors: int
    active_vendors: int
    status_counts: Dict[str, int]

class AdminVendorListItem(BaseModel):
    id: UUID
    user_id: UUID
    vendor_name: str
    business_name: str
    business_category: str
    city: str
    created_at: datetime
    verification_status: str
    rejection_reason: Optional[str] = None
    suspension_reason: Optional[str] = None

class AdminVendorListResponse(BaseModel):
    items: List[AdminVendorListItem]
    total: int
    page: int
    page_size: int
    total_pages: int

class AdminActionRequest(BaseModel):
    reason: str = Field(..., min_length=1)

class VendorDocumentDetail(BaseModel):
    id: UUID
    document_type: str
    document_category: str
    file_url: str
    signed_url: str
    verification_status: str
    remarks: Optional[str] = None
    uploaded_at: datetime

class AddressDetail(BaseModel):
    house_number: Optional[str] = None
    street: Optional[str] = None
    area: Optional[str] = None
    city: str
    state: str
    pincode: str

class LocationDetail(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PersonalDetail(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: str
    profile_photo_url: Optional[str] = None

class BankDetail(BaseModel):
    account_holder_name: str
    bank_name: str
    account_number: str
    ifsc_code: str
    upi_id: Optional[str] = None

class AdminVendorDetailResponse(BaseModel):
    id: UUID
    user_id: UUID
    business_name: str
    business_category: str
    business_description: Optional[str] = None
    years_experience: int
    service_radius_km: int
    date_of_birth: date
    gender: str
    address: AddressDetail
    location: LocationDetail
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
    
    personal_info: PersonalDetail
    bank_details: Optional[BankDetail] = None
    documents: List[VendorDocumentDetail]
