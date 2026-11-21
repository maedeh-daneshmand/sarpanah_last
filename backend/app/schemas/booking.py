from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.booking import BookingStatus


class BookingNightResponse(BaseModel):
    booking_id: int
    unit_id: int
    night: date
    price: Decimal

    model_config = ConfigDict(from_attributes=True)


class BookingQuoteRequest(BaseModel):
    unit_id: int
    check_in: date
    check_out: date
    guests_count: int = Field(..., gt=0)
    coupon_code: Optional[str] = None


class BookingQuoteResponse(BaseModel):
    unit_id: int
    check_in: date
    check_out: date
    nights: int
    subtotal: Decimal
    cleaning_fee: Decimal
    service_fee: Decimal
    discount_amount: Decimal
    total_price: Decimal


class BookingCreate(BaseModel):
    unit_id: int
    check_in: date
    check_out: date
    guests_count: int = Field(..., gt=0)
    coupon_code: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    guest_id: int
    unit_id: int
    coupon_id: Optional[int] = None
    check_in: date
    check_out: date
    guests_count: int
    nights: int
    subtotal: Decimal
    cleaning_fee: Decimal
    service_fee: Decimal
    discount_amount: Decimal
    total_price: Decimal
    status: BookingStatus
    created_at: datetime
    cancelled_at: Optional[datetime] = None
    booking_nights: Optional[List[BookingNightResponse]] = None

    model_config = ConfigDict(from_attributes=True)
