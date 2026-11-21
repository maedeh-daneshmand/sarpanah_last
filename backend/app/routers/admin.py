from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.booking import Booking, BookingStatus
from app.models.property import PropertyType, CancellationPolicy
from app.models.coupon import Coupon
from app.schemas.user import UserResponse, UserAdminUpdate, UserAdminCreate
from app.schemas.booking import BookingResponse
from app.schemas.property import (
    PropertyTypeCreate,
    PropertyTypeResponse,
    CancellationPolicyCreate,
    CancellationPolicyResponse,
)
from app.schemas.coupon import CouponCreate, CouponResponse
from app.dependencies.auth import get_current_admin
from app.core.exceptions import NotFoundException, ConflictException
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["Admin"])


# User Management
@router.get("/users", response_model=List[UserResponse])
def admin_get_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.offset(skip).limit(limit).all()


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def admin_create_user(
    user_in: UserAdminCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Admin-only endpoint to provision users with explicit roles (guest, host, admin)."""
    existing_email = db.query(User).filter(User.email == user_in.email).first()
    if existing_email:
        raise ConflictException(f"User with email '{user_in.email}' already exists.")
    if user_in.phone:
        existing_phone = db.query(User).filter(User.phone == user_in.phone).first()
        if existing_phone:
            raise ConflictException(f"User with phone '{user_in.phone}' already exists.")

    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
        is_active=user_in.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
def admin_update_user(
    user_id: int,
    user_in: UserAdminUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Admin-only endpoint to alter roles, active status, or user details."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User", user_id)

    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.phone is not None:
        if user_in.phone != user.phone:
            existing_phone = db.query(User).filter(User.phone == user_in.phone).first()
            if existing_phone:
                raise ConflictException(f"Phone '{user_in.phone}' is already in use.")
            user.phone = user_in.phone

    db.commit()
    db.refresh(user)
    return user


# Booking Oversight
@router.get("/bookings", response_model=List[BookingResponse])
def admin_get_bookings(
    status_filter: Optional[BookingStatus] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Booking)
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    return query.order_by(Booking.created_at.desc()).all()


# Property Types
@router.post("/property-types", response_model=PropertyTypeResponse, status_code=status.HTTP_201_CREATED)
def admin_create_property_type(
    type_in: PropertyTypeCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    existing = db.query(PropertyType).filter(PropertyType.name == type_in.name).first()
    if existing:
        raise ConflictException(f"Property type '{type_in.name}' already exists.")
    ptype = PropertyType(name=type_in.name)
    db.add(ptype)
    db.commit()
    db.refresh(ptype)
    return ptype


@router.get("/property-types", response_model=List[PropertyTypeResponse])
def get_property_types(db: Session = Depends(get_db)):
    return db.query(PropertyType).all()


# Cancellation Policies
@router.post("/cancellation-policies", response_model=CancellationPolicyResponse, status_code=status.HTTP_201_CREATED)
def admin_create_cancellation_policy(
    policy_in: CancellationPolicyCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    existing = db.query(CancellationPolicy).filter(CancellationPolicy.name == policy_in.name).first()
    if existing:
        raise ConflictException(f"Cancellation policy '{policy_in.name}' already exists.")
    policy = CancellationPolicy(
        name=policy_in.name,
        free_cancel_days=policy_in.free_cancel_days,
        refund_percent=policy_in.refund_percent,
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.get("/cancellation-policies", response_model=List[CancellationPolicyResponse])
def get_cancellation_policies(db: Session = Depends(get_db)):
    return db.query(CancellationPolicy).all()


# Coupons
@router.post("/coupons", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def admin_create_coupon(
    coupon_in: CouponCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    existing = db.query(Coupon).filter(Coupon.code == coupon_in.code).first()
    if existing:
        raise ConflictException(f"Coupon '{coupon_in.code}' already exists.")

    coupon = Coupon(
        code=coupon_in.code.upper(),
        discount_percent=coupon_in.discount_percent,
        valid_from=coupon_in.valid_from,
        valid_to=coupon_in.valid_to,
        usage_limit=coupon_in.usage_limit,
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.get("/coupons", response_model=List[CouponResponse])
def admin_get_coupons(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return db.query(Coupon).all()
