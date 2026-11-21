from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.property import PropertyResponse


class WishlistItemCreate(BaseModel):
    property_id: int


class WishlistItemResponse(BaseModel):
    wishlist_id: int
    property_id: int
    added_at: datetime
    property: Optional[PropertyResponse] = None

    model_config = ConfigDict(from_attributes=True)


class WishlistBase(BaseModel):
    name: str


class WishlistCreate(WishlistBase):
    pass


class WishlistUpdate(BaseModel):
    name: str


class WishlistResponse(WishlistBase):
    id: int
    user_id: int
    created_at: datetime
    items: Optional[List[WishlistItemResponse]] = None

    model_config = ConfigDict(from_attributes=True)
