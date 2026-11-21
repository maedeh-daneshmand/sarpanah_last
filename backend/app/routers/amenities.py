from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.amenity import Amenity
from app.schemas.amenity import AmenityCreate, AmenityResponse
from app.dependencies.auth import get_current_admin
from app.core.exceptions import ConflictException
from app.models.user import User

router = APIRouter(prefix="/amenities", tags=["Amenities"])


@router.get("/", response_model=List[AmenityResponse])
def get_amenities(db: Session = Depends(get_db)):
    return db.query(Amenity).order_by(Amenity.name).all()


@router.post("/", response_model=AmenityResponse, status_code=status.HTTP_201_CREATED)
def create_amenity(
    amenity_in: AmenityCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    existing = db.query(Amenity).filter(Amenity.name == amenity_in.name).first()
    if existing:
        raise ConflictException(f"Amenity '{amenity_in.name}' already exists.")
    
    amenity = Amenity(name=amenity_in.name, icon=amenity_in.icon)
    db.add(amenity)
    db.commit()
    db.refresh(amenity)
    return amenity
