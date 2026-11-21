from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MessageCreate(BaseModel):
    receiver_id: int
    booking_id: Optional[int] = None
    body: str


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    booking_id: Optional[int] = None
    body: str
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)
