'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import {
  Search,
  CalendarCheck,
  ThumbsUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  Users,
  Briefcase,
  HelpCircle,
  FileCheck,
  BellRing,
  Star,
  ChevronDown,
} from 'lucide-react';

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'client' | 'vendor'>('client');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const clientSteps = [
    {
      num: '01',
      title: 'Search & Discover',
      desc: 'Browse across 9+ essential local service categories or search directly for what you need. Compare verified local professionals by ratings, pricing, and availability.',
      icon: Search,
      highlight: 'Transparent Pricing & Verified Profiles',
    },
    {
      num: '02',
      title: 'Book Instantly',
      desc: 'Select your preferred appointment date and time with a single tap. Your booking request reaches the vendor dashboard instantly with real-time sync.',
      icon: CalendarCheck,
      highlight: 'Instant Live Confirmation',
    },
    {
      num: '03',
      title: 'Enjoy Service & Review',
      desc: 'Get high-quality service at your doorstep or visit the vendor location. Leave genuine feedback and ratings to help our local community thrive.',
      icon: ThumbsUp,
      highlight: 'Guaranteed Quality & Support',
    },
  ];

  const vendorSteps = [
    {
      num: '01',
      title: 'Register & Verify',
      desc: 'Create your vendor account, provide your business categories, and submit government ID verification (Aadhaar/Business proof) for quick administrative approval.',
      icon: FileCheck,
      highlight: 'Quick 24-hr Verification',
    },
    {
      num: '02',
      title: 'Manage Bookings in Real-Time',
      desc: 'Receive live job booking notifications immediately when clients request your services. Accept, decline, or reschedule appointments with zero delay.',
      icon: BellRing,
      highlight: '0ms Real-Time Dashboard Sync',
    },
    {
      num: '03',
      title: 'Deliver & Grow Your Business',
      desc: 'Serve satisfied local clients, build a stellar reputation, and expand your customer base with UrService’s verified marketplace credibility.',
      icon: Star,
      highlight: 'Direct Customer Connections',
    },
  ];

  const faqs = [
    {
      q: 'Is UrService free for clients to search and book?',
      a: 'Yes, searching for professionals, exploring categories, and placing booking requests on UrService is completely free for clients. You only pay for the service received directly with the service provider.',
    },
    {
      q: 'How does UrService verify service providers?',
      a: 'Every registered vendor undergoes an administrative verification process where business details, identity documents (Aadhaar or Government ID), phone verification, and addresses are thoroughly vetted before profile approval.',
    },
    {
      q: 'Can I reschedule or cancel a booking appointment?',
      a: 'Yes! Clients and vendors can easily reschedule booking times directly from their respective dashboards. If your plans change, you can update your schedule or cancel anytime before the appointment.',
    },
    {
      q: 'How do vendors receive new job requests?',
      a: 'When a client books an appointment, it synchronizes to the vendor dashboard in real-time. Vendors also receive instant in-app alerts on their notification bell.',
    },
    {
      q: 'What service categories are supported?',
      a: 'UrService supports Education, Healthcare & Nursing, Beauty & Wellness, Home Cleaning, Electrical & Plumbing, Appliance Repair, Events & Catering, Automotive, and more.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-24 overflow-x-hidden">
      {/* Background ambient accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-50/60 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-50/60 rounded-full blur-[120px]" />
      </div>

      {/* ════════ NAVBAR ════════ */}
      <Navbar activePage="how-it-works" />

      {/* ════════ HERO SECTION ════════ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, Transparent & Reliable
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            How <span className="gradient-text">UrService</span> Works
          </h1>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            Connecting trusted local professionals with clients who need quality services.
            Explore how seamless booking and managing jobs is on UrService.
          </p>

          {/* Toggle between Clients and Vendors */}
          <div className="mt-8 inline-flex p-1.5 bg-slate-100/90 border border-slate-200 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'client'
                  ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              For Clients
            </button>
            <button
              onClick={() => setActiveTab('vendor')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'vendor'
                  ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              For Service Partners
            </button>
          </div>
        </div>

        {/* ════════ STEPS CARDS ════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {(activeTab === 'client' ? clientSteps : vendorSteps).map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="group bg-white border border-slate-200/80 rounded-3xl p-8 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 relative flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-4 right-6 text-6xl font-black text-slate-100 select-none tracking-tighter group-hover:text-indigo-50/80 transition-colors">
                  {step.num}
                </div>
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm mb-6">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {step.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{step.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ════════ TRUST & SECURITY BANNER ════════ */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-20 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Safety & Verification Guarantee
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Built on Trust, Quality, and Accountability
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              We uphold rigorous standards for identity verification and prompt customer support to ensure
              every interaction on UrService is secure and dependable.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Aadhaar/ID Verified</h4>
                <p className="text-xs text-slate-300">All professionals submit verified government identification before approval.</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <Clock className="w-5 h-5 text-indigo-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Real-Time Scheduling</h4>
                <p className="text-xs text-slate-300">Live booking confirmations and cross-tab synchronization with 0ms delay.</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <Star className="w-5 h-5 text-amber-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Authentic Reviews</h4>
                <p className="text-xs text-slate-300">Only verified clients who booked a service can leave reviews and ratings.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════ FREQUENTLY ASKED QUESTIONS ════════ */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-800 text-sm sm:text-base hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-indigo-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ════════ BOTTOM CTA BANNER ════════ */}
        <div className="text-center max-w-3xl mx-auto p-10 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Ready to experience UrService?
          </h3>
          <p className="text-slate-500 text-sm mb-8 max-w-xl mx-auto">
            Join thousands of satisfied clients and verified local service partners today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/services"
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              Browse All Services
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register/vendor"
              className="w-full sm:w-auto px-7 py-3.5 border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-white hover:border-indigo-300 transition-all flex items-center justify-center gap-2 text-sm"
            >
              Register as Service Partner
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-slate-200 mt-24 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <img src="/logo.png?v=2" alt="UrService" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-bold text-slate-800 text-sm">UrService</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link href="/services" className="hover:text-indigo-600 transition-colors">Services</Link>
            <Link href="/how-it-works" className="hover:text-indigo-600 transition-colors font-bold text-indigo-600">How it Works</Link>
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
