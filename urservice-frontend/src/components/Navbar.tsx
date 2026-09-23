'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, LayoutDashboard, Calendar, ShieldCheck } from 'lucide-react';
import { useSession } from '../hooks/use-session';
import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/api-client';
import NotificationBell from './notification-bell';

interface NavbarProps {
  activePage?: 'home' | 'services' | 'how-it-works';
}

export default function Navbar({ activePage }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const userRole = user?.user_metadata?.role;

  // Clean any hash from the URL so address bar is always clean
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [pathname]);

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', '/');
      }
    }
  };

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

  // Sync profile photo and display name
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPhotoUrl(null);
      setDisplayName('');
      return;
    }

    const metaName = user.user_metadata?.full_name || user.user_metadata?.name || '';
    setDisplayName(metaName);

    // 1. Check Google OAuth avatar or user metadata
    const initialAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    if (initialAvatar) {
      setPhotoUrl(initialAvatar);
    }

    // 2. Check cached profile photo in sessionStorage for zero flicker
    const cacheKey = `profile_photo_${user.id}`;
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setPhotoUrl(cached);
      }
    }

    let isMounted = true;

    // 3. Fetch latest signed photo URL from backend
    apiClient.get<{ signedUrl: string | null }>('/api/profiles/me/photo-url')
      .then((res) => {
        if (!isMounted) return;
        if (res?.signedUrl) {
          setPhotoUrl(res.signedUrl);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(cacheKey, res.signedUrl);
          }
        }
      })
      .catch(() => {
        // Silently catch if not set
      });

    // 4. Fetch full name if not in metadata
    if (!metaName) {
      apiClient.get<{ full_name?: string }>('/api/profiles/me')
        .then((res) => {
          if (isMounted && res?.full_name) {
            setDisplayName(res.full_name);
          }
        })
        .catch(() => {});
    }

    // 5. Listen to custom profile update events
    const handleProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ signedUrl?: string }>;
      if (customEvent.detail?.signedUrl) {
        setPhotoUrl(customEvent.detail.signedUrl);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(cacheKey, customEvent.detail.signedUrl);
        }
      } else {
        apiClient.get<{ signedUrl: string | null }>('/api/profiles/me/photo-url')
          .then((res) => {
            if (res?.signedUrl) {
              setPhotoUrl(res.signedUrl);
              if (typeof window !== 'undefined') {
                sessionStorage.setItem(cacheKey, res.signedUrl);
              }
            }
          })
          .catch(() => {});
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('profile-updated', handleProfileUpdated);
    };
  }, [isAuthenticated, user]);

  const handleSignOut = async () => {
    if (typeof window !== 'undefined' && user?.id) {
      sessionStorage.removeItem(`profile_photo_${user.id}`);
    }
    setPhotoUrl(null);
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
            onClick={handleHomeClick}
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
              onClick={handleHomeClick}
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
              href="/how-it-works"
              className={`transition-colors ${
                isCurrent('/how-it-works', 'how-it-works') ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
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
                  <div className="flex items-center gap-3">
                    {/* Role-based Direct Dashboard Link */}
                    {userRole === 'admin' ? (
                      <Link
                        href="/admin/dashboard"
                        className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
                      >
                        Admin Console
                      </Link>
                    ) : userRole === 'vendor' ? (
                      <Link
                        href="/vendor/dashboard"
                        className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors"
                      >
                        Dashboard
                      </Link>
                    ) : null}

                    {/* Notification Bell */}
                    <NotificationBell />

                    {/* Profile Photo Avatar Button & Dropdown */}
                    <div className="relative" ref={profileMenuRef}>
                      <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/40 hover:border-indigo-600 shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 flex items-center justify-center bg-slate-100 group"
                        title="Open Account Menu"
                        aria-label="User Profile"
                      >
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={displayName || 'Profile Photo'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={() => setPhotoUrl(null)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {displayName ? (
                              displayName.charAt(0).toUpperCase()
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                        )}
                      </button>

                      {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-fade-in">
                          {/* User Info Header with Photo */}
                          <div className="flex items-center gap-3 px-3 py-2.5 border-b border-slate-100 mb-1.5">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                  {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {displayName || 'Account'}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 rounded">
                                  {userRole || 'User'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Role-specific Links */}
                          {userRole === 'client' && (
                            <>
                              <Link
                                href="/client/dashboard?tab=profile"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
                              >
                                <User className="w-4 h-4 text-slate-400" />
                                Profile Settings
                              </Link>
                              <Link
                                href="/client/dashboard?tab=dashboard"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
                              >
                                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                                Dashboard
                              </Link>
                              <Link
                                href="/client/dashboard?tab=bookings"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
                              >
                                <Calendar className="w-4 h-4 text-slate-400" />
                                My Bookings
                              </Link>
                            </>
                          )}

                          {userRole === 'vendor' && (
                            <Link
                              href="/vendor/dashboard"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-slate-400" />
                              Vendor Dashboard
                            </Link>
                          )}

                          {userRole === 'admin' && (
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-slate-400" />
                              Admin Dashboard
                            </Link>
                          )}

                          <div className="border-t border-slate-100 my-1"></div>
                          <button
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              handleSignOut();
                            }}
                            className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
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
          <div className="flex items-center gap-2 md:hidden shrink-0">
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
                  <div className="flex items-center gap-1.5">
                    <NotificationBell />
                    <Link
                      href={
                        userRole === 'admin'
                          ? '/admin/dashboard'
                          : userRole === 'vendor'
                          ? '/vendor/dashboard'
                          : '/client/dashboard'
                      }
                      className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200/80 rounded-full hover:bg-slate-100 transition-colors"
                      title="Go to Dashboard"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
                        {photoUrl ? (
                          <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                            {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 text-white" />}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
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
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                handleHomeClick(e);
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
              href="/how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isCurrent('/how-it-works', 'how-it-works')
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
                {/* Mobile User Profile Card */}
                <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200/70 rounded-xl mb-1">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-white flex items-center justify-center">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{displayName || 'Account'}</p>
                    <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">{userRole || 'User'}</span>
                  </div>
                </div>

                {userRole === 'client' && (
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

                {userRole === 'vendor' && (
                  <Link
                    href="/vendor/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    Vendor Dashboard
                  </Link>
                )}

                {userRole === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    Admin Console
                  </Link>
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
