'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, ShieldCheck, Scale, FileText, Lock, UserCheck, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-500 mb-4 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Terms of Service & Security Policy
          </h1>
          <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto">
            Please read these terms carefully before registering or using UrService platform services.
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Last Updated: August 2026</p>
        </div>

        {/* Highlighted Platform & Theft Disclaimer Banner */}
        <div className="mb-8 p-6 bg-amber-50/90 border border-amber-300/80 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-amber-950">
                Important Platform Role & Theft Disclaimer Notice
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                <strong>UrService operates strictly as an intermediary platform</strong> designed to discover and connect clients with independent local service vendors. UrService does not directly employ vendors nor provide on-site supervision.
              </p>
              <div className="p-3.5 bg-white/80 border border-amber-200/80 rounded-xl text-xs text-slate-800 space-y-1.5 font-medium">
                <p className="text-amber-900 font-bold">In the Event of House Theft or Criminal Misconduct:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li><strong>Zero Platform Liability:</strong> UrService is not legally or financially responsible for any house theft, missing items, or property loss caused by independent vendors.</li>
                  <li><strong>Immediate Account Suspension:</strong> Upon receiving a formal complaint of theft supported by initial proof or police report (FIR), the accused vendor's account will be immediately suspended.</li>
                  <li><strong>Full Data Disclosure:</strong> UrService Administration will release the vendor's complete verified identity records (Aadhaar/Govt ID, business details, phone number, address) directly to the client and law enforcement authorities to facilitate legal investigation.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">1. Intermediary Platform Scope</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              UrService acts as a digital matching marketplace. We provide tools for users to discover, request, and schedule services provided by registered vendors. Vendors listed on UrService operate as independent contractors. Registration on UrService does not constitute an employment relationship, agency, or partnership between UrService and any service provider.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">2. Vendor Verification & KYC Protocol</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              UrService enforces mandatory identity proof verification (such as Aadhaar, PAN, Passport, or Driving License) and business documentation review before vendor accounts are approved. While we take diligent measures to verify submitted documents, clients are advised to exercise standard precautions when granting service personnel physical entry into private premises.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">3. Theft, Property Damage & Legal Assistance Clause</h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
              <p>
                Clients acknowledge and agree that service bookings are performed on-site by independent third-party vendors. UrService explicitly disclaims liability for any unlawful conduct, theft, or property loss.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Mandatory Cooperation Protocol:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                  <li>The client must report any suspected incident immediately to local police authorities and notify UrService Support.</li>
                  <li>UrService Administration will verify the report and immediately issue a permanent or temporary platform suspension to the vendor.</li>
                  <li>UrService Administration will provide all stored KYC documents, government IDs, phone numbers, and physical address details of the vendor to the client and police.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">4. Client & Vendor Conduct Obligations</h2>
            </div>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              <li>Users must provide accurate, truthful, and complete profile information during registration.</li>
              <li>Vendors must maintain professional standards, respect client privacy, and adhere to agreed appointment schedules.</li>
              <li>Any form of harassment, fraud, or fraudulent booking requests will lead to account termination.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">5. Data Privacy & Account Termination</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              User personal data is handled in accordance with our Privacy Policy. UrService reserves the unilateral right to refuse service, suspend, or terminate accounts that violate our safety policies or engage in misconduct.
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center text-xs text-slate-500">
          By continuing to register or use UrService, you agree to comply with all terms above.{' '}
          <Link href="/" className="text-indigo-600 hover:text-indigo-500 font-bold">
            Return to Homepage
          </Link>
        </div>
      </main>
    </div>
  );
}
