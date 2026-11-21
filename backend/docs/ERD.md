# SarPanah Database ERD Documentation

این مستندات بر اساس نمودار دقیق موجودیت-رابطه (ERD) سامانه رزرو اقامتگاه **سرپناه (SarPanah)** تدوین شده است.

## حوزه‌ها و جدول‌های ۲۰گانه (Domains & Entities)

### ۱. مکان‌ها (Locations)
- **`COUNTRY`**:
  - `id` (INT, PK, Auto-increment)
  - `name` (VARCHAR(100), NOT NULL)
  - `iso_code` (CHAR(2), NOT NULL, UNIQUE)
- **`PROVINCE`**:
  - `id` (INT, PK, Auto-increment)
  - `country_id` (INT, FK -> COUNTRY.id, NOT NULL)
  - `name` (VARCHAR(100), NOT NULL)
  - قید یکتایی: `UNIQUE (country_id, name)`
- **`CITY`**:
  - `id` (INT, PK, Auto-increment)
  - `province_id` (INT, FK -> PROVINCE.id, NOT NULL)
  - `name` (VARCHAR(100), NOT NULL)
  - قید یکتایی: `UNIQUE (province_id, name)`

### ۲. کاربران (Users)
- **`USER`**:
  - `id` (INT, PK, Auto-increment)
  - `full_name` (VARCHAR(150), NOT NULL)
  - `email` (VARCHAR(255), NOT NULL, UNIQUE)
  - `phone` (VARCHAR(20), NULL, UNIQUE)
  - `password_hash` (VARCHAR(255), NOT NULL)
  - `role` (ENUM: `'guest'`, `'host'`, `'admin'`, DEFAULT `'guest'`)
  - `is_active` (BOOLEAN, DEFAULT TRUE)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### ۳. اقامتگاه و واحدها (Accommodation)
- **`PROPERTY_TYPE`**:
  - `id` (INT, PK, Auto-increment)
  - `name` (VARCHAR(60), NOT NULL, UNIQUE)
- **`CANCELLATION_POLICY`**:
  - `id` (INT, PK, Auto-increment)
  - `name` (VARCHAR(60), NOT NULL, UNIQUE)
  - `free_cancel_days` (INT, NOT NULL, DEFAULT 0)
  - `refund_percent` (NUMERIC(5, 2), NOT NULL)
- **`PROPERTY`**:
  - `id` (INT, PK, Auto-increment)
  - `host_id` (INT, FK -> USER.id, NOT NULL)
  - `city_id` (INT, FK -> CITY.id, NOT NULL)
  - `type_id` (INT, FK -> PROPERTY_TYPE.id, NOT NULL)
  - `policy_id` (INT, FK -> CANCELLATION_POLICY.id, NOT NULL)
  - `title` (VARCHAR(200), NOT NULL)
  - `description` (TEXT, NOT NULL)
  - `address` (VARCHAR(300), NOT NULL)
  - `latitude` (NUMERIC(9, 6), NULL)
  - `longitude` (NUMERIC(9, 6), NULL)
  - `check_in_time` (TIME, NOT NULL, DEFAULT '14:00:00')
  - `check_out_time` (TIME, NOT NULL, DEFAULT '12:00:00')
  - `status` (ENUM: `'draft'`, `'active'`, `'suspended'`, DEFAULT `'draft'`)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
  - `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- **`UNIT`**:
  - `id` (INT, PK, Auto-increment)
  - `property_id` (INT, FK -> PROPERTY.id, NOT NULL)
  - `name` (VARCHAR(120), NOT NULL)
  - `max_guests` (INT, NOT NULL)
  - `bedrooms` (INT, NOT NULL, DEFAULT 1)
  - `beds` (INT, NOT NULL, DEFAULT 1)
  - `bathrooms` (INT, NOT NULL, DEFAULT 1)
  - `base_price_per_night` (NUMERIC(12, 2), NOT NULL)
  - `cleaning_fee` (NUMERIC(12, 2), NOT NULL, DEFAULT 0)
  - `is_active` (BOOLEAN, DEFAULT TRUE)
- **`AMENITY`**:
  - `id` (INT, PK, Auto-increment)
  - `name` (VARCHAR(80), NOT NULL, UNIQUE)
  - `icon` (VARCHAR(100), NULL)
- **`PROPERTY_AMENITY`**:
  - `property_id` (INT, PK, FK -> PROPERTY.id, NOT NULL)
  - `amenity_id` (INT, PK, FK -> AMENITY.id, NOT NULL)
  - `PRIMARY KEY (property_id, amenity_id)`
- **`PHOTO`**:
  - `id` (INT, PK, Auto-increment)
  - `property_id` (INT, FK -> PROPERTY.id, NOT NULL)
  - `unit_id` (INT, FK -> UNIT.id, NULL)
  - `url` (VARCHAR(500), NOT NULL)
  - `sort_order` (INT, NOT NULL, DEFAULT 0)
- **`UNIT_PRICE_CALENDAR`**:
  - `id` (INT, PK, Auto-increment)
  - `unit_id` (INT, FK -> UNIT.id, NOT NULL)
  - `day` (DATE, NOT NULL)
  - `price` (NUMERIC(12, 2), NOT NULL)
  - `is_blocked` (BOOLEAN, DEFAULT FALSE)
  - قید یکتایی: `UNIQUE (unit_id, day)`

### ۴. رزرو و پرداخت (Booking & Payment)
- **`COUPON`**:
  - `id` (INT, PK, Auto-increment)
  - `code` (VARCHAR(40), NOT NULL, UNIQUE)
  - `discount_percent` (NUMERIC(5, 2), NOT NULL)
  - `valid_from` (DATE, NOT NULL)
  - `valid_to` (DATE, NOT NULL)
  - `usage_limit` (INT, NULL)
- **`BOOKING`**:
  - `id` (INT, PK, Auto-increment)
  - `guest_id` (INT, FK -> USER.id, NOT NULL)
  - `unit_id` (INT, FK -> UNIT.id, NOT NULL)
  - `coupon_id` (INT, FK -> COUPON.id, NULL)
  - `check_in` (DATE, NOT NULL)
  - `check_out` (DATE, NOT NULL)
  - `guests_count` (INT, NOT NULL)
  - `nights` (INT, NOT NULL)
  - `subtotal` (NUMERIC(12, 2), NOT NULL)
  - `cleaning_fee` (NUMERIC(12, 2), NOT NULL, DEFAULT 0)
  - `service_fee` (NUMERIC(12, 2), NOT NULL, DEFAULT 0)
  - `discount_amount` (NUMERIC(12, 2), NOT NULL, DEFAULT 0)
  - `total_price` (NUMERIC(12, 2), NOT NULL)
  - `status` (ENUM: `'pending'`, `'confirmed'`, `'cancelled'`, `'completed'`, `'rejected'`, DEFAULT `'pending'`)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
  - `cancelled_at` (TIMESTAMP WITH TIME ZONE, NULL)
- **`BOOKING_NIGHT`**:
  - `booking_id` (INT, PK, FK -> BOOKING.id, NOT NULL)
  - `unit_id` (INT, FK -> UNIT.id, NOT NULL)
  - `night` (DATE, PK, NOT NULL)
  - `price` (NUMERIC(12, 2), NOT NULL)
  - `PRIMARY KEY (booking_id, night)`
  - قید یکتایی و کنترل تداخل: `UNIQUE (unit_id, night)`
  - راهکار آزادسازی لغو: هنگام Cancel رزرو، رکوردهای مربوط به `BOOKING_NIGHT` در یک تراکنش حذف می‌شوند تا تاریخ‌ها آزاد شده و رزروهای جدید بتوانند ثبت شوند.
- **`PAYMENT`**:
  - `id` (INT, PK, Auto-increment)
  - `booking_id` (INT, FK -> BOOKING.id, NOT NULL)
  - `amount` (NUMERIC(12, 2), NOT NULL)
  - `method` (ENUM: `'card'`, `'wallet'`, `'bank_transfer'`, NOT NULL)
  - `status` (ENUM: `'pending'`, `'successful'`, `'failed'`, `'refunded'`, DEFAULT `'pending'`)
  - `transaction_ref` (VARCHAR(100), NULL, UNIQUE)
  - `paid_at` (TIMESTAMP WITH TIME ZONE, NULL)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### ۵. تعاملات (Interactions)
- **`REVIEW`**:
  - `id` (INT, PK, Auto-increment)
  - `booking_id` (INT, FK -> BOOKING.id, NOT NULL, UNIQUE)
  - `rating` (INT, NOT NULL, CHECK rating BETWEEN 1 AND 5)
  - `comment` (TEXT, NULL)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- **`WISHLIST`**:
  - `id` (INT, PK, Auto-increment)
  - `user_id` (INT, FK -> USER.id, NOT NULL)
  - `name` (VARCHAR(100), NOT NULL)
  - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
  - قید یکتایی: `UNIQUE (user_id, name)`
- **`WISHLIST_ITEM`**:
  - `wishlist_id` (INT, PK, FK -> WISHLIST.id, NOT NULL)
  - `property_id` (INT, PK, FK -> PROPERTY.id, NOT NULL)
  - `added_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
  - `PRIMARY KEY (wishlist_id, property_id)`
- **`MESSAGE`**:
  - `id` (INT, PK, Auto-increment)
  - `sender_id` (INT, FK -> USER.id, NOT NULL)
  - `receiver_id` (INT, FK -> USER.id, NOT NULL)
  - `booking_id` (INT, FK -> BOOKING.id, NULL)
  - `body` (TEXT, NOT NULL)
  - `sent_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

---

## ۲۵ رابطه مشخص‌شده در ERD

1. `COUNTRY` 1:N `PROVINCE`
2. `PROVINCE` 1:N `CITY`
3. `CITY` 1:N `PROPERTY`
4. `USER` 1:N `PROPERTY` (میزبان)
5. `PROPERTY_TYPE` 1:N `PROPERTY`
6. `CANCELLATION_POLICY` 1:N `PROPERTY`
7. `PROPERTY` 1:N `UNIT`
8. `PROPERTY` 1:N `PROPERTY_AMENITY`
9. `AMENITY` 1:N `PROPERTY_AMENITY`
10. `PROPERTY` 1:N `PHOTO`
11. `UNIT` 1:N `PHOTO` (اختیاری)
12. `UNIT` 1:N `UNIT_PRICE_CALENDAR`
13. `USER` 1:N `BOOKING` (مهمان)
14. `UNIT` 1:N `BOOKING`
15. `COUPON` 1:N `BOOKING` (اختیاری)
16. `BOOKING` 1:N `BOOKING_NIGHT`
17. `UNIT` 1:N `BOOKING_NIGHT`
18. `BOOKING` 1:N `PAYMENT`
19. `BOOKING` 1:0..1 `REVIEW` (یک‌به‌یک اختیاری)
20. `USER` 1:N `WISHLIST`
21. `WISHLIST` 1:N `WISHLIST_ITEM`
22. `PROPERTY` 1:N `WISHLIST_ITEM`
23. `USER` 1:N `MESSAGE` (فرستنده)
24. `USER` 1:N `MESSAGE` (گیرنده)
25. `BOOKING` 1:N `MESSAGE` (اختیاری)
