from typing import Generator
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise UnauthorizedException("Invalid authentication credentials")
    
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedException("Token missing subject claim")
    
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise UnauthorizedException("Invalid token subject")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UnauthorizedException("User no longer exists")
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise ForbiddenException("Inactive user account")
    return current_user


def get_current_host(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if current_user.role not in [UserRole.HOST, UserRole.ADMIN]:
        raise ForbiddenException("User does not have host privileges")
    return current_user


def get_current_admin(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise ForbiddenException("Administrator privileges required")
    return current_user
