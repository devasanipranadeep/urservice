from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from uuid import UUID
import math

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth's radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi/2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

from app.core.security import require_role, CurrentUser
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.services import vendor_service
from app.db.supabase_client import supabase

router = APIRouter(prefix="/api/services", tags=["services"])

@router.get("/me", response_model=List[ServiceResponse])
def get_my_services(current_user: CurrentUser = Depends(require_role("vendor"))):
    """
    Fetch all services listed by the authenticated vendor.
    """
    vendor = vendor_service.get_vendor_by_user_id(current_user.id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )

    response = supabase.table("services").select("*").eq("vendor_id", vendor["id"]).eq("is_active", True).execute()
    return response.data or []

@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    data: ServiceCreate,
    current_user: CurrentUser = Depends(require_role("vendor"))
):
    """
    Create a new service. Vendor must be approved.
    """
    vendor = vendor_service.get_vendor_by_user_id(current_user.id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )

    # Enforce verification_status == 'approved'
    if vendor["verification_status"] != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted. Only approved vendors can create services."
        )

    service_data = {
        "vendor_id": vendor["id"],
        "name": data.name,
        "description": data.description,
        "price": data.price,
        "is_active": True
    }

    response = supabase.table("services").insert(service_data).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create service record."
        )
    return response.data[0]

@router.get("/search")
def search_nearby_services(
    lat: float,
    lon: float,
    category: Optional[str] = None,
    subcategory: Optional[str] = None
):
    """
    Search approved vendors in a given category/subcategory within their service radius.
    """
    # 1. Fetch approved vendors
    query = supabase.table("vendors").select("*").eq("verification_status", "approved")
    vendors_res = query.execute()
    vendors = vendors_res.data or []
    
    # 2. Filter vendors by geodesic distance and matching subcategory (if provided)
    results = []
    for v in vendors:
        # Category matching (normalized case and spaces/underscores)
        if category:
            v_cat = (v.get("business_category") or "").lower().replace("_", " ").strip()
            filter_cat = category.lower().replace("_", " ").strip()
            if v_cat != filter_cat:
                continue

        v_lat = v.get("latitude")
        v_lon = v.get("longitude")
        if v_lat is None or v_lon is None:
            continue
            
        try:
            dist = haversine(lat, lon, float(v_lat), float(v_lon))
        except (ValueError, TypeError):
            continue
            
        radius = v.get("service_radius_km") or 25.0
        if dist > float(radius):
            continue
            
        # Match subcategory (by checking their name, description or listed services)
        if subcategory:
            sub_lower = subcategory.lower()
            b_name = (v.get("business_name") or "").lower()
            b_desc = (v.get("business_description") or "").lower()
            
            services_res = supabase.table("services").select("name").eq("vendor_id", v["id"]).eq("is_active", True).execute()
            service_names = [s["name"].lower() for s in services_res.data] if services_res.data else []
            
            has_match = (
                sub_lower in b_name or
                sub_lower in b_desc or
                any(sub_lower in sn for sn in service_names) or
                (not service_names and v.get("business_category") == category)
            )
            if not has_match:
                continue
                
        results.append({
            "id": v["id"],
            "user_id": str(v["user_id"]),
            "business_name": v["business_name"],
            "business_category": v["business_category"],
            "business_description": v["business_description"],
            "years_experience": v["years_experience"],
            "distance_km": round(dist, 2),
            "service_radius_km": radius,
            "city": v["city"],
            "area": v["area"],
            "business_logo_url": v.get("business_logo_url"),
            "working_hours_start": v.get("working_hours_start"),
            "working_hours_end": v.get("working_hours_end"),
            "emergency_availability": v.get("emergency_availability"),
        })
        
    results.sort(key=lambda x: x["distance_km"])
    return results

@router.patch("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: UUID,
    data: ServiceUpdate,
    current_user: CurrentUser = Depends(require_role("vendor"))
):
    """
    Update an existing service. Vendor must be approved and own the service.
    """
    vendor = vendor_service.get_vendor_by_user_id(current_user.id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )

    # Enforce verification_status == 'approved'
    if vendor["verification_status"] != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted. Only approved vendors can modify services."
        )

    # Verify service ownership and existence
    service_check = supabase.table("services").select("*").eq("id", str(service_id)).execute()
    if not service_check.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found."
        )
    
    existing_service = service_check.data[0]
    if existing_service["vendor_id"] != vendor["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found."
        )

    # Perform update
    update_data = {}
    if data.name is not None:
        update_data["name"] = data.name
    if data.description is not None:
        update_data["description"] = data.description
    if data.price is not None:
        update_data["price"] = data.price
    if data.is_active is not None:
        update_data["is_active"] = data.is_active

    if not update_data:
        return existing_service

    response = supabase.table("services").update(update_data).eq("id", str(service_id)).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update service record."
        )
    return response.data[0]

@router.delete("/{service_id}", response_model=ServiceResponse)
def delete_service(
    service_id: UUID,
    current_user: CurrentUser = Depends(require_role("vendor"))
):
    """
    Soft delete an existing service (deactivate it). Vendor must be approved and own the service.
    """
    vendor = vendor_service.get_vendor_by_user_id(current_user.id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found."
        )

    # Enforce verification_status == 'approved'
    if vendor["verification_status"] != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted. Only approved vendors can modify services."
        )

    # Verify service ownership and existence
    service_check = supabase.table("services").select("*").eq("id", str(service_id)).execute()
    if not service_check.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found."
        )
    
    existing_service = service_check.data[0]
    if existing_service["vendor_id"] != vendor["id"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found."
        )

    # Soft delete (is_active = False)
    response = supabase.table("services").update({"is_active": False}).eq("id", str(service_id)).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate service."
        )
    return response.data[0]
