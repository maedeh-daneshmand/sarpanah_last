'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PersianDatePicker from '@/components/ui/PersianDatePicker';
import { properties, amenities, reviews } from '@/lib/mockData';
import { useColorTheme } from '@/hooks/useColorTheme';
import {
  Star,
  MapPin,
  Heart,
  Bed,
  Users,
  Bath,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Share2,
  Phone,
  MessageCircle,
} from 'lucide-react';

export default function PropertyDetailPage({
  params,
}: {
  params: { id: string } | any;
}) {
  // Safe param resolver for Next.js 14 & 15
  let resolvedId = '1';
  if (params && typeof params === 'object') {
    if ('id' in params && typeof params.id === 'string') {
      resolvedId = params.id;
    }
  }

  const property = properties.find((p) => p.id === parseInt(resolvedId)) || properties[0];

  const [currentImage, setCurrentImage] = useState(0);
  const [checkIn, setCheckIn] = useState('۲۲ آبان ۱۴۰۴');
  const [checkOut, setCheckOut] = useState('۲۵ آبان ۱۴۰۴');
  const [guests, setGuests] = useState(2);
  const [isSaved, setIsSaved] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isGroupTrip, setIsGroupTrip] = useState(false);
  const [groupMembers, setGroupMembers] = useState<string[]>(['مائده دانشمند (مدیر سفر)']);
  const [newMemberName, setNewMemberName] = useState('');

  // Sync with wishlist from localStorage
  useEffect(() => {
    if (!property) return;
    try {
      const list = JSON.parse(localStorage.getItem('sarpanah_wishlist') || '[]');
      setIsSaved(list.some((item: any) => item.id === property.id));
    } catch {
      setIsSaved(false);
    }
  }, [property?.id]);

  const toggleWishlist = () => {
    if (!property) return;
    try {
      const list = JSON.parse(localStorage.getItem('sarpanah_wishlist') || '[]');
      let updated;
      if (isSaved) {
        updated = list.filter((item: any) => item.id !== property.id);
        setIsSaved(false);
      } else {
        updated = [
          ...list,
          {
            id: property.id,
            title: property.title,
            location: property.cityName,
            address: property.address,
            pricePerNight: property.pricePerNight,
            rating: property.rating,
            reviewsCount: property.reviewCount,
            image: property.images[0],
            bedrooms: property.bedrooms,
            maxGuests: property.maxGuests,
            typeName: property.typeName,
          },
        ];
        setIsSaved(true);
      }
      localStorage.setItem('sarpanah_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('wishlistChange'));
    } catch {}
  };

  // Dynamic theme update based on current property photo
  useColorTheme(property?.images?.[currentImage] || property?.images?.[0] || 'gilan');

  if (!property) {
    return (
      <main className="min-h-screen dynamic-theme-bg flex items-center justify-center p-4">
        <div className="card-clay p-12 text-center bg-white max-w-md w-full">
          <div className="text-6xl mb-4">🏡</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            اقامتگاه پیدا نشد!
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            اقامتگاه موردنظر ممکن است حذف یا غیرفعال شده باشد.
          </p>
          <Link
            href="/properties"
            className="btn-3d-clay px-6 py-3 text-white text-sm font-bold inline-block"
          >
            مشاهده همه اقامتگاه‌ها
          </Link>
        </div>
      </main>
    );
  }

  const propertyAmenities = amenities.filter((a) =>
    property.amenities.includes(a.id)
  );
  const propertyReviews = reviews.filter((r) => r.propertyId === property.id);

  // Calculate nights difference for Shamsi dates
  const calculateNights = (inDate: string, outDate: string) => {
    try {
      const toEn = (s: string) =>
        s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
      const p1 = toEn(inDate).split(' ').filter(Boolean);
      const p2 = toEn(outDate).split(' ').filter(Boolean);
      if (p1.length >= 1 && p2.length >= 1) {
        const d1 = parseInt(p1[0], 10);
        const d2 = parseInt(p2[0], 10);
        if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
          return d2 - d1;
        }
      }
    } catch {}
    return 3; // Default 3 nights
  };

  const nights = calculateNights(checkIn, checkOut);
  const subtotal = nights * property.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.09); // 9% service & insurance fee
  const cleaningFee = 250000;
  const totalAmount = subtotal > 0 ? subtotal + serviceFee + cleaningFee : 0;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      alert('لطفاً تاریخ ورود و خروج را مشخص کنید.');
      return;
    }
    setBookingSuccess(true);
  };

  return (
    <main className="min-h-screen dynamic-theme-bg overflow-x-hidden">
      <Navbar />

      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-green-800 transition-colors">
              خانه
            </Link>
            <span>/</span>
            <Link
              href="/properties"
              className="hover:text-green-800 transition-colors"
            >
              اقامتگاه‌ها
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-bold truncate max-w-xs sm:max-w-md">
              {property.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleWishlist}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all shadow-sm ${
                isSaved
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-white/90 border-gray-200 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isSaved ? 'fill-rose-500 text-rose-500' : 'text-gray-600'
                }`}
              />
              <span>{isSaved ? 'علاقه‌مندی (ذخیره شده)' : 'افزودن به علاقه‌مندی‌ها'}</span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: property.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('لینک اقامتگاه در کلیپ‌بورد کپی شد!');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-white shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-600" />
              <span>اشتراک‌گذاری</span>
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
            {property.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1 font-bold text-gray-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{property.rating}</span>
              <span className="text-gray-400 font-normal">
                ({property.reviewCount} نظر ثبت‌شده)
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-green-800 font-semibold">
              <MapPin className="w-4 h-4" />
              <span>{property.address}</span>
            </div>
            <span>•</span>
            <span className="text-gray-500">{property.typeName}</span>
            {property.isVerified && (
              <>
                <span>•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تأیید شده توسط کارشناسان سرپناه</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* 3D Interactive Photo Gallery */}
        <div className="card-clay p-3 bg-white mb-10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[380px] md:h-[480px]">
            {/* Main Featured Photo */}
            <div className="md:col-span-3 rounded-2xl overflow-hidden relative shadow-inner group">
              <img
                src={property.images[currentImage]}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-semibold">
                تصویر {currentImage + 1} از {property.images.length}
              </div>
            </div>

            {/* Thumbnails Column */}
            <div className="hidden md:flex flex-col gap-3">
              {property.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`flex-1 rounded-xl overflow-hidden cursor-pointer relative transition-all border-2 ${
                    currentImage === idx
                      ? 'border-green-600 shadow-md scale-[1.02]'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`تصویر ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Thumbnail strip */}
          <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-2">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  currentImage === idx ? 'border-green-600 scale-105' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Layout: Content Details vs Floating Booking Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Key Specs Card (3D Clay) */}
            <div className="card-clay p-6 bg-white grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-2xl bg-gray-50 flex flex-col items-center">
                <Bed className="w-6 h-6 text-green-700 mb-1" />
                <span className="text-sm font-bold text-gray-900">
                  {property.bedrooms} اتاق خواب
                </span>
                <span className="text-[11px] text-gray-500">تخت‌های دو نفره و راحت</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 flex flex-col items-center">
                <Users className="w-6 h-6 text-blue-700 mb-1" />
                <span className="text-sm font-bold text-gray-900">
                  تا {property.maxGuests} نفر
                </span>
                <span className="text-[11px] text-gray-500">ظرفیت استاندارد مهمان</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 flex flex-col items-center">
                <Bath className="w-6 h-6 text-amber-700 mb-1" />
                <span className="text-sm font-bold text-gray-900">
                  {property.bathrooms} حمام و سرویس
                </span>
                <span className="text-[11px] text-gray-500">ایرانی و فرنگی</span>
              </div>
            </div>

            {/* Description Card */}
            <div className="card-clay p-6 sm:p-8 bg-white space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                درباره این اقامتگاه
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {property.description}
              </p>
              <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-green-700" />
                  <span>ساعت ورود: ۱۴:۰۰</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-700" />
                  <span>ساعت خروج: ۱۲:۰۰</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>امکان لغو تا ۴۸ ساعت قبل از سفر</span>
                </div>
              </div>
            </div>

            {/* Amenities Grid Card */}
            <div className="card-clay p-6 sm:p-8 bg-white space-y-5">
              <h2 className="text-xl font-bold text-gray-900">
                امکانات و تجهیزات اقامتگاه
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {propertyAmenities.map((am) => (
                  <div
                    key={am.id}
                    className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3"
                  >
                    <span className="text-2xl">{am.icon}</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-800">
                      {am.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Info Card */}
            <div className="card-clay p-6 sm:p-8 bg-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-right">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80"
                  alt="میزبان"
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-green-100 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h3 className="text-lg font-bold text-gray-900">
                      میزبان: آقای بهزاد کاظمی
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      سوپرمیزبان ★
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    عضویت از سال ۱۳۹۹ • نرخ پاسخگویی ۱۰۰٪ • زمان پاسخ زیر ۱۰ دقیقه
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert('شماره تماس میزبان پس از نهایی شدن رزرو در اختیارتان قرار می‌گیرد.')}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-green-700" />
                  <span>پیام به میزبان</span>
                </button>
              </div>
            </div>

            {/* Group Travel Feature Showcase Card */}
            <div className="card-clay p-6 sm:p-8 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 border border-indigo-100/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-md">
                  👥
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    امکانات ویژه برنامه‌ریزی و سفر گروهی در سرپناه
                  </h3>
                  <p className="text-xs text-gray-500">
                    هماهنگی راحت‌تر، شفافیت مالی و محاسبه سهم هر مسافر با همراهان سفر
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-xs space-y-1">
                  <div className="text-lg font-bold text-indigo-700">🏕️ محاسبه خودکار سهم هزینه</div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    محاسبه سهم هر نفر از هزینه رزرو اقامتگاه و امکان پرداخت اشتراکی
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-xs space-y-1">
                  <div className="text-lg font-bold text-indigo-700">📋 چک‌لیست اشتراکی</div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    تقسیم وظایف، وسایل کمپینگ، مواد غذایی و لوازم سفر بین همسفران
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-xs space-y-1">
                  <div className="text-lg font-bold text-indigo-700">🔗 دعوت با یک لینک</div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    ارسال لینک اختصاصی به دوستان جهت پیوستن سریع به گروه مسافرین
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="card-clay p-6 sm:p-8 bg-white space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <h2 className="text-xl font-bold text-gray-900">
                    نظرات مهمانان ({propertyReviews.length})
                  </h2>
                </div>
                <span className="text-xs font-semibold text-green-800">
                  امتیاز کلی {property.rating} از ۵
                </span>
              </div>

              <div className="space-y-4">
                {propertyReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-gray-900">
                            {rev.userName}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {rev.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Floating Booking Widget (5 cols) */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="card-clay p-6 sm:p-7 bg-white sticky top-28 space-y-6 border border-white">
              
              {/* Price Tag */}
              <div className="flex items-baseline justify-between pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 block font-medium">
                    قیمت به ازای هر شب:
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                      {property.pricePerNight.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs font-bold text-gray-500">تومان</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-gray-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{property.rating}</span>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBooking} className="space-y-4">
                {/* Shamsi Dates with PersianDatePicker */}
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-2 gap-3">
                  <div className="border-l border-gray-200 pl-2">
                    <PersianDatePicker
                      label="📅 تاریخ ورود"
                      value={checkIn}
                      onChange={setCheckIn}
                      placeholder="انتخاب تاریخ..."
                    />
                  </div>
                  <div>
                    <PersianDatePicker
                      label="📅 تاریخ خروج"
                      value={checkOut}
                      onChange={setCheckOut}
                      placeholder="انتخاب تاریخ..."
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">
                    👥 تعداد مهمانان
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} نفر مسافر
                      </option>
                    ))}
                  </select>
                </div>

                {/* Group Travel Feature (برنامه‌ریزی و سفر گروهی / دانگی) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏕️</span>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">سفر گروهی و تقسیم هزینه</h4>
                        <p className="text-[10px] text-gray-500">برنامه‌ریزی مشترک با دوستان</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGroupTrip}
                        onChange={(e) => setIsGroupTrip(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {isGroupTrip && (
                    <div className="space-y-2.5 pt-2 border-t border-indigo-100 text-right animate-fade-up">
                      <div className="text-[11px] text-indigo-950 font-semibold flex items-center justify-between">
                        <span>همسفران ({groupMembers.length} نفر):</span>
                        <span className="text-xs font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded-full shadow-xs border border-indigo-100">
                          سهم هر مسافر: {Math.round(totalAmount / Math.max(1, groupMembers.length)).toLocaleString('fa-IR')} تومان
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                        {groupMembers.map((member, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-indigo-100 text-xs shadow-xs">
                            <span className="font-medium text-gray-800 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                                {idx + 1}
                              </span>
                              {member}
                            </span>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => setGroupMembers(groupMembers.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 text-[11px] font-bold px-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="نام همسفر..."
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newMemberName.trim()) {
                                setGroupMembers([...groupMembers, newMemberName.trim()]);
                                setNewMemberName('');
                              }
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 rounded-xl border border-indigo-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newMemberName.trim()) {
                              setGroupMembers([...groupMembers, newMemberName.trim()]);
                              setNewMemberName('');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-xs"
                        >
                          + افزودن
                        </button>
                      </div>

                      <div className="p-2 rounded-xl bg-white/80 border border-indigo-100 text-[10px] text-gray-600 flex items-center justify-between">
                        <span>📋 چک‌لیست لوازم مشترک سفر</span>
                        <span className="text-indigo-600 font-bold">فعال شد</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Calculation breakdown */}
                {nights > 0 && (
                  <div className="space-y-2 pt-2 text-xs text-gray-600 border-t border-gray-100">
                    <div className="flex justify-between">
                      <span>
                        {property.pricePerNight.toLocaleString('fa-IR')} تومان × {nights} شب
                      </span>
                      <span className="font-bold text-gray-800">
                        {subtotal.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>هزینه نظافت و آماده‌سازی</span>
                      <span className="font-bold text-gray-800">
                        {cleaningFee.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>کارمزد خدمات و بیمه مسافر</span>
                      <span className="font-bold text-gray-800">
                        {serviceFee.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-extrabold text-gray-900">
                      <span>مبلغ کل قابل پرداخت</span>
                      <span className="text-green-800 text-base">
                        {totalAmount.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>
                )}

                {/* Booking Button (3D Clay) */}
                <button
                  type="submit"
                  className="btn-3d-clay w-full py-4 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>
                    {nights > 0
                      ? `ثبت درخواست رزرو (${nights} شب)`
                      : 'انتخاب تاریخ و رزرو'}
                  </span>
                </button>
              </form>

              {/* Booking success notification modal / banner */}
              {bookingSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 animate-scale-in">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>درخواست رزرو با موفقیت ثبت شد!</span>
                  </div>
                  <p className="leading-relaxed">
                    پیامک تأیید رزرو برای شما ارسال شد. میزبان ظرف حداکثر ۱۵ دقیقه پاسخ نهایی را اعلام خواهد کرد.
                  </p>
                </div>
              )}

              {/* Guarantees */}
              <div className="space-y-2 pt-2 text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-700 flex-shrink-0" />
                  <span>ضمانت ۱۰۰٪ تحویل اقامتگاه و تطابق با تصاویر</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>تضمین کمترین نرخ رزرو در سرپناه</span>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>

      <Footer />
    </main>
  );
}
