'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { locations } from '@/lib/mockData';
import { useColorTheme } from '@/hooks/useColorTheme';
import { regionColorPresets } from '@/lib/colorExtractor';
import PersianDatePicker from '@/components/ui/PersianDatePicker';

export default function HeroSection() {
  const router = useRouter();
  const [activeRegionPreset, setActiveRegionPreset] = useState<string>('gilan');
  const [cityId, setCityId] = useState<string>('');
  const [checkIn, setCheckIn] = useState<string>('۲۲ آبان ۱۴۰۴');
  const [checkOut, setCheckOut] = useState<string>('۲۵ آبان ۱۴۰۴');
  const [guests, setGuests] = useState<number>(2);
  const [currentUser, setCurrentUser] = useState<{ name: string; email?: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadUser = () => {
      try {
        const saved = localStorage.getItem('sarpanah_user');
        if (saved) {
          setCurrentUser(JSON.parse(saved));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };
    loadUser();
    window.addEventListener('storage', loadUser);
    window.addEventListener('authChange', loadUser);
    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('authChange', loadUser);
    };
  }, []);

  // Hook dynamically applies dominant color of the active region/photo to the whole site background!
  const { updateTheme } = useColorTheme(activeRegionPreset);

  const handleRegionClick = (presetKey: string) => {
    setActiveRegionPreset(presetKey);
    updateTheme(presetKey);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (cityId) params.set('cityId', cityId);
    if (guests) params.set('minGuests', guests.toString());
    router.push(`/properties?${params.toString()}`);
  };

  // Scenic background images matching iconic regions
  const heroBackgrounds: Record<string, string> = {
    gilan: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1920&q=85', // Eco wooden cabin in green lawn & hills
    mazandaran: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85', // Gorgeous coastal beach & azure ocean blue
    isfahan: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1920&q=85', // Historic turquoise & architecture
    shiraz: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=85', // Boutique garden villa
    desert: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&q=85', // Golden desert lodge
  };

  const currentBg = heroBackgrounds[activeRegionPreset] || heroBackgrounds.gilan;

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-all duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Main Hero Card (مطابق عکس اصلی نمونه) */}
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[520px] md:min-h-[580px] flex flex-col justify-between p-6 sm:p-10 lg:p-14 border border-white/60">
          {/* Background image with subtle zoom & warm sun flare */}
          <div className="absolute inset-0 z-0">
            <img
              src={currentBg}
              alt="اقامتگاه بوم گردی و ویلا"
              className="w-full h-full object-cover transition-transform duration-1000 scale-105"
            />
            {/* Organic Soft Nature Overlay (مطابق نور و رنگ عکس نمونه اصلی) */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(20, 30, 20, 0.75) 0%, rgba(20, 30, 20, 0.35) 45%, rgba(0, 0, 0, 0.15) 100%)',
              }}
            />
            {/* Warm sunlight gradient flare top-left */}
            <div
              className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
              style={{ background: 'hsl(var(--secondary))' }}
            />
          </div>

          {/* Top Row: Floating Badge & User Trust Pile (از عکس امکانات سایت) */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            {/* Eco Badge (عکس اصلی) */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-semibold shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span>🌿 اقامتگاه‌های سبز و بوم‌گردی پاک</span>
            </div>

            {/* Social Proof (از عکس امکانات سایت: Trusted by 25K+ Happy Families) */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm shadow-lg">
              <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80"
                  alt="کاربر"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80"
                  alt="کاربر"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80"
                  alt="کاربر"
                />
              </div>
              <span className="font-medium text-white/95">
                مورد اعتماد بیش از <strong>۲۵,۰۰۰</strong> خانواده
              </span>
            </div>
          </div>

          {/* Hero Center Text (Find Eco-Friendly Homes Easily - عکس اصلی) */}
          <div className="relative z-10 max-w-2xl my-8">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-md mb-4">
              اقامتگاه‌های رویایی و بوم‌گردی در{' '}
              <span className="text-green-300 underline decoration-green-400/50 decoration-wavy decoration-2">
                دل طبیعت
              </span>
            </h1>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed drop-shadow max-w-xl mb-6">
              دستچین بهترین ویلاهای جنگلی، کلبه‌های چوبی کوهستانی و خانه‌های بومی با گارانتی کیفیت و تضمین کمترین نرخ رزرو.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/properties"
                className="btn-3d-clay px-8 py-3.5 text-base font-bold text-white shadow-xl flex items-center gap-2 group"
              >
                <span>مشاهده و رزرو اقامتگاه</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="px-6 py-3 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-semibold hover:bg-white/25 transition-all border border-white/30"
              >
                چرا سرپناه؟
              </a>
            </div>
          </div>

          {/* Bottom Region Atmosphere Selector (دکمه‌های انتخاب اقلیم و موقعیت مکانی) */}
          <div className="relative z-10 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
              <span className="font-medium">رنگ‌آمیزی متناسب با موقعیت مکانی و اقلیم:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'gilan', label: '🌿 گیلان' },
                { key: 'mazandaran', label: '🌊 مازندران' },
                { key: 'isfahan', label: '🏛️ اصفهان' },
                { key: 'shiraz', label: '🌸 شیراز' },
                { key: 'desert', label: '🏜️ کویر مرنجاب' },
              ].map((reg) => (
                <button
                  key={reg.key}
                  onClick={() => handleRegionClick(reg.key)}
                  className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold backdrop-blur-md ${
                    activeRegionPreset === reg.key
                      ? 'bg-white text-green-900 shadow-lg scale-105 font-bold'
                      : 'bg-black/30 text-white hover:bg-white/20'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Search Bar (کپسول سه‌بعدی جستجو دقیقاً مطابق عکس اصلی) */}
        <div className="relative -mt-10 sm:-mt-12 z-30 max-w-5xl mx-auto px-2">
          <form
            onSubmit={handleSearch}
            className="search-capsule-3d p-3 sm:p-4 flex flex-col md:flex-row items-center gap-3 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-100"
          >
            {/* 1. مقصد / شهر */}
            <div className="flex-1 w-full px-3 py-2 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                style={{ background: 'hsl(var(--primary))' }}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-400 mb-0.5">
                  مقصد یا شهر اقامت
                </label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
                >
                  <option value="">انتخاب از تمام شهرهای ایران...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.province})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. تاریخ اقامت (ورود و خروج) */}
            <div className="flex-1 w-full px-3 py-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <PersianDatePicker
                  label="تاریخ ورود"
                  value={checkIn}
                  onChange={setCheckIn}
                  placeholder="انتخاب ورود"
                />
                <PersianDatePicker
                  label="تاریخ خروج"
                  value={checkOut}
                  onChange={setCheckOut}
                  placeholder="انتخاب خروج"
                />
              </div>
            </div>

            {/* 3. تعداد مسافران */}
            <div className="w-full md:w-44 px-3 py-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-400 mb-0.5">
                  تعداد مهمانان
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                    <option key={num} value={num}>
                      {num} نفر مسافر
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. دکمه جستجو کپسولی سه‌بعدی (مطابق عکس اصلی) */}
            <div className="w-full md:w-auto p-1">
              <button
                type="submit"
                className="btn-3d-clay w-full md:w-auto px-8 py-3.5 text-white font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-xl"
              >
                <Search className="w-4 h-4" />
                <span>جستجو</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
