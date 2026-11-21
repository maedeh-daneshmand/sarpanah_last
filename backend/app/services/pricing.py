from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Tuple, List, Optional
from sqlalchemy.orm import Session
from app.models.unit import Unit, UnitPriceCalendar
from app.models.coupon import Coupon
from app.core.exceptions import BadRequestException, NotFoundException


class PricingService:
    @staticmethod
    def calculate_booking_price(
        db: Session,
        unit: Unit,
        check_in: date,
        check_out: date,
        coupon_code: Optional[str] = None,
    ) -> Tuple[Decimal, Decimal, Decimal, Decimal, Decimal, List[Tuple[date, Decimal]], Optional[Coupon]]:
        today = date.today()
        if check_in < today:
            raise BadRequestException("Check-in date cannot be in the past.")
        if check_out <= check_in:
            raise BadRequestException("Check-out date must be strictly after check-in date.")

        nights = (check_out - check_in).days
        if nights <= 0:
            raise BadRequestException("Booking must be for at least one night.")

        # Query all calendar entries for this unit in the date range
        calendar_entries = (
            db.query(UnitPriceCalendar)
            .filter(
                UnitPriceCalendar.unit_id == unit.id,
                UnitPriceCalendar.day >= check_in,
                UnitPriceCalendar.day < check_out,
            )
            .all()
        )
        calendar_map = {entry.day: entry for entry in calendar_entries}

        subtotal = Decimal("0.00")
        night_prices: List[Tuple[date, Decimal]] = []

        curr = check_in
        while curr < check_out:
            if curr in calendar_map:
                entry = calendar_map[curr]
                if entry.is_blocked:
                    raise BadRequestException(f"The date {curr} is blocked and unavailable for booking.")
                night_price = entry.price
            else:
                night_price = unit.base_price_per_night

            subtotal += night_price
            night_prices.append((curr, night_price))
            curr += timedelta(days=1)

        cleaning_fee = unit.cleaning_fee or Decimal("0.00")
        # Standard service fee: 5% of subtotal
        service_fee = (subtotal * Decimal("0.05")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Apply coupon if provided
        discount_amount = Decimal("0.00")
        applied_coupon: Optional[Coupon] = None

        if coupon_code:
            coupon = db.query(Coupon).filter(Coupon.code == coupon_code.strip()).first()
            if not coupon:
                raise NotFoundException("Coupon", coupon_code)
            
            # Check validity dates
            if today < coupon.valid_from or today > coupon.valid_to:
                raise BadRequestException(f"Coupon '{coupon.code}' is expired or not yet valid.")
            
            # Check usage limit
            if coupon.usage_limit is not None and len(coupon.bookings) >= coupon.usage_limit:
                raise BadRequestException(f"Coupon '{coupon.code}' has reached its maximum usage limit.")

            discount_amount = (subtotal * (coupon.discount_percent / Decimal("100.00"))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            applied_coupon = coupon

        total_price = subtotal + cleaning_fee + service_fee - discount_amount
        if total_price < Decimal("0.00"):
            total_price = Decimal("0.00")

        return subtotal, cleaning_fee, service_fee, discount_amount, total_price, night_prices, applied_coupon
