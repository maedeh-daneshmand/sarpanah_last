import sys
from os.path import abspath, dirname
from decimal import Decimal

sys.path.insert(0, dirname(dirname(abspath(__file__))))

from app.db.base import Base
from app.db.database import engine, SessionLocal
from app.models.location import Country, Province, City
from app.models.property import PropertyType, CancellationPolicy
from app.models.amenity import Amenity
from app.models.user import User, UserRole
from app.core.security import get_password_hash


def init_database():
    print("Creating all tables in PostgreSQL from metadata...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    db = SessionLocal()
    try:
        # 1. Countries
        if not db.query(Country).filter(Country.iso_code == "IR").first():
            iran = Country(name="Iran", iso_code="IR")
            db.add(iran)
            db.flush()

            # Provinces
            tehran_prov = Province(country_id=iran.id, name="Tehran")
            mazandaran_prov = Province(country_id=iran.id, name="Mazandaran")
            isfahan_prov = Province(country_id=iran.id, name="Isfahan")
            db.add_all([tehran_prov, mazandaran_prov, isfahan_prov])
            db.flush()

            # Cities
            db.add_all([
                City(province_id=tehran_prov.id, name="Tehran"),
                City(province_id=mazandaran_prov.id, name="Ramsar"),
                City(province_id=mazandaran_prov.id, name="Chaloos"),
                City(province_id=isfahan_prov.id, name="Isfahan"),
            ])
            print("Seeded Countries, Provinces, and Cities.")

        # 2. Property Types
        types = ["Villa", "Apartment", "Cabin", "Cottage", "Boutique Hotel"]
        for t in types:
            if not db.query(PropertyType).filter(PropertyType.name == t).first():
                db.add(PropertyType(name=t))

        # 3. Cancellation Policies
        policies = [
            ("Flexible", 1, Decimal("100.00")),
            ("Moderate", 5, Decimal("70.00")),
            ("Strict", 14, Decimal("50.00")),
        ]
        for name, days, refund in policies:
            if not db.query(CancellationPolicy).filter(CancellationPolicy.name == name).first():
                db.add(CancellationPolicy(name=name, free_cancel_days=days, refund_percent=refund))

        # 4. Amenities
        amenities = [
            ("WiFi", "wifi"),
            ("Swimming Pool", "pool"),
            ("Free Parking", "parking"),
            ("Air Conditioning", "ac"),
            ("Kitchen", "kitchen"),
            ("Barbecue", "bbq"),
            ("Sea View", "sea"),
        ]
        for name, icon in amenities:
            if not db.query(Amenity).filter(Amenity.name == name).first():
                db.add(Amenity(name=name, icon=icon))

        # 5. Default Admin User
        admin_email = "admin@sarpanah.com"
        if not db.query(User).filter(User.email == admin_email).first():
            admin = User(
                full_name="SarPanah Super Admin",
                email=admin_email,
                phone="09120000001",
                password_hash=get_password_hash("AdminSarPanah2026!"),
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(admin)
            print(f"Created default admin user: {admin_email} / AdminSarPanah2026!")

        db.commit()
        print("Initial database seed completed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
