import pytest
from fastapi.testclient import TestClient
from app.core.security import create_access_token


def test_register_success(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "phone": "09123334455",
            "password": "SecurePassword123!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    # Must always receive GUEST role regardless
    assert data["role"] == "guest"


def test_register_cannot_elevate_to_admin(client: TestClient):
    """Verifies that an attacker attempting to register with role=admin receives GUEST role."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Attacker",
            "email": "attacker@example.com",
            "password": "Password123!",
            "role": "admin",  # Malicious attempt
        },
    )
    assert response.status_code == 201
    assert response.json()["role"] == "guest"  # Privilege escalation blocked!


def test_register_duplicate_email(client: TestClient):
    payload = {
        "full_name": "User 1",
        "email": "duplicate@example.com",
        "password": "Pass123456!",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


def test_login_success(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Login User",
            "email": "login@example.com",
            "password": "Password123!",
        },
    )
    response = client.post(
        "/api/v1/auth/login-json",
        json={"email": "login@example.com", "password": "Password123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_failed(client: TestClient):
    response = client.post(
        "/api/v1/auth/login-json",
        json={"email": "nonexistent@example.com", "password": "WrongPassword"},
    )
    assert response.status_code == 401


def test_access_without_token(client: TestClient):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_access_with_incorrect_role(client: TestClient, guest_user):
    token = create_access_token(subject=guest_user.id)
    # Attempting to access admin user list as guest
    response = client.get(
        "/api/v1/admin/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_user_profile_privacy(client: TestClient, guest_user, host_user):
    """Verifies that user A cannot inspect user B's private phone and email."""
    guest_token = create_access_token(subject=guest_user.id)
    
    # Guest queries Host's profile
    res = client.get(
        f"/api/v1/users/{host_user.id}",
        headers={"Authorization": f"Bearer {guest_token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == host_user.id
    assert data["full_name"] == host_user.full_name
    # Sensitive contact info must NOT be disclosed
    assert "email" not in data
    assert "phone" not in data


def test_user_cannot_self_promote(client: TestClient, guest_user):
    """Verifies that PUT /users/me ignores or rejects role escalation attempts."""
    guest_token = create_access_token(subject=guest_user.id)
    res = client.put(
        "/api/v1/users/me",
        json={"full_name": "New Name", "role": "admin"},
        headers={"Authorization": f"Bearer {guest_token}"},
    )
    assert res.status_code == 200
    assert res.json()["role"] == "guest"  # Remained guest
