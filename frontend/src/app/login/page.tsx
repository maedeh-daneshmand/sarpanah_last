'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Home, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let displayName = 'کاربر گرامی';
    let userRole = 'guest';

    if (form.email === 'admin@sarpanah.ir') {
      displayName = 'مدیر سیستم';
      userRole = 'admin';
    } else if (form.email === 'host@sarpanah.ir') {
      displayName = 'علی احمدی (میزبان)';
      userRole = 'host';
    } else {
      // Check if user previously registered with this email or phone
      try {
        const saved = localStorage.getItem('sarpanah_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.email === form.email || parsed.phone === form.email) {
            displayName = parsed.name || displayName;
            userRole = parsed.role || userRole;
          }
        }
      } catch {}

      if (displayName === 'کاربر گرامی') {
        const cleanName = form.email.split('@')[0];
        displayName = cleanName && !/^\d+$/.test(cleanName) ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : 'مائده دانشمند';
      }
    }

    const userData = {
      name: displayName,
      email: form.email,
      role: userRole,
      isLoggedIn: true,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem('sarpanah_user', JSON.stringify(userData));
    window.dispatchEvent(new Event('authChange'));

    // Attempt real backend authentication in background
    try {
      await fetch('http://127.0.0.1:8000/api/v1/auth/login-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.access_token) {
            localStorage.setItem('sarpanah_token', data.access_token);
          }
        })
        .catch(() => {});
    } catch {}

    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    router.push('/');
  };

  return (
    <main className="min-h-screen dynamic-theme-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full card-clay overflow-hidden bg-white grid grid-cols-1 lg:grid-cols-12 shadow-2xl">
        {/* Left Visual Banner (Desktop) */}
        <div className="hidden lg:block lg:col-span-5 relative p-10 text-white overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=900&q=85"
            alt="سرپناه"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

          <div className="relative z-10 h-full flex flex-col justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg shadow-md"
                style={{ background: 'hsl(var(--primary))' }}
              >
                🌿
              </div>
              <span className="text-2xl font-bold text-white">سرپناه</span>
            </Link>

            <div className="space-y-4 my-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                حساب کاربری مسافران و میزبانان
              </span>
              <h2 className="text-3xl font-extrabold leading-tight">
                دوباره خوش آمدید به جمع سرپناهی‌ها
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                اقامتگاه‌های ثبت‌شده، سفرهای پیش‌رو و پیام‌های خود با میزبانان را در یک نگاه مدیریت کنید.
              </p>
            </div>

            <div className="text-[11px] text-white/70">
              © سرپناه • سامانه هوشمند رزرو بوم‌گردی ایران
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg shadow-md"
              style={{ background: 'hsl(var(--primary))' }}
            >
              🌿
            </div>
            <span className="text-2xl font-bold text-gray-900">سرپناه</span>
          </Link>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              ورود به حساب کاربری
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mb-8">
              هنوز در سرپناه حساب کاربری ندارید؟{' '}
              <Link
                href="/register"
                className="text-green-800 font-bold hover:underline"
              >
                ثبت‌نام رایگان
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ایمیل یا شماره موبایل
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="example@mail.com یا 0912..."
                    className="w-full pr-11 pl-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-700/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    رمز عبور
                  </label>
                  <a href="#" className="text-xs text-green-800 hover:underline font-semibold">
                    فراموشی رمز عبور؟
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder="رمز عبور خود را وارد کنید"
                    className="w-full pr-11 pl-11 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-700/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button (3D Clay) */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-3d-clay w-full py-4 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ورود به سرپناه</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <Link
                href="/"
                className="text-xs text-gray-500 hover:text-green-800 font-semibold inline-flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>بازگشت به صفحه اصلی</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
