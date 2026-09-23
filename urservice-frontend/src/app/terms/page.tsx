'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronUp,
  Scale,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Lock,
  FileText,
  CreditCard,
  XCircle,
  Gavel,
  Mail,
  Printer,
  Search,
  CheckCircle2,
  ExternalLink,
  Building2,
  Clock,
  ArrowRight
} from 'lucide-react';
import Navbar from '../../components/Navbar';

interface Section {
  id: string;
  num: string;
  title: string;
  keywords: string;
}

const sections: Section[] = [
  { id: 'preamble', num: '1.0', title: 'Preamble & Statutory Framework', keywords: 'preamble intermediary safe harbor it act 2000 definitions scope' },
  { id: 'definitions', num: '2.0', title: 'Interpretative Definitions', keywords: 'definitions client vendor marketplace booking kyc platform' },
  { id: 'intermediary-role', num: '3.0', title: 'Platform Scope & Independent Status', keywords: 'independent contractor employment agency intermediary control supervision' },
  { id: 'eligibility', num: '4.0', title: 'Account Eligibility & Security', keywords: 'age capacity 18 registration credentials passwords suspension' },
  { id: 'vendor-kyc', num: '5.0', title: 'Vendor Onboarding & Mandatory KYC', keywords: 'kyc verification aadhaar pan license trade background check' },
  { id: 'property-safety', num: '6.0', title: 'Property Integrity, Theft & Law Enforcement', keywords: 'theft damage fir police criminal misconduct disclosure cooperation safe harbor' },
  { id: 'service-bookings', num: '7.0', title: 'Service Bookings & Performance Standards', keywords: 'bookings scheduling appointments good faith execution standard of care' },
  { id: 'pricing-payments', num: '8.0', title: 'Pricing, Payments & Tax Obligations', keywords: 'fees pricing payment settlement invoices gst commissions' },
  { id: 'cancellation-refunds', num: '9.0', title: 'Cancellation, Rescheduling & Refunds', keywords: 'cancel rescheduling refunds policy dispute chargeback' },
  { id: 'prohibited-conduct', num: '10.0', title: 'Prohibited Activities & Platform Integrity', keywords: 'misconduct harassment fraud circumvention scraping tampering abuse' },
  { id: 'intellectual-property', num: '11.0', title: 'Intellectual Property Rights', keywords: 'copyright trademark proprietary software user content licensing' },
  { id: 'liability-disclaimer', num: '12.0', title: 'Limitation of Liability & Disclaimers', keywords: 'warranties as-is damages aggregate liability indirect consequential' },
  { id: 'indemnification', num: '13.0', title: 'Indemnification Obligations', keywords: 'indemnity defense hold harmless third party claims loss' },
  { id: 'governing-law', num: '14.0', title: 'Dispute Resolution, Arbitration & Governing Law', keywords: 'arbitration governing law jurisdiction hyderabad telangana conciliation' },
  { id: 'grievance-officer', num: '15.0', title: 'Statutory Grievance Redressal Mechanism', keywords: 'grievance officer complaint response timeline contact support it rules' },
];

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('preamble');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sectionElements = sections.map(s => ({
        id: s.id,
        el: document.getElementById(s.id),
      }));

      let current = sections[0].id;
      for (const sec of sectionElements) {
        if (sec.el) {
          const rect = sec.el.getBoundingClientRect();
          if (rect.top <= 160) {
            current = sec.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const filteredSections = searchQuery.trim() === ''
    ? sections
    : sections.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.keywords.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.num.includes(searchQuery)
      );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-24">
        {/* Breadcrumb Navigation & Document Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/80 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> UrService
            </Link>
            <span>/</span>
            <span className="text-slate-400">Legal & Governance</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Terms of Service</span>
          </div>

          {/* Quick Legal Switcher & Print Control */}
          <div className="flex items-center gap-2.5">
            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
              <span className="px-3 py-1.5 bg-white text-indigo-700 rounded-lg shadow-xs font-bold">
                Terms of Service
              </span>
              <Link
                href="/privacy"
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 transition-colors rounded-lg"
              >
                Privacy & Data Policy
              </Link>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Master Document Header */}
        <header className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-indigo-50/80 to-transparent pointer-events-none rounded-bl-full" />
          
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold tracking-wide mb-4">
              <Scale className="w-3.5 h-3.5" />
              <span>Official Regulatory & Operating Agreement</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Terms of Service & Platform Rules
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              This master agreement governs access to and commercial use of the UrService digital intermediary marketplace.
              Please review all provisions carefully.
            </p>

            {/* Document Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Operating Entity</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> UrService Tech Pvt. Ltd.
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Statutory Jurisdiction</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  Hyderabad, Telangana, IN
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Last Formal Revision</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  24 September 2026
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Regulatory Version</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Rev 2.4 (Active)
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 2-Column Responsive Layout: Sticky TOC + Legal Content */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
          
          {/* Left Sidebar: Sticky Table of Contents & Quick Search (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6 print:hidden">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" /> Document Index
                </span>
                <span className="text-[11px] font-mono text-slate-400">15 Articles</span>
              </div>

              {/* Clause Filter Search */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter clauses (e.g. KYC, theft, refund)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 max-h-[58vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {filteredSections.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className={`group flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-900 font-bold border-l-2 border-indigo-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className={`font-mono text-[11px] shrink-0 mt-0.5 ${
                        isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 group-hover:text-slate-600'
                      }`}>
                        {sec.num}
                      </span>
                      <span className="leading-snug">{sec.title}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Quick Grievance Reference Card */}
            <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Statutory Compliance Notice</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                UrService maintains an active Redressal Officer in compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines) Rules, 2021.
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Legal Inquiries:</span>
                <a href="mailto:legal@urservice.in" className="text-indigo-600 font-semibold hover:underline">
                  legal@urservice.in
                </a>
              </div>
            </div>
          </aside>

          {/* Right Main Column: Formal Legal Articles */}
          <div className="lg:col-span-8 space-y-10">

            {/* Article 1.0 */}
            <section id="preamble" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 1.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Preamble, Acceptance of Terms & Statutory Framework
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>1.1 Binding Contractual Relationship:</strong> These Terms of Service (&ldquo;Terms&rdquo; or &ldquo;Agreement&rdquo;) constitute a legally enforceable electronic contract executed pursuant to the provisions of the <em>Information Technology Act, 2000</em> and associated administrative rules, between <strong>UrService Technologies Private Limited</strong>, an incorporated company having its administrative office in Hyderabad, Telangana, India (&ldquo;UrService&rdquo;, &ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), and any individual, commercial entity, or organizational user (&ldquo;User&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;), encompassing both Consumers/Clients and Service Partners/Vendors.
                </p>
                <p>
                  <strong>1.2 Electronic Signature & Explicit Consent:</strong> By accessing the domain <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 text-xs">urservice.vercel.app</code> or any associated subdomains, mobile applications, APIs, or interactive portals (collectively, the &ldquo;Platform&rdquo;), or by clicking &ldquo;I Agree&rdquo;, &ldquo;Register&rdquo;, or &ldquo;Book Service&rdquo;, you irrevocably acknowledge and agree that your electronic consent constitutes a valid electronic signature under the <em>Information Technology Act, 2000</em>, having identical legal efficacy to an executed physical instrument.
                </p>
                <p>
                  <strong>1.3 Periodic Regulatory Amendments:</strong> The Company reserves the right to modify, amend, restate, or update any provision of these Terms to reflect legislative changes, operational enhancements, or statutory directives. Any revised version shall become operative immediately upon formal publication on the Platform with an updated Revision Timestamp. Continued access or commercial transactions following publication shall constitute conclusive affirmation of such amendments.
                </p>
              </div>
            </section>

            {/* Article 2.0 */}
            <section id="definitions" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 2.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Interpretative Definitions & Classification of Parties
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                <p>Throughout these Terms, the following terms shall possess the respective definitions ascribed below:</p>
                <dl className="grid grid-cols-1 gap-3 pt-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <dt className="font-bold text-slate-900">2.1 &ldquo;Digital Intermediary Marketplace&rdquo;</dt>
                    <dd className="text-slate-600 mt-1">The web and mobile computing infrastructure operated by UrService that facilitates communication, matching, scheduling, and transaction execution between autonomous service professionals and prospective clients.</dd>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <dt className="font-bold text-slate-900">2.2 &ldquo;Client&rdquo; or &ldquo;Consumer&rdquo;</dt>
                    <dd className="text-slate-600 mt-1">Any legal individual of majority age or recognized legal entity that utilizes the Platform to discover, request, schedule, or purchase local professional services.</dd>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <dt className="font-bold text-slate-900">2.3 &ldquo;Service Partner&rdquo; or &ldquo;Vendor&rdquo;</dt>
                    <dd className="text-slate-600 mt-1">An independent contractor, commercial merchant, skilled tradesperson, or enterprise entity that registers on the Platform to market, accept, and physically fulfill service bookings.</dd>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <dt className="font-bold text-slate-900">2.4 &ldquo;KYC Dossier&rdquo; (Know Your Customer)</dt>
                    <dd className="text-slate-600 mt-1">The mandatory portfolio of government-issued identity certificates, tax credentials (PAN/GSTIN), physical business proofs, and photographic records furnished by a Vendor for administrative vetting.</dd>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <dt className="font-bold text-slate-900">2.5 &ldquo;Marketplace Booking&rdquo;</dt>
                    <dd className="text-slate-600 mt-1">A confirmed service reservation agreed upon between a Client and a Vendor through the Platform, designating agreed deliverables, date, time window, and baseline compensation.</dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Article 3.0 */}
            <section id="intermediary-role" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 3.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Platform Scope & Statutory Intermediary Safe Harbor Status
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-950">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900 mb-1 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    Section 79 Statutory Declaration — Information Technology Act, 2000
                  </h4>
                  <p className="text-xs text-indigo-900/90 leading-relaxed">
                    UrService is strictly an <strong>Intermediary</strong> as defined under Section 2(1)(w) of the Information Technology Act, 2000. UrService does not directly manufacture, supply, execute, direct, or physically control the end services rendered by registered Vendors.
                  </p>
                </div>

                <p>
                  <strong>3.1 Independent Contractor Relationship:</strong> Nothing in these Terms shall be deemed or construed to create any partnership, joint venture, employer-employee relationship, master-servant, franchisor-franchisee, or agency relationship between UrService and any Vendor. Vendors maintain complete operational autonomy regarding their business hours, work methodology, pricing schedule, and equipment.
                </p>
                <p>
                  <strong>3.2 Absence of Direct Supervisory Control:</strong> UrService operates as a facilitator of digital connections. The Company does not supervise on-site service delivery, does not direct craftsmanship techniques, and does not maintain physical custody of tools, materials, or locations where services are performed.
                </p>
                <p>
                  <strong>3.3 Platform Availability SLA:</strong> While the Company applies modern cloud high-availability protocols, the Platform is rendered on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; framework without explicit guarantees of uninterrupted operation, zero latency, or continuous error-free server responsiveness.
                </p>
              </div>
            </section>

            {/* Article 4.0 */}
            <section id="eligibility" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 4.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  User Eligibility, Registration Standards & Account Security
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>4.1 Contractual Capacity:</strong> Registration and use of the Platform is restricted exclusively to individuals who are at least eighteen (18) years of chronological age and who possess full legal competence to enter into binding agreements under the <em>Indian Contract Act, 1872</em>. Individuals deemed incompetent under law (including un-discharged insolvents) are expressly barred.
                </p>
                <p>
                  <strong>4.2 Accuracy of Represented Records:</strong> You warrant that all credentials, identification documents, contact numbers, email addresses, and physical locations submitted during registration are authentic, accurate, and kept updated. Providing fictitious names, disposable telecommunications numbers, or impersonating third parties constitutes a material breach punishable by immediate termination and legal referral.
                </p>
                <p>
                  <strong>4.3 Custody of Credentials:</strong> You bear sole responsibility for safeguarding the confidentiality of your account authentication tokens, passwords, and one-time passwords (OTPs). Any commercial booking, message, or cancellation generated under your authenticated profile shall be legally attributed to you.
                </p>
              </div>
            </section>

            {/* Article 5.0 */}
            <section id="vendor-kyc" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 5.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Vendor Onboarding, Mandatory KYC & Compliance Audit Protocol
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>5.1 Mandatory Due Diligence:</strong> No Service Partner is authorized to accept bookings or publish service offerings until their identity profile has completed formal administrative verification. Vendors must submit verifiable records including:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 text-slate-700 text-xs sm:text-sm">
                  <li><strong>Government Identity Proof:</strong> Aadhaar Card, Permanent Account Number (PAN), Passport, or Electoral ID.</li>
                  <li><strong>Commercial Documentation:</strong> Shop & Establishment License, Trade License, or GSTIN Certificate where statutorily mandated.</li>
                  <li><strong>Category Certifications:</strong> Professional certifications, diplomas, or trade certificates for regulated technical categories (such as electrical work, healthcare assistance, or structural repairs).</li>
                  <li><strong>Photographic Record:</strong> Current high-resolution portrait photograph matching submitted identification documents.</li>
                </ul>
                <p>
                  <strong>5.2 Submission of Fraudulent Instruments:</strong> Any submission of forged, altered, expired, or non-matching documentation shall result in instantaneous profile revocation, blacklisting of hardware identifiers and phone numbers, and formal submission to statutory cybercrime enforcement cells.
                </p>
              </div>
            </section>

            {/* Article 6.0 — Property Safety & Theft Clause */}
            <section id="property-safety" className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-amber-600">Article 6.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Property Integrity, Theft, Criminal Misconduct & Law Enforcement Protocol
                </h2>
              </div>
              
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <div className="p-4 bg-slate-50 border-l-4 border-amber-500 rounded-r-xl">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Special Statutory Clause: Intermediary Immunity & Evidence Disclosure
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    UrService maintains zero tolerance for theft, burglary, assault, property damage, or unlawful trespass. The following operational protocol strictly dictates legal procedures in the event of any alleged criminal conduct.
                  </p>
                </div>

                <p>
                  <strong>6.1 On-Site Risk Acknowledgement:</strong> Clients acknowledge that on-site service performance occurs on private residential or commercial premises. While UrService enforces stringent pre-onboarding KYC verification, Clients are advised to exercise reasonable domestic prudence, including securing high-value currency, jewelry, confidential papers, and portable electronic assets prior to admitting any service personnel.
                </p>

                <p>
                  <strong>6.2 Mandatory Four-Step Law Enforcement Escalation Protocol:</strong> In the event that a Client discovers or suspects theft, property destruction, or criminal misconduct arising from a Marketplace Booking:
                </p>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs uppercase">Step 1: First Information Report (FIR) Lodgment</h5>
                      <p className="text-xs text-slate-600 mt-0.5">The Client must immediately register a formal complaint with the cognizant jurisdictional police station under the provisions of the Bharatiya Nyaya Sanhita (BNS) / Indian Penal Code (IPC) and obtain an official FIR copy or acknowledged CSR receipt.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs uppercase">Step 2: Emergency Account Quarantine</h5>
                      <p className="text-xs text-slate-600 mt-0.5">Upon transmission of the FIR number or complaint token to UrService Support, the Company shall instantaneously freeze the accused Vendor&apos;s account, suspend pending payouts, and withhold all active dispatch privileges.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs uppercase">Step 3: Statutory Release of Verified KYC Dossier</h5>
                      <p className="text-xs text-slate-600 mt-0.5">Under statutory requisition or formal investigation pursuant to Section 91 of the Code of Criminal Procedure / Section 94 of Bharatiya Nagarik Suraksha Sanhita (BNSS), UrService shall unconditionally release the Vendor&apos;s full verified Aadhaar, registered address, telephone records, GPS coordinates, and KYC dossier directly to investigating law enforcement authorities and the affected complainant.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs uppercase">Step 4: Permanent Blacklisting & Legal Sanctions</h5>
                      <p className="text-xs text-slate-600 mt-0.5">Following judicial adjudication or investigative substantiation, the Vendor&apos;s credentials and biometric fingerprints shall be permanently barred from ever re-registering across any UrService enterprise infrastructure.</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic">
                  <strong>6.3 Safe Harbor Disclaimer:</strong> As an intermediary marketplace under Section 79 of the IT Act, 2000, UrService is not an insurer of property, does not warrant the personal integrity of autonomous contractors beyond the scope of diligent KYC vetting, and cannot be held civilly or criminally liable for independent criminal offenses perpetrated by third-party individuals.
                </p>
              </div>
            </section>

            {/* Article 7.0 */}
            <section id="service-bookings" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 7.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Service Bookings, Performance Standards & Obligations
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>7.1 Contract Formation Between Users:</strong> When a Client submits a booking and a Vendor accepts, a distinct bilateral service contract is formed exclusively between Client and Vendor. UrService is not a contractual party to that service fulfillment contract.
                </p>
                <p>
                  <strong>7.2 Vendor Performance Commitments:</strong> Vendors agree to maintain industry-standard craftsmanship, arrive within the designated scheduling window, use safe and certified diagnostic tools, treat client premises with professional care, and furnish transparent diagnostic explanations before undertaking paid repairs.
                </p>
                <p>
                  <strong>7.3 Client Cooperation & Site Safety:</strong> Clients agree to ensure a reasonably secure, hazard-free physical working environment, provide necessary electrical and water access where applicable, and remain accessible via registered contact channels during the scheduled appointment.
                </p>
              </div>
            </section>

            {/* Article 8.0 */}
            <section id="pricing-payments" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 8.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Service Pricing, Payment Settlement & Statutory Taxes
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>8.1 Autonomous Pricing Structure:</strong> Vendors establish their own baseline inspection charges, hourly rates, and service tariffs. UrService may display estimated quotation ranges based on category averages, but the final scope of work and agreed quotation remains an agreement between Client and Vendor.
                </p>
                <p>
                  <strong>8.2 Payment Settlement Channels:</strong> Transactions may be settled via the Platform&apos;s integrated payment gateway (supporting UPI, Credit/Debit instruments, and Net Banking) or through cash-on-delivery directly to the service provider, as indicated at booking confirmation.
                </p>
                <p>
                  <strong>8.3 Platform Facilitation Fees:</strong> UrService may charge a nominal technology convenience fee or commission to cover hosting, verification databases, and customer support infrastructure. All applicable fees and Goods and Services Tax (GST) are itemized prior to final confirmation.
                </p>
              </div>
            </section>

            {/* Article 9.0 */}
            <section id="cancellation-refunds" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 9.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Cancellation, Rescheduling & Refund Protocol
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>9.1 Client Cancellation Windows:</strong> Clients may cancel a booking without penalty up to two (2) hours prior to the scheduled appointment window. Cancellations initiated after a Vendor has physically departed for the site may incur a nominal mobilization fee.
                </p>
                <p>
                  <strong>9.2 Vendor Non-Performance:</strong> In the event that a confirmed Vendor fails to arrive without reasonable cause, the Client shall receive a full refund of any prepaid deposits and may be assisted with immediate priority re-dispatch to another verified professional.
                </p>
                <p>
                  <strong>9.3 Refund Processing SLA:</strong> Approved refunds are credited back to the original source instrument within 5 to 7 operational banking days in conformity with Reserve Bank of India (RBI) payment settlement guidelines.
                </p>
              </div>
            </section>

            {/* Article 10.0 */}
            <section id="prohibited-conduct" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 10.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  User Conduct, Platform Integrity & Prohibited Activities
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-3">
                <p>Users expressly agree not to engage in any of the following unauthorized or unlawful behaviors:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">Circumvention of Marketplace:</strong>
                    <span className="text-slate-600">Soliciting platform users to conduct off-platform payments to evade lawful platform fees.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">Identity Fraud & Impersonation:</strong>
                    <span className="text-slate-600">Using altered credentials, forged certificates, or masquerading as an authorized affiliate.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">Automated Scraping & Ingestion:</strong>
                    <span className="text-slate-600">Deploying bots, spiders, or automated scrapers to extract directory listings or vendor telephone numbers.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">Harassment & Malicious Feedback:</strong>
                    <span className="text-slate-600">Extortion, verbal abuse, discriminatory slurs, or posting fabricated defamatory customer reviews.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Article 11.0 */}
            <section id="intellectual-property" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 11.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Intellectual Property & Proprietary Rights
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>11.1 Proprietary Code & Brand Marks:</strong> The Platform architecture, UI styling, databases, APIs, algorithms, visual iconography, and the trademark &ldquo;UrService&rdquo; are the exclusive proprietary property of UrService Technologies Private Limited, protected under the <em>Trade Marks Act, 1999</em> and <em>Copyright Act, 1957</em>.
                </p>
                <p>
                  <strong>11.2 Limited User Content License:</strong> By posting service portfolio photos, business badges, or ratings, Users grant UrService a perpetual, irrevocable, worldwide, royalty-free license to index, display, format, and display such materials strictly for platform operations and discovery marketing.
                </p>
              </div>
            </section>

            {/* Article 12.0 */}
            <section id="liability-disclaimer" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 12.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Comprehensive Disclaimer of Warranties & Limitation of Liability
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>12.1 Exclusion of Indirect & Consequential Damages:</strong> To the fullest extent permissible by applicable law, in no event shall UrService, its promoters, directors, key managerial personnel, or employees be liable for any indirect, special, punitive, exemplary, incidental, or consequential damages, including loss of business profit, goodwill, domestic disruption, or data corruption.
                </p>
                <p>
                  <strong>12.2 Aggregate Liability Ceiling:</strong> The total aggregate financial liability of UrService arising under any cause of action relating to these Terms or marketplace services shall be strictly capped at the total technological facilitation fee received by UrService for the specific booking giving rise to the claim, or INR ₹2,500 (Two Thousand Five Hundred Indian Rupees), whichever is lower.
                </p>
              </div>
            </section>

            {/* Article 13.0 */}
            <section id="indemnification" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 13.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Mutual Indemnification Obligations
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  You agree to fully defend, indemnify, and hold harmless UrService, its corporate affiliates, officers, directors, and representatives from and against any third-party claims, liabilities, statutory penalties, damages, costs, and legal defense expenditures arising directly or indirectly from:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-xs sm:text-sm">
                  <li>Your breach of any warranty, representation, or covenant contained in these Terms.</li>
                  <li>Your violation of any applicable municipal, state, or central legislation.</li>
                  <li>Any physical injury, structural damage, or property destruction occasioned by your willful negligence or misconduct during service performance.</li>
                  <li>Infringement of third-party intellectual property rights in submitted portfolio media.</li>
                </ul>
              </div>
            </section>

            {/* Article 14.0 */}
            <section id="governing-law" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 14.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Governing Law, Dispute Resolution & Binding Arbitration
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>14.1 Governing Jurisdiction:</strong> These Terms shall be construed, interpreted, and governed in all respects in accordance with the substantive laws of the Republic of India, without regard to conflict of law principles.
                </p>
                <p>
                  <strong>14.2 Mandatory Amicable Conciliation:</strong> Prior to instituting formal legal proceedings, any aggrieved party must transmit a formal Written Dispute Notice to <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 text-xs">legal@urservice.in</code>. The parties agree to engage in thirty (30) days of good-faith conciliation.
                </p>
                <p>
                  <strong>14.3 Sole Arbitration:</strong> If unresolved through conciliation, the dispute shall be definitively adjudicated through binding arbitration administered in Hyderabad, Telangana, in conformity with the <em>Arbitration and Conciliation Act, 1996</em>. The tribunal shall consist of a sole arbitrator mutually appointed by the parties. Proceedings shall be conducted in English.
                </p>
                <p>
                  <strong>14.4 Exclusive Territorial Jurisdiction:</strong> Subject to arbitration, the courts having competent jurisdiction in <strong>Hyderabad, Telangana, India</strong> shall possess exclusive jurisdiction over any proceeding arising out of or in connection with these Terms.
                </p>
              </div>
            </section>

            {/* Article 15.0 */}
            <section id="grievance-officer" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Article 15.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Statutory Grievance Redressal Mechanism & Regulatory Notice
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  In accordance with Rule 3(2) of the <em>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</em> and the <em>Consumer Protection (E-Commerce) Rules, 2020</em>, the designated Grievance Officer details for UrService are published below:
                </p>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block text-xs">Designated Grievance Officer</span>
                      <strong className="text-slate-900 block mt-0.5">Legal Affairs & Redressal Cell</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Direct Redressal Email</span>
                      <a href="mailto:grievance@urservice.in" className="text-indigo-600 font-semibold block mt-0.5 hover:underline">
                        grievance@urservice.in
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Statutory Response SLA</span>
                      <span className="text-slate-800 block mt-0.5 font-medium">Acknowledgment within 24–48 hours</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Resolution Window</span>
                      <span className="text-slate-800 block mt-0.5 font-medium">Within 15 statutory business days</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Physical Redressal Desk: UrService Technologies Private Limited, Cyberabad Financial District, Hyderabad, Telangana — 500032, India.
                </p>
              </div>
            </section>

            {/* Bottom Institutional Sign-Off Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-base font-bold">Have regulatory or contractual questions?</h4>
                <p className="text-xs text-slate-400">Our compliance legal desk is available to clarify enterprise partner agreements.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/privacy"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  Read Privacy Policy
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="mailto:legal@urservice.in"
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
                >
                  Contact Legal Desk
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-all z-50 cursor-pointer print:hidden"
          aria-label="Scroll to top of legal agreement"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
