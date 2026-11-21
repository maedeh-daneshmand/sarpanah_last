'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { properties, Property } from '@/lib/mockData';
import { Heart, Star, MapPin, Trash2, ArrowLeft, ArrowRight, Compass } from 'lucide-react';

export default function WishlistPage() {
  const [wishlistProps, setWishlistProps] = useState<Property[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('sarpanah_wishlist') || '[1, 2, 6]');
      const filtered = properties.filter((p) => savedIds.includes(p.id));
      setWishlistProps(filtered);
    } catch {
      setWishlistProps(properties.slice(0, 3));
    }
    setIsLoaded(true);
  }, []);

  const handleRemove = (id: number) => {
    try {
      const currentIds = JSON.parse(localStorage.getItem('sarpanah_wishlist') || '[1, 2, 6]');
      const updated = currentIds.filter((item: number) => item !== id);
      localStorage.setItem('sarpanah_wishlist', JSON.stringify(updated));
      setWishlistProps((prev) => prev.filter((p) => p.id !== id));
      window.dispatchEvent(new Event('wishlistChange'));
    } catch {}
  };

  return (
    <main className="min-h-screen dynamic-theme-bg overflow-x-hidden">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200/70">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-2 border border-rose-200">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>اقامتگاه‌های ذخیره‌شده</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              لیست علاقه‌مندی‌های من
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {wishlistProps.length > 0
                ? `${wishlistProps.length} اقامتگاه رویایی برای سفرهای بعدی شما ذخیره شده است`
                : 'هنوز اقامتگاهی را نشان نکرده‌اید'}
            </p>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-xs sm:text-sm font-bold text-gray-700 hover:text-green-800 hover:border-green-300 shadow-sm transition-all"
          >
            <Compass className="w-4 h-4 text-green-700" />
            <span>جستجو در سایر اقامتگاه‌ها</span>
          </Link>
        </div>

        {/* Wishlist Grid */}
        {isLoaded && wishlistProps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProps.map((p) => (
              <div
                key={p.id}
                className="card-clay overflow-hidden bg-white flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Badge */}
                    {p.badge && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-gray-900 shadow">
                        {p.badge}
                      </span>
                    )}

                    {/* Delete from wishlist button */}
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur text-rose-600 hover:bg-rose-50 flex items-center justify-center shadow-md transition-all"
                      title="حذف از علاقه‌مندی‌ها"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* City & Rating */}
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-green-300" />
                        {p.cityName}
                      </span>
                      <span className="flex items-center gap-1 font-bold bg-black/40 px-2 py-0.5 rounded-md backdrop-blur">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {p.rating}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="font-extrabold text-gray-900 text-base mb-1.5 line-clamp-1 group-hover:text-green-800 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-600 pb-3 border-b border-gray-100">
                      <span>{p.maxGuests} نفر مهمان</span>
                      <span>•</span>
                      <span>{p.bedrooms} خوابه</span>
                      <span>•</span>
                      <span>{p.bathrooms} حمام</span>
                    </div>
                  </div>
                </div>

                {/* Footer & CTA */}
                <div className="p-5 pt-0 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-gray-400 block font-medium">شروع از:</span>
                    <span className="text-base font-extrabold text-gray-900">
                      {p.pricePerNight.toLocaleString('fa-IR')}{' '}
                      <span className="text-xs font-normal text-gray-500">تومان/شب</span>
                    </span>
                  </div>

                  <Link
                    href={`/properties/${p.id}`}
                    className="btn-3d-clay px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow"
                  >
                    <span>مشاهده و رزرو</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-clay p-12 text-center bg-white max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              لیست علاقه‌مندی‌های شما خالی است
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-6 leading-relaxed">
              با زدن دکمه قلب روی هر اقامتگاه در صفحه جستجو یا جزئیات، می‌توانید اقامتگاه‌های دلخواه‌تان را اینجا ذخیره کنید.
            </p>
            <Link
              href="/properties"
              className="btn-3d-clay px-6 py-3 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2"
            >
              <span>مشاهده اقامتگاه‌های سرپناه</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
