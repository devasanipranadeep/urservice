from fastapi import APIRouter, Depends
from app.core.security import require_role, CurrentUser

router = APIRouter(prefix="/api/test", tags=["test"])

@router.get("/admin-only")
def admin_only_test(current_user: CurrentUser = Depends(require_role("admin"))):
    """
    Test endpoint restricted to admins only.
    """
    return {
        "status": "success",
        "message": "Welcome, Admin!",
        "admin_id": current_user.id
    }

@router.get("/error")
def trigger_error():
    """
    Intentionally trigger a ZeroDivisionError to verify the 500 error handler.
    """
    raise ZeroDivisionError("division by zero")
