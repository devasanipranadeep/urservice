'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, LayoutDashboard, Calendar, ShieldCheck } from 'lucide-react';
import { useSession } from '../hooks/use-session';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  activePage?: 'home' | 'services' | 'how-it-works';
}

export default function Navbar({ activePage }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const isCurrent = (path: string, pageKey?: string) => {
    if (pageKey && activePage === pageKey) return true;
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 group shrink-0"
          >
            <img
              src="/logo.png?v=2"
              alt="UrService"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-md group-hover:shadow-lg transition-all object-cover shrink-0"
            />
            <span className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
              <span className="text-slate-900">Ur</span>
              <span className="text-indigo-600">Service</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold">
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`transition-colors ${
                isCurrent('/', 'home') ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </Link>
            <Link
              href="/services"
              className={`transition-colors ${
                isCurrent('/services', 'services') ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Services
            </Link>
            <Link
              href="/#how-it-works"
              className={`transition-colors ${
                isCurrent('/#how-it-works', 'how-it-works') ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              How it Works
            </Link>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    {user?.user_metadata?.role === 'client' ? (
                      <div className="relative" ref={profileMenuRef}>
                        <button
                          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold border border-indigo-400/30 hover:border-indigo-400/60 shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none"
                          title="Open Profile Menu"
                        >
                          {user?.user_metadata?.full_name ? (
                            user.user_metadata.full_name.charAt(0).toUpperCase()
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </button>

                        {isProfileMenuOpen && (
                          <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 animate-fade-in">
                            <div className="px-3 py-2 border-b border-slate-100 mb-1">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {user?.user_metadata?.full_name || 'Client Account'}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                            </div>
                            <Link
                              href="/client/dashboard?tab=profile"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              <User className="w-4 h-4 text-slate-400" />
                              Profile
                            </Link>
                            <Link
                              href="/client/dashboard?tab=dashboard"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-slate-400" />
                              Dashboard
                            </Link>
                            <Link
                              href="/client/dashboard?tab=bookings"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              <Calendar className="w-4 h-4 text-slate-400" />
                              Bookings
                            </Link>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              onClick={() => {
                                setIsProfileMenuOpen(false);
                                handleSignOut();
                              }}
                              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <Link
                          href={
                            user?.user_metadata?.role === 'admin'
                              ? '/admin/dashboard'
                              : '/vendor/dashboard'
                          }
                          className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register/client"
                      className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Right Controls & Hamburger Toggle */}
          <div className="flex items-center gap-1.5 md:hidden shrink-0">
            {!isLoading && (
              <>
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/login"
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors whitespace-nowrap"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register/client"
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-all whitespace-nowrap"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <Link
                    href={
                      user?.user_metadata?.role === 'admin'
                        ? '/admin/dashboard'
                        : user?.user_metadata?.role === 'vendor'
                        ? '/vendor/dashboard'
                        : '/client/dashboard'
                    }
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
              </>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-3 shadow-xl animate-fade-in">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isCurrent('/', 'home')
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Home
            </Link>
            <Link
              href="/services"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isCurrent('/services', 'services')
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Services
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isCurrent('/#how-it-works', 'how-it-works')
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              How it Works
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/register/vendor"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Become a Service Partner
                </Link>
              </>
            ) : (
              <>
                {user?.user_metadata?.role === 'client' && (
                  <>
                    <Link
                      href="/client/dashboard?tab=profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profile Settings
                    </Link>
                    <Link
                      href="/client/dashboard?tab=bookings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-slate-400" />
                      My Bookings
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
