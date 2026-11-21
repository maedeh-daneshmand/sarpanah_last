from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.property import Property
from app.models.unit import Unit, UnitPriceCalendar
from app.schemas.unit import (
    UnitCreate,
    UnitUpdate,
    UnitResponse,
    UnitPriceCalendarCreate,
    UnitPriceCalendarResponse,
)
from app.dependencies.auth import get_current_host
from app.models.user import User, UserRole
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    BadRequestException,
)

router = APIRouter(prefix="/units", tags=["Units"])


@router.get("/", response_model=List[UnitResponse])
def get_units(
    property_id: Optional[int] = Query(None, description="Filter units by property ID"),
    db: Session = Depends(get_db),
):
    query = db.query(Unit)
    if property_id is not None:
        query = query.filter(Unit.property_id == property_id)
    return query.all()


@router.get("/{unit_id}", response_model=UnitResponse)
def get_unit(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise NotFoundException("Unit", unit_id)
    return unit


@router.post("/", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
def create_unit(
    unit_in: UnitCreate,
    host: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == unit_in.property_id).first()
    if not prop:
        raise NotFoundException("Property", unit_in.property_id)

    if prop.host_id != host.id and host.role != UserRole.ADMIN:
        raise ForbiddenException("You can only add units to your own property.")

    unit = Unit(
        property_id=unit_in.property_id,
        name=unit_in.name,
        max_guests=unit_in.max_guests,
        bedrooms=unit_in.bedrooms,
        beds=unit_in.beds,
        bathrooms=unit_in.bathrooms,
        base_price_per_night=unit_in.base_price_per_night,
        cleaning_fee=unit_in.cleaning_fee,
        is_active=unit_in.is_active,
    )
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return unit


@router.put("/{unit_id}", response_model=UnitResponse)
def update_unit(
    unit_id: int,
    unit_in: UnitUpdate,
    host: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise NotFoundException("Unit", unit_id)

    if unit.property.host_id != host.id and host.role != UserRole.ADMIN:
        raise ForbiddenException("You can only modify units that belong to your property.")

    for field, val in unit_in.model_dump(exclude_unset=True).items():
        if hasattr(unit, field) and val is not None:
            setattr(unit, field, val)

    db.commit()
    db.refresh(unit)
    return unit


# Price Calendar
@router.post("/{unit_id}/calendar", response_model=UnitPriceCalendarResponse, status_code=status.HTTP_201_CREATED)
def set_calendar_price(
    unit_id: int,
    cal_in: UnitPriceCalendarCreate,
    host: User = Depends(get_current_host),
    db: Session = Depends(get_db),
):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise NotFoundException("Unit", unit_id)

    if unit.property.host_id != host.id and host.role != UserRole.ADMIN:
        raise ForbiddenException("You can only configure calendar for your own units.")

    # Upsert calendar date
    entry = (
        db.query(UnitPriceCalendar)
        .filter(UnitPriceCalendar.unit_id == unit_id, UnitPriceCalendar.day == cal_in.day)
        .first()
    )
    if entry:
        entry.price = cal_in.price
        entry.is_blocked = cal_in.is_blocked
    else:
        entry = UnitPriceCalendar(
            unit_id=unit_id,
            day=cal_in.day,
            price=cal_in.price,
            is_blocked=cal_in.is_blocked,
        )
        db.add(entry)

    db.commit()
    db.refresh(entry)
    return entry


@router.get("/{unit_id}/calendar", response_model=List[UnitPriceCalendarResponse])
def get_unit_calendar(
    unit_id: int,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise NotFoundException("Unit", unit_id)

    query = db.query(UnitPriceCalendar).filter(UnitPriceCalendar.unit_id == unit_id)
    if start_date:
        query = query.filter(UnitPriceCalendar.day >= start_date)
    if end_date:
        query = query.filter(UnitPriceCalendar.day <= end_date)

    return query.order_by(UnitPriceCalendar.day).all()
