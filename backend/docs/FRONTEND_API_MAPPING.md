# Sarpanah Frontend API Mapping

> **Source**: Generated from actual backend source code in `sar-panah/app/`.  
> **Last updated**: 2026-11-14  
> No fields are guessed — all schemas are extracted directly from models, schemas, routers, and service files.

---

## 1. Base Configuration

| Setting | Value |
|---|---|
| **Local Base URL** | `http://127.0.0.1:8000` |
| **Production Base URL** | `NEXT_PUBLIC_API_BASE_URL` env variable |
| **API Prefix** | `/api/v1` |
| **Content-Type** | `application/json` |
| **Auth Header** | `Authorization: Bearer <access_token>` |
| **CORS** | `allow_origins=["*"]`, `allow_credentials=True` (set in `main.py`) |
| **OAuth2 Token URL** | `/api/v1/auth/login` (used by FastAPI Swagger UI) |

---

## 2. Authentication Mechanism

JWT Bearer tokens are used throughout.

- Token is obtained via `/api/v1/auth/login` (form data) or `/api/v1/auth/login-json` (JSON).
- Token payload: `{ "sub": "<user_id_as_string>" }`.
- Send token on every protected request: `Authorization: Bearer <token>`.
- **Role hierarchy**: `guest` < `host` < `admin`.
  - `get_current_active_user`: any authenticated + active user.
  - `get_current_host`: role must be `host` or `admin`.
  - `get_current_admin`: role must be `admin`.

---

## 3. Enums

### UserRole
| Value | Description |
|---|---|
| `guest` | Regular user who books properties |
| `host` | Property owner who lists and manages properties |
| `admin` | Full platform administrator |

> Public registration always creates a `guest`. Use admin endpoint to assign `host` or `admin` roles.

### BookingStatus
| Value | Description |
|---|---|
| `pending` | Booking created, payment not yet received |
| `confirmed` | Payment successful |
| `cancelled` | Booking was cancelled by guest, host, or admin |
| `completed` | Stay completed |
| `rejected` | Rejected (future use) |

### PaymentMethod
| Value | Description |
|---|---|
| `card` | Credit/debit card |
| `wallet` | Digital wallet |
| `bank_transfer` | Bank wire transfer |

### PaymentStatus
| Value | Description |
|---|---|
| `pending` | Payment initiated |
| `successful` | Payment completed successfully |
| `failed` | Payment attempt failed |
| `refunded` | Payment reversed on cancellation |

### PropertyStatus
| Value | Description |
|---|---|
| `draft` | Not yet published (default on create) |
| `active` | Publicly visible and bookable |
| `suspended` | Taken offline by host or admin |

---

## 4. Error Response Format

All API errors return JSON in the following format:

```json
{ "detail": "Human-readable error message" }
```

For validation errors (HTTP 422 Unprocessable Entity):
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error"
    }
  ]
}
```

**Common HTTP status codes:**
| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request (business logic error) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient role or ownership) |
| `404` | Not Found |
| `409` | Conflict (duplicate or concurrent booking) |
| `422` | Unprocessable Entity (validation failure) |

---

## 5. All Endpoints

### 5.1 Authentication — `/api/v1/auth`

#### `POST /api/v1/auth/register`
- **Auth**: ❌ Public
- **Description**: Register a new user account. Role is always set to `guest`.
- **Request Body** (`application/json`):
```json
{
  "full_name": "string",
  "email": "user@example.com",
  "phone": "string | null",
  "password": "string"
}
```
- **Response** `201` → `UserResponse`:
```json
{
  "id": 1,
  "full_name": "string",
  "email": "user@example.com",
  "phone": "string | null",
  "role": "guest",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```
- **Errors**: `409` if email or phone already registered.

---

#### `POST /api/v1/auth/login`
- **Auth**: ❌ Public
- **Description**: OAuth2 Password Flow (form-based). Used by Swagger UI. `username` field holds the email.
- **Request Body** (`application/x-www-form-urlencoded`):
```
username=user@example.com&password=secret
```
- **Response** `200` → `Token`:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```
- **Errors**: `401` if credentials invalid or user inactive.

---

#### `POST /api/v1/auth/login-json`
- **Auth**: ❌ Public
- **Description**: JSON-based login. Preferred for frontend clients.
- **Request Body** (`application/json`):
```json
{
  "email": "user@example.com",
  "password": "string"
}
```
- **Response** `200` → `Token`:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```
- **Errors**: `401` if credentials invalid or user inactive.

---

#### `GET /api/v1/auth/me`
- **Auth**: ✅ Required (any active user)
- **Description**: Returns full profile of the currently authenticated user.
- **Response** `200` → `UserResponse` (same shape as register response).

---

### 5.2 Users — `/api/v1/users`

#### `GET /api/v1/users/me`
- **Auth**: ✅ Required (any active user)
- **Description**: Retrieve private profile of the currently logged-in user.
- **Response** `200` → `UserResponse`:
```json
{
  "id": 1,
  "full_name": "string",
  "email": "user@example.com",
  "phone": "string | null",
  "role": "guest",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### `PUT /api/v1/users/me`
- **Auth**: ✅ Required (any active user)
- **Description**: Update own profile. Cannot change `role` or `is_active` here.
- **Request Body** (`application/json`, all fields optional):
```json
{
  "full_name": "string | null",
  "phone": "string | null",
  "password": "string | null"
}
```
- **Response** `200` → `UserResponse`
- **Errors**: `409` if new phone is already in use by another account.

---

#### `GET /api/v1/users/{user_id}`
- **Auth**: ✅ Required (any active user)
- **Description**: Get user by ID. Returns full profile if caller is the user themselves or an admin; otherwise returns public (sanitized) profile.
- **Path Param**: `user_id: int`
- **Response** `200`:
  - Full (`UserResponse`) if self or admin:
    ```json
    { "id": 1, "full_name": "...", "email": "...", "phone": "...", "role": "guest", "is_active": true, "created_at": "..." }
    ```
  - Public (`UserPublicResponse`) for other users:
    ```json
    { "id": 1, "full_name": "...", "role": "guest", "created_at": "..." }
    ```
- **Errors**: `404` if user not found.

---

### 5.3 Properties — `/api/v1/properties`

#### `GET /api/v1/properties/`
- **Auth**: ❌ Public
- **Description**: List and search active properties.
- **Query Params** (all optional):
  - `city_id: int`
  - `type_id: int`
  - `min_price: Decimal`
  - `max_price: Decimal`
  - `min_guests: int`
  - `search_query: string`
- **Response** `200` → `List[PropertyResponse]`

---

#### `GET /api/v1/properties/my-properties`
- **Auth**: ✅ Required (`host` or `admin`)
- **Description**: Returns properties owned by the authenticated host.
- **Response** `200` → `List[PropertyResponse]`

---

#### `GET /api/v1/properties/{property_id}`
- **Auth**: ❌ Public (draft properties only visible to owner/admin)
- **Description**: Full property detail including city, type, units, photos, and cancellation policy.
- **Path Param**: `property_id: int`
- **Response** `200` → `PropertyResponse`:
```json
{
  "id": 1,
  "host_id": 2,
  "city_id": 3,
  "type_id": 1,
  "policy_id": 1,
  "title": "string",
  "description": "string",
  "address": "string",
  "latitude": "12.345678",
  "longitude": "56.789012",
  "check_in_time": "14:00:00",
  "check_out_time": "12:00:00",
  "status": "active",
  "created_at": "...",
  "updated_at": "...",
  "city": { "id": 3, "name": "Tehran", ... },
  "property_type": { "id": 1, "name": "Villa" },
  "cancellation_policy": { "id": 1, "name": "Flexible", "free_cancel_days": 3, "refund_percent": "100.00" },
  "units": [ ... ],
  "photos": [ ... ]
}
```

---

#### `POST /api/v1/properties/`
- **Auth**: ✅ Required (`host` or `admin`)
- **Description**: Create a new property listing.
- **Request Body** (`application/json`):
```json
{
  "city_id": 1,
  "type_id": 1,
  "policy_id": 1,
  "title": "string",
  "description": "string",
  "address": "string",
  "latitude": "12.345678",
  "longitude": "56.789012",
  "check_in_time": "14:00:00",
  "check_out_time": "12:00:00",
  "status": "draft",
  "amenity_ids": [1, 2, 3]
}
```
- **Response** `201` → `PropertyResponse`

---

#### `PUT /api/v1/properties/{property_id}`
- **Auth**: ✅ Required (`host` or `admin`)
- **Description**: Update an existing property. All fields optional. Host can only update their own.
- **Request Body** (`application/json`, all fields optional — same keys as create minus required ones):
```json
{
  "title": "string",
  "description": "string",
  "status": "active",
  "amenity_ids": [1, 2]
}
```
- **Response** `200` → `PropertyResponse`
- **Errors**: `403` if not owner, `404` if not found.

---

#### `DELETE /api/v1/properties/{property_id}`
- **Auth**: ✅ Required (`host` or `admin`)
- **Description**: Suspends a property (sets status to `suspended`). Host can only delete own.
- **Response** `200` → `PropertyResponse` (with status `suspended`)
- **Errors**: `403` if not owner, `404` if not found.

---

### 5.4 Units — `/api/v1/units`

#### `GET /api/v1/units/`
- **Auth**: ❌ Public
- **Description**: List units, optionally filtered by property.
- **Query Params**: `property_id: int` (optional)
- **Response** `200` → `List[UnitResponse]`:
```json
[{
  "id": 1,
  "property_id": 1,
  "name": "Studio Unit",
  "max_guests": 2,
  "bedrooms": 1,
  "beds": 1,
  "bathrooms": 1,
  "base_price_per_night": "150.00",
  "cleaning_fee": "20.00",
  "is_active": true
}]
```

---

#### `GET /api/v1/units/{unit_id}`
- **Auth**: ❌ Public
- **Response** `200` → `UnitResponse`
- **Errors**: `404` if not found.

---

#### `POST /api/v1/units/`
- **Auth**: ✅ Required (`host` or `admin`)
- **Description**: Add a new unit to a property. Host can only add to their own property.
- **Request Body**:
```json
{
  "property_id": 1,
  "name": "string",
  "max_guests": 4,
  "bedrooms": 2,
  "beds": 2,
  "bathrooms": 1,
  "base_price_per_night": "200.00",
  "cleaning_fee": "30.00",
  "is_active": true
}
```
- **Response** `201` → `UnitResponse`
- **Errors**: `403` if not property owner, `404` if property not found.

---

#### `PUT /api/v1/units/{unit_id}`
- **Auth**: ✅ Required (`host` or `admin`)
- **Description**: Update unit details. All fields optional.
- **Request Body** (all optional):
```json
{
  "name": "string",
  "max_guests": 3,
  "bedrooms": 1,
  "beds": 2,
  "bathrooms": 1,
  "base_price_per_night": "180.00",
  "cleaning_fee": "25.00",
  "is_active": true
}
```
- **Response** `200` → `UnitResponse`
- **Errors**: `403` if not owner, `404` if not found.

---

#### `GET /api/v1/units/{unit_id}/calendar`
- **Auth**: ❌ Public
- **Description**: Get price calendar entries for a unit, with optional date range filter.
- **Query Params**: `start_date: date` (optional), `end_date: date` (optional)
- **Response** `200` → `List[UnitPriceCalendarResponse]`:
```json
[{
  "id": 1,
  "unit_id": 1,
  "day": "2024-12-25",
  "price": "250.00",
  "is_blocked": false
}]
```

---

#### `POST /api/v1/units/{unit_id}/calendar`
- **Auth**: ✅ Required (`host` or `admin`)
- **Description**: Set or update price/availability for a specific day (upsert by unit+day). Used to block dates or set custom prices.
- **Request Body**:
```json
{
  "day": "2024-12-25",
  "price": "250.00",
  "is_blocked": false
}
```
- **Response** `201` → `UnitPriceCalendarResponse`
- **Errors**: `403` if not unit owner, `404` if unit not found.

---

### 5.5 Locations — `/api/v1/locations`

#### `GET /api/v1/locations/countries`
- **Auth**: ❌ Public
- **Response** `200` → `List[CountryResponse]`

#### `GET /api/v1/locations/provinces`
- **Auth**: ❌ Public
- **Query Params**: `country_id: int` (optional)
- **Response** `200` → `List[ProvinceResponse]`

#### `GET /api/v1/locations/cities`
- **Auth**: ❌ Public
- **Query Params**: `province_id: int` (optional)
- **Response** `200` → `List[CityResponse]`

---

### 5.6 Amenities — `/api/v1/amenities`

#### `GET /api/v1/amenities/`
- **Auth**: ❌ Public
- **Response** `200` → `List[AmenityResponse]`

---

### 5.7 Photos — `/api/v1/properties/{property_id}/photos` and `/api/v1/photos`

#### `GET /api/v1/properties/{property_id}/photos`
- **Auth**: ❌ Public
- **Response** `200` → `List[PhotoResponse]`

#### `POST /api/v1/properties/{property_id}/photos`
- **Auth**: ✅ Required (`host` or `admin`)
- **Description**: Upload a new photo for a property or specific unit.
- **Response** `201` → `PhotoResponse`

#### `DELETE /api/v1/photos/{photo_id}`
- **Auth**: ✅ Required (`host` or `admin`)
- **Response** `200`

---

### 5.8 Bookings — `/api/v1/bookings`

#### `POST /api/v1/bookings/quote`
- **Auth**: ✅ Required (any active user)
- **Description**: Calculate full price breakdown for a potential stay WITHOUT creating a booking. Use this before showing the user the final price.
- **Pricing formula**:
  - `subtotal` = sum of nightly prices (calendar overrides or `base_price_per_night`)
  - `service_fee` = 5% of subtotal (rounded half-up)
  - `cleaning_fee` = unit's cleaning fee
  - `discount_amount` = coupon discount on subtotal (if valid coupon provided)
  - `total_price` = subtotal + cleaning_fee + service_fee − discount_amount
- **Request Body**:
```json
{
  "unit_id": 1,
  "check_in": "2024-12-20",
  "check_out": "2024-12-25",
  "guests_count": 2,
  "coupon_code": "SUMMER10"
}
```
- **Response** `200` → `BookingQuoteResponse`:
```json
{
  "unit_id": 1,
  "check_in": "2024-12-20",
  "check_out": "2024-12-25",
  "nights": 5,
  "subtotal": "750.00",
  "cleaning_fee": "30.00",
  "service_fee": "37.50",
  "discount_amount": "75.00",
  "total_price": "742.50"
}
```
- **Errors**: `400` if dates invalid, date blocked, or coupon expired/invalid; `404` if unit or coupon not found.

---

#### `POST /api/v1/bookings/`
- **Auth**: ✅ Required (any active user)
- **Description**: Create a confirmed booking. Atomically locks the nights in `booking_nights` table. Status starts as `pending`.
- **Business rules**:
  - Unit must be active.
  - Property must be `active`.
  - Host cannot book their own property.
  - `guests_count` ≤ `unit.max_guests`.
  - No nights may overlap existing bookings for that unit.
- **Request Body**:
```json
{
  "unit_id": 1,
  "check_in": "2024-12-20",
  "check_out": "2024-12-25",
  "guests_count": 2,
  "coupon_code": "SUMMER10"
}
```
- **Response** `201` → `BookingResponse`:
```json
{
  "id": 42,
  "guest_id": 7,
  "unit_id": 1,
  "coupon_id": 3,
  "check_in": "2024-12-20",
  "check_out": "2024-12-25",
  "guests_count": 2,
  "nights": 5,
  "subtotal": "750.00",
  "cleaning_fee": "30.00",
  "service_fee": "37.50",
  "discount_amount": "75.00",
  "total_price": "742.50",
  "status": "pending",
  "created_at": "2024-11-14T10:00:00Z",
  "cancelled_at": null,
  "booking_nights": [
    { "booking_id": 42, "unit_id": 1, "night": "2024-12-20", "price": "150.00" }
  ]
}
```
- **Errors**: `400` if dates invalid or blocked; `403` if host booking own property; `409` if dates already booked.

---

#### `GET /api/v1/bookings/`
- **Auth**: ✅ Required (any active user)
- **Description**: List bookings for the current user.
- **Query Params**:
  - `role_view: string` — `"guest"` (default): my reservations; `"host"`: bookings on my properties (host/admin only)
  - `status_filter: BookingStatus` (optional)
- **Response** `200` → `List[BookingResponse]`

---

#### `GET /api/v1/bookings/{booking_id}`
- **Auth**: ✅ Required
- **Description**: Get full booking detail. Only accessible by: booking guest, property host, or admin.
- **Response** `200` → `BookingResponse`
- **Errors**: `403` if not authorized, `404` if not found.

---

#### `POST /api/v1/bookings/{booking_id}/cancel`
- **Auth**: ✅ Required
- **Description**: Cancel a booking. Allowed by: the booking guest, the property host, or admin. Calculates refund based on the property's cancellation policy.
  - If `days_until_check_in >= policy.free_cancel_days` → 100% refund.
  - Otherwise → `policy.refund_percent` % of `total_price` refunded.
  - On cancel: booking status → `cancelled`, booked nights released, successful payments → `refunded`.
- **Response** `200` → custom object:
```json
{
  "message": "Booking successfully cancelled",
  "booking_id": 42,
  "status": "cancelled",
  "refund_amount": "742.50",
  "penalty_amount": "0.00",
  "cancelled_at": "2024-11-14T10:30:00Z"
}
```
- **Errors**: `400` if already cancelled or completed; `403` if not authorized; `404` if not found.

---

### 5.9 Payments — `/api/v1/payments`

#### `POST /api/v1/payments/`
- **Auth**: ✅ Required (any active user)
- **Description**: Process payment for a pending booking. Currently uses a simulation mode.
  - `simulate_success: true` (default) → payment status becomes `successful`, booking status → `confirmed`, `transaction_ref` generated as `SAR-<12-hex>`.
  - `simulate_success: false` → payment status becomes `failed`, booking stays `pending`.
- **Request Body**:
```json
{
  "booking_id": 42,
  "method": "card",
  "simulate_success": true
}
```
- **Response** `201` → `PaymentResponse`:
```json
{
  "id": 10,
  "booking_id": 42,
  "amount": "742.50",
  "method": "card",
  "status": "successful",
  "transaction_ref": "SAR-A1B2C3D4E5F6",
  "paid_at": "2024-11-14T10:05:00Z",
  "created_at": "2024-11-14T10:05:00Z"
}
```
- **Errors**: `400` if booking cancelled; `403` if not the booking guest; `404` if booking not found; `409` if already paid/confirmed.

---

#### `GET /api/v1/payments/booking/{booking_id}`
- **Auth**: ✅ Required
- **Description**: Get all payment records for a booking. Accessible by: booking guest, property host, or admin.
- **Response** `200` → `List[PaymentResponse]`
- **Errors**: `403` if not authorized; `404` if booking not found.

---

### 5.10 Messages — `/api/v1/messages`

#### `POST /api/v1/messages/`
- **Auth**: ✅ Required (any active user)
- **Description**: Send a message to another user. Optionally linked to a booking.
- **Request Body**:
```json
{
  "receiver_id": 5,
  "booking_id": 42,
  "body": "Hello, I have a question about check-in."
}
```
- **Response** `201` → `MessageResponse`:
```json
{
  "id": 100,
  "sender_id": 7,
  "receiver_id": 5,
  "booking_id": 42,
  "body": "Hello, I have a question about check-in.",
  "sent_at": "2024-11-14T10:10:00Z"
}
```
- **Errors**: `400` if sending to self; `404` if receiver or booking not found.

---

#### `GET /api/v1/messages/`
- **Auth**: ✅ Required (any active user)
- **Description**: Get the full conversation thread between current user and a contact, ordered oldest first.
- **Query Params**:
  - `contact_id: int` (required) — ID of the other participant.
  - `booking_id: int` (optional) — Filter to messages related to a specific booking.
- **Response** `200` → `List[MessageResponse]`

---

### 5.11 Reviews — `/api/v1/reviews`

#### `GET /api/v1/reviews/property/{property_id}`
- **Auth**: ❌ Public
- **Response** `200` → `List[ReviewResponse]`

#### `POST /api/v1/reviews/`
- **Auth**: ✅ Required (`guest`)
- **Description**: Submit a review for a completed or confirmed booking. One review per booking.
- **Response** `201` → `ReviewResponse`

---

### 5.12 Wishlists — `/api/v1/wishlists`

#### `GET /api/v1/wishlists/`
- **Auth**: ✅ Required (any active user)
- **Response** `200` → `List[WishlistResponse]`

#### `POST /api/v1/wishlists/`
- **Auth**: ✅ Required (any active user)
- **Description**: Create a new wishlist folder.
- **Response** `201` → `WishlistResponse`

#### `DELETE /api/v1/wishlists/{wishlist_id}`
- **Auth**: ✅ Required (any active user)
- **Response** `200`

#### `POST /api/v1/wishlists/{wishlist_id}/items`
- **Auth**: ✅ Required (any active user)
- **Description**: Add a property to a wishlist.
- **Response** `201`

#### `DELETE /api/v1/wishlists/{wishlist_id}/items/{property_id}`
- **Auth**: ✅ Required (any active user)
- **Description**: Remove a property from a wishlist.
- **Response** `200`

---

### 5.13 Admin — `/api/v1/admin`

> All admin endpoints require `role == admin`.

#### `GET /api/v1/admin/users`
- **Auth**: ✅ Admin only
- **Description**: List all users with optional role filter and pagination.
- **Query Params**: `skip: int` (default 0), `limit: int` (default 100), `role: UserRole` (optional)
- **Response** `200` → `List[UserResponse]`

#### `POST /api/v1/admin/users`
- **Auth**: ✅ Admin only
- **Description**: Create a user with explicit role (guest, host, or admin).
- **Request Body**:
```json
{
  "full_name": "string",
  "email": "admin@example.com",
  "phone": "string | null",
  "password": "string",
  "role": "host",
  "is_active": true
}
```
- **Response** `201` → `UserResponse`
- **Errors**: `409` if email or phone exists.

#### `PUT /api/v1/admin/users/{user_id}`
- **Auth**: ✅ Admin only
- **Description**: Update any user's role, active status, full name, or phone.
- **Request Body** (all optional):
```json
{
  "full_name": "string",
  "phone": "string",
  "role": "host",
  "is_active": false
}
```
- **Response** `200` → `UserResponse`
- **Errors**: `404` if user not found, `409` if phone in use.

#### `GET /api/v1/admin/bookings`
- **Auth**: ✅ Admin only
- **Description**: View all bookings platform-wide, with optional status filter.
- **Query Params**: `status_filter: BookingStatus` (optional)
- **Response** `200` → `List[BookingResponse]`

#### `GET /api/v1/admin/property-types`
- **Auth**: ❌ Public
- **Response** `200` → `List[PropertyTypeResponse]`:
```json
[{ "id": 1, "name": "Villa" }]
```

#### `POST /api/v1/admin/property-types`
- **Auth**: ✅ Admin only
- **Request Body**: `{ "name": "string" }`
- **Response** `201` → `PropertyTypeResponse`
- **Errors**: `409` if name exists.

#### `GET /api/v1/admin/cancellation-policies`
- **Auth**: ❌ Public
- **Response** `200` → `List[CancellationPolicyResponse]`:
```json
[{
  "id": 1,
  "name": "Flexible",
  "free_cancel_days": 3,
  "refund_percent": "100.00"
}]
```

#### `POST /api/v1/admin/cancellation-policies`
- **Auth**: ✅ Admin only
- **Request Body**:
```json
{
  "name": "string",
  "free_cancel_days": 3,
  "refund_percent": "100.00"
}
```
- **Response** `201` → `CancellationPolicyResponse`
- **Errors**: `409` if name exists.

#### `GET /api/v1/admin/coupons`
- **Auth**: ✅ Admin only
- **Response** `200` → `List[CouponResponse]`

#### `POST /api/v1/admin/coupons`
- **Auth**: ✅ Admin only
- **Description**: Create a discount coupon. `code` is stored uppercased automatically.
- **Request Body**:
```json
{
  "code": "SUMMER10",
  "discount_percent": "10.00",
  "valid_from": "2024-06-01",
  "valid_to": "2024-08-31",
  "usage_limit": 100
}
```
- **Response** `201` → `CouponResponse`:
```json
{
  "id": 5,
  "code": "SUMMER10",
  "discount_percent": "10.00",
  "valid_from": "2024-06-01",
  "valid_to": "2024-08-31",
  "usage_limit": 100
}
```
- **Errors**: `409` if code exists.

---

## 6. Booking Flow (End-to-End)

```
Step 1 — Quote (optional but recommended)
POST /api/v1/bookings/quote
  → Receive full price breakdown without locking anything

Step 2 — Create Booking
POST /api/v1/bookings/
  → Nights locked in booking_nights table
  → Booking status: "pending"
  → Coupon applied if provided

Step 3 — Pay
POST /api/v1/payments/
  { "booking_id": <id>, "method": "card", "simulate_success": true }
  → If simulate_success=true:
      Payment status: "successful"
      Booking status: "confirmed"
      transaction_ref: "SAR-XXXXXXXXXXXX"
  → If simulate_success=false:
      Payment status: "failed"
      Booking status stays "pending"

Step 4 — (Optional) Cancel
POST /api/v1/bookings/{booking_id}/cancel
  → Nights released
  → Booking status: "cancelled"
  → Successful payments → "refunded"
  → Refund calculated per property's CancellationPolicy
```

---

## 7. Host Role Capabilities

A user with `role == "host"` (or `admin`) can:

| Action | Endpoint |
|---|---|
| View own properties | `GET /api/v1/properties/my-properties` |
| Create property | `POST /api/v1/properties/` |
| Edit property | `PUT /api/v1/properties/{id}` |
| Suspend property | `DELETE /api/v1/properties/{id}` |
| Add unit to property | `POST /api/v1/units/` |
| Update unit | `PUT /api/v1/units/{id}` |
| Set calendar prices / block dates | `POST /api/v1/units/{id}/calendar` |
| Upload photos | `POST /api/v1/properties/{id}/photos` |
| Delete photos | `DELETE /api/v1/photos/{id}` |
| View bookings on own properties | `GET /api/v1/bookings/?role_view=host` |
| View booking detail | `GET /api/v1/bookings/{id}` |
| Cancel booking on own property | `POST /api/v1/bookings/{id}/cancel` |
| View payment records | `GET /api/v1/payments/booking/{id}` |
| Message guests | `POST /api/v1/messages/` |

> **Note**: Hosts **cannot** book their own properties. `BookingService` explicitly raises `403` if `unit.property.host_id == guest.id`.

---

## 8. Quick Reference — Public vs Authenticated Endpoints

| Auth | Endpoints |
|---|---|
| ❌ Public | `POST /auth/register`, `POST /auth/login`, `POST /auth/login-json`, `GET /properties/`, `GET /properties/{id}`, `GET /units/`, `GET /units/{id}`, `GET /units/{id}/calendar`, `GET /locations/*`, `GET /amenities/`, `GET /properties/{id}/photos`, `GET /reviews/property/{id}`, `GET /admin/property-types`, `GET /admin/cancellation-policies` |
| ✅ Any authenticated user | `GET /auth/me`, `GET /users/me`, `PUT /users/me`, `GET /users/{id}`, `POST /bookings/quote`, `POST /bookings/`, `GET /bookings/`, `GET /bookings/{id}`, `POST /bookings/{id}/cancel`, `POST /payments/`, `GET /payments/booking/{id}`, `POST /messages/`, `GET /messages/`, `GET /wishlists/`, `POST /wishlists/`, `DELETE /wishlists/{id}`, `POST /wishlists/{id}/items`, `DELETE /wishlists/{id}/items/{pid}` |
| 🔑 Host or Admin | `GET /properties/my-properties`, `POST /properties/`, `PUT /properties/{id}`, `DELETE /properties/{id}`, `POST /units/`, `PUT /units/{id}`, `POST /units/{id}/calendar`, `POST /properties/{id}/photos`, `DELETE /photos/{id}` |
| 👑 Admin only | `GET /admin/users`, `POST /admin/users`, `PUT /admin/users/{id}`, `GET /admin/bookings`, `POST /admin/property-types`, `POST /admin/cancellation-policies`, `GET /admin/coupons`, `POST /admin/coupons` |
