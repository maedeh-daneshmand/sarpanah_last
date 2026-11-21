from typing import Optional
from pydantic import BaseModel, ConfigDict


class AmenityBase(BaseModel):
    name: str
    icon: Optional[str] = None


class AmenityCreate(AmenityBase):
    pass


class AmenityResponse(AmenityBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class PropertyAmenityBase(BaseModel):
    amenity_id: int


class PropertyAmenityResponse(BaseModel):
    property_id: int
    amenity_id: int
    amenity: AmenityResponse

    model_config = ConfigDict(from_attributes=True)
