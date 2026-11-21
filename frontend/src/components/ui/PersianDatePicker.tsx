'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface PersianDatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const weekDays = [
  { short: 'ش', name: 'شنبه' },
  { short: 'ی', name: 'یکشنبه' },
  { short: 'د', name: 'دوشنبه' },
  { short: 'س', name: 'سه‌شنبه' },
  { short: 'چ', name: 'چهارشنبه' },
  { short: 'پ', name: 'پنج‌شنبه' },
  { short: 'ج', name: 'جمعه', isFriday: true },
];

// Helper to convert Jalali date to Gregorian to get exact day of week
function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  jy += 1595;
  let days =
    -355668 +
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  let gm = 0;
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
  return new Date(gy, gm - 1, gd);
}

// Convert numbers to Persian numerals
function toFaDigit(n: number | string): string {
  return n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
}

// Convert Persian digits to English
function toEnDigit(s: string): string {
  return s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
}

export default function PersianDatePicker({
  label,
  value,
  onChange,
  placeholder = 'انتخاب تاریخ...',
}: PersianDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial parse of value
  const parseDate = (val: string) => {
    try {
      const en = toEnDigit(val);
      // Case: "22 آبان 1404"
      for (let i = 0; i < persianMonths.length; i++) {
        if (val.includes(persianMonths[i])) {
          const parts = en.split(/\s+/).filter(Boolean);
          const d = parseInt(parts[0], 10) || 20;
          const y = parseInt(parts[2], 10) || 1404;
          return { day: d, month: i + 1, year: y };
        }
      }
      // Case: "1404/08/22"
      if (en.includes('/')) {
        const [y, m, d] = en.split('/').map(Number);
        if (y && m && d) return { day: d, month: m, year: y };
      }
    } catch {}
    return { day: 22, month: 8, year: 1404 };
  };

  const parsed = parseDate(value);
  const [viewYear, setViewYear] = useState<number>(parsed.year);
  const [viewMonth, setViewMonth] = useState<number>(parsed.month); // 1 to 12
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number }>(parsed);

  // Update internal state when value prop changes
  useEffect(() => {
    const p = parseDate(value);
    setSelectedDate(p);
    setViewYear(p.year);
    setViewMonth(p.month);
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate days in view month
  const getDaysInMonth = (m: number, y: number): number => {
    if (m <= 6) return 31;
    if (m <= 11) return 30;
    // Esfand leap year check (years 1403, 1408 are leap)
    const leapYears = [1403, 1408, 1412, 1416];
    return leapYears.includes(y) ? 30 : 29;
  };

  const daysCount = getDaysInMonth(viewMonth, viewYear);

  // Calculate starting day of the week for 1st of this month
  // 0 = Saturday (شنبه), 6 = Friday (جمعه)
  const firstDayGregorian = jalaliToGregorian(viewYear, viewMonth, 1);
  const startDayOfWeek = (firstDayGregorian.getDay() + 1) % 7;

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Select day handler
  const handleSelectDay = (day: number) => {
    setSelectedDate({ day, month: viewMonth, year: viewYear });
    const formatted = `${toFaDigit(day)} ${persianMonths[viewMonth - 1]} ${toFaDigit(viewYear)}`;
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-[11px] font-bold text-gray-500 mb-0.5">
        {label}
      </label>

      {/* Trigger Button - clicking opens the calendar popover */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-right flex items-center justify-between py-1 text-xs sm:text-sm font-bold text-gray-800 hover:text-emerald-800 transition-colors focus:outline-none group"
      >
        <span className={value ? 'text-gray-900 font-extrabold' : 'text-gray-400 font-normal'}>
          {value || placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
      </button>

      {/* Interactive Month-View Calendar Popover */}
      {isOpen && (
        <div
          dir="rtl"
          className="absolute top-full mt-2 right-0 sm:right-auto sm:left-0 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-4 z-50 animate-fade-up select-none"
        >
          {/* Calendar Header: Month/Year and Navigation arrows */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition"
              title="ماه قبل"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-sm font-extrabold text-gray-900">
                {persianMonths[viewMonth - 1]} {toFaDigit(viewYear)}
              </span>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition"
              title="ماه بعد"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday Names (ش, ی, د, س, چ, پ, ج) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map((wd, i) => (
              <div
                key={i}
                className={`text-[11px] font-bold py-1 ${
                  wd.isFriday ? 'text-rose-500' : 'text-gray-400'
                }`}
                title={wd.name}
              >
                {wd.short}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank leading cells */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="w-8 h-8 sm:w-9 sm:h-9" />
            ))}

            {/* Days 1 to daysCount */}
            {Array.from({ length: daysCount }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                selectedDate.day === dayNum &&
                selectedDate.month === viewMonth &&
                selectedDate.year === viewYear;

              const isFriday = (startDayOfWeek + i) % 7 === 6;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl text-xs font-bold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md scale-105'
                      : isFriday
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-gray-800 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  {toFaDigit(dayNum)}
                </button>
              );
            })}
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setViewMonth(8);
                setViewYear(1404);
                handleSelectDay(22);
              }}
              className="flex-1 py-1.5 text-[10px] font-bold bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-xl transition border border-gray-100"
            >
              ۲۲ آبان
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMonth(8);
                setViewYear(1404);
                handleSelectDay(25);
              }}
              className="flex-1 py-1.5 text-[10px] font-bold bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-xl transition border border-gray-100"
            >
              ۲۵ آبان
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMonth(9);
                setViewYear(1404);
                handleSelectDay(1);
              }}
              className="flex-1 py-1.5 text-[10px] font-bold bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-xl transition border border-gray-100"
            >
              ۱ آذر
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
