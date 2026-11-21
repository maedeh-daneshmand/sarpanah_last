# راهنمای جامع راه‌اندازی و اجرای سامانه سرپناه (Sarpanah)

این پروژه شامل دو بخش مجزا است:
1. **بکاند:** FastAPI + PostgreSQL + SQLAlchemy + Alembic
2. **فرانتاند:** Next.js 14 (App Router) + TypeScript + Tailwind CSS

---

## ۱. پیش‌نیازها
- **Node.js** نسخه ۲۰ یا بالاتر
- **Python** نسخه ۳.۱۱ یا بالاتر
- دیتابیس **PostgreSQL** یا کانتینر Docker آن

---

## ۲. راه‌اندازی بکاند (FastAPI)

وارد پوشه بکاند شوید:
```bash
cd sar-panah
```

محیط مجازی پایتون را فعال کنید:
```bash
# ویندوز (PowerShell)
.venv\Scripts\Activate.ps1

# لینوکس یا مک
source .venv/bin/activate
```

نصب وابستگی‌ها (در صورت نیاز):
```bash
pip install -r requirements.txt
```

تنظیم متغیرهای محیطی در فایل `sar-panah/.env`:
```env
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sarpanah
SECRET_KEY=sarpanah-super-secret-jwt-key-2026-production-ready-accommodation
```

اعمال Migrationها و اجرای سرور بکاند:
```bash
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- مستندات OpenAPI / Swagger در آدرس: `http://127.0.0.1:8000/docs`

---

## ۳. راه‌اندازی فرانتاند (Next.js)

در ریشه پروژه اصلی فرانتاند قرار بگیرید:
```bash
cd c:\Users\ASUS\vpn_landing_page_maedeh
```

بررسی متغیر محیطی در `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

اجرای فرانتاند در حالت توسعه (Development):
```bash
npm run dev
```
- سامانه در مرورگر در آدرس زیر در دسترس خواهد بود:
  `http://localhost:3000`

---

## ۴. ویژگی‌های پیاده‌سازی شده در فرانتاند

1. **سه تم اقلیمی زنده (Theme Management):**
   - تم پیش‌فرض (Modern Hospitality)
   - تم جنگلی (سبز هیرکانی - گیلان و مازندران)
   - تم کویری (گرم و سفالی - یزد و کاشان)
   - تم ساحلی (آبی اقیانوسی - کیش و قشم)
   - با قابلیت ذخیره‌سازی در Local Storage و تغییر در لحظه CSS Variables.

2. **سیستم احراز هویت یکپارچه (JWT):**
   - ثبت‌نام کاربر (`/register`)
   - ورود کاربر با ایمیل و رمز عبور (`/login`)
   - ذخیره Session امن در کلاینت بدون افشای داده‌های محرمانه
   - مدیریت خروج و کنترل دسترسی صفحات

3. **جریان کامل رزرو واقعی (End-to-End Booking Flow):**
   - محاسبه هزینه دقیق از سرویس Quote بکاند (`/bookings/quote`)
   - ایجاد رزرو در دیتابیس (`/bookings/`) با وضعیت Pending
   - درگاه شبیه‌سازی شده پرداخت آزمایشی (`/payments/`) و تغییر وضعیت رزرو به Confirmed

4. **پنل داشبورد کاربر (`/dashboard`):**
   - مشاهده لیست رزروهای مهمان همراه با وضعیت و جزئیات
   - امکان لغو رزرو با محاسبه خودکار جریمه/استرداد مطابق سیاست کنسلی
   - لیست علاقه‌مندی‌ها (Wishlists) با قابلیت افزودن و حذف
   - ویرایش اطلاعات کاربری پروفایل
   - ثبت نظر و امتیاز ستاره‌ای برای اقامتگاه‌های رزرو شده

5. **پنل میزبان (`/host`):**
   - مشاهده اقامتگاه‌های متعلق به میزبان جاری
   - ایجاد اقامتگاه جدید متصل به شهر و سیاست لغو
   - افزودن واحدهای اقامتی (ظرفیت، اتاق، تخت و قیمت هر شب)
   - افزودن عکس‌های اقامتگاه
