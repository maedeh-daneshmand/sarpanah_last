from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CouponBase(BaseModel):
    code: str
    discount_percent: Decimal = Field(..., ge=0, le=100)
    valid_from: date
    valid_to: date
    usage_limit: Optional[int] = None


class CouponCreate(CouponBase):
    pass


class CouponResponse(CouponBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
