from datetime import date, timedelta
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.models.location import Country, Province, City
from app.models.property import Property, PropertyType, CancellationPolicy, PropertyStatus
from app.models.unit import Unit, UnitPriceCalendar
from app.models.booking import BookingStatus


@pytest.fixture
def setup_property_and_unit(db_session: Session, host_user):
    country = Country(name="Iran", iso_code="IR")
    db_session.add(country)
    db_session.flush()

    province = Province(country_id=country.id, name="Mazandaran")
    db_session.add(province)
    db_session.flush()

    city = City(province_id=province.id, name="Ramsar")
    db_session.add(city)
    db_session.flush()

    ptype = PropertyType(name="Villa")
    db_session.add(ptype)
    db_session.flush()

    policy = CancellationPolicy(name="Flexible", free_cancel_days=2, refund_percent=Decimal("50.00"))
    db_session.add(policy)
    db_session.flush()

    prop = Property(
        host_id=host_user.id,
        city_id=city.id,
        type_id=ptype.id,
        policy_id=policy.id,
        title="Luxury Beachside Villa",
        description="A beautiful seaside getaway",
        address="Coastline Blvd 12",
        status=PropertyStatus.ACTIVE,
    )
    db_session.add(prop)
    db_session.flush()

    unit = Unit(
        property_id=prop.id,
        name="Main Villa Unit",
        max_guests=4,
        bedrooms=2,
        beds=3,
        bathrooms=2,
        base_price_per_night=Decimal("1000.00"),
        cleaning_fee=Decimal("100.00"),
        is_active=True,
    )
    db_session.add(unit)
    db_session.commit()
    db_session.refresh(unit)
    db_session.refresh(prop)
    return prop, unit


def test_create_property(client: TestClient, host_user, setup_property_and_unit):
    prop, unit = setup_property_and_unit
    token = create_access_token(subject=host_user.id)
    response = client.post(
        "/api/v1/properties/",
        json={
            "city_id": prop.city_id,
            "type_id": prop.type_id,
            "policy_id": prop.policy_id,
            "title": "Mountain Cabin",
            "description": "Quiet cabin in the woods",
            "address": "Mountain Rd 5",
            "status": "active",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Mountain Cabin"
    assert data["host_id"] == host_user.id


def test_booking_success(client: TestClient, guest_user, setup_property_and_unit):
    _, unit = setup_property_and_unit
    token = create_access_token(subject=guest_user.id)

    check_in = date.today() + timedelta(days=5)
    check_out = date.today() + timedelta(days=7)

    response = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(check_in),
            "check_out": str(check_out),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["unit_id"] == unit.id
    assert data["nights"] == 2
    # subtotal = 2 * 1000 = 2000, cleaning = 100, service = 5% of 2000 = 100 -> total = 2200
    assert Decimal(str(data["total_price"])) == Decimal("2200.00")
    assert data["status"] == "pending"


def test_booking_invalid_dates(client: TestClient, guest_user, setup_property_and_unit):
    _, unit = setup_property_and_unit
    token = create_access_token(subject=guest_user.id)

    # Check-out before check-in
    response = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(date.today() + timedelta(days=5)),
            "check_out": str(date.today() + timedelta(days=3)),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400


def test_booking_exceeding_capacity(client: TestClient, guest_user, setup_property_and_unit):
    _, unit = setup_property_and_unit
    token = create_access_token(subject=guest_user.id)

    # Unit max_guests is 4
    response = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(date.today() + timedelta(days=1)),
            "check_out": str(date.today() + timedelta(days=3)),
            "guests_count": 6,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "capacity" in response.json()["detail"].lower()


def test_booking_inactive_unit(client: TestClient, guest_user, setup_property_and_unit, db_session):
    _, unit = setup_property_and_unit
    unit.is_active = False
    db_session.commit()

    token = create_access_token(subject=guest_user.id)
    response = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(date.today() + timedelta(days=1)),
            "check_out": str(date.today() + timedelta(days=3)),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "inactive" in response.json()["detail"].lower()


def test_booking_blocked_date(client: TestClient, guest_user, setup_property_and_unit, db_session):
    _, unit = setup_property_and_unit
    blocked_day = date.today() + timedelta(days=10)

    cal = UnitPriceCalendar(
        unit_id=unit.id,
        day=blocked_day,
        price=Decimal("1500.00"),
        is_blocked=True,
    )
    db_session.add(cal)
    db_session.commit()

    token = create_access_token(subject=guest_user.id)
    response = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(date.today() + timedelta(days=9)),
            "check_out": str(date.today() + timedelta(days=12)),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "blocked" in response.json()["detail"].lower()


def test_booking_duplicate_dates_conflict(client: TestClient, guest_user, setup_property_and_unit):
    _, unit = setup_property_and_unit
    token = create_access_token(subject=guest_user.id)

    stay_start = date.today() + timedelta(days=15)
    stay_end = date.today() + timedelta(days=18)

    # First booking succeeds
    res1 = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(stay_start),
            "check_out": str(stay_end),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res1.status_code == 201

    # Second overlapping booking must fail with 409 Conflict
    res2 = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(stay_start + timedelta(days=1)),
            "check_out": str(stay_end + timedelta(days=2)),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res2.status_code == 409
    assert "already booked" in res2.json()["detail"].lower()


def test_payment_success_and_failure(client: TestClient, guest_user, setup_property_and_unit):
    _, unit = setup_property_and_unit
    token = create_access_token(subject=guest_user.id)

    # Create a booking
    res_b = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(date.today() + timedelta(days=20)),
            "check_out": str(date.today() + timedelta(days=22)),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    booking_id = res_b.json()["id"]

    # 1. Simulate failed payment
    fail_res = client.post(
        "/api/v1/payments/",
        json={"booking_id": booking_id, "method": "card", "simulate_success": False},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert fail_res.status_code == 201
    assert fail_res.json()["status"] == "failed"

    # 2. Simulate successful payment
    success_res = client.post(
        "/api/v1/payments/",
        json={"booking_id": booking_id, "method": "card", "simulate_success": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert success_res.status_code == 201
    assert success_res.json()["status"] == "successful"
    assert "SAR-" in success_res.json()["transaction_ref"]

    # Check that booking status became confirmed
    b_check = client.get(f"/api/v1/bookings/{booking_id}", headers={"Authorization": f"Bearer {token}"})
    assert b_check.json()["status"] == "confirmed"


def test_cancellation_and_night_release(client: TestClient, guest_user, setup_property_and_unit):
    _, unit = setup_property_and_unit
    token = create_access_token(subject=guest_user.id)

    check_in = date.today() + timedelta(days=25)
    check_out = date.today() + timedelta(days=27)

    # 1. Book dates
    res_b = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(check_in),
            "check_out": str(check_out),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    booking_id = res_b.json()["id"]

    # 2. Cancel booking
    cancel_res = client.post(
        f"/api/v1/bookings/{booking_id}/cancel",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # 3. Verify that the released nights can immediately be re-booked!
    rebook_res = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(check_in),
            "check_out": str(check_out),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert rebook_res.status_code == 201
    assert rebook_res.json()["status"] == "pending"


def test_duplicate_review_prevention(client: TestClient, guest_user, setup_property_and_unit):
    _, unit = setup_property_and_unit
    token = create_access_token(subject=guest_user.id)

    # Book and pay
    res_b = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(date.today() + timedelta(days=30)),
            "check_out": str(date.today() + timedelta(days=32)),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    booking_id = res_b.json()["id"]

    client.post(
        "/api/v1/payments/",
        json={"booking_id": booking_id, "method": "card", "simulate_success": True},
        headers={"Authorization": f"Bearer {token}"},
    )

    # Submit first review
    rev1 = client.post(
        "/api/v1/reviews/",
        json={"booking_id": booking_id, "rating": 5, "comment": "Amazing place!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert rev1.status_code == 201

    # Attempt second review on same booking
    rev2 = client.post(
        "/api/v1/reviews/",
        json={"booking_id": booking_id, "rating": 4, "comment": "Duplicate review"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert rev2.status_code == 409


def test_wishlist_unauthorized_isolation(client: TestClient, guest_user, host_user, setup_property_and_unit):
    prop, _ = setup_property_and_unit
    guest_token = create_access_token(subject=guest_user.id)
    host_token = create_access_token(subject=host_user.id)

    # Guest creates a wishlist
    w_res = client.post(
        "/api/v1/wishlists/",
        json={"name": "My Favorites"},
        headers={"Authorization": f"Bearer {guest_token}"},
    )
    wishlist_id = w_res.json()["id"]

    # Host attempts to delete guest's wishlist -> 403 Forbidden
    del_res = client.delete(
        f"/api/v1/wishlists/{wishlist_id}",
        headers={"Authorization": f"Bearer {host_token}"},
    )
    assert del_res.status_code == 403


def test_message_sending(client: TestClient, guest_user, host_user):
    guest_token = create_access_token(subject=guest_user.id)

    msg_res = client.post(
        "/api/v1/messages/",
        json={"receiver_id": host_user.id, "body": "Hello, is early check-in possible?"},
        headers={"Authorization": f"Bearer {guest_token}"},
    )
    assert msg_res.status_code == 201
    assert msg_res.json()["sender_id"] == guest_user.id
    assert msg_res.json()["receiver_id"] == host_user.id

def test_coupon_discount_calculation(client: TestClient, guest_user, admin_user, setup_property_and_unit):
    _, unit = setup_property_and_unit
    admin_token = create_access_token(subject=admin_user.id)
    guest_token = create_access_token(subject=guest_user.id)

    # Admin creates a 20% coupon
    c_res = client.post(
        "/api/v1/admin/coupons",
        json={
            "code": "SUMMER20",
            "discount_percent": 20.0,
            "valid_from": str(date.today() - timedelta(days=1)),
            "valid_to": str(date.today() + timedelta(days=30)),
            "usage_limit": 10,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert c_res.status_code == 201

    # Guest requests a price quote with coupon
    check_in = date.today() + timedelta(days=40)
    check_out = date.today() + timedelta(days=42)  # 2 nights

    quote_res = client.post(
        "/api/v1/bookings/quote",
        json={
            "unit_id": unit.id,
            "check_in": str(check_in),
            "check_out": str(check_out),
            "guests_count": 2,
            "coupon_code": "SUMMER20",
        },
        headers={"Authorization": f"Bearer {guest_token}"},
    )
    assert quote_res.status_code == 200
    q = quote_res.json()
    # subtotal = 2 * 1000 = 2000
    # 20% discount = 400
    # cleaning = 100, service = 100 -> total = 2000 + 100 + 100 - 400 = 1800
    assert Decimal(str(q["subtotal"])) == Decimal("2000.00")
    assert Decimal(str(q["discount_amount"])) == Decimal("400.00")
    assert Decimal(str(q["total_price"])) == Decimal("1800.00")


def test_concurrent_booking_simulation(client: TestClient, guest_user, admin_user, setup_property_and_unit):
    """Simulates two distinct guests simultaneously attempting to book the identical unit and date."""
    _, unit = setup_property_and_unit
    token1 = create_access_token(subject=guest_user.id)
    token2 = create_access_token(subject=admin_user.id)  # second non-host user

    check_in = date.today() + timedelta(days=50)
    check_out = date.today() + timedelta(days=52)

    # First user books
    req1 = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(check_in),
            "check_out": str(check_out),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert req1.status_code == 201

    # Second user tries concurrently for the same night -> conflict
    req2 = client.post(
        "/api/v1/bookings/",
        json={
            "unit_id": unit.id,
            "check_in": str(check_in),
            "check_out": str(check_out),
            "guests_count": 2,
        },
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert req2.status_code == 409
    assert "already booked" in req2.json()["detail"].lower()


def test_draft_property_visibility_restrictions(client: TestClient, host_user, guest_user, setup_property_and_unit, db_session):
    prop, _ = setup_property_and_unit
    prop.status = PropertyStatus.DRAFT
    db_session.commit()

    guest_token = create_access_token(subject=guest_user.id)
    host_token = create_access_token(subject=host_user.id)

    # 1. Unauthenticated visitor cannot see draft property (404)
    res_pub = client.get(f"/api/v1/properties/{prop.id}")
    assert res_pub.status_code == 404

    # 2. Another guest user cannot see draft property (404)
    res_guest = client.get(
        f"/api/v1/properties/{prop.id}",
        headers={"Authorization": f"Bearer {guest_token}"},
    )
    assert res_guest.status_code == 404

    # 3. Host owner CAN see their own draft property (200)
    res_host = client.get(
        f"/api/v1/properties/{prop.id}",
        headers={"Authorization": f"Bearer {host_token}"},
    )
    assert res_host.status_code == 200
    assert res_host.json()["id"] == prop.id


def test_photo_management_lifecycle(client: TestClient, host_user, guest_user, setup_property_and_unit):
    prop, unit = setup_property_and_unit
    host_token = create_access_token(subject=host_user.id)
    guest_token = create_access_token(subject=guest_user.id)

    # 1. Host adds a photo
    add_res = client.post(
        f"/api/v1/properties/{prop.id}/photos",
        json={"property_id": prop.id, "unit_id": unit.id, "url": "https://cdn.example.com/photo1.jpg", "sort_order": 1},
        headers={"Authorization": f"Bearer {host_token}"},
    )
    assert add_res.status_code == 201
    photo_id = add_res.json()["id"]

    # 2. Guest attempts to delete host's photo -> 403 Forbidden
    del_guest = client.delete(
        f"/api/v1/photos/{photo_id}",
        headers={"Authorization": f"Bearer {guest_token}"},
    )
    assert del_guest.status_code == 403

    # 3. Public lists property photos -> 200
    list_res = client.get(f"/api/v1/properties/{prop.id}/photos")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 4. Host deletes photo -> 204
    del_host = client.delete(
        f"/api/v1/photos/{photo_id}",
        headers={"Authorization": f"Bearer {host_token}"},
    )
    assert del_host.status_code == 204
