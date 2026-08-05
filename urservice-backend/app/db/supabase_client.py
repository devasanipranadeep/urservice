import httpx
from supabase import create_client, Client
from app.core.config import settings

# Service role client that bypasses Row-Level Security (RLS).
# Used for all backend-driven actions, queries, and storage operations.
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
)

# Disable HTTP/2 connection pooling for all Supabase sub-clients
# to prevent "Server disconnected" RemoteProtocolErrors when Supabase recycles idle HTTP/2 connections.
for client_attr in ["postgrest", "storage"]:
    client_obj = getattr(supabase, client_attr, None)
    if client_obj and hasattr(client_obj, "session"):
        client_obj.session._transport = httpx.HTTPTransport(http2=False)

if hasattr(supabase, "auth") and hasattr(supabase.auth, "_http_client"):
    supabase.auth._http_client._transport = httpx.HTTPTransport(http2=False)

if hasattr(supabase, "functions") and hasattr(supabase.functions, "_client"):
    supabase.functions._client._transport = httpx.HTTPTransport(http2=False)
