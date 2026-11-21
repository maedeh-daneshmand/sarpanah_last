import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.schemas.payment import PaymentCreate
from app.core.exceptions import (
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
)


class PaymentService:
    @staticmethod
    def process_payment(db: Session, user: User, payment_in: PaymentCreate) -> Payment:
        booking = db.query(Booking).filter(Booking.id == payment_in.booking_id).first()
        if not booking:
            raise NotFoundException("Booking", payment_in.booking_id)

        if booking.guest_id != user.id:
            raise ForbiddenException("Only the guest who made this reservation can pay for it.")

        if booking.status == BookingStatus.CANCELLED:
            raise BadRequestException("Cannot pay for a cancelled booking.")

        if booking.status in [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]:
            raise ConflictException("This booking has already been paid and confirmed.")

        # Check if there is already an active successful payment
        existing_paid = (
            db.query(Payment)
            .filter(
                Payment.booking_id == booking.id,
                Payment.status == PaymentStatus.SUCCESSFUL,
            )
            .first()
        )
        if existing_paid:
            raise ConflictException("Payment for this reservation has already been recorded.")

        # Create Payment
        payment = Payment(
            booking_id=booking.id,
            amount=booking.total_price,
            method=payment_in.method,
            status=PaymentStatus.PENDING,
        )
        db.add(payment)
        db.flush()

        if payment_in.simulate_success:
            payment.status = PaymentStatus.SUCCESSFUL
            payment.paid_at = datetime.now(timezone.utc)
            payment.transaction_ref = f"SAR-{uuid.uuid4().hex[:12].upper()}"
            booking.status = BookingStatus.CONFIRMED
        else:
            payment.status = PaymentStatus.FAILED

        db.commit()
        db.refresh(payment)
        return payment
