'use client';

import Link from 'next/link';
import { Building2, Coins, ShieldCheck, ArrowLeft, Users, CalendarCheck } from 'lucide-react';

export default function HostSection() {
  const hostPerks = [
    {
      icon: Coins,
      title: 'درآمد پایدار و تسویه روزانه',
      desc: 'اقامتگاه یا ویلای خود را به منبع درآمد ماهانه تبدیل کنید با واریز فوری پس از پذیرش مهمان.',
    },
    {
      icon: ShieldCheck,
      title: 'بیمه رایگان اقامتگاه',
      desc: 'پوشش کامل خسارت احتمالی تا سقف ۵۰۰ میلیون تومان برای تمامی اقامت‌های ثبت شده در سرپناه.',
    },
    {
      icon: CalendarCheck,
      title: 'تقویم هوشمند و مدیریت آسان',
      desc: 'کنترل کامل روزهای خالی، تغییر قیمت دلخواه برای آخر هفته‌ها و تعطیلات در پنل اختصاصی میزبان.',
    },
    {
      icon: Users,
      title: 'پشتیبانی اختصاصی میزبانان',
      desc: 'مشاوره حضوری جهت قیمت‌گذاری، عکاسی رایگان و پشتیبانی VIP در تمام مراحل.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
        <div className="card-clay p-8 sm:p-12 lg:p-16 bg-white overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Image Side */}
            <div className="lg:col-span-5 relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=85"
                  alt="میزبان سرپناه"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 right-6 left-6 text-white">
                  <div className="text-xl font-bold mb-1">حمیدرضا شریفی</div>
                  <div className="text-xs text-white/80">میزبان برتر ماسال • ۳ سال سابقه در سرپناه</div>
                </div>
              </div>

              {/* Floating Stat Badge */}
              <div className="absolute -top-4 -right-4 glass-card px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white">
                <div className="w-10 h-10 rounded-xl bg-green-700 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  💰
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">+۲۵ میلیون تومان</div>
                  <div className="text-[10px] text-gray-500">میانگین درآمد ماهانه میزبانان</div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                🏡 فرصت کسب درآمد برای مالکان اقامتگاه
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                اقامتگاه خالی‌ات را به{' '}
                <span style={{ color: 'hsl(var(--primary))' }}>درآمدی مطمئن</span> تبدیل کن
              </h2>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                اگر در شمال، کویر، شیراز، اصفهان یا هر گوشه‌ای از ایران ویلا، کلبه، بوم‌گردی یا خانه روستایی دارید، همین امروز رایگان در سرپناه ثبت‌نام کنید و به هزاران مسافر متصل شوید.
              </p>

              {/* Perks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {hostPerks.map((perk, idx) => {
                  const Icon = perk.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:shadow-md transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white text-green-800 flex items-center justify-center shadow-sm mb-3">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        {perk.title}
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {perk.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Host Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/register?role=host"
                  className="btn-3d-clay px-8 py-3.5 text-white font-bold text-sm shadow-xl flex items-center gap-2"
                >
                  <span>ثبت رایگان اقامتگاه به عنوان میزبان</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="px-6 py-3.5 rounded-full text-sm font-semibold text-gray-700 hover:text-green-800 hover:bg-green-50 transition-all border border-gray-200"
                >
                  ورود به پنل میزبان
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
