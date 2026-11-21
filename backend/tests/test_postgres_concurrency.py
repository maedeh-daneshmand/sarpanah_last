from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
from decimal import Decimal
import os
import sys
from os.path import abspath, dirname

sys.path.insert(0, dirname(dirname(abspath(__file__))))

import pytest
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import (
    User, UserRole,
    Country, Province, City,
    Property, PropertyType, CancellationPolicy, PropertyStatus,
    Unit, UnitPriceCalendar,
    Amenity, PropertyAmenity, Photo,
    Booking, BookingNight, Coupon, Payment,
    Review, Wishlist, WishlistItem, Message,
)
from app.schemas.booking import BookingCreate
from app.services.booking import BookingService
from app.core.exceptions import ConflictException

# Use PostgreSQL test database
pg_engine = create_engine(settings.TEST_SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)
PgSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=pg_engine)


def test_genuine_postgres_concurrency():
    """
    GENUINE CONCURRENCY TEST ON POSTGRESQL 18:
    Fires 2 simultaneous threads hitting BookingService.create_booking
    for the exact same unit and overlapping dates concurrently.
    
    Expected:
    - 1 thread succeeds (Booking created)
    - 1 thread fails with ConflictException (409)
    - PostgreSQL booking_nights table has EXACTLY one entry for that night (no duplicates).
    """
    db = PgSessionLocal()

    # 1. Clean test tables in reverse dependency order
    db.query(BookingNight).delete()
    db.query(Payment).delete()
    db.query(Booking).delete()
    db.query(Review).delete()
    db.query(WishlistItem).delete()
    db.query(Wishlist).delete()
    db.query(Message).delete()
    db.query(Photo).delete()
    db.query(UnitPriceCalendar).delete()
    db.query(PropertyAmenity).delete()
    db.query(Amenity).delete()
    db.query(Unit).delete()
    db.query(Property).delete()
    db.query(CancellationPolicy).delete()
    db.query(PropertyType).delete()
    db.query(City).delete()
    db.query(Province).delete()
    db.query(Country).delete()
    db.query(Coupon).delete()
    db.query(User).delete()
    db.commit()

    # 2. Seed prerequisites in PostgreSQL
    country = Country(name="Iran", iso_code="IR")
    db.add(country)
    db.flush()

    province = Province(country_id=country.id, name="Gilan")
    db.add(province)
    db.flush()

    city = City(province_id=province.id, name="Rasht")
    db.add(city)
    db.flush()

    host = User(
        full_name="Postgres Host",
        email="pg_host@sarpanah.com",
        phone="09110000001",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.HOST,
        is_active=True,
    )
    guest_a = User(
        full_name="Guest Alpha",
        email="guest_a@sarpanah.com",
        phone="09110000002",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.GUEST,
        is_active=True,
    )
    guest_b = User(
        full_name="Guest Beta",
        email="guest_b@sarpanah.com",
        phone="09110000003",
        password_hash=get_password_hash("Pass123!"),
        role=UserRole.GUEST,
        is_active=True,
    )
    db.add_all([host, guest_a, guest_b])
    db.flush()

    ptype = PropertyType(name="Villa")
    policy = CancellationPolicy(name="Flexible", free_cancel_days=2, refund_percent=Decimal("100.00"))
    db.add_all([ptype, policy])
    db.flush()

    prop = Property(
        host_id=host.id,
        city_id=city.id,
        type_id=ptype.id,
        policy_id=policy.id,
        title="Forest Villa",
        description="Peaceful mountain cabin",
        address="Jangal Rd 10",
        status=PropertyStatus.ACTIVE,
    )
    db.add(prop)
    db.flush()

    unit = Unit(
        property_id=prop.id,
        name="Main Suite",
        max_guests=4,
        bedrooms=2,
        beds=2,
        bathrooms=1,
        base_price_per_night=Decimal("2000.00"),
        cleaning_fee=Decimal("150.00"),
        is_active=True,
    )
    db.add(unit)
    db.commit()

    unit_id = unit.id
    guest_a_id = guest_a.id
    guest_b_id = guest_b.id
    db.close()

    target_night = date.today() + timedelta(days=60)
    target_checkout = target_night + timedelta(days=1)

    booking_payload = BookingCreate(
        unit_id=unit_id,
        check_in=target_night,
        check_out=target_checkout,
        guests_count=2,
    )

    results = []

    def attempt_booking(user_id: int):
        thread_db = PgSessionLocal()
        try:
            thread_user = thread_db.query(User).filter(User.id == user_id).first()
            booking = BookingService.create_booking(
                db=thread_db,
                guest=thread_user,
                booking_in=booking_payload,
            )
            return {"status": "SUCCESS", "booking_id": booking.id}
        except ConflictException as e:
            return {"status": "CONFLICT", "error": str(e.detail)}
        except Exception as e:
            return {"status": "ERROR", "error": str(e)}
        finally:
            thread_db.close()

    # Launch two simultaneous concurrent booking attempts on PostgreSQL
    with ThreadPoolExecutor(max_workers=2) as executor:
        future_a = executor.submit(attempt_booking, guest_a_id)
        future_b = executor.submit(attempt_booking, guest_b_id)
        res_a = future_a.result()
        res_b = future_b.result()

    statuses = [res_a["status"], res_b["status"]]
    print(f"\n[PostgreSQL Concurrency Results] Thread A: {res_a}, Thread B: {res_b}")

    # Verify exactly 1 SUCCESS and exactly 1 CONFLICT
    assert statuses.count("SUCCESS") == 1, f"Expected exactly 1 success, got: {statuses}"
    assert statuses.count("CONFLICT") == 1, f"Expected exactly 1 conflict, got: {statuses}"

    # Verify database state in PostgreSQL
    verify_db = PgSessionLocal()
    booked_nights_count = (
        verify_db.query(func.count(BookingNight.night))
        .filter(BookingNight.unit_id == unit_id, BookingNight.night == target_night)
        .scalar()
    )
    print(f"Total entries in PostgreSQL booking_nights for target night: {booked_nights_count}")
    assert booked_nights_count == 1, "There must be exactly ONE locked night record in PostgreSQL!"
    verify_db.close()
    print("PostgreSQL live concurrency audit: PASSED!")


if __name__ == "__main__":
    test_genuine_postgres_concurrency()
