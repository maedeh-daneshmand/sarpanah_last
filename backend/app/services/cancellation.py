from datetime import date, datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Tuple
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.booking import Booking, BookingNight, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.models.property import CancellationPolicy
from app.core.exceptions import NotFoundException, BadRequestException, ForbiddenException


class CancellationService:
    @staticmethod
    def calculate_refund(booking: Booking) -> Tuple[Decimal, Decimal]:
        today = date.today()
        policy: CancellationPolicy = booking.unit.property.cancellation_policy

        days_until_checkin = (booking.check_in - today).days

        if days_until_checkin >= policy.free_cancel_days:
            # 100% refund within free cancellation window
            refund_amount = booking.total_price
            penalty_amount = Decimal("0.00")
        else:
            # Apply policy refund percentage
            refund_amount = (booking.total_price * (policy.refund_percent / Decimal("100.00"))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            penalty_amount = booking.total_price - refund_amount

        return refund_amount, penalty_amount

    @staticmethod
    def cancel_booking(db: Session, booking_id: int, user: User) -> Tuple[Booking, Decimal, Decimal]:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise NotFoundException("Booking", booking_id)

        # Authorization: Guest who booked, Host of property, or Admin
        is_guest = booking.guest_id == user.id
        is_host = booking.unit.property.host_id == user.id
        is_admin = user.role == UserRole.ADMIN

        if not (is_guest or is_host or is_admin):
            raise ForbiddenException("You are not authorized to cancel this booking.")

        if booking.status == BookingStatus.CANCELLED:
            raise BadRequestException("Booking is already cancelled.")

        if booking.status == BookingStatus.COMPLETED:
            raise BadRequestException("Cannot cancel a completed booking.")

        refund_amount, penalty_amount = CancellationService.calculate_refund(booking)

        # 1. Update Booking status and timestamp
        booking.status = BookingStatus.CANCELLED
        booking.cancelled_at = datetime.now(timezone.utc)

        # 2. Release locked nights from booking_nights table
        db.query(BookingNight).filter(BookingNight.booking_id == booking.id).delete()

        # 3. Update any successful payments to REFUNDED if guest is cancelling
        for payment in booking.payments:
            if payment.status == PaymentStatus.SUCCESSFUL:
                payment.status = PaymentStatus.REFUNDED

        db.commit()
        db.refresh(booking)
        return booking, refund_amount, penalty_amount
