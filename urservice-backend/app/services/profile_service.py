from uuid import UUID
from typing import Dict, Any, Optional
from app.db.supabase_client import supabase
from app.schemas.profile import ProfileCreate, ProfileUpdate

def create_profile(user_id: UUID, data: ProfileCreate) -> Dict[str, Any]:
    """
    Inserts a new profile row linked to the given user ID.
    Uses the service role client (bypasses RLS).
    """
    profile_data = {
        "user_id": str(user_id),
        "full_name": data.full_name,
        "phone": data.phone,
        "city": data.city
    }
    
    response = supabase.table("profiles").insert(profile_data).execute()
    if not response.data:
        raise Exception("Failed to insert profile.")
    return response.data[0]

def get_profile(user_id: UUID) -> Optional[Dict[str, Any]]:
    """
    Fetches the profile for the given user ID.
    """
    response = supabase.table("profiles").select("*").eq("user_id", str(user_id)).execute()
    if not response.data:
        return None
    return response.data[0]

def update_profile(user_id: UUID, data: ProfileUpdate) -> Dict[str, Any]:
    """
    Updates the profile for the given user ID.
    Only allows updating non-null fields.
    """
    update_data = {}
    if data.full_name is not None:
        update_data["full_name"] = data.full_name
    if data.phone is not None:
        update_data["phone"] = data.phone
    if data.city is not None:
        update_data["city"] = data.city
        
    if not update_data:
        # Nothing to update, return current profile
        current = get_profile(user_id)
        if not current:
            raise Exception("Profile not found.")
        return current

    response = supabase.table("profiles").update(update_data).eq("user_id", str(user_id)).execute()
    if not response.data:
        raise Exception("Profile not found or update failed.")
    return response.data[0]
