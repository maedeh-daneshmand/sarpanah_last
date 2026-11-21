from datetime import datetime, date
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
import enum
from sqlalchemy import (
    Integer,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
    Enum,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.unit import Unit
    from app.models.coupon import Coupon
    from app.models.payment import Payment
    from app.models.review import Review
    from app.models.message import Message


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    REJECTED = "rejected"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guest_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey("units.id", ondelete="RESTRICT"), nullable=False, index=True)
    coupon_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("coupons.id", ondelete="SET NULL"), nullable=True, index=True)

    check_in: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    check_out: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    guests_count: Mapped[int] = mapped_column(Integer, nullable=False)
    nights: Mapped[int] = mapped_column(Integer, nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    cleaning_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    service_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status_enum", values_callable=lambda x: [e.value for e in x]),
        default=BookingStatus.PENDING,
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    guest: Mapped["User"] = relationship("User", back_populates="bookings")
    unit: Mapped["Unit"] = relationship("Unit", back_populates="bookings")
    coupon: Mapped[Optional["Coupon"]] = relationship("Coupon", back_populates="bookings")
    booking_nights: Mapped[List["BookingNight"]] = relationship(
        "BookingNight", back_populates="booking", cascade="all, delete-orphan"
    )
    payments: Mapped[List["Payment"]] = relationship(
        "Payment", back_populates="booking", cascade="all, delete-orphan"
    )
    review: Mapped[Optional["Review"]] = relationship(
        "Review", back_populates="booking", uselist=False, cascade="all, delete-orphan"
    )
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="booking")


class BookingNight(Base):
    __tablename__ = "booking_nights"
    __table_args__ = (
        UniqueConstraint("unit_id", "night", name="uq_unit_night_active"),
    )

    booking_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("bookings.id", ondelete="CASCADE"), primary_key=True
    )
    unit_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("units.id", ondelete="CASCADE"), nullable=False, index=True
    )
    night: Mapped[date] = mapped_column(Date, primary_key=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="booking_nights")
    unit: Mapped["Unit"] = relationship("Unit", back_populates="booking_nights")
