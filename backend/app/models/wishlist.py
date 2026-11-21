from datetime import datetime
from typing import TYPE_CHECKING, List
from sqlalchemy import (
    String,
    Integer,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.property import Property


class Wishlist(Base):
    __tablename__ = "wishlists"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_user_wishlist_name"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="wishlists")
    items: Mapped[List["WishlistItem"]] = relationship(
        "WishlistItem", back_populates="wishlist", cascade="all, delete-orphan"
    )


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    wishlist_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("wishlists.id", ondelete="CASCADE"), primary_key=True
    )
    property_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True
    )
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    wishlist: Mapped["Wishlist"] = relationship("Wishlist", back_populates="items")
    property: Mapped["Property"] = relationship("Property", back_populates="wishlist_items")
