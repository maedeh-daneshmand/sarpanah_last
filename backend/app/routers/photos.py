from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.photo import Photo
from app.models.property import Property, PropertyStatus
from app.models.unit import Unit
from app.schemas.photo import PhotoCreate, PhotoResponse
from app.dependencies.auth import get_current_host
from app.models.user import User, UserRole
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException

router = APIRouter(tags=["Photos"])


@router.get("/properties/{property_id}/photos", response_model=List[PhotoResponse])
def get_property_photos(property_id: int, db: Session = Depends(get_db)):
    """List all photos associated with a property."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop or prop.status != PropertyStatus.ACTIVE:
        raise NotFoundException("Property", property_id)
    return db.query(Photo).filter(Photo.property_id == property_id).order_by(Photo.sort_order.asc()).all()


@router.post("/properties/{property_id}/photos", response_model=PhotoResponse, status_code=status.HTTP_201_CREATED)
def add_property_photo(
    property_id: int,
    photo_in: PhotoCreate,
    host: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    """Adds a photo to a property. Validates that the caller owns the property and that any unit_id belongs to it."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise NotFoundException("Property", property_id)

    if prop.host_id != host.id and host.role != UserRole.ADMIN:
        raise ForbiddenException("You can only add photos to properties you own.")

    # Validate unit_id if supplied
    if photo_in.unit_id is not None:
        unit = db.query(Unit).filter(Unit.id == photo_in.unit_id).first()
        if not unit or unit.property_id != property_id:
            raise BadRequestException(f"Unit {photo_in.unit_id} does not belong to property {property_id}.")

    # Basic URL validation
    clean_url = photo_in.url.strip()
    if not (clean_url.startswith("http://") or clean_url.startswith("https://") or clean_url.startswith("/uploads/")):
        raise BadRequestException("Invalid photo URL schema. Must start with http://, https://, or /uploads/.")

    photo = Photo(
        property_id=property_id,
        unit_id=photo_in.unit_id,
        url=clean_url,
        sort_order=photo_in.sort_order,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(
    photo_id: int,
    host: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    """Deletes a photo. Only the property host or an admin can delete photos."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise NotFoundException("Photo", photo_id)

    if photo.property.host_id != host.id and host.role != UserRole.ADMIN:
        raise ForbiddenException("You cannot delete photos belonging to another host's property.")

    db.delete(photo)
    db.commit()
    return None
