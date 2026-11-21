from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Integer, Numeric, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.booking import Booking


class Coupon(Base):
    __tablename__ = "coupons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)
    discount_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_to: Mapped[date] = mapped_column(Date, nullable=False)
    usage_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="coupon")
