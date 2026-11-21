from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.models.unit import Unit
from app.models.property import Property, PropertyStatus
from app.models.booking import Booking, BookingNight, BookingStatus
from app.schemas.booking import BookingCreate
from app.services.pricing import PricingService
from app.core.exceptions import (
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
)


class BookingService:
    @staticmethod
    def create_booking(db: Session, guest: User, booking_in: BookingCreate) -> Booking:
        # Load unit with row-level lock or property relationship
        unit = db.query(Unit).filter(Unit.id == booking_in.unit_id).first()
        if not unit:
            raise NotFoundException("Unit", booking_in.unit_id)

        if not unit.is_active:
            raise BadRequestException("This accommodation unit is currently inactive.")

        if unit.property.status != PropertyStatus.ACTIVE:
            raise BadRequestException("This property is currently not active.")

        if unit.property.host_id == guest.id:
            raise ForbiddenException("Hosts cannot book their own property.")

        if booking_in.guests_count > unit.max_guests:
            raise BadRequestException(
                f"Number of guests ({booking_in.guests_count}) exceeds unit capacity ({unit.max_guests})."
            )

        # Calculate pricing and night details
        subtotal, cleaning_fee, service_fee, discount_amount, total_price, night_prices, coupon = (
            PricingService.calculate_booking_price(
                db=db,
                unit=unit,
                check_in=booking_in.check_in,
                check_out=booking_in.check_out,
                coupon_code=booking_in.coupon_code,
            )
        )

        nights_dates = [night for night, _ in night_prices]

        # Check existing active booking nights
        existing_booked_nights = (
            db.query(BookingNight)
            .filter(
                BookingNight.unit_id == unit.id,
                BookingNight.night.in_(nights_dates),
            )
            .all()
        )
        if existing_booked_nights:
            conflict_dates = ", ".join(str(bn.night) for bn in existing_booked_nights)
            raise ConflictException(f"The unit is already booked for the following date(s): {conflict_dates}")

        # Create Booking
        booking = Booking(
            guest_id=guest.id,
            unit_id=unit.id,
            coupon_id=coupon.id if coupon else None,
            check_in=booking_in.check_in,
            check_out=booking_in.check_out,
            guests_count=booking_in.guests_count,
            nights=len(night_prices),
            subtotal=subtotal,
            cleaning_fee=cleaning_fee,
            service_fee=service_fee,
            discount_amount=discount_amount,
            total_price=total_price,
            status=BookingStatus.PENDING,
        )
        db.add(booking)
        db.flush()  # Obtain booking.id

        # Insert BookingNight records
        try:
            for night, price in night_prices:
                bn = BookingNight(
                    booking_id=booking.id,
                    unit_id=unit.id,
                    night=night,
                    price=price,
                )
                db.add(bn)
            db.commit()
        except IntegrityError as e:
            db.rollback()
            raise ConflictException("A concurrent reservation locked one or more of these dates. Please try again.")

        db.refresh(booking)
        return booking
