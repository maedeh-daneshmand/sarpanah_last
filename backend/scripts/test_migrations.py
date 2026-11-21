import os
import sys
from os.path import abspath, dirname

sys.path.insert(0, dirname(dirname(abspath(__file__))))

from alembic.config import Config
from alembic import command
import psycopg
from app.core.config import settings

def test_alembic_cycle():
    print("Testing Alembic migration cycle on sarpanah_test...")
    
    # Clean sarpanah_test public schema
    conn = psycopg.connect(
        host=settings.POSTGRES_SERVER,
        port=settings.POSTGRES_PORT,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        dbname=settings.TEST_POSTGRES_DB,
        autocommit=True
    )
    with conn.cursor() as cur:
        cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
    conn.close()

    alembic_cfg = Config("alembic.ini")
    escaped_test_url = settings.TEST_SQLALCHEMY_DATABASE_URI.replace("%", "%%")
    alembic_cfg.set_main_option("sqlalchemy.url", escaped_test_url)

    # 1. Test upgrade head
    print("Executing: alembic upgrade head")
    command.upgrade(alembic_cfg, "head")
    print("Upgrade head succeeded.")

    # Check tables created
    conn = psycopg.connect(
        host=settings.POSTGRES_SERVER,
        port=settings.POSTGRES_PORT,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        dbname=settings.TEST_POSTGRES_DB,
        autocommit=True
    )
    with conn.cursor() as cur:
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
        tables = [row[0] for row in cur.fetchall()]
        print(f"Tables in sarpanah_test after upgrade: {len(tables)} tables")
        assert len(tables) >= 20, f"Expected 20 tables + alembic_version, got {len(tables)}"
        assert "bookings" in tables
        assert "booking_nights" in tables
        assert "properties" in tables
        assert "units" in tables
        assert "users" in tables

    # 2. Test downgrade base
    print("Executing: alembic downgrade base")
    command.downgrade(alembic_cfg, "base")
    print("Downgrade base succeeded.")

    with conn.cursor() as cur:
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
        remaining_tables = [row[0] for row in cur.fetchall()]
        print(f"Tables in sarpanah_test after downgrade: {len(remaining_tables)}")
        assert len(remaining_tables) <= 1  # only alembic_version or empty

    # 3. Final upgrade head on test database
    command.upgrade(alembic_cfg, "head")
    conn.close()
    print("Alembic upgrade/downgrade cycle test PASSED 100%!")

if __name__ == "__main__":
    test_alembic_cycle()
