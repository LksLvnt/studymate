import base64
import json
from fastapi import Request
from slowapi import Limiter


def get_user_key(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            payload = auth.split(".")[1]
            payload += "=" * (4 - len(payload) % 4)
            data = json.loads(base64.b64decode(payload))
            return data.get("sub", "anonymous")
        except Exception:
            pass
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=get_user_key)