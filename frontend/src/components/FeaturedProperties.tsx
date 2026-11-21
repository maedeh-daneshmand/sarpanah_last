'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { properties, propertyTypes } from '@/lib/mockData';

export default function FeaturedProperties() {
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const loadWishlist = () => {
      try {
        const stored = localStorage.getItem('sarpanah_wishlist');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setWishlist(parsed.map((item: any) => item.id));
            return;
          }
        }
        setWishlist([]);
      } catch {
        setWishlist([]);
      }
    };

    loadWishlist();
    window.addEventListener('storage', loadWishlist);
    window.addEventListener('wishlistChange', loadWishlist);
    return () => {
      window.removeEventListener('storage', loadWishlist);
      window.removeEventListener('wishlistChange', loadWishlist);
    };
  }, []);

  const toggleWishlist = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const stored = localStorage.getItem('sarpanah_wishlist');
      const list = stored ? JSON.parse(stored) : [];
      const itemToToggle = properties.find((p) => p.id === id);
      if (!itemToToggle) return;

      let updated;
      if (list.some((item: any) => item.id === id)) {
        updated = list.filter((item: any) => item.id !== id);
      } else {
        updated = [
          ...list,
          {
            id: itemToToggle.id,
            title: itemToToggle.title,
            location: itemToToggle.cityName,
            address: itemToToggle.address,
            pricePerNight: itemToToggle.pricePerNight,
            rating: itemToToggle.rating,
            reviewsCount: itemToToggle.reviewCount,
            image: itemToToggle.images[0],
            bedrooms: itemToToggle.bedrooms,
            maxGuests: itemToToggle.maxGuests,
            typeName: itemToToggle.typeName,
          },
        ];
      }

      localStorage.setItem('sarpanah_wishlist', JSON.stringify(updated));
      setWishlist(updated.map((item: any) => item.id));
      window.dispatchEvent(new Event('wishlistChange'));
    } catch {}
  };

  const filteredProperties = selectedType
    ? properties.filter((p) => p.typeId === selectedType)
    : properties;

  const displayProperties = filteredProperties.slice(0, 6);

  const badgeStyles: Record<string, string> = {
    ویژه: 'bg-emerald-600 text-white',
    جدید: 'bg-blue-600 text-white',
    تخفیف: 'bg-amber-600 text-white',
    داغ: 'bg-rose-600 text-white',
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Section Header (مشابه عکس اصلی و امکانات سایت) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 bg-white/80 backdrop-blur shadow-sm border border-gray-100">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>اقامتگاه‌های ممتاز سرپناه</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              ویلاها و کلبه‌های{' '}
              <span style={{ color: 'hsl(var(--primary))' }}>منتخب و اکوفرندلی</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2">
              اقامتگاه‌هایی با بالاترین امتیاز رضایت مهمانان و دسترسی به بکرترین چشم‌اندازهای طبیعی ایران.
            </p>
          </div>

          <Link
            href="/properties"
            className="btn-3d-clay px-6 py-2.5 text-white text-xs sm:text-sm font-bold flex items-center gap-2 self-start md:self-auto shadow-md"
          >
            <span>مشاهده همه اقامتگاه‌ها</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Tabs (کپسول‌های گرد فیلتر) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              selectedType === null
                ? 'btn-3d-clay text-white shadow-md'
                : 'bg-white/80 text-gray-700 hover:bg-white shadow-sm border border-gray-100'
            }`}
          >
            🏡 همه اقامتگاه‌ها
          </button>
          {propertyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedType === type.id
                  ? 'btn-3d-clay text-white shadow-md'
                  : 'bg-white/80 text-gray-700 hover:bg-white shadow-sm border border-gray-100'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>

        {/* 3D Property Cards Grid (مطابق عکس‌های ۱، ۲ و ۳) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProperties.map((property) => {
            const isSaved = wishlist.includes(property.id);
            return (
              <div
                key={property.id}
                className="card-clay group flex flex-col justify-between overflow-hidden p-4 bg-white"
              >
                <div>
                  {/* Photo with 3D Overlays */}
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-md">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-wrap gap-2">
                      {property.badge && (
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-md ${
                            badgeStyles[property.badge] || 'bg-emerald-600 text-white'
                          }`}
                        >
                          {property.badge}
                        </span>
                      )}
                      {property.discountPercent && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md">
                          {property.discountPercent}٪ تخفیف
                        </span>
                      )}
                    </div>

                    {/* Wishlist Heart Button */}
                    <button
                      onClick={(e) => toggleWishlist(property.id, e)}
                      className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-700 shadow-md hover:scale-110 active:scale-90 transition-all"
                      aria-label="افزودن به علاقه‌مندی‌ها"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isSaved ? 'fill-rose-500 text-rose-500' : 'text-gray-600'
                        }`}
                      />
                    </button>

                    {/* Verified Host Badge */}
                    {property.isVerified && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-medium border border-white/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <span>تأیید اصالت اقامتگاه</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="pt-4 px-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1 font-medium text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-green-700" />
                        <span>{property.cityName}</span>
                        <span>•</span>
                        <span>{property.typeName}</span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 font-bold text-gray-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{property.rating}</span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          ({property.reviewCount})
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-green-800 transition-colors mb-2">
                      {property.title}
                    </h3>

                    {/* Specs Icons */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 py-2 border-y border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <span>{property.bedrooms} اتاق</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>تا {property.maxGuests} نفر</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4 text-gray-400" />
                        <span>{property.bathrooms} حمام</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & 3D Action Button (مطابق عکس‌های نمونه) */}
                <div className="pt-4 px-1 mt-2 flex items-center justify-between border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">
                      شروع قیمت برای هر شب
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-gray-900">
                        {property.pricePerNight.toLocaleString('fa-IR')}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">تومان</span>
                    </div>
                  </div>

                  <Link
                    href={`/properties/${property.id}`}
                    className="btn-3d-clay px-5 py-2.5 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <span>مشاهده و رزرو</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots (دقیقاً مثل نقاط سبز انتهای عکس اصلی نمونه) */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`rounded-full transition-all duration-300 ${
                activeSlide === idx
                  ? 'w-8 h-3 bg-green-700 shadow-md'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`اسلاید ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
