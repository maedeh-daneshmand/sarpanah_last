from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exceptions import ConflictException, UnauthorizedException, BadRequestException


class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        # Check email uniqueness
        existing_email = db.query(User).filter(User.email == user_in.email).first()
        if existing_email:
            raise ConflictException(f"User with email '{user_in.email}' already exists.")
        
        # Check phone uniqueness if provided
        if user_in.phone:
            existing_phone = db.query(User).filter(User.phone == user_in.phone).first()
            if existing_phone:
                raise ConflictException(f"User with phone '{user_in.phone}' already exists.")

        hashed_password = get_password_hash(user_in.password)
        # CRITICAL SECURITY FIX: Public registrations always receive GUEST role
        user = User(
            full_name=user_in.full_name,
            email=user_in.email,
            phone=user_in.phone,
            password_hash=hashed_password,
            role=UserRole.GUEST,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise UnauthorizedException("Incorrect email or password")
        if not verify_password(password, user.password_hash):
            raise UnauthorizedException("Incorrect email or password")
        if not user.is_active:
            raise UnauthorizedException("Inactive user account")
        return user
