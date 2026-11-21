from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.property import Property
    from app.models.unit import Unit


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    property_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    unit_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("units.id", ondelete="SET NULL"), nullable=True, index=True
    )
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    property: Mapped["Property"] = relationship("Property", back_populates="photos")
    unit: Mapped[Optional["Unit"]] = relationship("Unit", back_populates="photos")
