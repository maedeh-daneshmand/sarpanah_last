from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import AuthService
from app.core.security import create_access_token
from app.dependencies.auth import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (guest, host, or admin)."""
    return AuthService.register_user(db=db, user_in=user_in)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible login endpoint (username is user email)."""
    user = AuthService.authenticate(db=db, email=form_data.username, password=form_data.password)
    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer")


@router.post("/login-json", response_model=Token)
def login_json(login_in: LoginRequest, db: Session = Depends(get_db)):
    """JSON-based login endpoint for clients."""
    user = AuthService.authenticate(db=db, email=login_in.email, password=login_in.password)
    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    """Get profile information for currently authenticated user."""
    return current_user
