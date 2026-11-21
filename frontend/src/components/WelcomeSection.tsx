'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Leaf, Shield, Sparkles } from 'lucide-react';

export default function WelcomeSection() {
  return (
    <section id="why-us" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Container matching "Welcome on Treopps?" in نمونه اصلی */}
        <div className="card-clay p-6 sm:p-10 lg:p-14 bg-white/95">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Image Side with 3D Overlapping Badges (دقیقاً مثل عکس اصلی) */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=85"
                  alt="اقامتگاه بوم‌گردی سرپناه"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* 3D Round Badge 1: Top-Left (مثل دایره سبز Next Home در عکس اصلی) */}
              <div className="badge-clay-circle absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-emerald-700 text-white p-3.5 sm:p-4 flex items-center gap-2 shadow-2xl border-2 border-white">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-emerald-200" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-emerald-200 font-medium">اقامت پایدار</div>
                  <div className="text-xs font-bold whitespace-nowrap">بوم‌گردی سبز</div>
                </div>
              </div>

              {/* 3D Round Badge 2: Bottom-Right (مثل دایره نارنجی در عکس اصلی) */}
              <div className="badge-clay-circle absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-amber-600 text-white p-3 sm:p-3.5 flex items-center gap-2 shadow-2xl border-2 border-white">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-100" />
                </div>
                <div className="text-right pr-1">
                  <div className="text-[10px] text-amber-100 font-medium">کیفیت تضمین‌شده</div>
                  <div className="text-xs font-bold">بازرسی حضوری</div>
                </div>
              </div>
            </div>

            {/* Content Side (متن و دکمه کپسولی سبز) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                <span>🌿</span>
                <span>تجربه اصیل زندگی در طبیعت ایران</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                به سامانه بوم‌گردی{' '}
                <span style={{ color: 'hsl(var(--primary))' }}>سرپناه</span> خوش آمدید
              </h2>

              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                سرپناه اولین سامانه تخصصی رزرواسیون اقامتگاه‌های پایدار، بوم‌گردی‌های روستایی و ویلاهای اختصاصی با محوریت حفظ محیط‌زیست و حمایت از جوامع بومی است. ما سفری خاطره‌انگیز و اقامتی امن، تمیز و آرام را برای شما رقم می‌زنیم.
              </p>

              {/* Checklist items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'تضمین نظافت هتل‌مانند و ضدعفونی استاندارد',
                  'پشتیبانی ۲۴ ساعته در طول اقامت',
                  'ارتباط مستقیم با میزبانان محلی',
                  'شرایط لغو رزرو منعطف با استرداد آنی',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons (مثل عکس اصلی) */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/properties"
                  className="btn-3d-clay px-8 py-3.5 text-white font-bold text-sm shadow-xl flex items-center gap-2"
                >
                  <span>رزرو اقامتگاه سبز</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <Link
                  href="#why-us"
                  className="px-6 py-3.5 rounded-full text-sm font-semibold text-gray-700 hover:text-green-800 hover:bg-green-50 transition-all border border-gray-200"
                >
                  اطلاعات بیشتر
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
