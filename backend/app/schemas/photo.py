from typing import Optional
from pydantic import BaseModel, ConfigDict


class PhotoBase(BaseModel):
    property_id: int
    unit_id: Optional[int] = None
    url: str
    sort_order: int = 0


class PhotoCreate(PhotoBase):
    pass


class PhotoResponse(PhotoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
