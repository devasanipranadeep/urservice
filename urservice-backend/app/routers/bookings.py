from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

from app.core.security import require_role, CurrentUser
from app.schemas.booking import VendorBookingResponse
from app.services import vendor_service
from app.db.supabase_client import supabase

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

class BookingUpdate(BaseModel):
    status: Optional[str] = None
    scheduled_at: Optional[datetime] = None

class BookingCreate(BaseModel):
    vendor_id: UUID
    service_id: UUID
    scheduled_at: datetime

@router.post("", status_code=status.HTTP_201_CREATED)
def create_booking(
    data: BookingCreate,
    current_user: CurrentUser = Depends(require_role("client"))
):
    """
    Create a new booking.
    """
    booking_data = {
        "client_id": str(current_user.id),
        "vendor_id": str(data.vendor_id),
        "service_id": str(data.service_id),
        "status": "requested",
        "scheduled_at": data.scheduled_at.isoformat()
    }
    
    response = supabase.table("bookings").insert(booking_data).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create booking record."
        )
        
    booking = response.data[0]
    
    # Retrieve vendor info
    vendor_res = supabase.table("vendors").select("user_id, business_name").eq("id", str(data.vendor_id)).execute()
    vendor_info = vendor_res.data[0] if vendor_res.data else None
    
    # Create server-side notifications
    try:
        from app.services import notification_service
        # Client notification
        client_msg = f"Your booking request with {vendor_info['business_name'] if vendor_info else 'the vendor'} has been sent."
        notification_service.create_notification(
            user_id=current_user.id,
            title="Booking Requested",
            message=client_msg
        )
        
        # Vendor notification
        if vendor_info and vendor_info.get("user_id"):
            client_name = "A client"
            profile_res = supabase.table("profiles").select("full_name").eq("user_id", str(current_user.id)).execute()
            if profile_res.data:
                client_name = profile_res.data[0].get("full_name") or "A client"
                
            vendor_msg = f"{client_name} has requested an appointment."
            notification_service.create_notification(
                user_id=UUID(vendor_info["user_id"]),
                title="New Booking Request",
                message=vendor_msg
            )
    except Exception:
        pass
        
    return booking

@router.get("/me")
def get_my_bookings(current_user: CurrentUser = Depends(require_role("client"))):
    """
    Fetch all bookings for the authenticated client.
    """
    res = supabase.table("bookings").select("*").eq("client_id", str(current_user.id)).execute()
    bookings_data = res.data or []
    
    if not bookings_data:
        return []
        
    # Get vendor info and service details
    vendor_ids = list(set([b["vendor_id"] for b in bookings_data]))
    service_ids = list(set([b["service_id"] for b in bookings_data if b["service_id"]]))
    
    # Fetch vendors
    vendors_res = supabase.table("vendors").select("id, business_name, business_logo_url").in_("id", vendor_ids).execute()
    vendors_map = {v["id"]: v for v in vendors_res.data} if vendors_res.data else {}
    
    # Fetch services
    services_res = supabase.table("services").select("id, name, price").in_("id", service_ids).execute()
    services_map = {s["id"]: s for s in services_res.data} if services_res.data else {}
    
    result = []
    for b in bookings_data:
        v = vendors_map.get(b["vendor_id"], {})
        s = services_map.get(b["service_id"], {})
        result.append({
            "id": b["id"],
            "client_id": b["client_id"],
            "vendor_id": b["vendor_id"],
            "service_id": b["service_id"],
            "status": b["status"],
            "scheduled_at": b["scheduled_at"],
            "created_at": b["created_at"],
            "vendor": {
                "business_name": v.get("business_name") or "Vendor",
                "business_logo_url": v.get("business_logo_url")
            },
            "service": {
                "name": s.get("name") or "General Service",
                "price": float(s["price"]) if s.get("price") else 0.0
            }
        })
    return result

@router.get("/vendor/me", response_model=List[VendorBookingResponse])
def get_vendor_bookings(current_user: CurrentUser = Depends(require_role("vendor"))):
    """
    Fetch bookings for the authenticated vendor.
    Only approved vendors can fetch bookings; returns empty list otherwise.
    """
    vendor = vendor_service.get_vendor_by_user_id(current_user.id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )

    # Return empty list if not approved
    if vendor["verification_status"] != "approved":
        return []

    # Fetch bookings
    bookings_res = supabase.table("bookings").select("*").eq("vendor_id", vendor["id"]).execute()
    bookings_data = bookings_res.data or []
    
    if not bookings_data:
        return []
        
    # Get all client IDs and service IDs to batch fetch details
    client_ids = list(set([b["client_id"] for b in bookings_data]))
    service_ids = list(set([b["service_id"] for b in bookings_data]))
    
    # Fetch services
    services_res = supabase.table("services").select("id, name, price").in_("id", service_ids).execute()
    services_map = {s["id"]: s for s in services_res.data} if services_res.data else {}
    
    # Fetch profiles
    profiles_res = supabase.table("profiles").select("user_id, full_name, phone").in_("user_id", client_ids).execute()
    profiles_map = {p["user_id"]: p for p in profiles_res.data} if profiles_res.data else {}
    
    # Fetch users (for email)
    users_res = supabase.table("users").select("id, email").in_("id", client_ids).execute()
    users_map = {u["id"]: u for u in users_res.data} if users_res.data else {}
    
    result = []
    for b in bookings_data:
        client_id = b["client_id"]
        service_id = b["service_id"]
        
        service_detail = None
        if service_id in services_map:
            s = services_map[service_id]
            service_detail = {
                "id": s["id"],
                "name": s["name"],
                "price": float(s["price"])
            }
            
        client_detail = None
        if client_id in users_map:
            u = users_map[client_id]
            p = profiles_map.get(client_id, {})
            client_detail = {
                "id": u["id"],
                "full_name": p.get("full_name") or "Client",
                "email": u["email"],
                "phone": p.get("phone")
            }
            
        result.append({
            "id": b["id"],
            "client_id": client_id,
            "vendor_id": b["vendor_id"],
            "service_id": service_id,
            "status": b["status"],
            "scheduled_at": b["scheduled_at"],
            "created_at": b["created_at"],
            "service": service_detail,
            "client": client_detail
        })
    return result

@router.patch("/{booking_id}")
def update_booking(
    booking_id: UUID,
    data: BookingUpdate,
    current_user: CurrentUser = Depends(require_role("client", "vendor"))
):
    """
    Update booking status or scheduled date.
    """
    # 1. Fetch the booking to verify ownership
    res = supabase.table("bookings").select("*").eq("id", str(booking_id)).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found."
        )
    booking = res.data[0]

    # Verify that the current user is either the client who booked it, or the vendor
    vendor_res = supabase.table("vendors").select("user_id, business_name").eq("id", booking["vendor_id"]).execute()
    if not vendor_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found."
        )
    vendor = vendor_res.data[0]

    is_client = (booking["client_id"] == str(current_user.id))
    is_vendor = (vendor["user_id"] == str(current_user.id))

    if not (is_client or is_vendor):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this booking."
        )

    # 2. Build update payload
    update_data = {}
    if data.status is not None:
        update_data["status"] = data.status
    if data.scheduled_at is not None:
        update_data["scheduled_at"] = data.scheduled_at.isoformat()

    if not update_data:
        return booking

    # 3. Perform update in database
    update_res = supabase.table("bookings").update(update_data).eq("id", str(booking_id)).execute()
    if not update_res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update booking."
        )
    updated_booking = update_res.data[0]

    # 4. Trigger notifications based on updates
    try:
        from app.services import notification_service
        # If status updated
        if data.status is not None:
            title = f"Booking {data.status.title()}"
            if is_client:
                msg = f"Client has {data.status} the booking."
                notification_service.create_notification(
                    user_id=UUID(vendor["user_id"]),
                    title=title,
                    message=msg
                )
            elif is_vendor:
                msg = f"Vendor has {data.status} your booking."
                notification_service.create_notification(
                    user_id=UUID(booking["client_id"]),
                    title=title,
                    message=msg
                )
        # If rescheduled
        if data.scheduled_at is not None:
            title = "Booking Rescheduled"
            formatted_time = data.scheduled_at.strftime("%Y-%m-%d %H:%M")
            if is_client:
                msg = f"Client has rescheduled the booking to {formatted_time}."
                notification_service.create_notification(
                    user_id=UUID(vendor["user_id"]),
                    title=title,
                    message=msg
                )
            elif is_vendor:
                msg = f"Vendor has rescheduled your booking to {formatted_time}."
                notification_service.create_notification(
                    user_id=UUID(booking["client_id"]),
                    title=title,
                    message=msg
                )
    except Exception:
        pass

    return updated_booking
