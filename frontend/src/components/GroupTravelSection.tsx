'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Calculator,
  CheckSquare,
  Share2,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Compass,
  MessageCircle,
} from 'lucide-react';

export default function GroupTravelSection() {
  const [totalCost, setTotalCost] = useState<number>(12000000);
  const [memberCount, setMemberCount] = useState<number>(4);
  const [companions, setCompanions] = useState<string[]>([
    'مائده دانشمند (مدیر سفر)',
    'سارا کریمی',
    'علی رضایی',
    'نرگس محمدی',
  ]);
  const [newCompanion, setNewCompanion] = useState('');

  const perPerson = Math.round(totalCost / Math.max(1, memberCount));

  const addCompanion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCompanion.trim()) {
      setCompanions([...companions, newCompanion.trim()]);
      setMemberCount(companions.length + 1);
      setNewCompanion('');
    }
  };

  const removeCompanion = (index: number) => {
    if (companions.length > 1) {
      const updated = companions.filter((_, i) => i !== index);
      setCompanions(updated);
      setMemberCount(updated.length);
    }
  };

  return (
    <section id="group-travel" className="py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3 bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>ویژگی اختصاصی سرپناه • طراحی شده بر اساس نیازهای واقعی</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            برنامه‌ریزی هوشمند، همسفری و{' '}
            <span className="text-indigo-600">محاسبه هوشمند سهم هزینه سفر</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-3 leading-relaxed">
            دیگر نیازی به محاسبات دستی و دغدغه تقسیم هزینه‌ها نیست! با سرپناه دوستانتان را به سفر دعوت کنید، اقامتگاه دلخواه را انتخاب نمایید و هزینه‌ها را به آسانی و عادلانه بین همه مسافران تقسیم کنید.
          </p>
        </div>

        {/* 2-Column Showcase: Features list & Interactive Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Features Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="card-clay p-5 bg-white border border-gray-100/80 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Calculator className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  محاسبه‌گر هوشمند سهم هزینه
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  محاسبه عادلانه کل هزینه اقامت، نظافت و وعده‌ها بر اساس تعداد نفرات حاضر با لینک پرداخت مجزا برای هر همسفر.
                </p>
              </div>

              <div className="card-clay p-5 bg-white border border-gray-100/80 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Share2 className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  دعوت سریع با لینک اختصاصی
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  ارسال دعوت‌نامه از طریق پیامک یا واتساپ؛ همسفران با یک کلیک مشخصات ویلا را دیده و به گروه ملحق می‌شوند.
                </p>
              </div>

              <div className="card-clay p-5 bg-white border border-gray-100/80 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  چک‌لیست اشتراکی لوازم
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  فهرست اشتراکی تجهیزات کمپینگ، چادر، مواد خوراکی و تقسیم وظایف خرید بین همسفران تا چیزی از قلم نیفتد.
                </p>
              </div>

              <div className="card-clay p-5 bg-white border border-gray-100/80 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  اتاق گفتگوی اختصاصی سفر
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  هماهنگی ساعت حرکت، وسایل نقلیه و برنامه‌ریزی گشت‌وگذار روزانه در یک فضای متمرکز و امن.
                </p>
              </div>

            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="btn-3d-clay px-6 py-3 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md"
              >
                <Compass className="w-4 h-4" />
                <span>شروع برنامه‌ریزی سفر گروهی</span>
              </Link>
            </div>
          </div>

          {/* Interactive Live Split Simulator (5 cols) */}
          <div className="lg:col-span-5">
            <div className="card-clay p-6 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 border border-indigo-200 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏕️</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      شبیه‌ساز هوشمند سهم هزینه سفر
                    </h4>
                    <span className="text-[10px] text-gray-500">
                      تست امکانات گروهی سرپناه
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                  آنلاین
                </span>
              </div>

              {/* Cost slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>مجموع هزینه اقامتگاه:</span>
                  <span className="text-indigo-700">
                    {totalCost.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <input
                  type="range"
                  min="3000000"
                  max="30000000"
                  step="500000"
                  value={totalCost}
                  onChange={(e) => setTotalCost(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Members List */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>لیست همسفران ({companions.length} نفر):</span>
                  <span className="text-gray-400 text-[11px]">با کلیک حذف یا اضافه کنید</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {companions.map((comp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-indigo-100 text-xs shadow-xs"
                    >
                      <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {comp}
                      </span>
                      {companions.length > 1 && (
                        <button
                          onClick={() => removeCompanion(idx)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold px-1"
                          title="حذف"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add member form */}
                <form onSubmit={addCompanion} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newCompanion}
                    onChange={(e) => setNewCompanion(e.target.value)}
                    placeholder="نام همسفر جدید..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-indigo-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-xs"
                  >
                    + افزودن
                  </button>
                </form>
              </div>

              {/* Output Result */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[11px] block opacity-90">سهم پرداختی هر مسافر:</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-extrabold">
                      {perPerson.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs">تومان</span>
                  </div>
                </div>
                <div className="text-left text-[11px] opacity-90 leading-tight">
                  <div>پرداخت مستقیم</div>
                  <div className="font-bold text-amber-300">بدون کارمزد مازاد</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
