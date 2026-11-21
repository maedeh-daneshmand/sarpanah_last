from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
import enum
from sqlalchemy import String, Integer, Boolean, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.property import Property
    from app.models.booking import Booking
    from app.models.wishlist import Wishlist
    from app.models.message import Message


class UserRole(str, enum.Enum):
    GUEST = "guest"
    HOST = "host"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role_enum", values_callable=lambda x: [e.value for e in x]),
        default=UserRole.GUEST,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    properties: Mapped[List["Property"]] = relationship("Property", back_populates="host")
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="guest")
    wishlists: Mapped[List["Wishlist"]] = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
    sent_messages: Mapped[List["Message"]] = relationship(
        "Message", foreign_keys="[Message.sender_id]", back_populates="sender"
    )
    received_messages: Mapped[List["Message"]] = relationship(
        "Message", foreign_keys="[Message.receiver_id]", back_populates="receiver"
    )
