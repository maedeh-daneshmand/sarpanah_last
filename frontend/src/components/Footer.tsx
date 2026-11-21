'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Send, Compass, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = 1403;

  return (
    <footer className="bg-stone-900 text-stone-200 pt-16 pb-10 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-stone-800">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg shadow-md"
                style={{ background: 'hsl(var(--primary))' }}
              >
                🌿
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                سرپناه
              </span>
            </Link>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              سامانه جامع رزرواسیون آنلاین ویلا، اقامتگاه‌های بوم‌گردی و کلبه‌های چوبی در زیباترین مناطق ایران. اقامتی امن، آرام و خاطره‌انگیز با تضمین بهترین قیمت.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:bg-emerald-800 transition-all"
                aria-label="اینستاگرام"
              >
                <Globe className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:bg-blue-600 transition-all"
                aria-label="تلگرام"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white mb-2">دسترسی سریع</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-400">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  صفحه اصلی
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-emerald-400 transition-colors">
                  همه اقامتگاه‌ها
                </Link>
              </li>
              <li>
                <Link href="#regions" className="hover:text-emerald-400 transition-colors">
                  مناطق گردشگری
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-emerald-400 transition-colors">
                  امکانات و مزایا
                </Link>
              </li>
              <li>
                <Link href="/register?role=host" className="hover:text-emerald-400 transition-colors">
                  میزبان شوید
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Cities */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white mb-2">مقاصد پرطرفدار</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-400">
              <li>
                <Link href="/properties?cityId=5" className="hover:text-emerald-400 transition-colors">
                  ویلاهای گیلان و ماسال
                </Link>
              </li>
              <li>
                <Link href="/properties?cityId=6" className="hover:text-emerald-400 transition-colors">
                  کلبه‌های جنگلی مازندران
                </Link>
              </li>
              <li>
                <Link href="/properties?cityId=4" className="hover:text-emerald-400 transition-colors">
                  اقامتگاه‌های شیراز
                </Link>
              </li>
              <li>
                <Link href="/properties?cityId=2" className="hover:text-emerald-400 transition-colors">
                  خانه‌های سنتی اصفهان
                </Link>
              </li>
              <li>
                <Link href="/properties?cityId=7" className="hover:text-emerald-400 transition-colors">
                  اکولاژ کویر مرنجاب
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Trust */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-bold text-white mb-2">ارتباط با پشتیبانی</h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>پشتیبانی شبانه‌روزی: ۰۲۱-۹۱۰۰۱۲۳۴</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>ایمیل: support@sarpanah.ir</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>دفتر مرکزی: تهران، میدان ونک، برج نگار</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex items-center gap-3">
              <div className="p-2 bg-stone-800 rounded-xl flex items-center gap-2 border border-stone-700 text-xs font-semibold text-stone-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>پرداخت امن بانکی</span>
              </div>
              <div className="p-2 bg-stone-800 rounded-xl flex items-center gap-2 border border-stone-700 text-xs font-semibold text-stone-300">
                <Compass className="w-5 h-5 text-amber-400" />
                <span>مجوز گردشگری</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {currentYear} تمامی حقوق مادی و معنوی این وب‌سایت متعلق به «سرپناه» می‌باشد.
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-stone-300 transition-colors">
              قوانین و مقررات
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-stone-300 transition-colors">
              حریم خصوصی
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-stone-300 transition-colors">
              سوالات متداول
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
