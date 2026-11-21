'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { properties, locations, propertyTypes, amenities } from '@/lib/mockData';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Heart,
  Bed,
  Users,
  Bath,
  ArrowLeft,
  X,
  RotateCcw,
} from 'lucide-react';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= Math.round(rating) ? 'fill-amber-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function PropertiesListContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get('cityId') || '';
  const initialGuests = searchParams.get('minGuests') || '';

  const [filters, setFilters] = useState({
    cityId: initialCity,
    typeId: '',
    minPrice: '',
    maxPrice: '',
    minGuests: initialGuests,
    amenities: [] as number[],
    sort: 'rating',
    searchQuery: '',
  });

  const [wishlist, setWishlist] = useState<number[]>([]);

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

  const toggleAmenity = useCallback((id: number) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter((a) => a !== id)
        : [...prev.amenities, id],
    }));
  }, []);

  const resetFilters = () => {
    setFilters({
      cityId: '',
      typeId: '',
      minPrice: '',
      maxPrice: '',
      minGuests: '',
      amenities: [],
      sort: 'rating',
      searchQuery: '',
    });
  };

  const filtered = properties
    .filter((p) => {
      if (filters.cityId && p.cityId !== parseInt(filters.cityId)) return false;
      if (filters.typeId && p.typeId !== parseInt(filters.typeId)) return false;
      if (filters.minPrice && p.pricePerNight < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && p.pricePerNight > parseInt(filters.maxPrice)) return false;
      if (filters.minGuests && p.maxGuests < parseInt(filters.minGuests)) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesCity = p.cityName.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCity && !matchesDesc) return false;
      }
      if (
        filters.amenities.length > 0 &&
        !filters.amenities.every((a) => p.amenities.includes(a))
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === 'rating') return b.rating - a.rating;
      if (filters.sort === 'price_asc') return a.pricePerNight - b.pricePerNight;
      if (filters.sort === 'price_desc') return b.pricePerNight - a.pricePerNight;
      return 0;
    });

  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner & Search */}
      <div className="card-clay p-6 sm:p-8 bg-white mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              رزرو آنلاین اقامتگاه، ویلا و بوم‌گردی
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              نمایش {filtered.length} اقامتگاه موجود بر اساس فیلترهای انتخابی شما
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="جستجوی نام اقامتگاه یا شهر..."
              className="w-full pr-11 pl-4 py-3 rounded-full bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-700/20"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters({ ...filters, searchQuery: '' })}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Right: Sidebar Filters (3D Claymorphic) */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="card-clay p-6 bg-white sticky top-28 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <Filter className="w-4 h-4 text-green-700" />
                <span>فیلترهای پیشرفته</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>پاک کردن همه</span>
              </button>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                📍 استان یا شهر
              </label>
              <select
                value={filters.cityId}
                onChange={(e) => setFilters({ ...filters, cityId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none"
              >
                <option value="">همه استان‌ها و شهرها</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.province})
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                🏠 نوع اقامتگاه
              </label>
              <select
                value={filters.typeId}
                onChange={(e) => setFilters({ ...filters, typeId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none"
              >
                <option value="">همه انواع (ویلا، کلبه، بوم‌گردی)</option>
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                👥 ظرفیت مهمانان
              </label>
              <select
                value={filters.minGuests}
                onChange={(e) => setFilters({ ...filters, minGuests: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none"
              >
                <option value="">هر تعداد مهمان</option>
                {[2, 4, 6, 8, 10].map((num) => (
                  <option key={num} value={num}>
                    حداقل {num} نفر و بالاتر
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                💰 بازه قیمت هر شب (تومان)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="از (حداقل)"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="تا (حداکثر)"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Amenities Checklist */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                ✨ امکانات ویژه اقامتگاه
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar pt-1">
                {amenities.map((am) => {
                  const isChecked = filters.amenities.includes(am.id);
                  return (
                    <button
                      key={am.id}
                      type="button"
                      onClick={() => toggleAmenity(am.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs text-right transition-all ${
                        isChecked
                          ? 'bg-green-100 text-green-900 border border-green-400 font-bold'
                          : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      <span>{am.icon}</span>
                      <span className="truncate">{am.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Left: Property Listings Grid */}
        <main className="lg:col-span-8 xl:col-span-9">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6 bg-white/80 p-3 rounded-2xl border border-gray-100">
            <span className="text-xs font-medium text-gray-500">
              مرتب‌سازی نتایج:
            </span>
            <div className="flex items-center gap-2">
              {[
                { key: 'rating', label: '⭐ بیشترین امتیاز' },
                { key: 'price_asc', label: 'ارزان‌ترین' },
                { key: 'price_desc', label: 'گران‌ترین' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFilters({ ...filters, sort: opt.key })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filters.sort === opt.key
                      ? 'btn-3d-clay text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Grid */}
          {filtered.length === 0 ? (
            <div className="card-clay p-16 text-center bg-white">
              <div className="text-6xl mb-4">🏡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                اقامتگاهی با این مشخصات یافت نشد!
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                لطفاً فیلترهای انتخابی (مانند قیمت یا شهر) را تغییر دهید تا نتایج بیشتری مشاهده کنید.
              </p>
              <button
                onClick={resetFilters}
                className="btn-3d-clay px-6 py-2.5 text-white text-xs font-bold"
              >
                حذف تمام فیلترها
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((property) => {
                const isSaved = wishlist.includes(property.id);
                return (
                  <div
                    key={property.id}
                    className="card-clay group flex flex-col justify-between overflow-hidden p-3.5 bg-white"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-sm">
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                        {property.badge && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm bg-emerald-600">
                            {property.badge}
                          </div>
                        )}

                        <button
                          onClick={(e) => toggleWishlist(property.id, e)}
                          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-700 shadow-sm hover:scale-110 active:scale-90 transition-all"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isSaved ? 'fill-rose-500 text-rose-500' : 'text-gray-500'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="pt-3 px-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                          <div className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-green-700" />
                            <span>{property.cityName}</span>
                          </div>
                          <div className="flex items-center gap-1 font-bold text-gray-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{property.rating}</span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-green-800 transition-colors mb-2 line-clamp-1">
                          {property.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-gray-500 py-1.5 border-y border-gray-100">
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-gray-400" />
                            {property.bedrooms} خواب
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            تا {property.maxGuests} نفر
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pricing & Action */}
                    <div className="pt-3 px-1 mt-2 flex items-center justify-between border-t border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">هر شب</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-gray-900">
                            {property.pricePerNight.toLocaleString('fa-IR')}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">تومان</span>
                        </div>
                      </div>

                      <Link
                        href={`/properties/${property.id}`}
                        className="btn-3d-clay px-4 py-2 text-white text-xs font-bold shadow-sm flex items-center gap-1"
                      >
                        <span>رزرو</span>
                        <ArrowLeft className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <main className="min-h-screen dynamic-theme-bg overflow-x-hidden">
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-sm font-semibold">در حال بارگذاری اقامتگاه‌ها...</p>
            </div>
          </div>
        }
      >
        <PropertiesListContent />
      </Suspense>
      <Footer />
    </main>
  );
}
