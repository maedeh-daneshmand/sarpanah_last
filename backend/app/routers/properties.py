from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, status, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.database import get_db
from app.models.property import Property, PropertyStatus, PropertyType, CancellationPolicy
from app.models.location import City
from app.models.amenity import PropertyAmenity, Amenity
from app.models.unit import Unit
from app.schemas.property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
)
from app.dependencies.auth import get_current_host, get_current_active_user, oauth2_scheme
from app.core.security import decode_access_token
from app.models.user import User, UserRole
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    BadRequestException,
)

router = APIRouter(prefix="/properties", tags=["Properties"])


def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Helper to detect logged-in user if token is provided, without forcing authentication."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    try:
        return db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    except (ValueError, TypeError):
        return None


@router.get("/", response_model=List[PropertyResponse])
def search_properties(
    city_id: Optional[int] = Query(None, description="Filter by city ID"),
    type_id: Optional[int] = Query(None, description="Filter by property type ID"),
    min_price: Optional[Decimal] = Query(None, description="Minimum base price per night"),
    max_price: Optional[Decimal] = Query(None, description="Maximum base price per night"),
    min_guests: Optional[int] = Query(None, description="Minimum guest capacity"),
    search_query: Optional[str] = Query(None, description="Search keyword in title or address"),
    db: Session = Depends(get_db),
):
    """Public search endpoint. Strictly exposes only ACTIVE properties with ACTIVE units."""
    query = db.query(Property).filter(Property.status == PropertyStatus.ACTIVE)

    if city_id:
        query = query.filter(Property.city_id == city_id)
    if type_id:
        query = query.filter(Property.type_id == type_id)
    if search_query:
        query = query.filter(
            or_(
                Property.title.ilike(f"%{search_query}%"),
                Property.address.ilike(f"%{search_query}%"),
            )
        )

    # Filter through associated active units
    if min_price is not None or max_price is not None or min_guests is not None:
        query = query.join(Property.units).filter(Unit.is_active == True)
        if min_price is not None:
            query = query.filter(Unit.base_price_per_night >= min_price)
        if max_price is not None:
            query = query.filter(Unit.base_price_per_night <= max_price)
        if min_guests is not None:
            query = query.filter(Unit.max_guests >= min_guests)

    return query.distinct().all()


@router.get("/my-properties", response_model=List[PropertyResponse])
def get_host_properties(
    status_filter: Optional[PropertyStatus] = Query(None),
    host: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    """Host-only endpoint to view all their properties including drafts and suspended ones."""
    query = db.query(Property).filter(Property.host_id == host.id)
    if status_filter:
        query = query.filter(Property.status == status_filter)
    return query.all()


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(
    property_id: int,
    db: Session = Depends(get_db),
    caller: Optional[User] = Depends(get_optional_user),
):
    """
    Publicly fetches property details.
    Draft or suspended properties are invisible to the public and only accessible by the owner or an admin.
    """
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise NotFoundException("Property", property_id)

    if prop.status != PropertyStatus.ACTIVE:
        # Non-active properties require owner or admin caller
        is_owner = caller and caller.id == prop.host_id
        is_admin = caller and caller.role == UserRole.ADMIN
        if not (is_owner or is_admin):
            raise NotFoundException("Property", property_id)

    return prop


@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    prop_in: PropertyCreate,
    host: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    if not db.query(City).filter(City.id == prop_in.city_id).first():
        raise NotFoundException("City", prop_in.city_id)
    if not db.query(PropertyType).filter(PropertyType.id == prop_in.type_id).first():
        raise NotFoundException("PropertyType", prop_in.type_id)
    if not db.query(CancellationPolicy).filter(CancellationPolicy.id == prop_in.policy_id).first():
        raise NotFoundException("CancellationPolicy", prop_in.policy_id)

    prop = Property(
        host_id=host.id,
        city_id=prop_in.city_id,
        type_id=prop_in.type_id,
        policy_id=prop_in.policy_id,
        title=prop_in.title,
        description=prop_in.description,
        address=prop_in.address,
        latitude=prop_in.latitude,
        longitude=prop_in.longitude,
        check_in_time=prop_in.check_in_time,
        check_out_time=prop_in.check_out_time,
        status=prop_in.status,
    )
    db.add(prop)
    db.flush()

    if prop_in.amenity_ids:
        for aid in prop_in.amenity_ids:
            if db.query(Amenity).filter(Amenity.id == aid).first():
                db.add(PropertyAmenity(property_id=prop.id, amenity_id=aid))

    db.commit()
    db.refresh(prop)
    return prop


@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    prop_in: PropertyUpdate,
    host: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise NotFoundException("Property", property_id)

    if prop.host_id != host.id and host.role != UserRole.ADMIN:
        raise ForbiddenException("You can only modify properties that belong to you.")

    for field, val in prop_in.model_dump(exclude_unset=True).items():
        if field == "amenity_ids" and val is not None:
            db.query(PropertyAmenity).filter(PropertyAmenity.property_id == prop.id).delete()
            for aid in val:
                if db.query(Amenity).filter(Amenity.id == aid).first():
                    db.add(PropertyAmenity(property_id=prop.id, amenity_id=aid))
        elif hasattr(prop, field) and val is not None:
            setattr(prop, field, val)

    db.commit()
    db.refresh(prop)
    return prop


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: int,
    host: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise NotFoundException("Property", property_id)

    if prop.host_id != host.id and host.role != UserRole.ADMIN:
        raise ForbiddenException("You can only delete your own property.")

    prop.status = PropertyStatus.SUSPENDED
    db.commit()
    return None
