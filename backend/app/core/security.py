import hmac
import hashlib
import base64
import json
import time
from typing import Optional, Dict, Any
import bcrypt
from app.core.config import settings

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64url_decode(s: str) -> bytes:
    padding = '=' * (4 - (len(s) % 4)) if len(s) % 4 != 0 else ''
    return base64.urlsafe_b64decode(s + padding)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[int] = None) -> str:
    payload = data.copy()
    expire_seconds = expires_delta if expires_delta else (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    payload["exp"] = int(time.time()) + expire_seconds
    payload["iat"] = int(time.time())
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_str = _b64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_str = _b64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{header_str}.{payload_str}".encode('utf-8')
    signature = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_str = _b64url_encode(signature)
    
    return f"{header_str}.{payload_str}.{sig_str}"

def decode_access_token(token: str) -> Dict[str, Any]:
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid token format")
    header_str, payload_str, sig_str = parts
    
    signing_input = f"{header_str}.{payload_str}".encode('utf-8')
    expected_sig = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(_b64url_encode(expected_sig), sig_str):
        raise ValueError("Invalid signature")
        
    payload = json.loads(_b64url_decode(payload_str))
    if payload.get("exp", 0) < time.time():
        raise ValueError("Token has expired")
        
    return payload
