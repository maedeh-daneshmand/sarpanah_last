from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.property import Property


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    icon: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    property_amenities: Mapped[List["PropertyAmenity"]] = relationship(
        "PropertyAmenity", back_populates="amenity", cascade="all, delete-orphan"
    )


class PropertyAmenity(Base):
    __tablename__ = "property_amenities"

    property_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True
    )
    amenity_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True
    )

    property: Mapped["Property"] = relationship("Property", back_populates="property_amenities")
    amenity: Mapped["Amenity"] = relationship("Amenity", back_populates="property_amenities")
