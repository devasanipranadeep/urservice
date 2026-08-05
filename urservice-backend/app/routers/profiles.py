from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from uuid import UUID
import os
import time

from app.core.security import get_current_user, get_current_user_light, require_role, CurrentUser
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse, GoogleUserEnsure
from app.services import profile_service
from app.db.supabase_client import supabase
from app.core.rate_limit import upload_rate_limiter

router = APIRouter(prefix="/api/profiles", tags=["profiles"])


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
        return profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile: {str(e)}"
        )

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: CurrentUser = Depends(get_current_user)):
    """
    Fetches the profile of the current authenticated user.
    """
    profile = profile_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )
    return profile

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
        url_res = supabase.storage.from_("profile-images").create_signed_url(path=storage_path, expires_in=300)
        signed_url = url_res.get("signedURL") or url_res.get("signedUrl")

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
    Generates on-demand a fresh signed URL (300s expiry) for the user's profile photo.
    """
    profile = profile_service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )

    path = profile.get("profile_photo_url")
    if not path:
        return {"signedUrl": None}

    try:
        url_res = supabase.storage.from_("profile-images").create_signed_url(path=path, expires_in=300)
        signed_url = url_res.get("signedURL") or url_res.get("signedUrl")
        return {"signedUrl": signed_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate signed URL: {str(e)}"
        )

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

        return {"status": "ok", "message": "User and profile ensured."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ensure Google user: {str(e)}"
        )
