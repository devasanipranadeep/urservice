from fastapi import FastAPI, Depends, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import re

from app.routers.test_auth_role import router as test_router
from app.routers.profiles import router as profiles_router
from app.routers.bookings import router as bookings_router
from app.routers.vendors import router as vendors_router
from app.routers.services import router as services_router
from app.routers.admin import router as admin_router
from app.routers.notifications import router as notifications_router
from app.core.config import settings
from app.core.security import get_current_user, CurrentUser

logger = logging.getLogger("app")

app = FastAPI(
    title="UrService Backend",
    description="Python FastAPI backend for UrService, integrating with Supabase Auth, Postgres, and Storage.",
    version="1.0.0"
)

# CORS configuration: Allow localhost, production Vercel frontend, and preview deployments
origins = [
    settings.FRONTEND_URL,
    settings.FRONTEND_URL.rstrip("/"),
    "https://urservice.vercel.app",
    "https://urservice.vercel.app/",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

origin_regex = r"^https:\/\/.*(urservice.*\.vercel\.app|localhost:\d+|127\.0\.0\.1:\d+)"

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

def get_cors_headers(request: Request) -> dict:
    origin = request.headers.get("origin")
    if not origin:
        return {}
    clean_origin = origin.rstrip("/")
    if (
        origin in origins
        or clean_origin in origins
        or "localhost" in origin
        or "127.0.0.1" in origin
        or re.match(origin_regex, origin)
    ):
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Vary": "Origin",
        }
    return {}

@app.exception_handler(StarletteHTTPException)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    headers = dict(exc.headers) if getattr(exc, "headers", None) else {}
    cors_headers = get_cors_headers(request)
    headers.update(cors_headers)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Request validation failed: {exc.errors()}")
    headers = get_cors_headers(request)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Request validation failed.", "errors": exc.errors()},
        headers=headers
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception occurred: {str(exc)}", exc_info=True)
    headers = get_cors_headers(request)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
        headers=headers
    )

app.include_router(test_router)
app.include_router(profiles_router)
app.include_router(bookings_router)
app.include_router(vendors_router)
app.include_router(services_router)
app.include_router(admin_router)
app.include_router(notifications_router)


@app.get("/health")
def health_check():
    """
    Public health check endpoint.
    """
    return {"status": "ok"}

@app.get("/me", response_model=CurrentUser)
def get_me(current_user: CurrentUser = Depends(get_current_user)):
    """
    Authenticated endpoint to fetch current user's profile information and role.
    """
    return current_user
