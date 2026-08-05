'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  ChevronRight,
  X,
  User,
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../lib/constants';
import { useSession } from '../../hooks/use-session';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';

/* ─── Category Icon Map ─── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  education: <GraduationCap className="w-6 h-6" />,
  healthcare: <HeartPulse className="w-6 h-6" />,
  beauty_salon: <Sparkles className="w-6 h-6" />,
  home_services: <Wrench className="w-6 h-6" />,
  cleaning_services: <SprayCan className="w-6 h-6" />,
  vehicle_services: <Car className="w-6 h-6" />,
  event_services: <PartyPopper className="w-6 h-6" />,
  repair_services: <Smartphone className="w-6 h-6" />,
  rental_services: <Building className="w-6 h-6" />,
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

export default function ServicesCatalogPage() {
  const [activePopupCategory, setActivePopupCategory] = useState<any | null>(null);
  const { isAuthenticated, user, isLoading } = useSession();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-24">
      {/* Background radial accent */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-50/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-50/50 rounded-full blur-[120px]" />
      </div>

      {/* ════════ NAVBAR ════════ */}
      <Navbar activePage="services" />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Page Banner Title */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-sm font-medium mb-4">
            Services Directory
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Explore All <span className="gradient-text">UrService Specialties</span>
          </h1>
          <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto">
            Click any service category to view available specialties and book instantly.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setActivePopupCategory(cat)}
              className="group relative h-[260px] rounded-2xl cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-1"
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
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[cat.id]} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {CATEGORY_ICONS[cat.id]}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white drop-shadow-lg">{cat.name}</h2>
                    <p className="text-xs text-slate-300/80 font-medium">{cat.subCategories.length} specialties available</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 shrink-0" />
              </div>

              {/* Top-right hover badge */}
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                View Specialties →
              </div>
            </div>
          ))}
        </div>
      </main>

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
                  <Link
                    key={sub.id}
                    href={`/?category=${activePopupCategory.id}&subcategory=${sub.id}`}
                    className="p-3 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-xl flex items-center justify-between group/sub transition-all duration-200 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 group-hover/sub:text-indigo-600 transition-colors">
                      {sub.name}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-indigo-600 group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                  </Link>
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
