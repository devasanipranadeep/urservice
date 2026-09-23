'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronUp,
  Shield,
  Database,
  Lock,
  Clock,
  UserCheck,
  Cookie,
  Users,
  Mail,
  FileText,
  Printer,
  Search,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Server,
  FileCheck2
} from 'lucide-react';
import Navbar from '../../components/Navbar';

interface Section {
  id: string;
  num: string;
  title: string;
  keywords: string;
}

const sections: Section[] = [
  { id: 'framework', num: '1.0', title: 'Statutory Framework & Data Fiduciary Designation', keywords: 'framework dpdp act 2023 data fiduciary principal compliance it act' },
  { id: 'data-collected', num: '2.0', title: 'Categories of Personal Data Collected', keywords: 'client vendor data collection kyc aadhaar pan phone location' },
  { id: 'processing-purposes', num: '3.0', title: 'Lawful Grounds & Specific Purposes for Processing', keywords: 'purpose legitimate consent fulfillment verification matching dispatch' },
  { id: 'disclosure-channels', num: '4.0', title: 'Authorized Data Disclosures & Processors', keywords: 'third party sharing processors cloud supabase payments sms' },
  { id: 'law-enforcement-disclosure', num: '5.0', title: 'Law Enforcement Requisition & Emergency Disclosure', keywords: 'police fir theft investigation section 91 criminal disclosure crpc bnss' },
  { id: 'security-architecture', num: '6.0', title: 'Cryptographic Security & Access Controls', keywords: 'security encryption tls ssl aes-256 rbac passwords hashing audit' },
  { id: 'retention-archival', num: '7.0', title: 'Data Retention, Archival & Purging Protocol', keywords: 'retention archival deletion destruction time limits logs' },
  { id: 'principal-rights', num: '8.0', title: 'Statutory Rights of Data Principals', keywords: 'rights access correction erasure withdrawal nomination dpdp' },
  { id: 'cookies-telemetry', num: '9.0', title: 'Cookies, Local Storage & Telemetry', keywords: 'cookies session local storage tokens analytics tracking' },
  { id: 'minors-protection', num: '10.0', title: 'Protection of Minors & Age Restrictions', keywords: 'children minors 18 consent guardian age parental' },
  { id: 'cloud-infrastructure', num: '11.0', title: 'Cloud Hosting & Data Sovereignty', keywords: 'cloud infrastructure hosting sovereignty india residency' },
  { id: 'grievance-redressal', num: '12.0', title: 'Data Protection Officer & Redressal Mechanism', keywords: 'grievance officer contact dpo redressal data protection board' },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('framework');
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
            <span className="text-slate-900 font-semibold">Privacy Policy</span>
          </div>

          {/* Quick Legal Switcher & Print Control */}
          <div className="flex items-center gap-2.5">
            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
              <Link
                href="/terms"
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 transition-colors rounded-lg"
              >
                Terms of Service
              </Link>
              <span className="px-3 py-1.5 bg-white text-indigo-700 rounded-lg shadow-xs font-bold">
                Privacy & Data Policy
              </span>
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
              <Shield className="w-3.5 h-3.5" />
              <span>DPDP Act 2023 & IT Act 2000 Statutory Policy</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Privacy & Personal Data Protection Policy
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              This charter articulates the operational methodologies applied by UrService in collecting, securing, processing, and governing the lifecycle of digital personal data.
            </p>

            {/* Document Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Designated Data Fiduciary</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> UrService Tech Pvt. Ltd.
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Primary Legislative Base</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  DPDP Act 2023 / IT Rules
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Last Formal Audit</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  24 September 2026
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Regulatory Status</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Compliant & In Force
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 2-Column Responsive Layout: Sticky TOC + Legal Content */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
          
          {/* Left Sidebar: Sticky Table of Contents (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6 print:hidden">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" /> Privacy Charter Index
                </span>
                <span className="text-[11px] font-mono text-slate-400">12 Sections</span>
              </div>

              {/* Clause Filter Search */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter privacy terms..."
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

            {/* Quick Privacy Commitment Badge */}
            <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Zero Data Monetization Pledge</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                UrService does not sell, rent, monetize, or lease personal identifiers, telephone numbers, or behavioral telemetry to external ad brokers or data markets.
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Privacy Desk:</span>
                <a href="mailto:privacy@urservice.in" className="text-indigo-600 font-semibold hover:underline">
                  privacy@urservice.in
                </a>
              </div>
            </div>
          </aside>

          {/* Right Main Column: Formal Privacy Sections */}
          <div className="lg:col-span-8 space-y-10">

            {/* Section 1.0 */}
            <section id="framework" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Section 1.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Statutory Framework, Applicability & Data Fiduciary Designation
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>1.1 Legislative Basis:</strong> This Privacy Policy (&ldquo;Policy&rdquo;) is formulated in rigorous adherence to the <em>Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;)</em>, Section 43A of the <em>Information Technology Act, 2000</em>, and the <em>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (&ldquo;SPDI Rules&rdquo;)</em>.
                </p>
                <p>
                  <strong>1.2 Designation of Roles:</strong> For the purposes of processing personal data across the UrService platform:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700 text-xs sm:text-sm">
                  <li><strong>Data Fiduciary:</strong> <strong>UrService Technologies Private Limited</strong>, determining the purposes and means of personal data processing.</li>
                  <li><strong>Data Principal:</strong> Any individual user (whether registering as a Consumer/Client or as a Service Partner/Vendor) to whom personal data directly relates.</li>
                  <li><strong>Data Processors:</strong> Contracted infrastructure and technology entities that process data strictly upon documented instructions from UrService.</li>
                </ul>
                <p>
                  <strong>1.3 Jurisdictional Scope:</strong> This Policy applies to all digital personal data collected online via our web domains, progressive web applications, customer support ticketing channels, and partner verification portals throughout the territory of India.
                </p>
              </div>
            </section>

            {/* Section 2.0 */}
            <section id="data-collected" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Section 2.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Categories of Personal Data Collected
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>We process discrete data categories tailored strictly to user classification and operational necessity:</p>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      2.1 Consumer / Client Data
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs pl-1">
                      <li><strong>Identity & Contact Markers:</strong> Full legal name, verified mobile phone number, and authenticated email address.</li>
                      <li><strong>Location & Service Coordinates:</strong> Domestic or commercial service address, city, pin code, and real-time device geolocation (strictly upon active user authorization to determine vendor proximity).</li>
                      <li><strong>Booking History & Communications:</strong> Service requirements, selected appointment slots, past invoices, customer feedback, and in-app customer support chat logs.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      2.2 Service Partner / Vendor Data (Mandatory KYC Dossier)
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs pl-1">
                      <li><strong>Statutory Identity Credentials:</strong> Government photo IDs (Aadhaar Card, Permanent Account Number [PAN], Driving License, or Passport) submitted for administrative identity verification.</li>
                      <li><strong>Commercial Documentation:</strong> Business trade name, Shop & Establishment registration, GSTIN certificate, trade certifications, and registered business premises address.</li>
                      <li><strong>Biometric / Photographic Verification:</strong> Clear digital facial portrait photographs matching submitted identification credentials.</li>
                      <li><strong>Disbursement Banking Data:</strong> Bank account holder name, account number, IFSC code, and UPI virtual payment address strictly for booking compensation settlement.</li>
                      <li><strong>Service Telemetry:</strong> Primary service operating coordinates, service category tags, and historical customer rating aggregates.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-indigo-600" />
                      2.3 Automated Telemetry & Machine Metadata
                    </h4>
                    <p className="text-xs text-slate-600">
                      Standard technical metadata including Internet Protocol (IP) addresses, browser user-agent strings, device operating system versions, and session access timestamps collected automatically for cyber-defense monitoring and session persistence.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3.0 */}
            <section id="processing-purposes" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Section 3.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Lawful Grounds & Specific Purposes for Processing
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  Under Section 4 and Section 7 of the DPDP Act 2023, UrService processes personal data exclusively under specified lawful bases:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">Performance of Service Contract:</strong>
                    <span className="text-slate-600">Facilitating matching, dispatching appointment schedules, transmitting real-time alerts, and processing settlement disbursements.</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">Mandatory Regulatory KYC Vetting:</strong>
                    <span className="text-slate-600">Administering thorough background and credential validation to prevent unauthorized or fraudulent service professionals on the platform.</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">Platform Security & Fraud Prevention:</strong>
                    <span className="text-slate-600">Preventing credential abuse, account takeover, illegal circumvention, and denial-of-service cyber disruptions.</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">Statutory Compliance:</strong>
                    <span className="text-slate-600">Meeting mandatory tax accounting (GST), corporate audit standards, and responding to judicial or law enforcement summonses.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4.0 */}
            <section id="disclosure-channels" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Section 4.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Authorized Data Disclosures & Contracted Processors
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>4.1 Inter-User Marketplace Coordination:</strong> To enable physical fulfillment of a confirmed Marketplace Booking, limited operational data is shared bilaterally:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600 text-xs sm:text-sm">
                  <li>The Vendor receives the Client&apos;s specified first name, scheduled address, and booking requirement description.</li>
                  <li>The Client receives the Vendor&apos;s verified trade name, photo portrait, historical rating score, and direct telephone contact.</li>
                </ul>
                <p>
                  <strong>4.2 Certified Infrastructure Sub-Processors:</strong> UrService engages leading enterprise cloud vendors bound by strict non-disclosure obligations:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <span><strong>Database & Auth Hosting:</strong> Supabase Cloud Infrastructure</span>
                    <span className="font-mono text-slate-500">ISO 27001 / SOC 2</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <span><strong>Payment Processing Gateway:</strong> RBI-Authorized Payment Aggregators</span>
                    <span className="font-mono text-slate-500">PCI-DSS Level 1</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <span><strong>Telephony & SMS Delivery:</strong> Telecom Regulatory Authority of India (TRAI) DLT Gateways</span>
                    <span className="font-mono text-slate-500">TRAI Compliant</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5.0 — Mandatory Law Enforcement Disclosure */}
            <section id="law-enforcement-disclosure" className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-amber-600">Section 5.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Law Enforcement Requisition & Emergency Criminal Investigation Protocol
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <div className="p-4 bg-slate-50 border-l-4 border-amber-500 rounded-r-xl">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Statutory Notice on Intermediary Disclosure Obligations
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Personal data protection rights under the DPDP Act 2023 are subject to statutory exemptions under Section 17 for the prevention, detection, investigation, or prosecution of offenses under Indian law.
                  </p>
                </div>

                <p>
                  <strong>5.1 Formal Police Requisition Compliance:</strong> Pursuant to Section 91 of the Code of Criminal Procedure, 1973 (CrPC) and Section 94 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS), UrService is legally compelled to cooperate with investigating officers of state police departments, the Central Bureau of Investigation (CBI), and cybercrime cells.
                </p>
                <p>
                  <strong>5.2 Disclosure of Vendor KYC Dossier in Criminal Incidents:</strong> As explicitly agreed by all Vendors upon onboarding (and detailed in Article 6 of the Terms of Service), in the event of an FIR or official police complaint alleging theft, property destruction, bodily harm, or unlawful acts occurring during an active booking:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700 text-xs sm:text-sm">
                  <li>UrService shall immediately disclose the accused Vendor&apos;s verified government identity documents (Aadhaar/PAN/Passport), registered permanent domicile address, phone records, and GPS check-in logs to the investigating authority.</li>
                  <li>Relevant verification credentials shall also be furnished directly to the affected Client to enable legal complaint filing and judicial redressal.</li>
                </ul>
              </div>
            </section>

            {/* Section 6.0 */}
            <section id="security-architecture" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Section 6.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Cryptographic Security Standards & Access Architecture
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  UrService deploys defense-in-depth security controls in compliance with Rule 8 of the Information Technology (SPDI) Rules, 2011:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">End-to-End Transport Encryption:</strong>
                    <span className="text-slate-600">All data in transit is encrypted using Transport Layer Security (TLS 1.3) protocols with strict forward secrecy.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">Storage Cryptography:</strong>
                    <span className="text-slate-600">Databases and identity document buckets are encrypted at rest using Advanced Encryption Standard (AES-256).</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">Role-Based Access Control (RBAC):</strong>
                    <span className="text-slate-600">Access to sensitive KYC documents is strictly restricted to verified administrative clearance personnel via audited access logs.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <strong className="text-slate-900 block">Cryptographic Credential Hashing:</strong>
                    <span className="text-slate-600">User passwords and session tokens are salted and hashed using Argon2/Bcrypt. Raw plaintext passwords are never stored.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7.0 */}
            <section id="retention-archival" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Section 7.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Data Retention, Archival & Automated Purging Protocol
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>7.1 Purpose Limitation:</strong> Personal data is maintained only for the duration essential to accomplish the purposes articulated in Section 3, unless statutory retention mandates apply.
                </p>
                <p>
                  <strong>7.2 Retention Schedule:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600 text-xs sm:text-sm">
                  <li><strong>Active Client Accounts:</strong> Data retained during active tenancy and for 180 days following account closure.</li>
                  <li><strong>Financial & Transactional Records:</strong> Retained for eight (8) statutory years in compliance with Section 128 of the Companies Act, 2013 and Goods & Services Tax regulations.</li>
                  <li><strong>Vendor KYC Verification Files:</strong> Retained for a minimum period of five (5) years following profile termination to preserve auditability for consumer dispute tribunals.</li>
                  <li><strong>Transient Geolocation Coordinates:</strong> Purged from operational servers within thirty (30) days of booking completion.</li>
                </ul>
              </div>
            </section>

            {/* Section 8.0 */}
            <section id="principal-rights" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Section 8.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Statutory Rights of Data Principals under DPDP Act 2023
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  As a Data Principal, you possess statutory rights enforceable through our Data Protection Officer:
                </p>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <strong className="text-slate-900 block">8.1 Right to Access Summary of Personal Data (Section 11):</strong>
                    <span className="text-slate-600">You may request an electronic summary of personal data held by UrService, including identities of data processors with whom data has been shared.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <strong className="text-slate-900 block">8.2 Right to Correction & Erasure (Section 12):</strong>
                    <span className="text-slate-600">You may rectify obsolete contact credentials or request complete erasure of your profile, subject to statutory retention exceptions.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <strong className="text-slate-900 block">8.3 Right of Grievance Redressal (Section 13):</strong>
                    <span className="text-slate-600">You are entitled to prompt resolution of privacy concerns through our institutional grievance officer before escalating to regulatory bodies.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <strong className="text-slate-900 block">8.4 Right to Nominate (Section 14):</strong>
                    <span className="text-slate-600">You may nominate any authorized individual to exercise your data principal rights in the event of death or incapacity.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9.0 */}
            <section id="cookies-telemetry" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Section 9.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Cookies, Session Tokens & Analytical Telemetry
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  <strong>9.1 Functional Session Tokens:</strong> UrService utilizes cryptographically signed JSON Web Tokens (JWT) and secure HTTP cookies strictly necessary to sustain authenticated login sessions and prevent cross-site request forgery (CSRF).
                </p>
                <p>
                  <strong>9.2 Absence of Third-Party Tracking Pixels:</strong> We do not deploy unauthorized third-party commercial advertising trackers or behavioral social-media tracking pixels across our transactional booking workflows.
                </p>
              </div>
            </section>

            {/* Section 10.0 */}
            <section id="minors-protection" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Section 10.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Protection of Minors & Processing Prohibitions
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  In compliance with Section 9 of the DPDP Act 2023, UrService does not knowingly register, process data of, or direct services toward children under the age of eighteen (18) without verified parental/guardian consent. UrService does not undertake behavioral tracking or targeted marketing directed at minors. Any minor account identified without legal guardianship shall be permanently terminated within 24 hours.
                </p>
              </div>
            </section>

            {/* Section 11.0 */}
            <section id="cloud-infrastructure" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Section 11.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Cloud Infrastructure, Hosting & Data Sovereignty
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  Primary database clusters, authentication directories, and KYC document repositories utilized by UrService are physically located within sovereign Indian cloud data regions (Mumbai / Hyderabad). Any cross-border transmission of metadata for global CDN routing strictly conforms with governmental directives notified under Section 16 of the DPDP Act 2023.
                </p>
              </div>
            </section>

            {/* Section 12.0 */}
            <section id="grievance-redressal" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs scroll-mt-28">
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-mono font-bold text-indigo-600">Section 12.0</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Statutory Grievance Redressal Officer & Data Protection Board Recourse
                </h2>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>
                  For any inquiry, grievance, or rights request concerning this Privacy Charter or personal data processing, please address our appointed Data Protection & Grievance Officer:
                </p>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block text-xs">Appointed Grievance Officer</span>
                      <strong className="text-slate-900 block mt-0.5">Data Protection & Regulatory Cell</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Direct Privacy Communications</span>
                      <a href="mailto:privacy@urservice.in" className="text-indigo-600 font-semibold block mt-0.5 hover:underline">
                        privacy@urservice.in
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Statutory Response SLA</span>
                      <span className="text-slate-800 block mt-0.5 font-medium">Initial acknowledgment within 48 hours</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Final Redressal Window</span>
                      <span className="text-slate-800 block mt-0.5 font-medium">Within 30 calendar days</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Regulatory Escalation Notice: If an aggrieved Data Principal is dissatisfied with the resolution afforded by the Grievance Officer, they maintain the statutory right to escalate their complaint to the <strong>Data Protection Board of India</strong> pursuant to Section 13(4) of the DPDP Act, 2023.
                </p>
              </div>
            </section>

            {/* Bottom Institutional Sign-Off Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-base font-bold">Need assistance with your personal data?</h4>
                <p className="text-xs text-slate-400">Our privacy and data compliance team is dedicated to safeguarding user trust.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/terms"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  View Terms of Service
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="mailto:privacy@urservice.in"
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
                >
                  Contact Privacy Desk
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
          aria-label="Scroll to top of privacy charter"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
