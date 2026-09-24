'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import TermsPrivacyModal, { termsHighlights } from '../../components/terms-privacy-modal';

export default function TermsOfServicePage() {
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

  const handleToggleTerms = (val: boolean) => {
    setAcceptedTerms(val);
    try {
      localStorage.setItem(
        'urservice_legal_agreed',
        JSON.stringify({ terms: val, privacy: acceptedPrivacy })
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> UrService
            </Link>
            <span>/</span>
            <span className="text-slate-400">Legal</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Terms of Service</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
              <span className="px-3.5 py-1.5 bg-white text-indigo-700 rounded-lg shadow-xs font-bold">
                Terms of Service
              </span>
              <Link
                href="/privacy"
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 transition-colors rounded-lg"
              >
                Privacy Policy
              </Link>
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Print
            </button>
          </div>
        </div>

        {/* Hero Banner without logos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Platform Agreement</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                Terms of Service
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                A clear, plain-language summary of terms and platform operating rules for clients and verified vendors.
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                <span>Effective September 2026</span>
                <span>•</span>
                <span>Governed under Indian Law</span>
              </div>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Open Pop-up View
              </button>
            </div>
          </div>
        </div>

        {/* On-Page Agreement Status Box */}
        <div className="mb-8 p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Your Agreement Status</h2>
            <p className="text-xs text-slate-600">
              Tick the box to confirm you understand and accept the platform terms.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => handleToggleTerms(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800">
              {acceptedTerms ? 'Terms Accepted' : 'Tick to Accept Terms'}
            </span>
          </label>
        </div>

        {/* Structured Highlight Cards - No Logos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {termsHighlights.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">{item.title}</h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    {item.badge}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {item.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 mb-8 text-xs text-slate-600 leading-relaxed space-y-2">
          <p className="font-bold text-slate-800">
            Statutory Intermediary Safe Harbor & Compliance Note
          </p>
          <p>
            UrService operates as an electronic intermediary under Section 79 of the Information Technology Act, 2000. UrService connects clients with independent trade professionals. In criminal incidents involving registered FIRs, verified KYC records will be released directly to legal authorities.
          </p>
        </div>

        {/* Redressal and Contact Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Grievance Redressal</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Contact our Grievance Officer at <span className="font-semibold text-slate-800">grievance@urservice.com</span>.
            </p>
          </div>
          <Link
            href="/privacy"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View Privacy Policy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Pop-up Tick Modal */}
      <TermsPrivacyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTab="terms"
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
