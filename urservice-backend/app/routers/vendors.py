from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from typing import Optional, List, Dict, Any
from uuid import UUID
import json
import os
import time

from app.core.security import require_role, CurrentUser
from app.schemas.vendor import (
    VendorPersonalInfo,
    VendorBusinessInfo,
    VendorBankDetails,
    VendorAvailability,
    VendorRegistrationResponse
)
from app.services import vendor_service
from app.core.rate_limit import upload_rate_limiter

router = APIRouter(prefix="/api/vendors", tags=["vendors"])

def validate_image_file(file: UploadFile, max_size_mb: float = 2.0) -> bytes:
    """
    Validates that a file is a valid image (JPEG/PNG) and within the size limit.
    Returns file bytes.
    """
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image format for {file.filename}. Only JPEG and PNG are supported."
        )
    
    _, ext = os.path.splitext(file.filename or "")
    if ext.lower() not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension for {file.filename}."
        )

    # Read bytes and check size
    content = file.file.read()
    if len(content) > max_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image {file.filename} exceeds size limit of {max_size_mb}MB."
        )
    return content

def validate_doc_file(file: UploadFile, max_size_mb: float = 5.0) -> bytes:
    """
    Validates that a file is a valid PDF or Image and within the size limit.
    Returns file bytes.
    """
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document format for {file.filename}. Only PDF, JPEG, and PNG are supported."
        )
    
    _, ext = os.path.splitext(file.filename or "")
    if ext.lower() not in [".pdf", ".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension for {file.filename}."
        )

    content = file.file.read()
    if len(content) > max_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document {file.filename} exceeds size limit of {max_size_mb}MB."
        )
    return content

@router.post("/register", response_model=VendorRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_vendor_endpoint(
    data: str = Form(...),
    profile_photo: UploadFile = File(...),
    business_logo: Optional[UploadFile] = File(None),
    identity_file: UploadFile = File(...),
    shop_license: Optional[UploadFile] = File(None),
    trade_license: Optional[UploadFile] = File(None),
    registration_certificate: Optional[UploadFile] = File(None),
    category_certificate: Optional[UploadFile] = File(None),
    current_user: CurrentUser = Depends(require_role("vendor")),
    rate_limit: None = Depends(upload_rate_limiter)
):
    """
    Registers a vendor with multi-step data and supporting verification files.
    All data steps are sent inside the single serialized JSON form field `data`.
    """
    # 1. Parse and validate JSON data structures
    try:
        json_data = json.loads(data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse registration data JSON: {str(e)}"
        )

    try:
        personal = VendorPersonalInfo(**json_data.get("personal", {}))
        business = VendorBusinessInfo(**json_data.get("business", {}))
        bank = VendorBankDetails(**json_data.get("bank", {}))
        availability = VendorAvailability(**json_data.get("availability", {}))
    except Exception as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation failed: {str(val_err)}"
        )

    # Check if this user is already registered as a vendor
    # (Since we have a unique user_id constraint on vendors table)
    from app.db.supabase_client import supabase
    existing = supabase.table("vendors").select("id").eq("user_id", str(current_user.id)).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A vendor account is already registered for this user."
        )

    # 2. Perform file validation and collect byte arrays
    files_to_upload = []
    timestamp = int(time.time())
    user_id_str = str(current_user.id)

    # Validate Profile Photo (Required, max 2MB)
    photo_bytes = validate_image_file(profile_photo, max_size_mb=2.0)
    _, photo_ext = os.path.splitext(profile_photo.filename or "")
    files_to_upload.append({
        "bucket": "profile-images",
        "path": f"{user_id_str}/profile_{timestamp}{photo_ext.lower()}",
        "content": photo_bytes,
        "content_type": profile_photo.content_type,
        "doc_purpose": "profile_photo"
    })

    # Validate Business Logo (Optional, max 2MB)
    if business_logo and business_logo.filename:
        logo_bytes = validate_image_file(business_logo, max_size_mb=2.0)
        _, logo_ext = os.path.splitext(business_logo.filename or "")
        files_to_upload.append({
            "bucket": "vendor-logos",
            "path": f"{user_id_str}/logo_{timestamp}{logo_ext.lower()}",
            "content": logo_bytes,
            "content_type": business_logo.content_type,
            "doc_purpose": "business_logo"
        })

    # Validate Identity Verification Document (Required, max 5MB)
    id_bytes = validate_doc_file(identity_file, max_size_mb=5.0)
    _, id_ext = os.path.splitext(identity_file.filename or "")
    identity_type = json_data.get("identity_type", "identity_document")
    files_to_upload.append({
        "bucket": "vendor-identity",
        "path": f"{user_id_str}/identity_{timestamp}{id_ext.lower()}",
        "content": id_bytes,
        "content_type": identity_file.content_type,
        "doc_purpose": "document",
        "doc_type": identity_type,
        "doc_category": "identity"
    })

    # Validate Optional Business Proofs (Shop License, Trade License, Registration Certificate)
    business_proofs = [
        ("shop_license", shop_license),
        ("trade_license", trade_license),
        ("registration_certificate", registration_certificate),
        ("category_certificate", category_certificate)
    ]

    for doc_type, file_obj in business_proofs:
        if file_obj and file_obj.filename:
            doc_bytes = validate_doc_file(file_obj, max_size_mb=5.0)
            _, doc_ext = os.path.splitext(file_obj.filename or "")
            # Resolve actual document type label (for category_certificate, use category name from business info)
            actual_type = doc_type
            if doc_type == "category_certificate":
                category = business.business_category.lower().replace(" ", "_")
                actual_type = f"{category}_certificate"

            files_to_upload.append({
                "bucket": "vendor-business-documents",
                "path": f"{user_id_str}/{actual_type}_{timestamp}{doc_ext.lower()}",
                "content": doc_bytes,
                "content_type": file_obj.content_type,
                "doc_purpose": "document",
                "doc_type": actual_type,
                "doc_category": "business_proof"
            })

    # 3. Save vendor cleanly using transactional service
    try:
        result = vendor_service.register_vendor(
            user_id=current_user.id,
            personal=personal,
            business=business,
            bank=bank,
            availability=availability,
            files_to_upload=files_to_upload
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

from app.schemas.vendor import VendorMeResponse, VendorAnalyticsResponse

@router.get("/me", response_model=VendorMeResponse)
def get_my_vendor_profile(current_user: CurrentUser = Depends(require_role("vendor"))):
    """
    Fetches the vendor record for the authenticated user.
    """
    vendor = vendor_service.get_vendor_by_user_id(current_user.id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )
    return vendor

@router.patch("/me/resubmit", response_model=VendorMeResponse)
def resubmit_vendor_verification(current_user: CurrentUser = Depends(require_role("vendor"))):
    """
    Flips vendor verification_status from rejected to pending.
    Returns 409 if status is not rejected.
    """
    vendor = vendor_service.get_vendor_by_user_id(current_user.id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )
    
    if vendor["verification_status"] != "rejected":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Can only resubmit verification when current status is rejected."
        )
        
    from app.db.supabase_client import supabase
    update_res = supabase.table("vendors").update({
        "verification_status": "pending",
        "rejection_reason": None
    }).eq("id", vendor["id"]).execute()
    
    if not update_res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update vendor verification status."
        )
        
    # Insert resubmission notification using centralized service
    try:
        from app.services import notification_service
        notification_service.create_notification(
            user_id=current_user.id,
            title="Resubmitted for review",
            message="Your vendor profile has been resubmitted for review."
        )
    except Exception:
        pass
        
    return update_res.data[0]

@router.post("/me/documents")
async def upload_corrected_document(
    document_type: str = Form(...),
    document_category: str = Form(...),
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(require_role("vendor")),
    rate_limit: None = Depends(upload_rate_limiter)
):
    """
    Re-uploads a corrected document for a rejected vendor.
    """
    vendor = vendor_service.get_vendor_by_user_id(current_user.id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )
        
    if vendor["verification_status"] != "rejected":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Can only upload corrected documents when vendor verification status is rejected."
        )

    # Validate file
    doc_bytes = validate_doc_file(file, max_size_mb=5.0)
    _, ext = os.path.splitext(file.filename or "")
    ext = ext.lower()

    user_id_str = str(current_user.id)
    timestamp = int(time.time())
    
    if document_category == "identity":
        bucket = "vendor-identity"
        storage_path = f"{user_id_str}/identity_{timestamp}{ext}"
    else:
        bucket = "vendor-business-documents"
        storage_path = f"{user_id_str}/{document_type}_{timestamp}{ext}"

    # Upload to Supabase Storage
    try:
        from app.db.supabase_client import supabase
        supabase.storage.from_(bucket).upload(
            path=storage_path,
            file=doc_bytes,
            file_options={"content-type": file.content_type, "x-upsert": "true"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document to storage: {str(e)}"
        )

    # Insert into vendor_documents
    try:
        doc_data = {
            "vendor_id": vendor["id"],
            "document_type": document_type,
            "document_category": document_category,
            "file_url": storage_path,
            "verification_status": "pending"
        }
        response = supabase.table("vendor_documents").insert(doc_data).execute()
        if not response.data:
            raise Exception("No data returned from DB insert.")
        return response.data[0]
    except Exception as db_err:
        try:
            supabase.storage.from_(bucket).remove([storage_path])
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save document record: {str(db_err)}"
        )

@router.get("/me/analytics", response_model=VendorAnalyticsResponse)
def get_vendor_analytics(current_user: CurrentUser = Depends(require_role("vendor"))):
    """
    Fetches real aggregate booking counts for the vendor.
    """
    vendor = vendor_service.get_vendor_by_user_id(current_user.id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )
    
    from app.db.supabase_client import supabase
    bookings_res = supabase.table("bookings").select("status").eq("vendor_id", vendor["id"]).execute()
    
    total = len(bookings_res.data) if bookings_res.data else 0
    completed = 0
    pending = 0
    cancelled = 0
    
    if bookings_res.data:
        for b in bookings_res.data:
            status_val = b.get("status")
            if status_val == "completed":
                completed += 1
            elif status_val == "cancelled":
                cancelled += 1
            else:
                pending += 1
                
    return VendorAnalyticsResponse(
        total_bookings=total,
        completed_bookings=completed,
        pending_bookings=pending,
        cancelled_bookings=cancelled
    )

