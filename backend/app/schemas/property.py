from datetime import datetime, time
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.property import PropertyStatus
from app.schemas.location import CityResponse
from app.schemas.unit import UnitResponse
from app.schemas.photo import PhotoResponse
from app.schemas.amenity import AmenityResponse


class PropertyTypeBase(BaseModel):
    name: str


class PropertyTypeCreate(PropertyTypeBase):
    pass


class PropertyTypeResponse(PropertyTypeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class CancellationPolicyBase(BaseModel):
    name: str
    free_cancel_days: int = Field(0, ge=0)
    refund_percent: Decimal = Field(..., ge=0, le=100)


class CancellationPolicyCreate(CancellationPolicyBase):
    pass


class CancellationPolicyResponse(CancellationPolicyBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class PropertyBase(BaseModel):
    city_id: int
    type_id: int
    policy_id: int
    title: str
    description: str
    address: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    check_in_time: time = time(14, 0)
    check_out_time: time = time(12, 0)
    status: PropertyStatus = PropertyStatus.DRAFT


class PropertyCreate(PropertyBase):
    amenity_ids: Optional[List[int]] = None


class PropertyUpdate(BaseModel):
    city_id: Optional[int] = None
    type_id: Optional[int] = None
    policy_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    check_in_time: Optional[time] = None
    check_out_time: Optional[time] = None
    status: Optional[PropertyStatus] = None
    amenity_ids: Optional[List[int]] = None


class PropertyResponse(PropertyBase):
    id: int
    host_id: int
    created_at: datetime
    updated_at: datetime
    city: Optional[CityResponse] = None
    property_type: Optional[PropertyTypeResponse] = None
    cancellation_policy: Optional[CancellationPolicyResponse] = None
    units: Optional[List[UnitResponse]] = None
    photos: Optional[List[PhotoResponse]] = None

    model_config = ConfigDict(from_attributes=True)
