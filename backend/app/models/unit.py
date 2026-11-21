from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING, List
from sqlalchemy import (
    String,
    Integer,
    Numeric,
    Boolean,
    Date,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.property import Property
    from app.models.photo import Photo
    from app.models.booking import Booking, BookingNight


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    property_id: Mapped[int] = mapped_column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    max_guests: Mapped[int] = mapped_column(Integer, nullable=False)
    bedrooms: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    beds: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    bathrooms: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    base_price_per_night: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    cleaning_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    property: Mapped["Property"] = relationship("Property", back_populates="units")
    calendar_prices: Mapped[List["UnitPriceCalendar"]] = relationship(
        "UnitPriceCalendar", back_populates="unit", cascade="all, delete-orphan"
    )
    photos: Mapped[List["Photo"]] = relationship("Photo", back_populates="unit")
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="unit")
    booking_nights: Mapped[List["BookingNight"]] = relationship("BookingNight", back_populates="unit")


class UnitPriceCalendar(Base):
    __tablename__ = "unit_price_calendars"
    __table_args__ = (
        UniqueConstraint("unit_id", "day", name="uq_unit_day_calendar"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey("units.id", ondelete="CASCADE"), nullable=False, index=True)
    day: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    unit: Mapped["Unit"] = relationship("Unit", back_populates="calendar_prices")
