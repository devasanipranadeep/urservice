from uuid import UUID
from typing import Dict, Any, List
from app.db.supabase_client import supabase
from app.schemas.vendor import VendorPersonalInfo, VendorBusinessInfo, VendorBankDetails, VendorAvailability

def register_vendor(
    user_id: UUID,
    personal: VendorPersonalInfo,
    business: VendorBusinessInfo,
    bank: VendorBankDetails,
    availability: VendorAvailability,
    files_to_upload: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Saves a vendor registration transactionally:
    1. Uploads files to storage.
    2. Inserts vendor row.
    3. Inserts bank details.
    4. Inserts document rows.
    5. Updates/creates user profile.
    6. Inserts initial notification.
    
    If any step fails, purges uploaded storage files and cascade-deletes the database rows.
    """
    uploaded_storage_paths = []  # list of tuples (bucket, path)
    vendor_id = None
    profile_photo_path = None
    business_logo_path = None

    try:
        # Step 1: Perform storage uploads concurrently
        import concurrent.futures

        def _do_upload(item):
            b = item["bucket"]
            p = item["path"]
            c = item["content"]
            ct = item["content_type"]
            supabase.storage.from_(b).upload(
                path=p,
                file=c,
                file_options={"content-type": ct, "x-upsert": "true"}
            )
            return (b, p)

        if files_to_upload:
            with concurrent.futures.ThreadPoolExecutor(max_workers=min(5, len(files_to_upload))) as executor:
                results = list(executor.map(_do_upload, files_to_upload))
                uploaded_storage_paths.extend(results)

        for f in files_to_upload:
            doc_purpose = f.get("doc_purpose")
            if doc_purpose == "profile_photo":
                profile_photo_path = f["path"]
            elif doc_purpose == "business_logo":
                business_logo_path = f["path"]

        # Step 2: Insert into public.vendors
        vendor_data = {
            "user_id": str(user_id),
            "business_name": business.business_name,
            "business_category": business.business_category,
            "business_description": business.business_description,
            "years_experience": business.years_experience,
            "service_radius_km": business.service_radius_km,
            "date_of_birth": str(personal.dob),
            "gender": personal.gender,
            "house_number": business.house_number,
            "street": business.street,
            "area": business.area,
            "city": business.city,
            "state": business.state,
            "pincode": business.pincode,
            "latitude": availability.latitude,
            "longitude": availability.longitude,
            "working_days": availability.working_days,
            "working_hours_start": availability.working_hours_start,
            "working_hours_end": availability.working_hours_end,
            "emergency_availability": availability.emergency_availability,
            "verification_status": "pending",
            "business_logo_url": business_logo_path
        }
        
        vendor_res = supabase.table("vendors").insert(vendor_data).execute()
        if not vendor_res.data:
            raise Exception("Failed to insert vendor row.")
        
        vendor_id = vendor_res.data[0]["id"]

        # Step 3: Insert into public.vendor_bank_details
        bank_data = {
            "vendor_id": str(vendor_id),
            "account_holder_name": bank.account_holder_name,
            "bank_name": bank.bank_name,
            "account_number": bank.account_number,
            "ifsc_code": bank.ifsc_code,
            "upi_id": bank.upi_id
        }
        bank_res = supabase.table("vendor_bank_details").insert(bank_data).execute()
        if not bank_res.data:
            raise Exception("Failed to insert bank details.")

        # Step 4: Insert into public.vendor_documents
        for f in files_to_upload:
            if f.get("doc_purpose") != "document":
                continue # Skip profile photo and business logo from documents table
            
            doc_data = {
                "vendor_id": str(vendor_id),
                "document_type": f["doc_type"],
                "document_category": f["doc_category"],
                "file_url": f["path"],
                "verification_status": "pending"
            }
            supabase.table("vendor_documents").insert(doc_data).execute()

        # Step 5: Upsert profile row (in public.profiles)
        profile_data = {
            "user_id": str(user_id),
            "full_name": personal.full_name,
            "phone": personal.phone
        }
        if profile_photo_path:
            profile_data["profile_photo_url"] = profile_photo_path

        # We check if profile exists
        prof_check = supabase.table("profiles").select("*").eq("user_id", str(user_id)).execute()
        if prof_check.data:
            supabase.table("profiles").update(profile_data).eq("user_id", str(user_id)).execute()
        else:
            supabase.table("profiles").insert(profile_data).execute()

        # Step 6: Create initial notification using centralized service
        from app.services import notification_service
        notification_service.create_notification(
            user_id=user_id,
            title="Registration received",
            message="Your vendor registration has been received and is under review."
        )

        return {
            "vendor_id": vendor_id,
            "verification_status": "pending"
        }

    except Exception as e:
        # Transaction failed: Roll back storage uploads
        for bucket, path in uploaded_storage_paths:
            try:
                supabase.storage.from_(bucket).remove([path])
            except Exception:
                pass

        # Roll back database rows via vendor cascade delete
        if vendor_id:
            try:
                supabase.table("vendors").delete().eq("id", str(vendor_id)).execute()
            except Exception:
                pass
        raise e

from typing import Optional

def get_vendor_by_user_id(user_id: UUID) -> Optional[Dict[str, Any]]:
    """
    Fetches the vendor record for a given user ID.
    """
    response = supabase.table("vendors").select("*").eq("user_id", str(user_id)).execute()
    if not response.data:
        return None
    return response.data[0]

