# سرپناه (SarPanah) — سیستم جامع رزرو اقامتگاه

بک‌اند استاندارد و قدرتمند سامانه رزرواسیون اقامتگاه با معماری ماژولار و مقیاس‌پذیر، توسعه‌داده‌شده با **Python 3.13**، **FastAPI**، **PostgreSQL 18** و **SQLAlchemy 2.x**.

---

## ۱. ویژگی‌ها و مشخصات کلیدی

- **طراحی پایگاه داده بر اساس ERD اختصاصی**: پیاده‌سازی کامل ۲۰ جدول و ۲۵ رابطه در ۵ دامنه تخصصی.
- **تأیید هویت و کنترل دسترسی بر پایه نقش (RBAC)**: پشتیبانی از ۳ سطح کاربری (`guest`, `host`, `admin`) با توکن‌های JWT و هش رمزنگاری‌شده امن با Bcrypt.
- **موتور رزرواسیون و جلوگیری از تداخل (Concurrency-Safe Booking Engine)**: رزرو به ازای هر شب با استفاده از قیدهای یکتای دیتابیس `(unit_id, night)` و تراکنش‌های اتمیک برای جلوگیری قطعی از رزرو همزمان یا Overbooking.
- **آزادسازی خودکار شب‌های لغوشده**: در هنگام Cancel، رکوردهای شب‌های مسدودشده به شکل تراکنشی حذف شده و ظرفیت بلافاصله در دسترس سایر کاربران قرار می‌گیرد در حالی که تاریخچه مالی حفظ می‌شود.
- **سیاست‌های لغو و بازپرداخت پویا (Cancellation & Refund Engine)**: محاسبه خودکار جریمه و بازپرداخت بر اساس قوانین هر اقامتگاه (`free_cancel_days` و `refund_percent`).
- **محاسبه هوشمند قیمت و کوپن‌های تخفیف**: پشتیبانی از تقویم قیمت روزانه (`unit_price_calendars`)، هزینه نظافت، کارمزد خدمات و کوپن‌های درصدی تاریخ‌دار.
- **شبیه‌سازی تراکنش‌های مالی (Simulated Payment Gateway)**: آزمودن سناریوهای موفق و ناموفق پرداخت با کد پیگیری یکتا.
- **پوشش تست کامل**: بیش از ۲۰ تست واحد و یکپارچگی (Integration Tests) با استفاده از Pytest و HTTPX.
- **مستندسازی تعاملی OpenAPI / Swagger**: دسترسی از مسیر `/docs` و مجموعه کامل کالکشن Postman.

---

## ۲. دامنه‌ها و جدول‌های پایگاه داده (۲۰ جدول)

| دامنه (Domain) | موجودیت‌ها (Entities) | شرح کاربرد |
| :--- | :--- | :--- |
| **Locations** | `countries`, `provinces`, `cities` | مدیریت سلسله‌مراتبی کشور، استان و شهر با قیدهای نرمال‌سازی‌شده. |
| **Users** | `users` | حساب‌های کاربری با نقش‌های مهمان، میزبان و مدیر سیستم. |
| **Accommodation** | `property_types`, `cancellation_policies`, `properties`, `units`, `amenities`, `property_amenities`, `photos`, `unit_price_calendars` | تعریف اقامتگاه، واحدهای قابل رزرو، قیمت‌های تقویمی، امکانات و تصاویر. |
| **Booking & Payment** | `coupons`, `bookings`, `booking_nights`, `payments` | مدیریت فرآیند رزرو، ثبت شب‌های رزروشده، تخفیف‌ها و تراکنش‌های مالی. |
| **Interactions** | `reviews`, `wishlists`, `wishlist_items`, `messages` | امتیازدهی مهمان، فهرست علاقه‌مندی‌ها و پیام‌رسانی درون‌سیستمی. |

---

## ۳. ساختار پوشه‌ها و معماری پروژه

```text
sar-panah/
│
├── app/
│   ├── main.py                     # نقطه ورود برنامه FastAPI و پیکربندی Routerها
│   ├── core/
│   │   ├── config.py               # مدیریت تنظیمات محیطی با Pydantic Settings
│   │   ├── security.py             # تولید و اعتبارسنجی JWT و هش Bcrypt
│   │   └── exceptions.py           # کلاس‌های خطای استاندارد HTTP
│   ├── db/
│   │   ├── base.py                 # DeclarativeBase برای SQLAlchemy 2
│   │   └── database.py             # اتصال دیتابیس و مدیریت سشن‌ها
│   ├── models/                     # مدلهای ORM نگاشت‌شده به ۲۰ جدول ERD
│   ├── schemas/                    # اعتبارسنجی داده‌های ورودی و خروجی با Pydantic v2
│   ├── services/                   # لایه منطق بیزنس (رزرو، قیمت‌گذاری، پرداخت، لغو)
│   ├── routers/                    # اندپوینت‌های RESTful تفکیک‌شده
│   └── dependencies/               # تزریق وابستگی‌های Auth و Permissions
│
├── alembic/                        # تنظیمات و فایل‌های مهاجرت پایگاه داده
├── tests/                          # تست‌های خودکار با Pytest و HTTPX
├── scripts/
│   └── init_db.py                  # اسکریپت راه‌اندازی و سید داده‌های اولیه
├── postman/
│   └── sarpanah_postman_collection.json # کالکشن کامل تست اندپوینت‌ها در Postman
├── docs/
│   ├── ERD.md                      # مستندات متنی و مشخصات کامل جدول‌ها
│   └── erd-presentation.html       # ارائه تعاملی و ویژوال ERD
├── .env.example                    # نمونه متغیرهای محیطی
├── requirements.txt                # پیش‌نیازها و پکیج‌های پایتون
└── README.md
```

---

## ۴. نحوه نصب و راه‌اندازی

### مرحله ۱: کلون یا ورود به پوشه پروژه
```bash
cd sar-panah
```

### مرحله ۲: فعال‌سازی محیط مجازی پایتون
در ویندوز (PowerShell):
```powershell
.\.venv\Scripts\Activate.ps1
```

### مرحله ۳: نصب وابستگی‌ها
```bash
pip install -r requirements.txt
```

### مرحله ۴: تنظیم متغیرهای محیطی
یک کپی از فایل `.env.example` به نام `.env` ایجاد کرده و اطلاعات اتصال دیتابیس را وارد نمایید:
```env
PROJECT_NAME=SarPanah
API_V1_STR=/api/v1
SECRET_KEY=your-super-secret-key-for-jwt-signing
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=sarpanah
```

### مرحله ۵: ساخت جداول و سید داده‌های اولیه
```bash
python scripts/init_db.py
```

### مرحله ۶: اجرای سرور توسعه (Uvicorn)
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
سپس مستندات Swagger در آدرس زیر در دسترس خواهد بود:
👉 **http://localhost:8000/docs**

---

## ۵. نحوه اجرای تست‌ها

تست‌ها در محیط ایزوله حافظه اجرا می‌شوند و نیازی به تغییر یا ریسک در دیتابیس اصلی ندارند:
```bash
pytest tests -v
```

---

## ۶. حساب‌های پیش‌فرض تست

پس از اجرای `scripts/init_db.py`:
- **مدیر ارشد (Admin)**: `admin@sarpanah.com` / کلمه عبور: `AdminSarPanah2026!`
