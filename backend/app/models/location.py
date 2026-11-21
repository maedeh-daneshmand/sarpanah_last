from typing import TYPE_CHECKING, List
from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.property import Property


class Country(Base):
    __tablename__ = "countries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    iso_code: Mapped[str] = mapped_column(String(2), nullable=False, unique=True, index=True)

    provinces: Mapped[List["Province"]] = relationship("Province", back_populates="country", cascade="all, delete-orphan")


class Province(Base):
    __tablename__ = "provinces"
    __table_args__ = (
        UniqueConstraint("country_id", "name", name="uq_province_country_name"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    country_id: Mapped[int] = mapped_column(Integer, ForeignKey("countries.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    country: Mapped["Country"] = relationship("Country", back_populates="provinces")
    cities: Mapped[List["City"]] = relationship("City", back_populates="province", cascade="all, delete-orphan")


class City(Base):
    __tablename__ = "cities"
    __table_args__ = (
        UniqueConstraint("province_id", "name", name="uq_city_province_name"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    province_id: Mapped[int] = mapped_column(Integer, ForeignKey("provinces.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    province: Mapped["Province"] = relationship("Province", back_populates="cities")
    properties: Mapped[List["Property"]] = relationship("Property", back_populates="city")
