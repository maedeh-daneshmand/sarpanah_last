'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Home,
  Search,
  Heart,
  User,
  Menu,
  X,
  Compass,
  MapPin,
  LogOut,
  ChevronDown,
  Camera,
  Upload,
  Check,
  Settings,
} from 'lucide-react';

const avatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&q=80',
];

const navLinks = [
  { href: '/', label: 'خانه', icon: Home },
  { href: '/properties', label: 'اقامتگاه‌ها', icon: Compass },
  { href: '/#regions', label: 'مناطق گردشگری', icon: MapPin },
  { href: '/#features', label: 'امکانات', icon: Heart },
  { href: '/#why-us', label: 'درباره ما', icon: User },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; role?: string; email?: string; avatar?: string } | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [customAvatar, setCustomAvatar] = useState('');
  const [editName, setEditName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم عکس انتخابی نباید بیشتر از ۲ مگابایت باشد.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    try {
      const current = JSON.parse(localStorage.getItem('sarpanah_user') || '{}');
      const updated = {
        ...current,
        name: editName.trim() || current.name || 'مائده دانشمند',
        avatar: customAvatar,
      };
      localStorage.setItem('sarpanah_user', JSON.stringify(updated));
      setCurrentUser(updated);
      window.dispatchEvent(new Event('authChange'));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setProfileModalOpen(false);
      }, 600);
    } catch {}
  };

  const openProfileModal = () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setEditName(getDisplayName(currentUser));
    setCustomAvatar((currentUser as any)?.avatar || '');
    setProfileModalOpen(true);
  };

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem('sarpanah_user');
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('authChange', checkUser);
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('authChange', checkUser);
    };
  }, []);

  useEffect(() => {
    const updateWishlist = () => {
      try {
        const stored = localStorage.getItem('sarpanah_wishlist');
        if (stored) {
          const parsed = JSON.parse(stored);
          setWishlistCount(Array.isArray(parsed) ? parsed.length : 0);
        } else {
          setWishlistCount(0);
        }
      } catch {
        setWishlistCount(0);
      }
    };
    updateWishlist();
    window.addEventListener('storage', updateWishlist);
    window.addEventListener('wishlistChange', updateWishlist);
    return () => {
      window.removeEventListener('storage', updateWishlist);
      window.removeEventListener('wishlistChange', updateWishlist);
    };
  }, []);

  const getDisplayName = (user: { name?: string; role?: string; email?: string } | null) => {
    if (!user || !user.name) return 'مائده دانشمند';
    const clean = user.name.trim();
    if (/^(\+98|0)?9\d{9}$/.test(clean) || /^[0-9+ ]{8,}$/.test(clean)) {
      return 'مائده دانشمند';
    }
    return clean;
  };

  const handleLogout = () => {
    localStorage.removeItem('sarpanah_user');
    localStorage.removeItem('sarpanah_token');
    setCurrentUser(null);
    setUserDropdownOpen(false);
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 pb-2 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Floating pill navigation container (دقیقاً مثل عکس اصلی) */}
        <nav
          className={`flex items-center justify-between px-6 py-3.5 rounded-full transition-all duration-300 ${
            isScrolled
              ? 'glass-pill shadow-xl'
              : 'bg-white/90 backdrop-blur-md shadow-md border border-white/80'
          }`}
        >
          {/* Logo (Poulls / سرپناه) */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg shadow-md group-hover:scale-105 transition-transform"
              style={{ background: 'hsl(var(--primary))' }}
            >
              🌿
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-green-800 transition-colors">
                سرپناه
              </span>
              <span className="text-[10px] text-gray-500 font-medium -mt-1">
                رزرو بوم‌گردی و ویلا
              </span>
            </div>
          </Link>

          {/* Center Links (دسکتاپ) */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-green-900 hover:bg-green-50/70 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/properties"
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-green-800 hover:bg-gray-100 transition-colors"
              title="جستجوی سریع اقامتگاه‌ها"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/wishlist"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="علاقه‌مندی‌ها"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-gray-600 hover:text-rose-500'}`} />
              {isMounted && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {isMounted && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-emerald-200/80 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all shadow-md group"
                >
                  <div
                    className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow overflow-hidden border border-white/80"
                    style={{ background: 'hsl(var(--primary))' }}
                  >
                    {(currentUser as any)?.avatar ? (
                      <img
                        src={(currentUser as any).avatar}
                        alt="عکس مسافر"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getDisplayName(currentUser).charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                      {getDisplayName(currentUser)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold -mt-0.5">
                      {currentUser.role === 'host' ? 'پنل میزبان' : 'پنل مسافر'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-800 transition-colors" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-fade-up">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1 flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shadow overflow-hidden"
                        style={{ background: 'hsl(var(--primary))' }}
                      >
                        {(currentUser as any)?.avatar ? (
                          <img
                            src={(currentUser as any).avatar}
                            alt="عکس مسافر"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getDisplayName(currentUser).charAt(0)
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-gray-900 truncate">{getDisplayName(currentUser)}</p>
                        {currentUser.email && (
                          <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={openProfileModal}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors text-right"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>پروفایل</span>
                    </button>

                    <Link
                      href="/properties"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 rounded-xl transition-colors"
                    >
                      <Compass className="w-4 h-4 text-emerald-700" />
                      <span>رزروهای من</span>
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>علاقه‌مندی‌ها</span>
                      </div>
                      {wishlistCount > 0 && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1 text-right"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>خروج از حساب</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-3d-clay px-6 py-2.5 text-sm font-bold text-white shadow-md flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>ورود / ثبت‌نام</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/wishlist"
              className="p-2 text-rose-500 relative"
              title="علاقه‌مندی‌ها"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-rose-500' : ''}`} />
              {isMounted && wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {isMounted && currentUser ? (
              <button
                onClick={openProfileModal}
                className="px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-1.5"
                title="پروفایل مسافر"
              >
                <div
                  className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold overflow-hidden"
                  style={{ background: 'hsl(var(--primary))' }}
                >
                  {(currentUser as any)?.avatar ? (
                    <img
                      src={(currentUser as any).avatar}
                      alt="عکس"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getDisplayName(currentUser).charAt(0)
                  )}
                </div>
                <span>{getDisplayName(currentUser)}</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="btn-3d-clay px-3.5 py-1.5 text-xs font-bold text-white shadow-sm"
              >
                ورود
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100"
              aria-label="منو"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-2 p-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 animate-fade-up">
            <div className="flex flex-col gap-1">
              {isMounted && currentUser && (
                <div className="p-3 mb-2 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-bold shadow overflow-hidden"
                      style={{ background: 'hsl(var(--primary))' }}
                    >
                      {(currentUser as any)?.avatar ? (
                        <img
                          src={(currentUser as any).avatar}
                          alt="عکس مسافر"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getDisplayName(currentUser).charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{getDisplayName(currentUser)}</p>
                      <button
                        onClick={openProfileModal}
                        className="text-[10px] text-emerald-800 font-bold hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <User className="w-3 h-3" />
                        <span>پروفایل</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs"
                    title="خروج"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-900 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-green-700" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>علاقه‌مندی‌های من</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {isMounted && currentUser && (
                <button
                  onClick={openProfileModal}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-emerald-800 hover:bg-emerald-50 transition-colors text-right"
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>پروفایل</span>
                </button>
              )}

              <div className="pt-3 mt-2 border-t border-gray-100 flex gap-2">
                {isMounted && currentUser ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 text-center text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>خروج از حساب کاربری</span>
                  </button>
                ) : (
                  <>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-3d-clay flex-1 py-2.5 text-center text-xs font-bold text-white rounded-xl"
                    >
                      ثبت‌نام کاربر جدید
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2.5 text-center text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl"
                    >
                      ورود
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile & Avatar Edit Modal */}
        {profileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="card-clay bg-white max-w-md w-full p-6 sm:p-7 rounded-3xl shadow-2xl border border-gray-100 text-right space-y-5 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">پروفایل</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Avatar preview with change trigger */}
              <div className="flex flex-col items-center justify-center py-1">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full ring-4 ring-emerald-500/30 overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
                    {customAvatar ? (
                      <img
                        src={customAvatar}
                        alt="پروفایل"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-white"
                        style={{ background: 'hsl(var(--primary))' }}
                      >
                        {editName ? editName.charAt(0) : '👤'}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md hover:bg-emerald-700 transition"
                    title="انتخاب عکس از سیستم"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>انتخاب عکس از کامپیوتر یا موبایل</span>
                </button>
              </div>

              {/* Preset avatars */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  یا انتخاب سریع از عکس‌های آماده:
                </label>
                <div className="flex items-center justify-center gap-2.5">
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomAvatar(preset)}
                      className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all ${
                        customAvatar === preset
                          ? 'border-emerald-600 scale-110 shadow-md ring-2 ring-emerald-300'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  نام مسافر در سایت:
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="نام شما (مثلاً: مائده دانشمند)"
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/60"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="btn-3d-clay flex-1 py-3 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>ذخیره شد!</span>
                    </>
                  ) : (
                    <span>ذخیره تغییرات</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-5 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  انصراف
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </header>
  );
}
