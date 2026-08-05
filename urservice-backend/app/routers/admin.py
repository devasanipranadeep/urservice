from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.core.security import require_role, CurrentUser
from app.db.supabase_client import supabase
from app.services import notification_service
from app.schemas.admin import (
    AdminStatsResponse,
    AdminVendorListResponse,
    AdminVendorListItem,
    AdminActionRequest,
    AdminVendorDetailResponse,
    VendorDocumentDetail,
    AddressDetail,
    LocationDetail,
    PersonalDetail,
    BankDetail
)

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(current_user: CurrentUser = Depends(require_role("admin"))):
    """
    Fetch aggregate counts of clients, vendors, and status distribution for admin dashboard.
    """
    # 1. Total clients: users whose role is 'client'
    clients_res = supabase.table("users").select("id", count="exact").eq("role", "client").execute()
    total_clients = clients_res.count or 0
    
    # 2. Total vendors: all rows in the vendors table
    vendors_res = supabase.table("vendors").select("id", count="exact").execute()
    total_vendors = vendors_res.count or 0
    
    # 3. Active vendors
    # Comment: An active vendor is defined as a vendor with an 'approved' verification status.
    # Under our schema, if a vendor is suspended, their verification_status is flipped to 'suspended'.
    # Therefore, verification_status == 'approved' explicitly denotes active, non-suspended vendors.
    active_res = supabase.table("vendors").select("id", count="exact").eq("verification_status", "approved").execute()
    active_vendors = active_res.count or 0
    
    # 4. Distribution of verification statuses
    statuses = ["pending", "under_review", "approved", "rejected", "suspended"]
    status_counts = {}
    for s in statuses:
        s_res = supabase.table("vendors").select("id", count="exact").eq("verification_status", s).execute()
        status_counts[s] = s_res.count or 0
        
    return AdminStatsResponse(
        total_clients=total_clients,
        total_vendors=total_vendors,
        active_vendors=active_vendors,
        status_counts=status_counts
    )

@router.get("/vendors", response_model=AdminVendorListResponse)
def get_verification_queue(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: CurrentUser = Depends(require_role("admin"))
):
    """
    Paginated and filterable queue of registered vendors under review or action.
    """
    query = supabase.table("vendors").select("*, users(profiles(full_name))", count="exact")
    
    if status:
        query = query.eq("verification_status", status)
    else:
        query = query.neq("verification_status", "rejected").neq("verification_status", "suspended")
    if category:
        query = query.eq("business_category", category)
    if city:
        query = query.eq("city", city)
        
    query = query.order("created_at", desc=True)
    
    start = (page - 1) * page_size
    end = start + page_size - 1
    query = query.range(start, end)
    
    res = query.execute()
    
    items = []
    for v in (res.data or []):
        vendor_name = ""
        users_data = v.get("users")
        if users_data:
            profiles_data = users_data.get("profiles")
            if profiles_data:
                vendor_name = profiles_data.get("full_name") or ""
                
        if not vendor_name:
            vendor_name = v.get("business_name") or "Unknown"
            
        items.append(
            AdminVendorListItem(
                id=v["id"],
                user_id=v["user_id"],
                vendor_name=vendor_name,
                business_name=v["business_name"],
                business_category=v["business_category"],
                city=v["city"],
                created_at=v["created_at"],
                verification_status=v["verification_status"],
                rejection_reason=v.get("rejection_reason"),
                suspension_reason=v.get("suspension_reason")
            )
        )
        
    total = res.count or 0
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    
    return AdminVendorListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/vendors/{id}", response_model=AdminVendorDetailResponse)
def get_vendor_details(id: UUID, current_user: CurrentUser = Depends(require_role("admin"))):
    """
    Fetch comprehensive vendor registration profiles and create short-lived signed URLs for documents/assets.
    """
    vendor_res = supabase.table("vendors").select("*, users(email, profiles(full_name, phone, profile_photo_url))").eq("id", str(id)).execute()
    if not vendor_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )
    v = vendor_res.data[0]
    
    bank_res = supabase.table("vendor_bank_details").select("*").eq("vendor_id", str(id)).execute()
    bank = bank_res.data[0] if bank_res.data else None
    
    docs_res = supabase.table("vendor_documents").select("*").eq("vendor_id", str(id)).execute()
    docs = docs_res.data or []
    
    signed_docs = []
    for doc in docs:
        cat = doc.get("document_category")
        file_url = doc.get("file_url")
        bucket = "vendor-identity" if cat == "identity" else "vendor-business-documents"
        
        try:
            url_res = supabase.storage.from_(bucket).create_signed_url(path=file_url, expires_in=300)
            signed_url = url_res.get("signedURL") or url_res.get("signedUrl") or ""
        except Exception:
            signed_url = ""
            
        signed_docs.append(
            VendorDocumentDetail(
                id=doc["id"],
                document_type=doc["document_type"],
                document_category=cat,
                file_url=file_url,
                signed_url=signed_url,
                verification_status=doc["verification_status"],
                remarks=doc.get("remarks"),
                uploaded_at=doc["uploaded_at"]
            )
        )
        
    profile_photo_url = None
    users_data = v.get("users") or {}
    profiles_data = users_data.get("profiles") or {}
    photo_path = profiles_data.get("profile_photo_url")
    if photo_path:
        try:
            url_res = supabase.storage.from_("profile-images").create_signed_url(path=photo_path, expires_in=300)
            profile_photo_url = url_res.get("signedURL") or url_res.get("signedUrl")
        except Exception:
            pass
            
    business_logo_url = None
    logo_path = v.get("business_logo_url")
    if logo_path:
        try:
            url_res = supabase.storage.from_("vendor-logos").create_signed_url(path=logo_path, expires_in=300)
            business_logo_url = url_res.get("signedURL") or url_res.get("signedUrl")
        except Exception:
            pass
            
    return AdminVendorDetailResponse(
        id=v["id"],
        user_id=v["user_id"],
        business_name=v["business_name"],
        business_category=v["business_category"],
        business_description=v.get("business_description"),
        years_experience=v["years_experience"],
        service_radius_km=v["service_radius_km"],
        date_of_birth=v["date_of_birth"],
        gender=v["gender"],
        address=AddressDetail(
            house_number=v.get("house_number"),
            street=v.get("street"),
            area=v.get("area"),
            city=v["city"],
            state=v["state"],
            pincode=v["pincode"]
        ),
        location=LocationDetail(
            latitude=v.get("latitude"),
            longitude=v.get("longitude")
        ),
        business_logo_url=business_logo_url,
        verification_status=v["verification_status"],
        rejection_reason=v.get("rejection_reason"),
        suspension_reason=v.get("suspension_reason"),
        working_days=v["working_days"],
        working_hours_start=str(v["working_hours_start"]),
        working_hours_end=str(v["working_hours_end"]),
        emergency_availability=v["emergency_availability"],
        created_at=v["created_at"],
        updated_at=v["updated_at"],
        personal_info=PersonalDetail(
            full_name=profiles_data.get("full_name") or "",
            phone=profiles_data.get("phone"),
            email=users_data.get("email") or "",
            profile_photo_url=profile_photo_url
        ),
        bank_details=BankDetail(
            account_holder_name=bank["account_holder_name"],
            bank_name=bank["bank_name"],
            account_number=bank["account_number"],
            ifsc_code=bank["ifsc_code"],
            upi_id=bank.get("upi_id")
        ) if bank else None,
        documents=signed_docs
    )

@router.post("/vendors/{id}/approve")
def approve_vendor(id: UUID, current_user: CurrentUser = Depends(require_role("admin"))):
    """
    Approve a vendor's application, clearing rejection or suspension states and alerting them via notification.
    """
    vendor_res = supabase.table("vendors").select("*").eq("id", str(id)).execute()
    if not vendor_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )
    v = vendor_res.data[0]
    
    supabase.table("vendors").update({
        "verification_status": "approved",
        "rejection_reason": None,
        "suspension_reason": None
    }).eq("id", str(id)).execute()
    
    supabase.table("vendor_documents").update({
        "verification_status": "approved"
    }).eq("vendor_id", str(id)).execute()
    
    notification_service.create_notification(
        user_id=v["user_id"],
        title="Application Approved",
        message="Your vendor application has been approved. You can now list services and receive bookings."
    )
    
    return {"status": "success", "message": "Vendor approved successfully."}

@router.post("/vendors/{id}/reject")
def reject_vendor(
    id: UUID, 
    action: AdminActionRequest, 
    current_user: CurrentUser = Depends(require_role("admin"))
):
    """
    Reject a vendor's application with a mandatory reason, updating the status and creating a notification.
    """
    vendor_res = supabase.table("vendors").select("*").eq("id", str(id)).execute()
    if not vendor_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )
    v = vendor_res.data[0]
    
    supabase.table("vendors").update({
        "verification_status": "rejected",
        "rejection_reason": action.reason,
        "suspension_reason": None
    }).eq("id", str(id)).execute()
    
    supabase.table("vendor_documents").update({
        "verification_status": "rejected"
    }).eq("vendor_id", str(id)).execute()
    
    notification_service.create_notification(
        user_id=v["user_id"],
        title="Application Rejected",
        message=f"Your vendor application was rejected. Reason: {action.reason}"
    )
    
    return {"status": "success", "message": "Vendor rejected successfully."}

@router.post("/vendors/{id}/suspend")
def suspend_vendor(
    id: UUID, 
    action: AdminActionRequest, 
    current_user: CurrentUser = Depends(require_role("admin"))
):
    """
    Suspend an active vendor with a mandatory reason, blocking service actions and creating a notification.
    """
    vendor_res = supabase.table("vendors").select("*").eq("id", str(id)).execute()
    if not vendor_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )
    v = vendor_res.data[0]
    
    supabase.table("vendors").update({
        "verification_status": "suspended",
        "suspension_reason": action.reason,
        "rejection_reason": None
    }).eq("id", str(id)).execute()
    
    notification_service.create_notification(
        user_id=v["user_id"],
        title="Account Suspended",
        message=f"Your vendor account has been suspended. Reason: {action.reason}"
    )
    
    return {"status": "success", "message": "Vendor suspended successfully."}
