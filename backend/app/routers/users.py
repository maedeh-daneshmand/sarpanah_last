from typing import Union
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserPublicResponse, UserSelfUpdate
from app.dependencies.auth import get_current_active_user, get_current_admin
from app.core.exceptions import NotFoundException, ConflictException
from app.core.security import get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_active_user)):
    """Retrieve private profile of the currently logged in user."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_in: UserSelfUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update profile information for the current user. Role and active status cannot be modified here."""
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.phone is not None:
        if user_in.phone != current_user.phone:
            exists = db.query(User).filter(User.phone == user_in.phone).first()
            if exists:
                raise ConflictException("Phone number is already registered by another user.")
            current_user.phone = user_in.phone
    if user_in.password is not None:
        current_user.password_hash = get_password_hash(user_in.password)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=Union[UserResponse, UserPublicResponse])
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieve user by ID.
    If the caller is the user themselves or an admin, returns full profile including contact details.
    For all other users, returns sanitized public profile to prevent data scraping.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User", user_id)

    # Privacy check: full details only for self or admin
    if current_user.id == user.id or current_user.role == UserRole.ADMIN:
        return UserResponse.model_validate(user)
    
    return UserPublicResponse.model_validate(user)
