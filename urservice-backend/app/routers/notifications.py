from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID
from typing import List, Optional, Dict, Tuple
import time

from app.core.security import get_current_user, CurrentUser
from app.db.supabase_client import supabase
from app.schemas.notification import NotificationResponse, NotificationFeedResponse, UnreadCountResponse

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

# In-memory unread count cache: user_id -> (count, expiry)
UNREAD_COUNT_CACHE: Dict[str, Tuple[int, float]] = {}
UNREAD_COUNT_TTL = 15.0  # 15 seconds

def invalidate_unread_count(user_id: UUID | str):
    """Invalidate cached count so read actions reflect immediately."""
    UNREAD_COUNT_CACHE.pop(str(user_id), None)


@router.get("/me", response_model=NotificationFeedResponse)
def get_my_notifications(
    unread_only: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Fetch paginated notifications belonging to the authenticated caller, ordered newest first.
    """
    query = supabase.table("notifications").select("*", count="exact").eq("user_id", str(current_user.id))
    
    if unread_only:
        query = query.eq("is_read", False)
        
    query = query.order("created_at", desc=True)
    
    start = (page - 1) * page_size
    end = start + page_size - 1
    query = query.range(start, end)
    
    res = query.execute()
    
    items = []
    for n in (res.data or []):
        items.append(
            NotificationResponse(
                id=n["id"],
                user_id=n["user_id"],
                title=n["title"],
                message=n["message"],
                is_read=n["is_read"],
                created_at=n["created_at"]
            )
        )
        
    total = res.count or 0
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    
    return NotificationFeedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.patch("/{id}/read", response_model=NotificationResponse)
def mark_notification_as_read(id: UUID, current_user: CurrentUser = Depends(get_current_user)):
    """
    Marks a specific notification as read, enforcing owner validation.
    """
    # 1. Fetch notification
    notif_res = supabase.table("notifications").select("*").eq("id", str(id)).execute()
    if not notif_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )
        
    notif = notif_res.data[0]
    
    # 2. Enforce ownership verification
    if notif["user_id"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted. You do not own this notification."
        )
        
    # 3. Perform update
    update_res = supabase.table("notifications").update({"is_read": True}).eq("id", str(id)).execute()
    if not update_res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification status."
        )
        
    invalidate_unread_count(current_user.id)
    n = update_res.data[0]
    return NotificationResponse(
        id=n["id"],
        user_id=n["user_id"],
        title=n["title"],
        message=n["message"],
        is_read=n["is_read"],
        created_at=n["created_at"]
    )

@router.patch("/me/read-all")
def mark_all_notifications_as_read(current_user: CurrentUser = Depends(get_current_user)):
    """
    Marks all notifications belonging to the caller as read.
    """
    supabase.table("notifications").update({"is_read": True}).eq("user_id", str(current_user.id)).execute()
    invalidate_unread_count(current_user.id)
    return {"status": "success", "message": "All notifications marked as read."}

@router.get("/me/unread-count", response_model=UnreadCountResponse)
def get_unread_count(current_user: CurrentUser = Depends(get_current_user)):
    """
    Returns the count of unread notifications for the caller.
    """
    user_key = str(current_user.id)
    now = time.time()
    cached = UNREAD_COUNT_CACHE.get(user_key)
    if cached and cached[1] > now:
        return UnreadCountResponse(count=cached[0])

    res = supabase.table("notifications").select("id", count="exact").eq("user_id", user_key).eq("is_read", False).execute()
    count = res.count or 0
    UNREAD_COUNT_CACHE[user_key] = (count, now + UNREAD_COUNT_TTL)
    return UnreadCountResponse(count=count)
