from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
import enum
from sqlalchemy import (
    String,
    Integer,
    Numeric,
    DateTime,
    ForeignKey,
    Enum,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.booking import Booking


class PaymentMethod(str, enum.Enum):
    CARD = "card"
    WALLET = "wallet"
    BANK_TRANSFER = "bank_transfer"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESSFUL = "successful"
    FAILED = "failed"
    REFUNDED = "refunded"


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    booking_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, name="payment_method_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status_enum", values_callable=lambda x: [e.value for e in x]),
        default=PaymentStatus.PENDING,
        nullable=False,
        index=True,
    )
    transaction_ref: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True, index=True)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    booking: Mapped["Booking"] = relationship("Booking", back_populates="payments")
