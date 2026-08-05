'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '../hooks/use-session';
import { supabase } from '../lib/supabase';
import {
  GraduationCap,
  HeartPulse,
  Sparkles,
  Wrench,
  SprayCan,
  Car,
  PartyPopper,
  Smartphone,
  Building,
  Search,
  CalendarCheck,
  ThumbsUp,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  MapPin,
  Star,
  Shield,
  Clock,
  Zap,
  X,
} from 'lucide-react';

import { apiClient } from '../lib/api-client';
import Navbar from '../components/Navbar';

/* ─── Category Icon Map ─── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  education: <GraduationCap className="w-7 h-7" />,
  healthcare: <HeartPulse className="w-7 h-7" />,
  beauty_salon: <Sparkles className="w-7 h-7" />,
  home_services: <Wrench className="w-7 h-7" />,
  cleaning_services: <SprayCan className="w-7 h-7" />,
  vehicle_services: <Car className="w-7 h-7" />,
  event_services: <PartyPopper className="w-7 h-7" />,
  repair_services: <Smartphone className="w-7 h-7" />,
  rental_services: <Building className="w-7 h-7" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  education: 'from-blue-500 to-cyan-400',
  healthcare: 'from-rose-500 to-pink-400',
  beauty_salon: 'from-fuchsia-500 to-pink-400',
  home_services: 'from-amber-500 to-orange-400',
  cleaning_services: 'from-sky-500 to-blue-400',
  vehicle_services: 'from-violet-500 to-purple-400',
  event_services: 'from-yellow-500 to-amber-400',
  repair_services: 'from-indigo-500 to-blue-400',
  rental_services: 'from-teal-500 to-emerald-400',
};

/* ─── Service Categories from constants ─── */
import { SERVICE_CATEGORIES } from '../lib/constants';

/* ─── Scroll Reveal Hook ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = node.querySelectorAll('.reveal, .reveal-stagger');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            let start = 0;
            const duration = 2000;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              start = Math.floor(eased * target);
              if (node) {
                node.textContent = start.toLocaleString() + suffix;
              }
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ─── Main Landing Page ─── */
function HomeContent() {
  const containerRef = useScrollReveal();
  const [activePopupCategory, setActivePopupCategory] = useState<any | null>(null);
  const { isAuthenticated, user, isLoading } = useSession();

  const router = useRouter();
  const searchParams = useSearchParams();

  // Geolocation & Search States
  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    id: string;
    name: string;
    categoryId: string;
  } | null>(null);

  const handleCloseSearchModal = () => {
    setSelectedSubcategory(null);
    setNearbyVendors(null);
    setBookingVendor(null);
    setBookingSuccess(false);
    setBookingError(null);

    // Clear category & subcategory search parameters from the URL
    if (searchParams.get('category') || searchParams.get('subcategory')) {
      router.replace('/', { scroll: false });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSubcategory) {
        handleCloseSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSubcategory, searchParams]);

  useEffect(() => {
    const categoryId = searchParams.get('category');
    const subcategoryId = searchParams.get('subcategory');
    if (categoryId && subcategoryId) {
      const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
      if (category) {
        const sub = category.subCategories.find((s) => s.id === subcategoryId);
        if (sub) {
          setSelectedSubcategory({
            id: sub.id,
            name: sub.name,
            categoryId: category.id,
          });
          
          setTimeout(() => {
            const searchSection = document.getElementById('search-section');
            if (searchSection) {
              searchSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);
        }
      }
    }
  }, [searchParams]);
  const [clientCoords, setClientCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [nearbyVendors, setNearbyVendors] = useState<any[] | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mockLocationName, setMockLocationName] = useState('GPS');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // Homepage Service Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [formSearchError, setFormSearchError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Homepage Location Search States
  const [locationInputVal, setLocationInputVal] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!clientCoords) return;

    if (mockLocationName !== 'GPS') {
      const cityLabels: Record<string, string> = {
        Bangalore: 'Bangalore Hub',
        Hyderabad: 'Hyderabad Center',
        Pune: 'Pune IT Park',
        Chennai: 'Chennai Tech Corridor',
        Gurgaon: 'Gurgaon Cyber City',
        Mumbai: 'Mumbai FinTech Zone',
      };
      setResolvedAddress(cityLabels[mockLocationName] || mockLocationName);
      return;
    }

    const resolveGPSAddress = async () => {
      setIsResolvingAddress(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${clientCoords.lat}&lon=${clientCoords.lon}`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const place = addr.suburb || addr.neighbourhood || addr.locality || addr.commercial || addr.industrial || '';
            const city = addr.city || addr.town || addr.village || addr.county || '';
            const state = addr.state || '';
            
            let parts = [];
            if (place) parts.push(place);
            if (city) parts.push(city);
            else if (state) parts.push(state);
            
            const cleanName = parts.join(', ');
            setResolvedAddress(cleanName || data.display_name || 'GPS Location');
          } else if (data && data.display_name) {
            setResolvedAddress(data.display_name);
          } else {
            setResolvedAddress('GPS Location');
          }
        } else {
          setResolvedAddress('GPS Location');
        }
      } catch (err) {
        console.error('Error reverse geocoding:', err);
        setResolvedAddress('GPS Location');
      } finally {
        setIsResolvingAddress(false);
      }
    };

    resolveGPSAddress();
  }, [clientCoords, mockLocationName]);

  // Sync location input field with geocoded/mock address when it resolves
  useEffect(() => {
    if (resolvedAddress) {
      setLocationInputVal(resolvedAddress);
    }
  }, [resolvedAddress]);

  // Filter services dynamically for homepage search bar
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = SERVICE_CATEGORIES.flatMap(category => 
      category.subCategories
        .filter(sub => sub.name.toLowerCase().includes(query))
        .map(sub => ({
          ...sub,
          categoryId: category.id,
          categoryName: category.name
        }))
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  // Search location using OpenStreetMap Nominatim API
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!locationInputVal.trim() || locationInputVal === resolvedAddress) {
        setLocationResults([]);
        return;
      }
      setIsLocationLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            locationInputVal
          )}&limit=5&addressdetails=1`
        );
        if (res.ok) {
          const data = await res.json();
          setLocationResults(data || []);
        }
      } catch (err) {
        console.error('Error searching location:', err);
      } finally {
        setIsLocationLoading(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounce);
  }, [locationInputVal, resolvedAddress]);

  // Automatically trigger GPS location resolution on mount
  useEffect(() => {
    requestGPSLocation();
  }, []);

  // Booking states
  const [bookingVendor, setBookingVendor] = useState<any>(null);
  const [bookingDateTime, setBookingDateTime] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const categoriesSliderRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const smoothScroll = (time: number) => {
      if (!isHovered && categoriesSliderRef.current) {
        const container = categoriesSliderRef.current;
        const delta = time - lastTime;
        const speed = 0.04; // scroll speed (pixels per millisecond)
        
        container.scrollLeft += speed * delta;
        
        // Loop back to start if we scroll past the original set of items
        const halfWidth = container.scrollWidth / 2;
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft = 0;
        }
      }
      lastTime = time;
      animationFrameId = requestAnimationFrame(smoothScroll);
    };

    animationFrameId = requestAnimationFrame(smoothScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered]);

  const slideCategories = (direction: 'left' | 'right') => {
    if (categoriesSliderRef.current) {
      const scrollAmount = direction === 'left' ? -344 : 344;
      categoriesSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };


  const handleSubcategoryClick = (sub: { id: string; name: string }, categoryId: string) => {
    setSelectedSubcategory({
      id: sub.id,
      name: sub.name,
      categoryId: categoryId,
    });
    setNearbyVendors(null);
    setBookingVendor(null);
    setBookingSuccess(false);
    setBookingError(null);
    
    // Automatically trigger GPS lookup
    requestGPSLocation(categoryId, sub.name);
  };

  const handleServiceSelect = (service: any) => {
    setSearchQuery(service.name);
    setSearchResults([]);
    setSelectedSubcategory({
      id: service.id,
      name: service.name,
      categoryId: service.categoryId,
    });
    setNearbyVendors(null);
    setBookingVendor(null);
    setBookingSuccess(false);
    setBookingError(null);
    
    // Blur input to dismiss search dropdown
    setIsSearchFocused(false);
    searchInputRef.current?.blur();

    // Automatically trigger GPS lookup
    requestGPSLocation(service.categoryId, service.name);

    // Scroll to search section
    setTimeout(() => {
      const searchSection = document.getElementById('search-section');
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    let bestMatch: any = null;

    if (searchResults.length > 0) {
      const exactMatch = searchResults.find(
        (sub) => sub.name.toLowerCase() === query
      );
      bestMatch = exactMatch || searchResults[0];
    } else {
      for (const category of SERVICE_CATEGORIES) {
        const exactSub = category.subCategories.find(
          (sub) => sub.name.toLowerCase() === query
        );
        if (exactSub) {
          bestMatch = {
            ...exactSub,
            categoryId: category.id,
            categoryName: category.name,
          };
          break;
        }
      }

      if (!bestMatch) {
        for (const category of SERVICE_CATEGORIES) {
          const partialSub = category.subCategories.find(
            (sub) => sub.name.toLowerCase().includes(query)
          );
          if (partialSub) {
            bestMatch = {
              ...partialSub,
              categoryId: category.id,
              categoryName: category.name,
            };
            break;
          }
        }
      }
    }

    if (bestMatch) {
      setFormSearchError(null);
      handleServiceSelect(bestMatch);
    } else {
      setFormSearchError(`No services matching "${searchQuery}" found. Please select from the dropdown or try another search.`);
    }
  };

  const handleLocationSelect = (loc: any) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    setClientCoords({ lat, lon });
    setMockLocationName('GPS');
    setResolvedAddress(loc.display_name);
    setLocationInputVal(loc.display_name);
    setLocationResults([]);
    
    // Blur input to dismiss location search dropdown
    setIsLocationFocused(false);
    locationInputRef.current?.blur();

    fetchVendors(lat, lon);
  };

  const handleUseCurrentLocation = () => {
    // Blur input to dismiss location search dropdown
    setIsLocationFocused(false);
    locationInputRef.current?.blur();

    requestGPSLocation();
    setLocationResults([]);
  };

  const requestGPSLocation = (catId?: string, subName?: string) => {
    setIsLoadingSearch(true);
    setSearchError(null);
    
    const activeCat = catId || selectedSubcategory?.categoryId;
    const activeSub = subName || selectedSubcategory?.name;

    if (!navigator.geolocation) {
      const fallbackLat = 12.9716;
      const fallbackLon = 77.5946;
      setClientCoords({ lat: fallbackLat, lon: fallbackLon });
      setMockLocationName('Bangalore');
      fetchVendors(fallbackLat, fallbackLon, activeCat, activeSub);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setClientCoords({ lat, lon });
        setMockLocationName('GPS');
        fetchVendors(lat, lon, activeCat, activeSub);
      },
      (error) => {
        console.warn('GPS lookup timed out or failed, using fallback location:', error);
        const fallbackLat = 12.9716;
        const fallbackLon = 77.5946;
        setClientCoords({ lat: fallbackLat, lon: fallbackLon });
        setMockLocationName('Bangalore');
        fetchVendors(fallbackLat, fallbackLon, activeCat, activeSub);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  };

  const fetchVendors = async (lat: number, lon: number, catId?: string, subName?: string) => {
    const activeCat = catId || selectedSubcategory?.categoryId;
    const activeSub = subName || selectedSubcategory?.name;
    if (!activeCat || !activeSub) {
      return;
    }
    setIsLoadingSearch(true);
    setSearchError(null);
    
    try {
      const queryParams = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
      });
      if (activeCat) queryParams.set('category', activeCat);
      if (activeSub) queryParams.set('subcategory', activeSub);

      const res = await apiClient.get<any[]>(`/api/services/search?${queryParams.toString()}`);
      setNearbyVendors(res);
    } catch (err) {
      setSearchError((err as Error).message || 'Failed to search for nearby providers.');
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setBookingError('Please log in first.');
      return;
    }
    
    setIsSubmittingBooking(true);
    setBookingError(null);
    try {
      let serviceId = null;
      try {
        const sRes = await supabase
          .from('services')
          .select('id')
          .eq('vendor_id', bookingVendor.id)
          .eq('is_active', true)
          .limit(1);
        if (sRes.data && sRes.data.length > 0) {
          serviceId = sRes.data[0].id;
        }
      } catch (err) {
        // service query failed
      }

      if (!serviceId) {
        const { data: newService, error: serviceErr } = await supabase
          .from('services')
          .insert({
            vendor_id: bookingVendor.id,
            name: selectedSubcategory?.name || 'General Service',
            description: `Standard ${selectedSubcategory?.name || 'General'} service`,
            price: 1000,
            is_active: true
          })
          .select()
          .single();
        if (serviceErr) throw serviceErr;
        serviceId = newService.id;
      }

      // 2. Submit booking request to backend
      await apiClient.post('/api/bookings', {
        vendor_id: bookingVendor.id,
        service_id: serviceId,
        scheduled_at: new Date(bookingDateTime).toISOString(),
      });

      setBookingSuccess(true);
    } catch (err) {
      setBookingError((err as Error).message || 'Failed to request booking. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      {/* ════════ NAVBAR ════════ */}
      <Navbar activePage="home" />

      {/* ════════ HERO ════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        {/* Floating decorative badges */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <div className="absolute top-[18%] left-[8%] animate-float">
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05),0_10px_15px_-5px_rgba(0,0,0,0.03)] hover:scale-105 transition-transform duration-300 rounded-2xl px-5 py-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              Tutoring
            </div>
          </div>
          <div className="absolute top-[25%] right-[10%] animate-float-delayed">
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05),0_10px_15px_-5px_rgba(0,0,0,0.03)] hover:scale-105 transition-transform duration-300 rounded-2xl px-5 py-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <HeartPulse className="w-5 h-5 text-rose-400" />
              Healthcare
            </div>
          </div>
          <div className="absolute bottom-[30%] left-[12%] animate-float-delayed">
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05),0_10px_15px_-5px_rgba(0,0,0,0.03)] hover:scale-105 transition-transform duration-300 rounded-2xl px-5 py-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Sparkles className="w-5 h-5 text-fuchsia-400" />
              Beauty
            </div>
          </div>
          <div className="absolute bottom-[22%] right-[8%] animate-float">
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05),0_10px_15px_-5px_rgba(0,0,0,0.03)] hover:scale-105 transition-transform duration-300 rounded-2xl px-5 py-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Smartphone className="w-5 h-5 text-indigo-500" />
              Repairs
            </div>
          </div>
          <div className="absolute top-[50%] right-[6%] animate-float-delayed">
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05),0_10px_15px_-5px_rgba(0,0,0,0.03)] hover:scale-105 transition-transform duration-300 rounded-2xl px-5 py-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Wrench className="w-5 h-5 text-amber-500" />
              Home Services
            </div>
          </div>
          <div className="absolute top-[44%] left-[5%] animate-float">
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05),0_10px_15px_-5px_rgba(0,0,0,0.03)] hover:scale-105 transition-transform duration-300 rounded-2xl px-5 py-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Car className="w-5 h-5 text-violet-400" />
              Vehicles
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            Every service you need,{' '}
            <span className="gradient-text">one tap away</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            From home tutors to healthcare, beauty to vehicle repairs — connect
            with verified local professionals and book instantly.
          </p>

          {/* Location Search Bar */}
          <div
            className="relative z-40 max-w-xl mx-auto mb-4 animate-fade-in-up"
            style={{ animationDelay: '0.22s' }}
          >
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
              <input
                ref={locationInputRef}
                type="text"
                placeholder="Search location..."
                value={locationInputVal}
                onChange={(e) => setLocationInputVal(e.target.value)}
                onFocus={() => setIsLocationFocused(true)}
                onBlur={() => setTimeout(() => setIsLocationFocused(false), 200)}
                className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl text-slate-800 placeholder-slate-400 font-medium shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-md transition-all outline-none text-base"
              />
              {isLocationLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Location Results Dropdown */}
            {isLocationFocused && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left max-h-72 overflow-y-auto">
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleUseCurrentLocation();
                  }}
                  className="px-5 py-3 hover:bg-indigo-50/50 transition-colors flex items-center gap-2 cursor-pointer border-b border-slate-100 text-indigo-600 font-semibold text-xs"
                >
                  <MapPin className="w-4 h-4 animate-bounce" />
                  Use Current Location (GPS)
                </div>
                {locationResults.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {locationResults.map((loc, idx) => (
                      <div
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleLocationSelect(loc);
                        }}
                        className="px-5 py-3 hover:bg-slate-50 transition-colors flex flex-col cursor-pointer group"
                      >
                        <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors text-sm">
                          {loc.name || loc.display_name.split(',')[0]}
                        </span>
                        <span className="text-xs text-slate-400 truncate">
                          {loc.display_name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  locationInputVal.trim() && locationInputVal !== resolvedAddress && !isLocationLoading && (
                    <div className="px-5 py-4 text-sm text-slate-500 text-center">
                      No matching locations found
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Service Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative z-30 max-w-xl mx-auto mb-10 animate-fade-in-up"
            style={{ animationDelay: '0.25s' }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="What service are you looking for? (e.g. Electrician, Tutor, Cook...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (formSearchError) setFormSearchError(null);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-12 pr-36 py-4 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl text-slate-800 placeholder-slate-400 font-medium shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-md transition-all outline-none text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setFormSearchError(null);
                  }}
                  className="absolute right-28 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

            {formSearchError && (
              <div className="absolute left-0 right-0 mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs text-center animate-fade-in shadow-sm z-20">
                {formSearchError}
              </div>
            )}

            {/* Search Results Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left max-h-72 overflow-y-auto">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Available Services
                </div>
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {searchResults.map((service) => (
                      <div
                        key={service.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleServiceSelect(service);
                        }}
                        className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                          {service.name}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          {service.categoryName}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-4 text-sm text-slate-500 text-center">
                    No services matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </form>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="/register/client"
              className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-base"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/register/vendor"
              className="group px-8 py-4 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 text-base shadow-sm"
            >
              Become a Provider
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust signals */}
          <div
            className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" /> Verified Providers
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" /> Instant Booking
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" /> Rated & Reviewed
            </span>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ════════ SERVICE CATEGORIES ════════ */}
      <section id="services" className="relative py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-7 py-3 rounded-full bg-slate-100/80 border border-slate-200 text-slate-700 text-sm font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
              Our Services
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Everything you need,{' '}
              <span className="gradient-text">all in one place</span>
            </h2>
            <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
              Browse through 10 service categories covering 95+ specialized services
            </p>
          </div>

          {/* Slider Container Wrapper */}
          <div 
            className="relative group/slider select-none py-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Left Manual Scroll Button */}
            <button
              onClick={() => slideCategories('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-all duration-300 cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Manual Scroll Button */}
            <button
              onClick={() => slideCategories('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-all duration-300 cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              ref={categoriesSliderRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-6 pt-4"
            >
              {/* First Set */}
              {SERVICE_CATEGORIES.map((cat) => {
                return (
                  <div
                    key={`${cat.id}-set1`}
                    onClick={() => setActivePopupCategory(cat)}
                    className="flex-none w-[300px] sm:w-[340px] h-[220px] sm:h-[240px] group relative rounded-2xl cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1"
                  >
                    {/* Full-Bleed Image */}
                    <img 
                      src={`/asserts/${cat.id}.png`} 
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Bottom Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[cat.id]} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}
                        >
                          {CATEGORY_ICONS[cat.id]}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white drop-shadow-lg">{cat.name}</h3>
                          <p className="text-[11px] text-slate-300/80 font-medium">{cat.subCategories.length} specialties</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                    </div>

                    {/* Top-right hover badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      View Specialties →
                    </div>
                  </div>
                );
              })}

              {/* Second Set (Seamless Loop Duplicate) */}
              {SERVICE_CATEGORIES.map((cat) => {
                return (
                  <div
                    key={`${cat.id}-set2`}
                    onClick={() => setActivePopupCategory(cat)}
                    className="flex-none w-[300px] sm:w-[340px] h-[220px] sm:h-[240px] group relative rounded-2xl cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1"
                  >
                    {/* Full-Bleed Image */}
                    <img 
                      src={`/asserts/${cat.id}.png`} 
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Bottom Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[cat.id]} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}
                        >
                          {CATEGORY_ICONS[cat.id]}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white drop-shadow-lg">{cat.name}</h3>
                          <p className="text-[11px] text-slate-300/80 font-medium">{cat.subCategories.length} specialties</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                    </div>

                    {/* Top-right hover badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      View Specialties →
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Show All Services Link Button */}
          <div className="mt-12 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all duration-300 shadow-sm"
            >
              <span>Show All Services</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section id="how-it-works" className="relative py-12 px-4 sm:px-6">


        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-7 py-3 rounded-full bg-slate-100/80 border border-slate-200 text-slate-700 text-sm font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Book a service in{' '}
              <span className="gradient-text">3 simple steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative flex flex-col items-start text-left overflow-hidden">
              <span className="absolute top-4 right-6 text-5xl font-black text-slate-100 select-none tracking-tighter">01</span>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">Search & Explore</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-normal">
                Browse categories or search for specific services in your area. Filter by ratings, price, and availability.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative flex flex-col items-start text-left overflow-hidden">
              <span className="absolute top-4 right-6 text-5xl font-black text-slate-100 select-none tracking-tighter">02</span>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">Book Instantly</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-normal">
                Pick your preferred time slot and confirm your booking. Get instant confirmation from verified providers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative flex flex-col items-start text-left overflow-hidden">
              <span className="absolute top-4 right-6 text-5xl font-black text-slate-100 select-none tracking-tighter">03</span>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-6 mb-2">Enjoy & Review</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-normal">
                Receive professional service at your doorstep. Rate your experience and help others make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ════════ CTA BANNER ════════ */}
      <section className="relative py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center relative">


          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mb-10">
            Join thousands of users who trust UrService for their everyday needs.
            Sign up in under 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register/client"
              className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-base"
            >
              Sign Up as Client
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/register/vendor"
              className="group px-8 py-4 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 text-base shadow-sm"
            >
              Register as Vendor
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-slate-200 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/logo.png?v=2"
                  alt="UrService"
                  className="w-9 h-9 rounded-xl shadow-md object-cover"
                />
                <span className="text-lg font-bold tracking-tight">
                  <span className="text-slate-900">Ur</span>
                  <span className="text-indigo-600">Service</span>
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                A premium service marketplace connecting clients with verified
                local professionals. Education, healthcare, beauty, home
                services, and much more — all at your fingertips.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                Account
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/login" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">
                    Log In
                  </Link>
                </li>
                <li>
                  <Link href="/register/client" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">
                    Sign Up as Client
                  </Link>
                </li>
                <li>
                  <Link href="/register/vendor" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                    Register as Vendor
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                Top Categories
              </h4>
              <ul className="space-y-2.5">
                {SERVICE_CATEGORIES.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <span className="text-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">
                      {cat.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} UrService. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
              <Link href="/terms" className="hover:text-indigo-600 transition-colors">Security Disclaimers</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ════════ NEARBY VENDORS SEARCH MODAL ════════ */}
      {selectedSubcategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in animate-duration-200">
          {/* Backdrop Close Clicker */}
          <div 
            className="absolute inset-0 cursor-default" 
            onClick={handleCloseSearchModal}
          />
          <div className="relative z-10 w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">
                  Providers for {selectedSubcategory.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Category: {SERVICE_CATEGORIES.find(c => c.id === selectedSubcategory.categoryId)?.name || 'General'}
                </p>
              </div>
              <button
                onClick={handleCloseSearchModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Location Bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                {isResolvingAddress ? (
                  <span className="animate-pulse">Resolving location...</span>
                ) : resolvedAddress ? (
                  <span>
                    Results near <strong className="text-slate-800">{resolvedAddress}</strong>
                  </span>
                ) : clientCoords ? (
                  <span>
                    Results near <strong className="text-slate-800">{clientCoords.lat.toFixed(4)}, {clientCoords.lon.toFixed(4)}</strong>
                  </span>
                ) : (
                  <span>Resolving coordinates...</span>
                )}
              </span>
              
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Location Area:</label>
                <select
                  value={mockLocationName === 'GPS' ? 'gps' : mockLocationName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Bangalore') {
                      setClientCoords({ lat: 12.9716, lon: 77.5946 });
                      setMockLocationName('Bangalore');
                      fetchVendors(12.9716, 77.5946);
                    } else if (val === 'Hyderabad') {
                      setClientCoords({ lat: 17.3850, lon: 78.4867 });
                      setMockLocationName('Hyderabad');
                      fetchVendors(17.3850, 78.4867);
                    } else if (val === 'Pune') {
                      setClientCoords({ lat: 18.5204, lon: 73.8567 });
                      setMockLocationName('Pune');
                      fetchVendors(18.5204, 73.8567);
                    } else if (val === 'Chennai') {
                      setClientCoords({ lat: 13.0827, lon: 80.2707 });
                      setMockLocationName('Chennai');
                      fetchVendors(13.0827, 80.2707);
                    } else if (val === 'Gurgaon') {
                      setClientCoords({ lat: 28.4595, lon: 77.0266 });
                      setMockLocationName('Gurgaon');
                      fetchVendors(28.4595, 77.0266);
                    } else if (val === 'Mumbai') {
                      setClientCoords({ lat: 19.0760, lon: 72.8777 });
                      setMockLocationName('Mumbai');
                      fetchVendors(19.0760, 72.8777);
                    } else if (val === 'gps') {
                      requestGPSLocation();
                    }
                  }}
                  className="bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="gps">Browser GPS (Auto)</option>
                  <option value="Bangalore">Bangalore Hub</option>
                  <option value="Hyderabad">Hyderabad Center</option>
                  <option value="Pune">Pune IT Park</option>
                  <option value="Chennai">Chennai Tech Corridor</option>
                  <option value="Gurgaon">Gurgaon Cyber City</option>
                  <option value="Mumbai">Mumbai FinTech Zone</option>
                </select>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px]">
              {isLoadingSearch ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
                  </div>
                  <p className="text-slate-600 text-sm font-semibold tracking-wide animate-pulse">
                    Scanning for nearby service providers...
                  </p>
                </div>
              ) : searchError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm text-center">
                  {searchError}
                </div>
              ) : nearbyVendors && nearbyVendors.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-slate-800 font-bold">No Providers Found</h4>
                  <p className="text-slate-600 text-xs max-w-sm mx-auto">
                    We couldn't find any approved {selectedSubcategory.name} providers within range of this location.
                  </p>
                </div>
              ) : bookingVendor ? (
                /* --- Booking Form --- */
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">Confirm Booking with {bookingVendor.business_name}</h4>
                      <p className="text-xs text-slate-600">Service: {selectedSubcategory.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingVendor(null)}
                      className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold"
                    >
                      Back to list
                    </button>
                  </div>

                  {bookingError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                      {bookingError}
                    </div>
                  )}

                  {bookingSuccess ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm text-center">
                      Appointment successfully requested! You can view and manage this booking in your dashboard.
                    </div>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="booking-datetime-input" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                          Appointment Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          required
                          id="booking-datetime-input"
                          name="scheduled_at"
                          value={bookingDateTime}
                          onChange={(e) => setBookingDateTime(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 font-sans"
                        />
                      </div>

                      {!isAuthenticated ? (
                        <div className="p-3 bg-indigo-50 border border-indigo-200/40 rounded-xl text-slate-700 text-xs text-center leading-relaxed">
                          Please{' '}
                          <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-500 underline">
                            Log In
                          </Link>{' '}
                          or{' '}
                          <Link href="/register/client" className="font-bold text-indigo-600 hover:text-indigo-500 underline">
                            Sign Up
                          </Link>{' '}
                          to complete your booking request.
                        </div>
                      ) : user?.user_metadata?.role !== 'client' ? (
                        <div className="p-3 bg-amber-50 border border-amber-200/40 rounded-xl text-amber-700 text-xs text-center leading-relaxed">
                          Only registered Clients can request service bookings. Please log in as a client.
                        </div>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmittingBooking}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold rounded-xl text-sm transition-all"
                        >
                          {isSubmittingBooking ? 'Submitting Request...' : 'Confirm Appointment'}
                        </button>
                      )}
                    </>
                  )}
                </form>
              ) : (
                /* --- Providers List --- */
                <div className="space-y-3">
                  {nearbyVendors && nearbyVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className="p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all"
                    >
                      <div className="space-y-2.5 flex-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-800 text-lg">
                              {vendor.business_name}
                            </h4>
                            {vendor.emergency_availability && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-medium uppercase tracking-wider">
                                Emergency
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-xs mt-0.5 line-clamp-2">
                            {vendor.business_description || 'No description provided.'}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5 text-indigo-600">
                            <MapPin className="w-3.5 h-3.5" />
                            {vendor.distance_km} km away (in {vendor.city || 'local area'})
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            4.8 Rating
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {vendor.years_experience} years exp
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setBookingVendor(vendor);
                          setBookingSuccess(false);
                          setBookingError(null);
                        }}
                        className="sm:shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/10"
                      >
                        Book Service
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleCloseSearchModal}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ SPECIALTIES MODAL POPUP ════════ */}
      {activePopupCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          {/* Backdrop Close Clicker */}
          <div 
            className="absolute inset-0 cursor-default" 
            onClick={() => setActivePopupCategory(null)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Cover Image Banner */}
            <div className="h-40 w-full relative overflow-hidden">
              <img 
                src={`/asserts/${activePopupCategory.id}.png`} 
                alt={activePopupCategory.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
              
              {/* Floating Category Icon Badge */}
              <div
                className={`absolute bottom-3 left-5 w-11 h-11 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[activePopupCategory.id]} flex items-center justify-center text-white shadow-lg`}
              >
                {CATEGORY_ICONS[activePopupCategory.id]}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActivePopupCategory(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer border border-slate-200"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Title Content */}
            <div className="px-6 pt-5 pb-2">
              <h3 className="text-xl font-bold text-slate-800">
                {activePopupCategory.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Select a specialty to find nearby available providers
              </p>
            </div>

            {/* Specialties List */}
            <div className="p-6">
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                {activePopupCategory.subCategories.map((sub: any) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      handleSubcategoryClick(sub, activePopupCategory.id);
                      setActivePopupCategory(null);
                    }}
                    className="p-3 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-xl flex items-center justify-between group/sub transition-all duration-200 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 group-hover/sub:text-indigo-600 transition-colors">
                      {sub.name}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-indigo-600 group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActivePopupCategory(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500"></div>
          <p className="text-slate-600 text-sm font-semibold tracking-wide animate-pulse">Loading UrService Homepage...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
