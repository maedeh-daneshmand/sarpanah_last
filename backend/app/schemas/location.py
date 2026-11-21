from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# Country
class CountryBase(BaseModel):
    name: str
    iso_code: str


class CountryCreate(CountryBase):
    pass


class CountryResponse(CountryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Province
class ProvinceBase(BaseModel):
    name: str
    country_id: int


class ProvinceCreate(ProvinceBase):
    pass


class ProvinceResponse(ProvinceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# City
class CityBase(BaseModel):
    name: str
    province_id: int


class CityCreate(CityBase):
    pass


class CityResponse(CityBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
