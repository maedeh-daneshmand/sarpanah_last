from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.review import Review
from app.models.booking import Booking, BookingStatus
from app.schemas.review import ReviewCreate, ReviewResponse
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.core.exceptions import (
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
)

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == review_in.booking_id).first()
    if not booking:
        raise NotFoundException("Booking", review_in.booking_id)

    if booking.guest_id != current_user.id:
        raise ForbiddenException("Only the guest of this reservation can leave a review.")

    # A review can only be submitted for completed or confirmed stays
    if booking.status not in [BookingStatus.COMPLETED, BookingStatus.CONFIRMED]:
        raise BadRequestException("Reviews can only be submitted for confirmed or completed stays.")

    existing_review = db.query(Review).filter(Review.booking_id == review_in.booking_id).first()
    if existing_review:
        raise ConflictException("A review has already been submitted for this booking.")

    review = Review(
        booking_id=review_in.booking_id,
        rating=review_in.rating,
        comment=review_in.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/property/{property_id}", response_model=List[ReviewResponse])
def get_property_reviews(property_id: int, db: Session = Depends(get_db)):
    """Fetches all reviews for units belonging to the specified property."""
    reviews = (
        db.query(Review)
        .join(Booking, Review.booking_id == Booking.id)
        .filter(Booking.unit.has(property_id=property_id))
        .order_by(Review.created_at.desc())
        .all()
    )
    return reviews
