"""initial_sarpanah_erd_migration

Revision ID: ad1bc4e641e1
Revises: 
Create Date: 2026-11-13 08:12:25.860969

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'ad1bc4e641e1'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enums
    user_role_enum = postgresql.ENUM('guest', 'host', 'admin', name='user_role_enum', create_type=False)
    user_role_enum.create(op.get_bind(), checkfirst=True)

    property_status_enum = postgresql.ENUM('draft', 'active', 'suspended', name='property_status_enum', create_type=False)
    property_status_enum.create(op.get_bind(), checkfirst=True)

    booking_status_enum = postgresql.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rejected', name='booking_status_enum', create_type=False)
    booking_status_enum.create(op.get_bind(), checkfirst=True)

    payment_method_enum = postgresql.ENUM('card', 'wallet', 'bank_transfer', name='payment_method_enum', create_type=False)
    payment_method_enum.create(op.get_bind(), checkfirst=True)

    payment_status_enum = postgresql.ENUM('pending', 'successful', 'failed', 'refunded', name='payment_status_enum', create_type=False)
    payment_status_enum.create(op.get_bind(), checkfirst=True)

    # 2. Countries
    op.create_table(
        'countries',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('iso_code', sa.String(length=2), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_countries_iso_code'), 'countries', ['iso_code'], unique=True)

    # 3. Provinces
    op.create_table(
        'provinces',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('country_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(['country_id'], ['countries.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('country_id', 'name', name='uq_province_country_name'),
    )
    op.create_index(op.f('ix_provinces_country_id'), 'provinces', ['country_id'], unique=False)

    # 4. Cities
    op.create_table(
        'cities',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('province_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(['province_id'], ['provinces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('province_id', 'name', name='uq_city_province_name'),
    )
    op.create_index(op.f('ix_cities_province_id'), 'cities', ['province_id'], unique=False)

    # 5. Users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', user_role_enum, nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_phone'), 'users', ['phone'], unique=True)

    # 6. Property Types
    op.create_table(
        'property_types',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=60), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_property_types_name'), 'property_types', ['name'], unique=True)

    # 7. Cancellation Policies
    op.create_table(
        'cancellation_policies',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=60), nullable=False),
        sa.Column('free_cancel_days', sa.Integer(), nullable=False),
        sa.Column('refund_percent', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_cancellation_policies_name'), 'cancellation_policies', ['name'], unique=True)

    # 8. Properties
    op.create_table(
        'properties',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('host_id', sa.Integer(), nullable=False),
        sa.Column('city_id', sa.Integer(), nullable=False),
        sa.Column('type_id', sa.Integer(), nullable=False),
        sa.Column('policy_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('address', sa.String(length=300), nullable=False),
        sa.Column('latitude', sa.Numeric(precision=9, scale=6), nullable=True),
        sa.Column('longitude', sa.Numeric(precision=9, scale=6), nullable=True),
        sa.Column('check_in_time', sa.Time(), nullable=False),
        sa.Column('check_out_time', sa.Time(), nullable=False),
        sa.Column('status', property_status_enum, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['city_id'], ['cities.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['host_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['policy_id'], ['cancellation_policies.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['type_id'], ['property_types.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_properties_city_id'), 'properties', ['city_id'], unique=False)
    op.create_index(op.f('ix_properties_host_id'), 'properties', ['host_id'], unique=False)
    op.create_index(op.f('ix_properties_policy_id'), 'properties', ['policy_id'], unique=False)
    op.create_index(op.f('ix_properties_status'), 'properties', ['status'], unique=False)
    op.create_index(op.f('ix_properties_title'), 'properties', ['title'], unique=False)
    op.create_index(op.f('ix_properties_type_id'), 'properties', ['type_id'], unique=False)

    # 9. Units
    op.create_table(
        'units',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('property_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('max_guests', sa.Integer(), nullable=False),
        sa.Column('bedrooms', sa.Integer(), nullable=False),
        sa.Column('beds', sa.Integer(), nullable=False),
        sa.Column('bathrooms', sa.Integer(), nullable=False),
        sa.Column('base_price_per_night', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('cleaning_fee', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_units_is_active'), 'units', ['is_active'], unique=False)
    op.create_index(op.f('ix_units_property_id'), 'units', ['property_id'], unique=False)

    # 10. Amenities
    op.create_table(
        'amenities',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=80), nullable=False),
        sa.Column('icon', sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_amenities_name'), 'amenities', ['name'], unique=True)

    # 11. Property Amenities
    op.create_table(
        'property_amenities',
        sa.Column('property_id', sa.Integer(), nullable=False),
        sa.Column('amenity_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['amenity_id'], ['amenities.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('property_id', 'amenity_id'),
    )

    # 12. Photos
    op.create_table(
        'photos',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('property_id', sa.Integer(), nullable=False),
        sa.Column('unit_id', sa.Integer(), nullable=True),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['unit_id'], ['units.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_photos_property_id'), 'photos', ['property_id'], unique=False)
    op.create_index(op.f('ix_photos_unit_id'), 'photos', ['unit_id'], unique=False)

    # 13. Unit Price Calendars
    op.create_table(
        'unit_price_calendars',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('unit_id', sa.Integer(), nullable=False),
        sa.Column('day', sa.Date(), nullable=False),
        sa.Column('price', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('is_blocked', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['unit_id'], ['units.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('unit_id', 'day', name='uq_unit_day_calendar'),
    )
    op.create_index(op.f('ix_unit_price_calendars_day'), 'unit_price_calendars', ['day'], unique=False)
    op.create_index(op.f('ix_unit_price_calendars_unit_id'), 'unit_price_calendars', ['unit_id'], unique=False)

    # 14. Coupons
    op.create_table(
        'coupons',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('code', sa.String(length=40), nullable=False),
        sa.Column('discount_percent', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('valid_from', sa.Date(), nullable=False),
        sa.Column('valid_to', sa.Date(), nullable=False),
        sa.Column('usage_limit', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_coupons_code'), 'coupons', ['code'], unique=True)

    # 15. Bookings
    op.create_table(
        'bookings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('guest_id', sa.Integer(), nullable=False),
        sa.Column('unit_id', sa.Integer(), nullable=False),
        sa.Column('coupon_id', sa.Integer(), nullable=True),
        sa.Column('check_in', sa.Date(), nullable=False),
        sa.Column('check_out', sa.Date(), nullable=False),
        sa.Column('guests_count', sa.Integer(), nullable=False),
        sa.Column('nights', sa.Integer(), nullable=False),
        sa.Column('subtotal', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('cleaning_fee', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('service_fee', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('discount_amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('total_price', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('status', booking_status_enum, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['coupon_id'], ['coupons.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['guest_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['unit_id'], ['units.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_bookings_check_in'), 'bookings', ['check_in'], unique=False)
    op.create_index(op.f('ix_bookings_check_out'), 'bookings', ['check_out'], unique=False)
    op.create_index(op.f('ix_bookings_coupon_id'), 'bookings', ['coupon_id'], unique=False)
    op.create_index(op.f('ix_bookings_guest_id'), 'bookings', ['guest_id'], unique=False)
    op.create_index(op.f('ix_bookings_status'), 'bookings', ['status'], unique=False)
    op.create_index(op.f('ix_bookings_unit_id'), 'bookings', ['unit_id'], unique=False)

    # 16. Booking Nights
    op.create_table(
        'booking_nights',
        sa.Column('booking_id', sa.Integer(), nullable=False),
        sa.Column('unit_id', sa.Integer(), nullable=False),
        sa.Column('night', sa.Date(), nullable=False),
        sa.Column('price', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['unit_id'], ['units.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('booking_id', 'night'),
        sa.UniqueConstraint('unit_id', 'night', name='uq_unit_night_active'),
    )
    op.create_index(op.f('ix_booking_nights_unit_id'), 'booking_nights', ['unit_id'], unique=False)

    # 17. Payments
    op.create_table(
        'payments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('booking_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('method', payment_method_enum, nullable=False),
        sa.Column('status', payment_status_enum, nullable=False),
        sa.Column('transaction_ref', sa.String(length=100), nullable=True),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_payments_booking_id'), 'payments', ['booking_id'], unique=False)
    op.create_index(op.f('ix_payments_status'), 'payments', ['status'], unique=False)
    op.create_index(op.f('ix_payments_transaction_ref'), 'payments', ['transaction_ref'], unique=True)

    # 18. Reviews
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('booking_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='ck_review_rating_1_to_5'),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_id'),
    )
    op.create_index(op.f('ix_reviews_booking_id'), 'reviews', ['booking_id'], unique=True)

    # 19. Wishlists
    op.create_table(
        'wishlists',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'name', name='uq_user_wishlist_name'),
    )
    op.create_index(op.f('ix_wishlists_user_id'), 'wishlists', ['user_id'], unique=False)

    # 20. Wishlist Items
    op.create_table(
        'wishlist_items',
        sa.Column('wishlist_id', sa.Integer(), nullable=False),
        sa.Column('property_id', sa.Integer(), nullable=False),
        sa.Column('added_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['wishlist_id'], ['wishlists.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('wishlist_id', 'property_id'),
    )

    # 21. Messages
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('sender_id', sa.Integer(), nullable=False),
        sa.Column('receiver_id', sa.Integer(), nullable=False),
        sa.Column('booking_id', sa.Integer(), nullable=True),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('sent_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['receiver_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_messages_booking_id'), 'messages', ['booking_id'], unique=False)
    op.create_index(op.f('ix_messages_receiver_id'), 'messages', ['receiver_id'], unique=False)
    op.create_index(op.f('ix_messages_sender_id'), 'messages', ['sender_id'], unique=False)


def downgrade() -> None:
    op.drop_table('messages')
    op.drop_table('wishlist_items')
    op.drop_table('wishlists')
    op.drop_table('reviews')
    op.drop_table('payments')
    op.drop_table('booking_nights')
    op.drop_table('bookings')
    op.drop_table('coupons')
    op.drop_table('unit_price_calendars')
    op.drop_table('photos')
    op.drop_table('property_amenities')
    op.drop_table('amenities')
    op.drop_table('units')
    op.drop_table('properties')
    op.drop_table('cancellation_policies')
    op.drop_table('property_types')
    op.drop_table('users')
    op.drop_table('cities')
    op.drop_table('provinces')
    op.drop_table('countries')

    # Drop enums
    op.execute('DROP TYPE IF EXISTS payment_status_enum CASCADE')
    op.execute('DROP TYPE IF EXISTS payment_method_enum CASCADE')
    op.execute('DROP TYPE IF EXISTS booking_status_enum CASCADE')
    op.execute('DROP TYPE IF EXISTS property_status_enum CASCADE')
    op.execute('DROP TYPE IF EXISTS user_role_enum CASCADE')
