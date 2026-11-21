'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Headphones,
  Sparkles,
  Check,
  ArrowLeft,
  Award,
  Clock,
  HeartHandshake,
} from 'lucide-react';

export default function FeaturesSection() {
  // 4 Main Feature Cards (دقیقاً مطابق ردیف امکانات عکس امکانات سایت)
  const topFeatures = [
    {
      icon: ShieldCheck,
      title: 'اقامتگاه‌های تایید شده',
      english: 'Verified Properties',
      description: 'تمام اقامتگاه‌ها توسط کارشناسان ما بازرسی و از نظر امنیت و نظافت تایید شده‌اند.',
      color: 'from-blue-500 to-indigo-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      icon: Lock,
      title: 'امن و بدون واسطه',
      english: 'Safe & Secure',
      description: 'پرداخت امن شاپرک با ضمانت بازگشت ۱۰۰٪ وجه در صورت مغایرت اطلاعات اقامتگاه.',
      color: 'from-purple-500 to-pink-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      icon: Headphones,
      title: 'پشتیبانی ۲۴/۷',
      english: '24/7 Support',
      description: 'تیم پشتیبانی اختصاصی در تمام ساعات شبانه‌روز آماده پاسخگویی به مسافران گرامی است.',
      color: 'from-cyan-500 to-blue-600',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    },
    {
      icon: Sparkles,
      title: 'تضمین بهترین قیمت',
      english: 'Best Price Guarantee',
      description: 'ارزان‌ترین نرخ رزرو مستقیم از میزبان؛ در صورت یافتن قیمت کمتر، مابه‌التفاوت بازگردانده می‌شود.',
      color: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
    },
  ];

  // Why Choose Checklist (مطابق بخش More Than Just A Property در عکس ۲)
  const whyChoosePoints = [
    {
      title: 'تنوع گسترده اقامتگاه‌های ممتاز',
      desc: 'بیش از ۱۸۰۰ ویلا، کلبه کوهستانی، بوم‌گردی و سوئیت لوکس برای هر سلیقه و بودجه.',
    },
    {
      title: 'قوانین لغو منعطف و قرارداد شفاف',
      desc: 'امکان کنسلی آسان بدون جریمه تا ۴۸ ساعت قبل از ورود با تسویه‌حساب اتوماتیک.',
    },
    {
      title: 'پیشنهادات هوشمند بر اساس نیاز شما',
      desc: 'انتخاب اختصاصی اقامتگاه‌های مناسب خانواده، حیوان خانگی، سفر کاری یا دوستانه.',
    },
    {
      title: 'مورد اعتماد بیش از ۵۰ هزار کاربر فعال',
      desc: 'هزاران نظر و تجربه واقعی ثبت شده توسط مهمانان پیشین برای انتخاب مطمئن.',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto space-y-24">

        {/* 1. Top 4 Feature Highlights Grid (از عکس امکانات سایت) */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3"
              style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
            >
              ⭐ مزایای اختصاصی سرپناه
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              چرا سرپناه مطمئن‌ترین انتخاب سفر شماست؟
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              استانداردهای بالای میزبانی و ایمنی کامل پرداخت، سفری بدون دغدغه برای شما به ارمغان می‌آورد.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="card-clay p-6 bg-white hover:bg-white flex flex-col justify-between group"
                >
                  <div>
                    {/* Icon with 3D badge */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border shadow-sm transition-transform group-hover:scale-110 duration-300 ${item.badgeBg}`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="text-[11px] font-bold text-gray-400 mb-1 ltr text-right">
                      {item.english}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center text-xs font-semibold text-green-800 gap-1 group-hover:gap-2 transition-all">
                    <span>اطلاعات بیشتر</span>
                    <span>←</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. "More Than Just A Property" Section (از عکس ۲ امکانات سایت) */}
        <div id="why-us" className="card-clay p-8 sm:p-12 lg:p-16 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                WHY CHOOSE SARPANAH
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                فراتر از فقط یک{' '}
                <span style={{ color: 'hsl(var(--primary))' }}>اقامتگاه ساده</span>
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                ما معتقدیم محل اقامت بخش اصلی خاطره سفر شماست. به همین دلیل علاوه بر امنیت و تمیزی، حس گرم خانه و اصالت اقلیم‌های ایران را در اختیارتان می‌گذاریم.
              </p>

              {/* Checkmarks List */}
              <div className="space-y-4 pt-2">
                {whyChoosePoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm"
                      style={{ background: 'hsl(var(--primary))' }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-800">
                        {point.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-relaxed">
                        {point.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-4 flex items-center gap-4">
                <Link
                  href="/properties"
                  className="btn-3d-clay px-8 py-3.5 text-white font-bold text-sm shadow-xl flex items-center gap-2"
                >
                  <span>جستجو در میان اقامتگاه‌ها</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Large Interior Showcase Image with floating badges */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&q=85"
                  alt="نمای داخلی ویلای لوکس"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Floating Pill 1: Guest Satisfaction */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 glass-card px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  ★ 4.9
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">رضایت مهمانان</div>
                  <div className="text-[10px] text-gray-500">بر اساس ۱۲,۰۰۰+ نظر</div>
                </div>
              </div>

              {/* Floating Pill 2: Verified Host */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 glass-card px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                  style={{ background: 'hsl(var(--primary))' }}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">میزبانان برگزیده</div>
                  <div className="text-[10px] text-gray-500">پاسخگویی زیر ۱۵ دقیقه</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
