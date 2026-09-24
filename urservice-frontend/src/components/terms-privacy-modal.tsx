'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Scale,
  CreditCard,
  Ban,
  Lock,
  Eye,
  FileCheck2,
  AlertTriangle,
  Building2,
  HelpCircle,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'privacy';
  initialAccepted?: { terms?: boolean; privacy?: boolean };
  onAccept?: (state: { terms: boolean; privacy: boolean }) => void;
}

export const termsHighlights = [
  {
    icon: Scale,
    title: '1. Intermediary Marketplace',
    badge: 'IT Act 2000',
    summary: 'UrService connects clients with verified independent service providers (Vendors). Vendors operate as independent contractors, not direct employees of UrService.',
    points: [
      'We verify vendor credentials (KYC, identity, phone)',
      'Service scheduling and scope are executed directly by vendors',
      'UrService provides technological facilitation and payment support'
    ]
  },
  {
    icon: CreditCard,
    title: '2. Transparent Pricing & Payments',
    badge: 'No Hidden Fees',
    summary: 'All pricing, minimum visit charges, and taxes are clearly displayed before booking confirmation.',
    points: [
      'Pay securely online via encrypted payment gateways',
      'No cash tips required; official receipts generated for all transactions',
      'Disputes held in escrow until completion confirmation'
    ]
  },
  {
    icon: RefreshCwIcon,
    title: '3. Cancellations & Instant Refunds',
    badge: 'Client Friendly',
    summary: 'Free cancellation up to 2 hours before the scheduled service time.',
    points: [
      '100% refund for cancellations prior to the cut-off window',
      'Vendor no-shows result in full refund plus platform priority rebooking',
      'Refunds credited back to original source within 3-5 banking days'
    ]
  },
  {
    icon: ShieldCheck,
    title: '4. Zero Tolerance for Theft & Misconduct',
    badge: 'Zero Tolerance',
    summary: 'UrService maintains strict safety standards for all clients and vendors.',
    points: [
      'Immediate suspension of any user or vendor involved in misconduct',
      'In confirmed theft/damage cases with an FIR, we cooperate fully with police and release verified KYC dossier to authorities',
      'UrService is an intermediary and caps platform liability pursuant to statutory provisions'
    ]
  },
  {
    icon: Ban,
    title: '5. Fair Platform Use & Prohibited Acts',
    badge: 'Code of Conduct',
    summary: 'Users must maintain respectful communication and refrain from off-platform circumvention.',
    points: [
      'No harassment, verbal abuse, or fraudulent booking requests',
      'No circumvention of platform payments to avoid safety protections',
      'Accounts violating platform safety are terminated without notice'
    ]
  },
  {
    icon: Building2,
    title: '6. Governing Law & Grievance Redressal',
    badge: 'India Jurisdiction',
    summary: 'Governed by the laws of India with exclusive jurisdiction in Hyderabad, Telangana.',
    points: [
      'Dedicated Grievance Redressal Officer: grievance@urservice.com',
      'Acknowledgment within 24 hours and resolution within 15 statutory days'
    ]
  }
];

export const privacyHighlights = [
  {
    icon: Eye,
    title: '1. What Information We Collect',
    badge: 'DPDP Act 2023',
    summary: 'We collect only the essential personal data necessary to provide and secure services.',
    points: [
      'Contact: Name, mobile number (for OTP verification), email address',
      'Location: Service address for professional dispatch and map routing',
      'Vendors: Government ID (Aadhaar/PAN verification) and bank payout info'
    ]
  },
  {
    icon: Lock,
    title: '2. How Your Data Is Used',
    badge: 'Strict Purpose',
    summary: 'Your information is used strictly to fulfill your bookings and ensure safety.',
    points: [
      'Sharing your address with your assigned technician for the booking',
      'Sending booking alerts, OTP verification, and digital invoices',
      'Preventing fraud, identity spoofing, and platform abuse'
    ]
  },
  {
    icon: ShieldCheck,
    title: '3. Data Sharing & Zero Sale Policy',
    badge: 'Never Sold',
    summary: 'We NEVER sell or monetize your personal information to third-party advertisers.',
    points: [
      'Only the assigned vendor receives your address/phone for active service',
      'Payment processors handle card/UPI info with PCI-DSS encryption',
      'Data shared with cloud infrastructure adhering to strict Indian data localization'
    ]
  },
  {
    icon: AlertTriangle,
    title: '4. Law Enforcement Disclosures',
    badge: 'Safety First',
    summary: 'In legal emergencies or criminal investigations, we uphold client safety above all.',
    points: [
      'KYC dossiers are shared with law enforcement upon valid FIR/official legal notices',
      'Helps protect homeowners and genuine service providers in dispute cases'
    ]
  },
  {
    icon: FileCheck2,
    title: '5. Your Privacy Rights & Controls',
    badge: 'User Control',
    summary: 'You remain in full control of your personal data at all times.',
    points: [
      'View and edit your profile directly from your dashboard',
      'Request complete account and personal data deletion upon request',
      'Withdraw non-essential marketing consent at any time'
    ]
  },
  {
    icon: Building2,
    title: '6. Data Protection Officer',
    badge: 'Direct Redressal',
    summary: 'Reach our dedicated Data Protection Officer for any privacy concerns.',
    points: [
      'Contact email: privacy@urservice.com',
      'Response timeline: within 48 hours for data inquiries'
    ]
  }
];

function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export default function TermsPrivacyModal({
  isOpen,
  onClose,
  defaultTab = 'terms',
  initialAccepted = { terms: false, privacy: false },
  onAccept
}: TermsPrivacyModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(defaultTab);
  const [termsAccepted, setTermsAccepted] = useState(!!initialAccepted.terms);
  const [privacyAccepted, setPrivacyAccepted] = useState(!!initialAccepted.privacy);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    if (initialAccepted.terms !== undefined) setTermsAccepted(initialAccepted.terms);
    if (initialAccepted.privacy !== undefined) setPrivacyAccepted(initialAccepted.privacy);
  }, [initialAccepted.terms, initialAccepted.privacy]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTickBoth = () => {
    setTermsAccepted(true);
    setPrivacyAccepted(true);
    setHasConfirmed(true);
    if (onAccept) {
      onAccept({ terms: true, privacy: true });
    }
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleConfirmSelected = () => {
    setHasConfirmed(true);
    if (onAccept) {
      onAccept({ terms: termsAccepted, privacy: privacyAccepted });
    }
    onClose();
  };

  const allAccepted = termsAccepted && privacyAccepted;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Policy & Agreement Highlights
              </h2>
              <p className="text-xs text-slate-500">Short, plain English summary • Read in 1 minute</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-2 sm:px-6 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center p-1 bg-slate-200/80 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
              {termsAccepted && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
              {privacyAccepted && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Updated Sept 2026</span>
          </div>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-3.5 bg-slate-50/30">
          {(activeTab === 'terms' ? termsHighlights : privacyHighlights).map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 hover:border-indigo-200 rounded-xl p-3.5 sm:p-4 shadow-xs transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-normal leading-relaxed mb-2 ml-9">
                  {item.summary}
                </p>
                <ul className="ml-9 space-y-1 text-[11px] text-slate-500">
                  {item.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold leading-tight">•</span>
                      <span className="leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="pt-2 text-center">
            <Link
              href={activeTab === 'terms' ? '/terms' : '/privacy'}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <span>View full legal document on separate page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Pop-up Tick Action Footer */}
        <div className="px-5 py-4 sm:px-6 bg-white border-t border-slate-200/80 shadow-lg space-y-3">
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="text-xs text-slate-700 font-medium leading-tight">
                I have read and agree to the <span className="font-semibold text-slate-900">Terms of Service</span> (Zero theft policy, marketplace intermediary rules & cancellations)
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="text-xs text-slate-700 font-medium leading-tight">
                I acknowledge and accept the <span className="font-semibold text-slate-900">Privacy Policy</span> (Data encryption, zero advertisement selling & KYC verification)
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 self-start sm:self-center">
              {allAccepted ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Both policies accepted
                </span>
              ) : (
                <span>Tick both checkboxes above to accept</span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              
              {!allAccepted ? (
                <button
                  type="button"
                  onClick={handleTickBoth}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tick Both & Agree</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmSelected}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm & Proceed</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
