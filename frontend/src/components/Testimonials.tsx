'use client';

import { Star, Quote, CheckCircle } from 'lucide-react';
import { reviews } from '@/lib/mockData';

export default function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Header (مطابق عکس امکانات سایت) */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-green-700">
            WHAT OUR CLIENTS SAY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-2 mb-4">
            تجربه واقعی{' '}
            <span style={{ color: 'hsl(var(--primary))' }}>مهمانان سرپناه</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            بیش از ۹۸٪ مسافران ما اقامت در سرپناه را به دوستان و خانواده خود پیشنهاد کرده‌اند.
          </p>
        </div>

        {/* 3 Review Cards Side-by-Side (مطابق عکس امکانات سایت) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="card-clay p-8 bg-white flex flex-col justify-between relative group hover:bg-white"
            >
              {/* Quote icon */}
              <div className="absolute top-6 left-6 text-gray-200 group-hover:text-green-200 transition-colors pointer-events-none">
                <Quote className="w-10 h-10 rotate-180" />
              </div>

              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                  «{rev.comment}»
                </p>
              </div>

              {/* User Profile */}
              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <img
                  src={rev.userAvatar}
                  alt={rev.userName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-green-600/20 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="text-sm font-bold text-gray-900">{rev.userName}</h4>
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-[11px] text-gray-400 block">
                    مهمان تایید شده • {rev.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
