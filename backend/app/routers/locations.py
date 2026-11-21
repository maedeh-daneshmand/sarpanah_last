from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.location import Country, Province, City
from app.schemas.location import (
    CountryCreate,
    CountryResponse,
    ProvinceCreate,
    ProvinceResponse,
    CityCreate,
    CityResponse,
)
from app.dependencies.auth import get_current_admin
from app.core.exceptions import ConflictException, NotFoundException
from app.models.user import User

router = APIRouter(prefix="/locations", tags=["Locations"])


# Countries
@router.get("/countries", response_model=List[CountryResponse])
def get_countries(db: Session = Depends(get_db)):
    return db.query(Country).order_by(Country.name).all()


@router.post("/countries", response_model=CountryResponse, status_code=status.HTTP_201_CREATED)
def create_country(
    country_in: CountryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    existing = db.query(Country).filter(Country.iso_code == country_in.iso_code.upper()).first()
    if existing:
        raise ConflictException(f"Country with ISO code '{country_in.iso_code}' already exists.")
    country = Country(name=country_in.name, iso_code=country_in.iso_code.upper())
    db.add(country)
    db.commit()
    db.refresh(country)
    return country


# Provinces
@router.get("/provinces", response_model=List[ProvinceResponse])
def get_provinces(
    country_id: Optional[int] = Query(None, description="Filter provinces by country ID"),
    db: Session = Depends(get_db),
):
    query = db.query(Province)
    if country_id is not None:
        query = query.filter(Province.country_id == country_id)
    return query.order_by(Province.name).all()


@router.post("/provinces", response_model=ProvinceResponse, status_code=status.HTTP_201_CREATED)
def create_province(
    province_in: ProvinceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    country = db.query(Country).filter(Country.id == province_in.country_id).first()
    if not country:
        raise NotFoundException("Country", province_in.country_id)
    
    existing = (
        db.query(Province)
        .filter(Province.country_id == province_in.country_id, Province.name == province_in.name)
        .first()
    )
    if existing:
        raise ConflictException(f"Province '{province_in.name}' already exists in this country.")

    province = Province(country_id=province_in.country_id, name=province_in.name)
    db.add(province)
    db.commit()
    db.refresh(province)
    return province


# Cities
@router.get("/cities", response_model=List[CityResponse])
def get_cities(
    province_id: Optional[int] = Query(None, description="Filter cities by province ID"),
    db: Session = Depends(get_db),
):
    query = db.query(City)
    if province_id is not None:
        query = query.filter(City.province_id == province_id)
    return query.order_by(City.name).all()


@router.post("/cities", response_model=CityResponse, status_code=status.HTTP_201_CREATED)
def create_city(
    city_in: CityCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    province = db.query(Province).filter(Province.id == city_in.province_id).first()
    if not province:
        raise NotFoundException("Province", city_in.province_id)

    existing = (
        db.query(City)
        .filter(City.province_id == city_in.province_id, City.name == city_in.name)
        .first()
    )
    if existing:
        raise ConflictException(f"City '{city_in.name}' already exists in this province.")

    city = City(province_id=city_in.province_id, name=city_in.name)
    db.add(city)
    db.commit()
    db.refresh(city)
    return city
