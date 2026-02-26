from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from app.core.config import get_settings

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify the Supabase JWT by calling Supabase's auth API."""
    settings = get_settings()

    print(f"[AUTH DEBUG] Supabase URL: {settings.supabase_url}")
    print(f"[AUTH DEBUG] Anon key starts with: {settings.supabase_anon_key[:20]}...")
    print(f"[AUTH DEBUG] Token starts with: {credentials.credentials[:20]}...")

    if not settings.supabase_url:
        return {"sub": "dev-user", "email": "dev@localhost"}

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.supabase_url}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {credentials.credentials}",
                "apikey": settings.supabase_anon_key,
            },
        )

    print(f"[AUTH DEBUG] Supabase response status: {response.status_code}")
    print(f"[AUTH DEBUG] Supabase response body: {response.text[:200]}")

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_data = response.json()
    return {
        "sub": user_data.get("id", ""),
        "email": user_data.get("email", ""),
    }