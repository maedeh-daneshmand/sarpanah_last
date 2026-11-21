from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.unit import Unit
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingQuoteRequest,
    BookingQuoteResponse,
)
from app.services.booking import BookingService
from app.services.pricing import PricingService
from app.services.cancellation import CancellationService
from app.dependencies.auth import get_current_active_user
from app.models.user import User, UserRole
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/quote", response_model=BookingQuoteResponse)
def get_booking_quote(
    quote_in: BookingQuoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Calculates full pricing breakdown for a tentative stay without creating a booking."""
    unit = db.query(Unit).filter(Unit.id == quote_in.unit_id).first()
    if not unit:
        raise NotFoundException("Unit", quote_in.unit_id)

    subtotal, cleaning_fee, service_fee, discount_amount, total_price, night_prices, _ = (
        PricingService.calculate_booking_price(
            db=db,
            unit=unit,
            check_in=quote_in.check_in,
            check_out=quote_in.check_out,
            coupon_code=quote_in.coupon_code,
        )
    )

    return BookingQuoteResponse(
        unit_id=unit.id,
        check_in=quote_in.check_in,
        check_out=quote_in.check_out,
        nights=len(night_prices),
        subtotal=subtotal,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        discount_amount=discount_amount,
        total_price=total_price,
    )


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Reserves an accommodation unit for specific dates, atomically locking nights."""
    return BookingService.create_booking(db=db, guest=current_user, booking_in=booking_in)


@router.get("/", response_model=List[BookingResponse])
def get_user_bookings(
    role_view: Optional[str] = Query("guest", description="'guest' for my reservations, 'host' for my properties"),
    status_filter: Optional[BookingStatus] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Lists bookings for the authenticated user."""
    query = db.query(Booking)

    if role_view == "host" and current_user.role in [UserRole.HOST, UserRole.ADMIN]:
        query = query.join(Booking.unit).join(Unit.property).filter(Unit.property.has(host_id=current_user.id))
    else:
        query = query.filter(Booking.guest_id == current_user.id)

    if status_filter:
        query = query.filter(Booking.status == status_filter)

    return query.order_by(Booking.created_at.desc()).all()


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
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
        raise ForbiddenException("You are not authorized to view this booking.")

    return booking


@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Cancels a booking according to its property cancellation policy and frees the reserved nights."""
    booking, refund, penalty = CancellationService.cancel_booking(
        db=db, booking_id=booking_id, user=current_user
    )
    return {
        "message": "Booking successfully cancelled",
        "booking_id": booking.id,
        "status": booking.status,
        "refund_amount": refund,
        "penalty_amount": penalty,
        "cancelled_at": booking.cancelled_at,
    }
