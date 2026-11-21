'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Sparkles, Compass } from 'lucide-react';
import { locations } from '@/lib/mockData';
import { useColorTheme } from '@/hooks/useColorTheme';

export default function RegionSection() {
  const [activeRegionId, setActiveRegionId] = useState<number | null>(5); // Default Gilan
  const { updateTheme } = useColorTheme('gilan');

  // Map each region ID to preset or color trigger
  const regionPresetMap: Record<number, string> = {
    5: 'gilan', // گیلان
    6: 'mazandaran', // مازندران
    2: 'isfahan', // اصفهان
    4: 'shiraz', // شیراز
    1: 'tehran', // تهران
    7: 'desert', // کرمان / کویر
    3: 'tehran', // مشهد
    8: 'tehran', // تبریز
  };

  const handleRegionHover = (locId: number) => {
    setActiveRegionId(locId);
    const preset = regionPresetMap[locId] || 'gilan';
    updateTheme(preset);
  };

  return (
    <section id="regions" className="py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 bg-white/80 backdrop-blur shadow-sm border border-gray-100">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>رنگ‌آمیزی زنده بر اساس طبیعت و اقلیم</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              مقاصد محبوب و{' '}
              <span style={{ color: 'hsl(var(--primary))' }}>اقلیم‌های رنگارنگ</span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-xl">
              با حرکت ماوس روی هر منطقه، رنگ‌آمیزی کل صفحه متناسب با طبیعت و آب‌وهوای آن منطقه هماهنگ می‌شود.
            </p>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-2 font-bold text-sm text-green-800 hover:gap-3 transition-all"
          >
            <span>مشاهده همه مقاصد ایران</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Regions Grid (3D Claymorphic Cards - طبق عکس سه بعدی بودن سایت) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {locations.slice(0, 8).map((loc, index) => {
            const isActive = activeRegionId === loc.id;
            return (
              <div
                key={loc.id}
                onMouseEnter={() => handleRegionHover(loc.id)}
                className={`card-clay group cursor-pointer overflow-hidden p-3 transition-all duration-500 ${
                  isActive ? 'ring-2 ring-green-600/60 scale-[1.02]' : ''
                }`}
              >
                {/* Image Container with 3D shadow */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-inner">
                  <img
                    src={loc.imageUrl}
                    alt={loc.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* 3D Round Regional Badge in corner (عکس ۳) */}
                  <div className="badge-clay-circle absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-md flex items-center justify-center text-lg shadow-md border border-white">
                    {index === 0 && '🏙️'}
                    {index === 1 && '🏛️'}
                    {index === 2 && '🕌'}
                    {index === 3 && '🌸'}
                    {index === 4 && '🌲'}
                    {index === 5 && '🌊'}
                    {index === 6 && '🏜️'}
                    {index === 7 && '🏔️'}
                  </div>

                  {/* Active Color Pulse Indicator */}
                  {isActive && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold shadow-lg animate-pulse">
                      اقلیم انتخابی
                    </div>
                  )}

                  {/* Bottom Text Details */}
                  <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                    <div className="flex items-center gap-1.5 text-xs text-green-300 font-medium mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{loc.province}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mb-3">
                      {loc.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/20">
                      <span className="text-xs font-semibold text-white/90">
                        {loc.propertyCount.toLocaleString('fa-IR')} اقامتگاه فعال
                      </span>
                      <Link
                        href={`/properties?cityId=${loc.id}`}
                        className="btn-3d-clay px-3.5 py-1.5 text-xs text-white font-bold flex items-center gap-1"
                      >
                        <span>رزرو</span>
                        <ArrowLeft className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
