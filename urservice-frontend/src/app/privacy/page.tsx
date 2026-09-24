'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Lock,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Printer,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileCheck2,
  Clock,
  Scale
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import TermsPrivacyModal, { privacyHighlights } from '../../components/terms-privacy-modal';

export default function PrivacyPolicyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('urservice_legal_agreed');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.terms) setAcceptedTerms(true);
        if (parsed.privacy) setAcceptedPrivacy(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleTogglePrivacy = (val: boolean) => {
    setAcceptedPrivacy(val);
    try {
      localStorage.setItem(
        'urservice_legal_agreed',
        JSON.stringify({ terms: acceptedTerms, privacy: val })
      );
    } catch {}
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20">
        {/* Navigation & Tab Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> UrService
            </Link>
            <span>/</span>
            <span className="text-slate-400">Legal</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Privacy Policy</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Direct Switcher Tabs */}
            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
              <Link
                href="/terms"
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 transition-colors rounded-lg"
              >
                Terms of Service
              </Link>
              <span className="px-3.5 py-1.5 bg-white text-indigo-700 rounded-lg shadow-xs font-bold">
                Privacy Policy
              </span>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Print Summary"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Hero Banner with Pop-up Button */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-100/50 via-indigo-50/20 to-transparent pointer-events-none rounded-bl-full" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold mb-4">
              <Lock className="w-3.5 h-3.5" />
              <span>DPDP Act 2023 Compliant • Plain Language</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Privacy Policy & Data Protection
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                  We respect your personal data. We never sell your info to advertisers, we encrypt sensitive data, and you stay in complete control of your account.
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> 1.5 minute read
                  </span>
                  <span>•</span>
                  <span>Effective September 2026</span>
                  <span>•</span>
                  <span>Zero Ad Sale Guarantee</span>
                </div>
              </div>

              {/* Action Button to launch Pop-up Tick Page */}
              <div className="shrink-0 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Open as Pop-up Tick Page</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <p className="text-[11px] text-slate-400 text-center">Fast review & 1-click agreement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Quick Tick Status Box on Page */}
        <div className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-emerald-50/60 via-white to-indigo-50/40 border border-emerald-100 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Your Privacy Consent Status</h2>
              <p className="text-xs text-slate-600">
                Tick below to record your explicit consent to our secure data handling practices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-xs cursor-pointer hover:border-emerald-300 transition-colors">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => handleTogglePrivacy(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <span className="text-xs font-semibold text-slate-800">
                {acceptedPrivacy ? '✓ Privacy Policy Accepted' : 'Tick to Accept Privacy'}
              </span>
            </label>
          </div>
        </div>

        {/* Clear, Short & Structured Highlights (Grid of 6 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {privacyHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-base font-bold text-slate-900">{item.title}</h2>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Key Practices
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {item.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold leading-tight">•</span>
                        <span className="leading-snug">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statutory Compliance & Data Sovereignty Note */}
        <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-5 sm:p-6 mb-10 text-xs text-slate-600 leading-relaxed space-y-2">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-600" /> Digital Personal Data Protection (DPDP) Act, 2023 Compliance
          </p>
          <p>
            UrService operates as a Data Fiduciary under the Digital Personal Data Protection Act, 2023. User data is processed lawfully solely for service fulfillment, verification, and statutory compliance. User databases and KYC dossiers are hosted in ISO/IEC 27001 certified cloud data centers situated within the territory of India.
          </p>
          <p>
            Users possess the statutory right to request correction of inaccurate data, withdraw processing consent, or request complete account erasure by contacting our Data Protection Officer.
          </p>
        </div>

        {/* Redressal and Contact Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Need help with your privacy rights?</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Contact our Data Protection Officer directly at <span className="font-semibold text-indigo-600">privacy@urservice.com</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/terms"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Terms of Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Pop-up Tick Modal */}
      <TermsPrivacyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTab="privacy"
        initialAccepted={{ terms: acceptedTerms, privacy: acceptedPrivacy }}
        onAccept={(state) => {
          setAcceptedTerms(state.terms);
          setAcceptedPrivacy(state.privacy);
          try {
            localStorage.setItem('urservice_legal_agreed', JSON.stringify(state));
          } catch {}
        }}
      />
    </div>
  );
}
