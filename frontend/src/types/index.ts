// ============================================================
// Sarpanah - Core TypeScript Types (from actual backend schemas)
// ============================================================

// ---- Enums ----
export type UserRole = 'guest' | 'host' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentMethod = 'card' | 'wallet' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'refunded';
export type PropertyStatus = 'draft' | 'active' | 'suspended';

// ---- Location ----
export interface Country {
  id: number;
  name: string;
  iso_code: string;
}

export interface Province {
  id: number;
  name: string;
  country_id: number;
}

export interface City {
  id: number;
  name: string;
  province_id: number;
}

// ---- User ----
export interface UserResponse {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface UserPublicResponse {
  id: number;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface UserCreate {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface UserSelfUpdate {
  full_name?: string;
  phone?: string;
  password?: string;
}

// ---- Auth ----
export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ---- Amenity ----
export interface Amenity {
  id: number;
  name: string;
  icon: string | null;
}

// ---- Photo ----
export interface Photo {
  id: number;
  property_id: number;
  unit_id: number | null;
  url: string;
  sort_order: number;
}

// ---- Unit ----
export interface Unit {
  id: number;
  property_id: number;
  name: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  base_price_per_night: string; // Decimal as string from backend
  cleaning_fee: string;
  is_active: boolean;
}

export interface UnitCreate {
  property_id: number;
  name: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  base_price_per_night: number;
  cleaning_fee: number;
  is_active: boolean;
}

export interface UnitUpdate {
  name?: string;
  max_guests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  base_price_per_night?: number;
  cleaning_fee?: number;
  is_active?: boolean;
}

// ---- PropertyType ----
export interface PropertyType {
  id: number;
  name: string;
}

// ---- CancellationPolicy ----
export interface CancellationPolicy {
  id: number;
  name: string;
  free_cancel_days: number;
  refund_percent: string;
}

// ---- Property ----
export interface Property {
  id: number;
  host_id: number;
  city_id: number;
  type_id: number;
  policy_id: number;
  title: string;
  description: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  check_in_time: string; // "HH:MM:SS"
  check_out_time: string;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
  city?: City;
  property_type?: PropertyType;
  cancellation_policy?: CancellationPolicy;
  units?: Unit[];
  photos?: Photo[];
  amenities?: Amenity[];
}

export interface PropertyCreate {
  city_id: number;
  type_id: number;
  policy_id: number;
  title: string;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  check_in_time?: string;
  check_out_time?: string;
  status?: PropertyStatus;
  amenity_ids?: number[];
}

export interface PropertyUpdate {
  city_id?: number;
  type_id?: number;
  policy_id?: number;
  title?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  check_in_time?: string;
  check_out_time?: string;
  status?: PropertyStatus;
  amenity_ids?: number[];
}

export interface PropertySearchParams {
  city_id?: number;
  type_id?: number;
  min_price?: number;
  max_price?: number;
  min_guests?: number;
  search_query?: string;
}

// ---- Booking ----
export interface BookingNight {
  booking_id: number;
  unit_id: number;
  night: string; // date string
  price: string;
}

export interface BookingQuoteRequest {
  unit_id: number;
  check_in: string; // date string YYYY-MM-DD
  check_out: string;
  guests_count: number;
  coupon_code?: string;
}

export interface BookingQuoteResponse {
  unit_id: number;
  check_in: string;
  check_out: string;
  nights: number;
  subtotal: string;
  cleaning_fee: string;
  service_fee: string;
  discount_amount: string;
  total_price: string;
}

export interface BookingCreate {
  unit_id: number;
  check_in: string;
  check_out: string;
  guests_count: number;
  coupon_code?: string;
}

export interface Booking {
  id: number;
  guest_id: number;
  unit_id: number;
  coupon_id: number | null;
  check_in: string;
  check_out: string;
  guests_count: number;
  nights: number;
  subtotal: string;
  cleaning_fee: string;
  service_fee: string;
  discount_amount: string;
  total_price: string;
  status: BookingStatus;
  created_at: string;
  cancelled_at: string | null;
  booking_nights?: BookingNight[];
}

// ---- Payment ----
export interface PaymentCreate {
  booking_id: number;
  method: PaymentMethod;
  simulate_success: boolean;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_ref: string | null;
  paid_at: string | null;
  created_at: string;
}

// ---- Review ----
export interface ReviewCreate {
  booking_id: number;
  rating: number; // 1–5
  comment?: string;
}

export interface Review {
  id: number;
  booking_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

// ---- Wishlist ----
export interface WishlistItem {
  wishlist_id: number;
  property_id: number;
  added_at: string;
  property?: Property;
}

export interface Wishlist {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  items?: WishlistItem[];
}

export interface WishlistCreate {
  name: string;
}

// ---- Message ----
export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  property_id: number | null;
  body: string;
  created_at: string;
  sender?: UserPublicResponse;
  receiver?: UserPublicResponse;
}

export interface MessageCreate {
  receiver_id: number;
  property_id?: number;
  body: string;
}

// ---- API Error ----
export interface APIError {
  detail: string | { msg: string; type: string; loc: string[] }[];
}

// ---- Theme ----
export type Theme = 'default' | 'forest' | 'desert' | 'ocean';

// ---- UI State ----
export interface SearchParams {
  city_id?: string;
  city_name?: string;
  check_in?: string;
  check_out?: string;
  guests?: string;
  min_price?: string;
  max_price?: string;
  type_id?: string;
}
