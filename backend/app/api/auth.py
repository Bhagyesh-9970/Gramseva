from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.db.models import User, Village
from app.core.security import verify_password, create_access_token, decode_access_token
from app.schemas.schemas import UserLogin, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authorization header")
    token = authorization.split(" ")[1]
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
        return user
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token verification error: {str(e)}")

@router.post("/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    
    village_name = user.village.name if user.village else "All Villages / District"
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "phone": user.phone,
            "village_id": user.village_id,
            "village_name": village_name
        }
    }

@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    users = db.query(User).all()
    accounts = []
    for u in users:
        v_name = u.village.name if u.village else "District Level (All Villages)"
        # Pre-generate token for one-click demo login
        quick_token = create_access_token({"sub": u.id, "email": u.email, "role": u.role})
        accounts.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "phone": u.phone,
            "village_id": u.village_id,
            "village_name": v_name,
            "demo_password": "password123",
            "quick_token": quick_token
        })
    return accounts

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    v_name = current_user.village.name if current_user.village else "All Villages / District"
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "phone": current_user.phone,
        "village_id": current_user.village_id,
        "village_name": v_name
    }
