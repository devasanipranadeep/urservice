'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'privacy';
  initialAccepted?: { terms?: boolean; privacy?: boolean };
  onAccept?: (state: { terms: boolean; privacy: boolean }) => void;
}

export const termsHighlights = [
  {
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
    title: '4. Law Enforcement Disclosures',
    badge: 'Safety First',
    summary: 'In legal emergencies or criminal investigations, we uphold client safety above all.',
    points: [
      'KYC dossiers are shared with law enforcement upon valid FIR/official legal notices',
      'Helps protect homeowners and genuine service providers in dispute cases'
    ]
  },
  {
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
    title: '6. Data Protection Officer',
    badge: 'Direct Redressal',
    summary: 'Reach our dedicated Data Protection Officer for any privacy concerns.',
    points: [
      'Contact email: privacy@urservice.com',
      'Response timeline: within 48 hours for data inquiries'
    ]
  }
];

function TermsPrivacyModalDialog({
  onClose,
  defaultTab = 'terms',
  initialAccepted,
  onAccept
}: Omit<TermsPrivacyModalProps, 'isOpen'>) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(defaultTab);
  const [termsAccepted, setTermsAccepted] = useState(Boolean(initialAccepted?.terms));
  const [privacyAccepted, setPrivacyAccepted] = useState(Boolean(initialAccepted?.privacy));

  // Lock body scroll while modal is mounted and restore on unmount
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleToggleTerms = useCallback((checked: boolean) => {
    setTermsAccepted(checked);
    if (onAccept) {
      onAccept({ terms: checked, privacy: privacyAccepted });
    }
  }, [onAccept, privacyAccepted]);

  const handleTogglePrivacy = useCallback((checked: boolean) => {
    setPrivacyAccepted(checked);
    if (onAccept) {
      onAccept({ terms: termsAccepted, privacy: checked });
    }
  }, [onAccept, termsAccepted]);

  const handleTickBoth = useCallback(() => {
    setTermsAccepted(true);
    setPrivacyAccepted(true);
    if (onAccept) {
      onAccept({ terms: true, privacy: true });
    }
    onClose();
  }, [onAccept, onClose]);

  const handleConfirmSelected = useCallback(() => {
    if (onAccept) {
      onAccept({ terms: termsAccepted, privacy: privacyAccepted });
    }
    onClose();
  }, [onAccept, onClose, termsAccepted, privacyAccepted]);

  const allAccepted = termsAccepted && privacyAccepted;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Header - No Logo */}
        <div className="px-5 py-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 id="legal-modal-title" className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Terms & Privacy Agreement
            </h2>
            <p className="text-xs text-slate-500">Short, plain English summary</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher - Clean Text */}
        <div className="px-5 pt-3 pb-2 sm:px-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center p-1 bg-slate-200/80 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terms of Service {termsAccepted ? '(Agreed)' : ''}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Privacy Policy {privacyAccepted ? '(Agreed)' : ''}
            </button>
          </div>

          <div className="hidden sm:block text-[11px] text-slate-500 font-medium">
            Updated Sept 2026
          </div>
        </div>

        {/* Content Body - Clean cards without logos */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-3 bg-slate-50/30">
          {(activeTab === 'terms' ? termsHighlights : privacyHighlights).map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-normal leading-relaxed mb-2">
                {item.summary}
              </p>
              <ul className="space-y-1 text-[11px] text-slate-500">
                {item.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-1.5">
                    <span className="text-slate-400 font-bold leading-tight">•</span>
                    <span className="leading-snug">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="pt-2 text-center">
            <Link
              href={activeTab === 'terms' ? '/terms' : '/privacy'}
              target="_blank"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2"
            >
              View full document on separate page
            </Link>
          </div>
        </div>

        {/* Pop-up Tick Action Footer */}
        <div className="px-5 py-4 sm:px-6 bg-white border-t border-slate-200 shadow-lg space-y-3">
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => handleToggleTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs text-slate-700 font-medium leading-tight">
                I agree to the <span className="font-semibold text-slate-900">Terms of Service</span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => handleTogglePrivacy(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs text-slate-700 font-medium leading-tight">
                I agree to the <span className="font-semibold text-slate-900">Privacy Policy</span>
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-2.5 pt-1">
            <div className="text-[11px] text-slate-500">
              {allAccepted ? 'Both accepted' : 'Tick checkboxes to agree'}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              
              {!allAccepted ? (
                <button
                  type="button"
                  onClick={handleTickBoth}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Tick Both & Agree
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmSelected}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Confirm & Proceed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TermsPrivacyModal(props: TermsPrivacyModalProps) {
  if (!props.isOpen) return null;
  return <TermsPrivacyModalDialog {...props} />;
}
