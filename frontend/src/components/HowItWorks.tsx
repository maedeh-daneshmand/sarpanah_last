'use client';

import { Search, Home, KeyRound, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const steps = [
    {
      num: '۰۱',
      icon: Search,
      title: 'جستجو و کاوش هوشمند',
      desc: 'شهر یا منطقه دلخواه، تاریخ سفر و تعداد مسافران را مشخص کرده و در میان صدها اقامتگاه گلچین شده جستجو کنید.',
      badgeColor: 'from-blue-600 to-indigo-700 text-white',
    },
    {
      num: '۰۲',
      icon: Home,
      title: 'انتخاب اقامتگاه و رزرو آنی',
      desc: 'عکس‌های ۳۶۰ درجه، امکانات، نظرات واقعی مهمانان و قیمت شفاف را بررسی کرده و رزرو خود را قطعی کنید.',
      badgeColor: 'from-emerald-600 to-green-700 text-white',
    },
    {
      num: '۰۳',
      icon: KeyRound,
      title: 'تحویل کلید و لذت از اقامت',
      desc: 'با آرامش خاطر راهی سفر شوید؛ میزبان در محل منتظر شماست و تیم پشتیبانی سرپناه تا پایان اقامت همراه شما خواهد بود.',
      badgeColor: 'from-purple-600 to-pink-700 text-white',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-green-700">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-2 mb-4">
            رزرو اقامتگاه رویایی در{' '}
            <span style={{ color: 'hsl(var(--primary))' }}>۳ مرحله ساده</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            فرآیند سریع، شفاف و بدون معطلی رزرواسیون اقامتگاه در سراسر ایران
          </p>
        </div>

        {/* Steps with connecting line (دقیقاً مطابق عکس امکانات سایت) */}
        <div className="relative">
          {/* Dashed Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 -translate-y-8 right-[15%] left-[15%] h-0.5 border-t-2 border-dashed border-gray-300 -z-0 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="card-clay p-8 bg-white flex flex-col items-center text-center group hover:bg-white transition-all"
                >
                  {/* 3D Round Numbered Badge */}
                  <div
                    className={`badge-clay-circle w-20 h-20 rounded-full bg-gradient-to-tr ${step.badgeColor} flex items-center justify-center mb-6 shadow-xl relative`}
                  >
                    <Icon className="w-9 h-9" />
                    {/* Tiny Number Pill */}
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white text-gray-900 font-extrabold text-xs flex items-center justify-center shadow-md border border-gray-100">
                      {step.num}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-800 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Bottom Banner (مطابق انتهای عکس امکانات سایت) */}
        <div className="mt-16 card-clay p-8 sm:p-12 bg-gradient-to-l from-emerald-950 via-emerald-900 to-green-950 text-white shadow-2xl border border-emerald-700/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center md:text-right">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 drop-shadow-md">
                آماده‌اید اقامتگاه رویایی‌تان را پیدا کنید؟
              </h3>
              <p className="text-white font-extrabold text-sm sm:text-base leading-relaxed max-w-xl drop-shadow">
                همین حالا به جمع هزاران مسافری بپیوندید که خاطره‌انگیزترین سفرهایشان را با سرپناه تجربه کردند.
              </p>
            </div>
            <Link
              href="/properties"
              className="btn-3d-clay px-8 py-4 bg-white text-emerald-950 hover:text-black font-extrabold text-sm whitespace-nowrap shadow-xl hover:bg-gray-50 flex items-center gap-2"
            >
              <span>شروع جستجو و رزرو</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
