from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from uuid import UUID
import os
import time
from typing import Dict, Tuple, Optional
import logging

from app.core.security import (
    get_current_user,
    get_current_user_light,
    get_current_user_phone_light,
    require_role,
    CurrentUser,
    invalidate_user_cache,
)
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse, GoogleUserEnsure, PhoneUserEnsure
from app.services import profile_service
from app.db.supabase_client import supabase
from app.core.rate_limit import upload_rate_limiter

logger = logging.getLogger("app.profiles")
router = APIRouter(prefix="/api/profiles", tags=["profiles"])

# In-memory signed photo URL cache: user_id -> (signed_url, expiry)
PHOTO_URL_CACHE: Dict[str, Tuple[Optional[str], float]] = {}

def get_or_create_signed_photo_url(user_id: UUID | str, storage_path: Optional[str]) -> Optional[str]:
    """Returns cached signed photo URL or generates a fresh one valid for 1 hour."""
    if not storage_path:
        return None
    user_key = str(user_id)
    now = time.time()
    cached = PHOTO_URL_CACHE.get(user_key)
    if cached and cached[1] > now:
        return cached[0]

    try:
        url_res = supabase.storage.from_("profile-images").create_signed_url(path=storage_path, expires_in=3600)
        signed_url = url_res.get("signedURL") or url_res.get("signedUrl")
        if signed_url:
            # Cache for 50 minutes (3000s)
            PHOTO_URL_CACHE[user_key] = (signed_url, now + 3000.0)
            return signed_url
    except Exception as e:
        logger.warning(f"Failed to generate signed photo URL for user {user_id}: {e}")
    return None


@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_user_profile(
    data: ProfileCreate,
    current_user: CurrentUser = Depends(require_role("client", "vendor"))
):
    """
    Creates a new profile for the authenticated client or vendor.
    """
    # Check if profile already exists
    existing = profile_service.get_profile(current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists for this user."
        )
    
    try:
        profile = profile_service.create_profile(current_user.id, data)
        invalidate_user_cache(current_user.id)
        return profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile: {str(e)}"
        )

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: CurrentUser = Depends(get_current_user)):
    """
    Fetches the profile of the current authenticated user, including pre-signed photo URL.
    """
    profile = profile_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )
    
    profile_data = dict(profile)
    path = profile_data.get("profile_photo_url")
    if path:
        profile_data["signed_photo_url"] = get_or_create_signed_photo_url(current_user.id, path)
    return profile_data

@router.patch("/me", response_model=ProfileResponse)
def update_my_profile(
    data: ProfileUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Updates the profile of the current authenticated user.
    """
    # Verify profile exists
    profile = profile_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )
    
    try:
        updated = profile_service.update_profile(current_user.id, data)
        invalidate_user_cache(current_user.id)
        return updated
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.post("/me/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    rate_limit: None = Depends(upload_rate_limiter)
):
    """
    Uploads a profile photo to private Supabase storage.
    Validates file format (jpeg/png) and size (<= 2MB) and updates the user profile record.
    """
    # 1. Validate content type and extension
    content_type = file.content_type
    if content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Only JPG and PNG are supported."
        )
        
    _, ext = os.path.splitext(file.filename or "")
    ext = ext.lower()
    if ext not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file extension."
        )

    # 2. Validate file size (2MB limit)
    content = await file.read()
    size_in_bytes = len(content)
    if size_in_bytes > 2 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 2MB limit."
        )

    # Get current profile to check if there is an old photo to clean up
    profile = profile_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )

    # Generate a unique path to bypass browser caching issues
    filename = f"photo_{int(time.time())}{ext}"
    storage_path = f"{current_user.id}/{filename}"

    try:
        # 3. Upload file content to Supabase Storage profile-images bucket
        supabase.storage.from_("profile-images").upload(
            path=storage_path,
            file=content,
            file_options={"content-type": content_type, "x-upsert": "true"}
        )
        
        # 4. Clean up old photo if it exists
        old_path = profile.get("profile_photo_url")
        if old_path:
            try:
                supabase.storage.from_("profile-images").remove([old_path])
            except Exception:
                # Fail silently if delete fails so the upload completes
                pass

        # 5. Update profiles database record
        supabase.table("profiles").update({"profile_photo_url": storage_path}).eq("user_id", str(current_user.id)).execute()

        # 6. Generate signed URL
        url_res = supabase.storage.from_("profile-images").create_signed_url(path=storage_path, expires_in=3600)
        signed_url = url_res.get("signedURL") or url_res.get("signedUrl")

        # Update cache
        if signed_url:
            PHOTO_URL_CACHE[str(current_user.id)] = (signed_url, time.time() + 3000.0)

        return {
            "profile_photo_url": storage_path,
            "signedUrl": signed_url
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

@router.get("/me/photo-url")
def get_profile_photo_url(current_user: CurrentUser = Depends(get_current_user)):
    """
    Generates on-demand or returns cached signed URL for the user's profile photo.
    """
    user_key = str(current_user.id)
    now = time.time()
    cached = PHOTO_URL_CACHE.get(user_key)
    if cached and cached[1] > now:
        return {"signedUrl": cached[0]}

    profile = profile_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )

    path = profile.get("profile_photo_url")
    if not path:
        return {"signedUrl": None}

    signed_url = get_or_create_signed_photo_url(current_user.id, path)
    return {"signedUrl": signed_url}

@router.post("/ensure-google-user", status_code=status.HTTP_200_OK)
def ensure_google_user(
    data: GoogleUserEnsure,
    current_user: CurrentUser = Depends(get_current_user_light)
):
    """
    Idempotent endpoint for Google OAuth users.
    Ensures both the public.users row and the profiles row exist for the authenticated user.
    If rows already exist, returns success without modification.
    Only allows 'client' or 'vendor' roles (validated by schema).
    """
    user_id = str(current_user.id)

    try:
        # 1. Check if public.users row exists
        users_res = supabase.table("users").select("id, role").eq("id", user_id).execute()

        if not users_res.data:
            # Create the public.users row
            supabase.table("users").insert({
                "id": user_id,
                "email": current_user.email,
                "role": data.role,
            }).execute()
        
        # 2. Check if profile exists
        existing_profile = profile_service.get_profile(current_user.id)
        if not existing_profile:
            # Create profile with available data
            profile_data = ProfileCreate(
                full_name=data.full_name or "Google User",
                phone=data.phone or None,
                city=data.city or "Not Set",
            )
            profile_service.create_profile(current_user.id, profile_data)

        invalidate_user_cache(user_id)
        return {"status": "ok", "message": "User and profile ensured."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ensure Google user: {str(e)}"
        )

@router.post("/ensure-user", status_code=status.HTTP_200_OK)
def ensure_phone_user(
    data: PhoneUserEnsure,
    current_user: CurrentUser = Depends(get_current_user_phone_light)
):
    """
    Idempotent endpoint for phone-OTP authenticated users.
    Ensures both the public.users row and the profiles row exist for the authenticated user.
    If rows already exist, returns success without modification.
    Used by login and client registration flows after phone OTP verification.
    """
    user_id = str(current_user.id)

    try:
        # 1. Check if public.users row exists
        users_res = supabase.table("users").select("id, role").eq("id", user_id).execute()

        if not users_res.data:
            # Create the public.users row
            supabase.table("users").insert({
                "id": user_id,
                "email": current_user.email or "",
                "role": data.role,
            }).execute()
        elif data.role == "vendor" and users_res.data[0].get("role") != "vendor":
            supabase.table("users").update({"role": "vendor"}).eq("id", user_id).execute()

        # 2. Check if profile exists
        existing_profile = profile_service.get_profile(current_user.id)
        if not existing_profile:
            # Create profile with available data
            profile_data = ProfileCreate(
                full_name=data.full_name or "Phone User",
                phone=data.phone,
                city=data.city or "Not Set",
            )
            profile_service.create_profile(current_user.id, profile_data)

        invalidate_user_cache(user_id)
        return {"status": "ok", "message": "User and profile ensured."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ensure phone user: {str(e)}"
        )
