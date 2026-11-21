from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None


# Public registration schema - role cannot be chosen by caller
class UserCreate(UserBase):
    password: str


# Admin creation schema - allows setting role and active status
class UserAdminCreate(UserBase):
    password: str
    role: UserRole = UserRole.GUEST
    is_active: bool = True


# User self-update schema - cannot alter role or is_active
class UserSelfUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None


# Admin user update schema - can alter role and is_active
class UserAdminUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


# Backward-compatible alias
UserUpdate = UserSelfUpdate


# Private response (for current user /me and admin)
class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Public response (for other users viewing a profile/host)
class UserPublicResponse(BaseModel):
    id: int
    full_name: str
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
