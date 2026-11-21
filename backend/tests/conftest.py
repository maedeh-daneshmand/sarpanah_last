import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models.user import User, UserRole
from app.core.security import get_password_hash

# In-memory SQLite engine for lightning fast and completely isolated testing
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    # Create all 20 tables in memory for each test
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db_session: Session) -> User:
    admin = User(
        full_name="Admin User",
        email="admin@sarpanah.com",
        phone="09120000000",
        password_hash=get_password_hash("AdminPass123!"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def host_user(db_session: Session) -> User:
    host = User(
        full_name="Host User",
        email="host@sarpanah.com",
        phone="09121111111",
        password_hash=get_password_hash("HostPass123!"),
        role=UserRole.HOST,
        is_active=True,
    )
    db_session.add(host)
    db_session.commit()
    db_session.refresh(host)
    return host


@pytest.fixture
def guest_user(db_session: Session) -> User:
    guest = User(
        full_name="Guest User",
        email="guest@sarpanah.com",
        phone="09122222222",
        password_hash=get_password_hash("GuestPass123!"),
        role=UserRole.GUEST,
        is_active=True,
    )
    db_session.add(guest)
    db_session.commit()
    db_session.refresh(guest)
    return guest
