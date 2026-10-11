from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.dependencies import get_db, get_current_active_user
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.auth import LoginRequest, AuthResponse, LoginResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Register a new user.
    """
    user = AuthService.register_user(db, user_in)
    return AuthResponse(
        message="Registration successful",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=LoginResponse)
def login(
    response: Response,
    db: Session = Depends(get_db),
    login_data: LoginRequest = None,
) -> Any:
    """
    Login user.
    """
    user = AuthService.authenticate(db, login_data=login_data)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id, role=user.role, expires_delta=access_token_expires
    )
    
    # Set secure HTTP-only cookie
    secure_cookie = getattr(settings, "ENVIRONMENT", "development") == "production"
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        secure=secure_cookie,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }

@router.post("/logout")
def logout(response: Response) -> Any:
    """
    Logout user (clear cookie).
    """
    response.delete_cookie("access_token")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current logged in user.
    """
    return current_user
