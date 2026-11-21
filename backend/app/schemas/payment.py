from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.payment import PaymentMethod, PaymentStatus


class PaymentCreate(BaseModel):
    booking_id: int
    method: PaymentMethod
    simulate_success: bool = True


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: Decimal
    method: PaymentMethod
    status: PaymentStatus
    transaction_ref: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
