"""
Seed script: داده‌های اولیه را در دیتابیس ایجاد می‌کند.
اجرا (از پوشه sar-panah): python scripts/seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from decimal import Decimal
from datetime import time
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.models.location import Country, Province, City
from app.models.property import Property, PropertyType, CancellationPolicy, PropertyStatus
from app.models.amenity import Amenity, PropertyAmenity
from app.models.unit import Unit
from app.models.photo import Photo
from app.core.security import get_password_hash


def seed(db: Session):
    print("🌱 شروع seed دیتابیس...")

    # ===== Country =====
    iran = db.query(Country).filter(Country.iso_code == "IR").first()
    if not iran:
        iran = Country(name="ایران", iso_code="IR")
        db.add(iran)
        db.flush()

    # ===== Provinces & Cities =====
    provinces_data = [
        ("گیلان", [("رشت", "rasht"), ("بندر انزلی", "anzali"), ("لاهیجان", "lahijan")]),
        ("مازندران", [("رامسر", "ramsar"), ("ساری", "sari"), ("چالوس", "chalus")]),
        ("اصفهان", [("اصفهان", "isfahan"), ("کاشان", "kashan")]),
        ("فارس", [("شیراز", "shiraz")]),
        ("یزد", [("یزد", "yazd")]),
        ("کرمان", [("کرمان", "kerman"), ("ماهان", "mahan")]),
        ("خراسان رضوی", [("مشهد", "mashhad")]),
        ("تهران", [("تهران", "tehran")]),
    ]

    city_map = {}

    for prov_name, cities in provinces_data:
        province = db.query(Province).filter(
            Province.name == prov_name, Province.country_id == iran.id
        ).first()
        if not province:
            province = Province(name=prov_name, country_id=iran.id)
            db.add(province)
            db.flush()

        for city_name, city_slug in cities:
            city = db.query(City).filter(
                City.name == city_name, City.province_id == province.id
            ).first()
            if not city:
                city = City(name=city_name, province_id=province.id)
                db.add(city)
                db.flush()
            city_map[city_slug] = city

    print(f"  ✅ {len(city_map)} شهر اضافه شد")

    # ===== Property Types =====
    type_names = ["ویلا", "آپارتمان", "اقامتگاه بوم‌گردی", "کلبه", "سوئیت", "خانه سنتی"]
    type_map = {}
    for name in type_names:
        t = db.query(PropertyType).filter(PropertyType.name == name).first()
        if not t:
            t = PropertyType(name=name)
            db.add(t)
            db.flush()
        type_map[name] = t

    # ===== Cancellation Policies =====
    policies_data = [
        ("انعطاف‌پذیر", 1, Decimal("100")),
        ("متوسط", 5, Decimal("50")),
        ("سخت", 7, Decimal("0")),
    ]
    policy_map = {}
    for pname, days, refund in policies_data:
        p = db.query(CancellationPolicy).filter(CancellationPolicy.name == pname).first()
        if not p:
            p = CancellationPolicy(name=pname, free_cancel_days=days, refund_percent=refund)
            db.add(p)
            db.flush()
        policy_map[pname] = p

    # ===== Amenities =====
    amenities_data = [
        "وای‌فای رایگان", "پارکینگ", "استخر", "باربیکیو", "آشپزخانه", "تهویه مطبوع",
        "گرمایش", "تلویزیون", "ماشین لباسشویی", "بالکن", "حیاط", "دسترسی به ساحل",
    ]
    amenity_map = {}
    for a_name in amenities_data:
        a = db.query(Amenity).filter(Amenity.name == a_name).first()
        if not a:
            a = Amenity(name=a_name)
            db.add(a)
            db.flush()
        amenity_map[a_name] = a

    print(f"  ✅ {len(amenities_data)} امکانات اضافه شد")

    # ===== Admin User =====
    admin = db.query(User).filter(User.email == "admin@sarpanah.ir").first()
    if not admin:
        admin = User(
            full_name="مدیر سیستم",
            email="admin@sarpanah.ir",
            phone="09000000000",
            password_hash=get_password_hash("Admin@2026"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        db.flush()
        print("  ✅ کاربر ادمین ساخته شد (admin@sarpanah.ir / Admin@2026)")

    # ===== Host User =====
    host = db.query(User).filter(User.email == "host@sarpanah.ir").first()
    if not host:
        host = User(
            full_name="علی احمدی",
            email="host@sarpanah.ir",
            phone="09111111111",
            password_hash=get_password_hash("Host@2026"),
            role=UserRole.HOST,
            is_active=True,
        )
        db.add(host)
        db.flush()
        print("  ✅ کاربر میزبان نمونه ساخته شد (host@sarpanah.ir / Host@2026)")

    # ===== Sample Properties =====
    properties_data = [
        {
            "title": "ویلای جنگلی لاکچری گیلان",
            "description": "ویلای بی‌نظیر در دل جنگل‌های سرسبز گیلان با دید کامل به دریا.",
            "address": "گیلان، رشت، روستای سراوان",
            "city": "rasht",
            "type": "ویلا",
            "policy": "انعطاف‌پذیر",
            "base_price": Decimal("2500000"),
            "max_guests": 8, "bedrooms": 4, "beds": 5, "bathrooms": 2,
            "amenities": ["وای‌فای رایگان", "پارکینگ", "باربیکیو", "آشپزخانه", "حیاط"],
            "photo": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
        },
        {
            "title": "کلبه چوبی دریاچه رامسر",
            "description": "کلبه‌ای رومانتیک با چشم‌انداز دریاچه. صبحانه شامل، دسترسی مستقیم به آب.",
            "address": "مازندران، رامسر، کنار دریاچه",
            "city": "ramsar",
            "type": "کلبه",
            "policy": "متوسط",
            "base_price": Decimal("1800000"),
            "max_guests": 4, "bedrooms": 2, "beds": 3, "bathrooms": 1,
            "amenities": ["وای‌فای رایگان", "گرمایش", "تلویزیون", "بالکن", "دسترسی به ساحل"],
            "photo": "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
        },
        {
            "title": "خانه سنتی اصفهان",
            "description": "خانه تاریخی قاجاری با حیاط مرکزی، حوض آب، و معماری اصیل ایرانی.",
            "address": "اصفهان، خیابان چهارباغ",
            "city": "isfahan",
            "type": "خانه سنتی",
            "policy": "انعطاف‌پذیر",
            "base_price": Decimal("2200000"),
            "max_guests": 6, "bedrooms": 3, "beds": 4, "bathrooms": 2,
            "amenities": ["وای‌فای رایگان", "آشپزخانه", "حیاط", "تهویه مطبوع"],
            "photo": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
        },
        {
            "title": "اقامتگاه بوم‌گردی کویر یزد",
            "description": "تجربه شب‌نشینی در کویر، زیر آسمان پر ستاره. غذاهای محلی اصیل.",
            "address": "یزد، روستای چوپانان",
            "city": "yazd",
            "type": "اقامتگاه بوم‌گردی",
            "policy": "متوسط",
            "base_price": Decimal("1500000"),
            "max_guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 1,
            "amenities": ["باربیکیو", "حیاط"],
            "photo": "https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?w=800",
        },
        {
            "title": "سوئیت لوکس شیراز",
            "description": "سوئیت مدرن در قلب شیراز، قدم تا باغ ارم و آرامگاه حافظ.",
            "address": "شیراز، خیابان ارم",
            "city": "shiraz",
            "type": "سوئیت",
            "policy": "انعطاف‌پذیر",
            "base_price": Decimal("1900000"),
            "max_guests": 2, "bedrooms": 1, "beds": 1, "bathrooms": 1,
            "amenities": ["وای‌فای رایگان", "تهویه مطبوع", "تلویزیون", "پارکینگ"],
            "photo": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        },
        {
            "title": "ویلای ساحلی چالوس",
            "description": "ویلای مدرن روبروی دریا با استخر اختصاصی و پارکینگ.",
            "address": "مازندران، چالوس، خیابان ساحلی",
            "city": "chalus",
            "type": "ویلا",
            "policy": "سخت",
            "base_price": Decimal("3500000"),
            "max_guests": 10, "bedrooms": 5, "beds": 7, "bathrooms": 3,
            "amenities": ["وای‌فای رایگان", "استخر", "پارکینگ", "باربیکیو", "آشپزخانه", "دسترسی به ساحل"],
            "photo": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
        },
        {
            "title": "آپارتمان مدرن مشهد",
            "description": "آپارتمان نزدیک حرم با امکانات کامل. ۱۰ دقیقه پیاده تا حرم مطهر.",
            "address": "مشهد، خیابان امام رضا",
            "city": "mashhad",
            "type": "آپارتمان",
            "policy": "انعطاف‌پذیر",
            "base_price": Decimal("1200000"),
            "max_guests": 4, "bedrooms": 2, "beds": 3, "bathrooms": 1,
            "amenities": ["وای‌فای رایگان", "تهویه مطبوع", "تلویزیون", "ماشین لباسشویی"],
            "photo": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        },
        {
            "title": "باغ ویلای کاشان",
            "description": "باغ ویلای بزرگ با باغچه گل، کنار خانه‌های تاریخی فین.",
            "address": "کاشان، محله فین",
            "city": "kashan",
            "type": "ویلا",
            "policy": "متوسط",
            "base_price": Decimal("2800000"),
            "max_guests": 12, "bedrooms": 6, "beds": 8, "bathrooms": 3,
            "amenities": ["وای‌فای رایگان", "پارکینگ", "باربیکیو", "آشپزخانه", "حیاط", "تهویه مطبوع"],
            "photo": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        },
    ]

    created_count = 0
    for pdata in properties_data:
        exists = db.query(Property).filter(Property.title == pdata["title"]).first()
        if exists:
            continue

        prop = Property(
            host_id=host.id,
            city_id=city_map[pdata["city"]].id,
            type_id=type_map[pdata["type"]].id,
            policy_id=policy_map[pdata["policy"]].id,
            title=pdata["title"],
            description=pdata["description"],
            address=pdata["address"],
            status=PropertyStatus.ACTIVE,
            check_in_time=time(14, 0),
            check_out_time=time(12, 0),
        )
        db.add(prop)
        db.flush()

        # Unit
        unit = Unit(
            property_id=prop.id,
            name="واحد اصلی",
            max_guests=pdata["max_guests"],
            bedrooms=pdata["bedrooms"],
            beds=pdata["beds"],
            bathrooms=pdata["bathrooms"],
            base_price_per_night=pdata["base_price"],
            is_active=True,
        )
        db.add(unit)

        # Cover photo
        photo = Photo(
            property_id=prop.id,
            url=pdata["photo"],
            sort_order=0,
        )
        db.add(photo)

        # Amenities
        for a_name in pdata["amenities"]:
            if a_name in amenity_map:
                pa = PropertyAmenity(property_id=prop.id, amenity_id=amenity_map[a_name].id)
                db.add(pa)

        created_count += 1

    print(f"  ✅ {created_count} اقامتگاه نمونه اضافه شد")

    db.commit()
    print("\n🎉 Seed کامل شد!")
    print("\n📧 اطلاعات ورود:")
    print("   ادمین:   admin@sarpanah.ir / Admin@2026")
    print("   میزبان:  host@sarpanah.ir  / Host@2026")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed(db)
    except Exception as e:
        db.rollback()
        print(f"❌ خطا: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()
