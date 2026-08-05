'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Eye, ShieldCheck, Database, FileText } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-500 mb-4 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Privacy & Data Security Policy
          </h1>
          <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto">
            How UrService collects, protects, and handles your personal and identity data.
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Last Updated: August 2026</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We collect user details such as full name, phone number, email address, city, and GPS location to facilitate nearby service discovery. For vendors, we collect mandatory identity proofs (Aadhaar, PAN, Passport, Driving License) and business documentation to verify credentials.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">2. How We Use Your Data</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your data is used to match service requests, send appointment updates via OTP/SMS, verify service providers, and maintain platform security.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">3. Information Disclosure & Security Protocol</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
              We do not sell or rent your personal data to third-party advertisers. Data is disclosed only in the following necessary circumstances:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5">
              <li>Between client and vendor to fulfill scheduled service bookings.</li>
              <li>To law enforcement or clients in cases of reported property loss, theft, or criminal investigation.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
