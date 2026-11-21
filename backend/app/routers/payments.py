from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.payment import Payment
from app.models.booking import Booking
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payment import PaymentService
from app.dependencies.auth import get_current_active_user
from app.models.user import User, UserRole
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def make_payment(
    payment_in: PaymentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Processes simulated payment for a pending reservation."""
    return PaymentService.process_payment(db=db, user=current_user, payment_in=payment_in)


@router.get("/booking/{booking_id}", response_model=List[PaymentResponse])
def get_booking_payments(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise NotFoundException("Booking", booking_id)

    is_guest = booking.guest_id == current_user.id
    is_host = booking.unit.property.host_id == current_user.id
    is_admin = current_user.role == UserRole.ADMIN

    if not (is_guest or is_host or is_admin):
        raise ForbiddenException("You are not authorized to view payments for this booking.")

    return db.query(Payment).filter(Payment.booking_id == booking_id).order_by(Payment.created_at.desc()).all()
