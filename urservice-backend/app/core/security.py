from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from uuid import UUID
import httpx
from typing import Dict, Any

from app.core.config import settings
from app.db.supabase_client import supabase

# HTTPBearer security scheme to extract Authorization: Bearer <token>
security_scheme = HTTPBearer(auto_error=False)

class CurrentUser(BaseModel):
    id: UUID
    email: str
    role: str

# Simple in-memory cache for JWKS keys to avoid requesting the endpoint on every request
JWKS_CACHE: Dict[str, Dict[str, Any]] = {}

import time
from typing import Tuple

# In-memory user cache with TTL to eliminate redundant Supabase network queries per request
USER_CACHE: Dict[str, Tuple[CurrentUser, float]] = {}
USER_CACHE_TTL = 180.0  # 3 minutes

def invalidate_user_cache(user_id: str | UUID):
    """Invalidate cached user credentials so role or profile updates take effect immediately."""
    USER_CACHE.pop(str(user_id), None)


def get_jwk_by_kid(kid: str) -> Dict[str, Any]:
    """
    Fetch the JSON Web Key matching the given key ID (kid) from Supabase.
    Caches keys to minimize latency.
    """
    global JWKS_CACHE
    if kid in JWKS_CACHE:
        return JWKS_CACHE[kid]
    
    # Fetch JWKS from Supabase. We include the service role key as the apikey header
    # because the Supabase gateway requires API key routing.
    url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    headers = {"apikey": settings.SUPABASE_SERVICE_ROLE_KEY}
    
    try:
        response = httpx.get(url, headers=headers, timeout=5.0)
        response.raise_for_status()
        jwks = response.json()
        for key in jwks.get("keys", []):
            if "kid" in key:
                JWKS_CACHE[key["kid"]] = key
    except Exception as e:
        raise JWTError(f"Failed to fetch public keys from Supabase: {str(e)}")
        
    if kid in JWKS_CACHE:
        return JWKS_CACHE[kid]
    raise JWTError(f"Signing key with kid '{kid}' not found in Supabase certs.")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> CurrentUser:
    """
    FastAPI dependency to verify the Supabase JWT token and load the user's details and role.
    Supports both ES256 (JWKS) and HS256 (JWT Secret).
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization credentials are required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        # Determine the signing algorithm from the header
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get("alg", "HS256")
        
        if alg == "ES256":
            # Asymmetric verification using JWKS (common on newer Supabase setups)
            kid = unverified_header.get("kid")
            if not kid:
                raise JWTError("ES256 token is missing 'kid' header claim.")
            key = get_jwk_by_kid(kid)
            payload = jwt.decode(
                token,
                key,
                algorithms=["ES256"],
                options={"verify_aud": False}
            )
        elif alg == "HS256":
            # Traditional symmetric verification using the JWT Secret
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        else:
            raise JWTError(f"Unsupported JWT algorithm: {alg}")
            
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    email = payload.get("email")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing the user ID (sub).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Check in-memory user cache with TTL to eliminate 2+ external network queries
    now = time.time()
    cached = USER_CACHE.get(user_id)
    if cached and cached[1] > now:
        return cached[0]

    # Check if the user is authenticated in Supabase Auth (via Phone OTP or Email)
    try:
        auth_user_res = supabase.auth.admin.get_user_by_id(user_id)
        auth_user = auth_user_res.user
        if not auth_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account not found.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        is_verified = bool(auth_user.email_confirmed_at or auth_user.phone_confirmed_at or auth_user.phone)
        if not is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="account_not_verified"
            )
    except HTTPException as he:
        raise he
    except Exception as e:
        # If user was deleted from Auth system but token is still active, return 401
        err_msg = str(e).lower()
        if "not found" in err_msg or "not_found" in err_msg or "404" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account no longer exists in authentication system.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user auth status: {str(e)}"
        )

    # Query public.users to fetch user's application-level role
    try:
        response = supabase.table("users").select("role, email").eq("id", user_id).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database lookup failed: {str(e)}"
        )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in application database.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_data = response.data[0]
    current_user = CurrentUser(
        id=UUID(user_id),
        email=user_data.get("email") or email or "",
        role=user_data.get("role")
    )
    # Save to user cache
    USER_CACHE[user_id] = (current_user, now + USER_CACHE_TTL)
    return current_user

def require_role(*allowed_roles: str):
    """
    Dependency factory to check if the current user has one of the required roles.
    Raises 403 Forbidden if the user's role is not authorized.
    """
    def role_dependency(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required role: one of {allowed_roles}."
            )
        return current_user
    return role_dependency

async def get_current_user_light(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> CurrentUser:
    """
    Lightweight auth dependency that verifies the JWT and email confirmation
    but does NOT require a public.users row to exist.
    Used for the ensure-google-user endpoint where the users row may not yet exist.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization credentials are required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get("alg", "HS256")
        
        if alg == "ES256":
            kid = unverified_header.get("kid")
            if not kid:
                raise JWTError("ES256 token is missing 'kid' header claim.")
            key = get_jwk_by_kid(kid)
            payload = jwt.decode(token, key, algorithms=["ES256"], options={"verify_aud": False})
        elif alg == "HS256":
            payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
        else:
            raise JWTError(f"Unsupported JWT algorithm: {alg}")
            
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    email = payload.get("email")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing the user ID (sub).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check email verification in Supabase Auth
    try:
        auth_user_res = supabase.auth.admin.get_user_by_id(user_id)
        auth_user = auth_user_res.user
        if not auth_user or not auth_user.email_confirmed_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="email_not_verified"
            )
    except HTTPException as he:
        raise he
    except Exception as e:
        err_msg = str(e).lower()
        if "not found" in err_msg or "not_found" in err_msg or "404" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account no longer exists in authentication system.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user auth status: {str(e)}"
        )

    # Try to get the role from public.users, but default to empty string if not found
    role = ""
    try:
        response = supabase.table("users").select("role, email").eq("id", user_id).execute()
        if response.data:
            user_data = response.data[0]
            role = user_data.get("role", "")
            email = user_data.get("email") or email
    except Exception:
        pass  # Users row may not exist yet for new Google OAuth users

    return CurrentUser(
        id=UUID(user_id),
        email=email or "",
        role=role
    )

async def get_current_user_phone_light(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> CurrentUser:
    """
    Lightweight auth dependency for phone-OTP authenticated users.
    Verifies the JWT and checks phone_confirmed_at (not email_confirmed_at).
    Does NOT require a public.users row to exist yet.
    Used by the ensure-user endpoint where phone OTP users may not have a users row.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization credentials are required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get("alg", "HS256")
        
        if alg == "ES256":
            kid = unverified_header.get("kid")
            if not kid:
                raise JWTError("ES256 token is missing 'kid' header claim.")
            key = get_jwk_by_kid(kid)
            payload = jwt.decode(token, key, algorithms=["ES256"], options={"verify_aud": False})
        elif alg == "HS256":
            payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
        else:
            raise JWTError(f"Unsupported JWT algorithm: {alg}")
            
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    email = payload.get("email")
    phone = payload.get("phone")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing the user ID (sub).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check phone verification in Supabase Auth
    try:
        auth_user_res = supabase.auth.admin.get_user_by_id(user_id)
        auth_user = auth_user_res.user
        if not auth_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account not found.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Accept if phone is confirmed OR email is confirmed (covers both flows)
        is_verified = bool(auth_user.phone_confirmed_at or auth_user.email_confirmed_at or auth_user.phone)
        if not is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="phone_not_verified"
            )
    except HTTPException as he:
        raise he
    except Exception as e:
        err_msg = str(e).lower()
        if "not found" in err_msg or "not_found" in err_msg or "404" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account no longer exists in authentication system.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user auth status: {str(e)}"
        )

    # Try to get the role from public.users, but default to empty string if not found
    role = ""
    try:
        response = supabase.table("users").select("role, email").eq("id", user_id).execute()
        if response.data:
            user_data = response.data[0]
            role = user_data.get("role", "")
            email = user_data.get("email") or email
    except Exception:
        pass  # Users row may not exist yet for new phone OTP users

    return CurrentUser(
        id=UUID(user_id),
        email=email or "",
        role=role
    )
