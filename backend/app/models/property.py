from datetime import datetime, time
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
import enum
from sqlalchemy import (
    String,
    Integer,
    Numeric,
    Text,
    Time,
    DateTime,
    ForeignKey,
    Enum,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.location import City
    from app.models.unit import Unit
    from app.models.amenity import Amenity, PropertyAmenity
    from app.models.photo import Photo
    from app.models.wishlist import WishlistItem


class PropertyStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    SUSPENDED = "suspended"


class PropertyType(Base):
    __tablename__ = "property_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)

    properties: Mapped[List["Property"]] = relationship("Property", back_populates="property_type")


class CancellationPolicy(Base):
    __tablename__ = "cancellation_policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)
    free_cancel_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    refund_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)

    properties: Mapped[List["Property"]] = relationship("Property", back_populates="cancellation_policy")


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    host_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    city_id: Mapped[int] = mapped_column(Integer, ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False, index=True)
    type_id: Mapped[int] = mapped_column(Integer, ForeignKey("property_types.id", ondelete="RESTRICT"), nullable=False, index=True)
    policy_id: Mapped[int] = mapped_column(Integer, ForeignKey("cancellation_policies.id", ondelete="RESTRICT"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str] = mapped_column(String(300), nullable=False)
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(9, 6), nullable=True)
    check_in_time: Mapped[time] = mapped_column(Time, default=time(14, 0), nullable=False)
    check_out_time: Mapped[time] = mapped_column(Time, default=time(12, 0), nullable=False)
    status: Mapped[PropertyStatus] = mapped_column(
        Enum(PropertyStatus, name="property_status_enum", values_callable=lambda x: [e.value for e in x]),
        default=PropertyStatus.DRAFT,
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    host: Mapped["User"] = relationship("User", back_populates="properties")
    city: Mapped["City"] = relationship("City", back_populates="properties")
    property_type: Mapped["PropertyType"] = relationship("PropertyType", back_populates="properties")
    cancellation_policy: Mapped["CancellationPolicy"] = relationship("CancellationPolicy", back_populates="properties")
    units: Mapped[List["Unit"]] = relationship("Unit", back_populates="property", cascade="all, delete-orphan")
    property_amenities: Mapped[List["PropertyAmenity"]] = relationship("PropertyAmenity", back_populates="property", cascade="all, delete-orphan")
    photos: Mapped[List["Photo"]] = relationship("Photo", back_populates="property", cascade="all, delete-orphan")
    wishlist_items: Mapped[List["WishlistItem"]] = relationship("WishlistItem", back_populates="property", cascade="all, delete-orphan")
