from datetime import date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class UnitPriceCalendarBase(BaseModel):
    day: date
    price: Decimal = Field(..., gt=0)
    is_blocked: bool = False


class UnitPriceCalendarCreate(UnitPriceCalendarBase):
    pass


class UnitPriceCalendarResponse(UnitPriceCalendarBase):
    id: int
    unit_id: int

    model_config = ConfigDict(from_attributes=True)


class UnitBase(BaseModel):
    name: str
    max_guests: int = Field(..., gt=0)
    bedrooms: int = Field(1, ge=0)
    beds: int = Field(1, ge=0)
    bathrooms: int = Field(1, ge=0)
    base_price_per_night: Decimal = Field(..., gt=0)
    cleaning_fee: Decimal = Field(Decimal("0.00"), ge=0)
    is_active: bool = True


class UnitCreate(UnitBase):
    property_id: int


class UnitUpdate(BaseModel):
    name: Optional[str] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[int] = None
    base_price_per_night: Optional[Decimal] = None
    cleaning_fee: Optional[Decimal] = None
    is_active: Optional[bool] = None


class UnitResponse(UnitBase):
    id: int
    property_id: int

    model_config = ConfigDict(from_attributes=True)
