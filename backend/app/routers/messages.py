from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.db.database import get_db
from app.models.message import Message
from app.models.user import User
from app.models.booking import Booking
from app.schemas.message import MessageCreate, MessageResponse
from app.dependencies.auth import get_current_active_user
from app.core.exceptions import NotFoundException, BadRequestException

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if msg_in.receiver_id == current_user.id:
        raise BadRequestException("You cannot send a message to yourself.")

    receiver = db.query(User).filter(User.id == msg_in.receiver_id).first()
    if not receiver:
        raise NotFoundException("User", msg_in.receiver_id)

    if msg_in.booking_id is not None:
        booking = db.query(Booking).filter(Booking.id == msg_in.booking_id).first()
        if not booking:
            raise NotFoundException("Booking", msg_in.booking_id)

    message = Message(
        sender_id=current_user.id,
        receiver_id=msg_in.receiver_id,
        booking_id=msg_in.booking_id,
        body=msg_in.body,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get("/", response_model=List[MessageResponse])
def get_chat_history(
    contact_id: int = Query(..., description="ID of other user in chat"),
    booking_id: Optional[int] = Query(None, description="Optional booking context filter"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Retrieves conversation thread between current user and specified contact."""
    query = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == contact_id),
            and_(Message.sender_id == contact_id, Message.receiver_id == current_user.id),
        )
    )

    if booking_id is not None:
        query = query.filter(Message.booking_id == booking_id)

    return query.order_by(Message.sent_at.asc()).all()
