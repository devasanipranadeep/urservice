'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronUp, Shield, Database, Eye, ShieldCheck, Lock, Clock, UserCheck, Cookie, Users, RefreshCw, Mail, FileText } from 'lucide-react';
import Navbar from '../../components/Navbar';

const sections = [
  { id: 'collection', title: 'Information We Collect', icon: Database },
  { id: 'purpose', title: 'Purpose of Data Collection & Use', icon: Eye },
  { id: 'sharing', title: 'Data Sharing & Disclosure', icon: Users },
  { id: 'security', title: 'Data Security Measures', icon: Lock },
  { id: 'retention', title: 'Data Retention', icon: Clock },
  { id: 'rights', title: 'Your Rights & Choices', icon: UserCheck },
  { id: 'cookies', title: 'Cookies & Tracking Technologies', icon: Cookie },
  { id: 'children', title: 'Children\'s Privacy', icon: Shield },
  { id: 'updates', title: 'Changes to This Policy', icon: RefreshCw },
  { id: 'contact', title: 'Contact & Grievance Officer', icon: Mail },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sectionElements = sections.map(s => ({
        id: s.id,
        el: document.getElementById(s.id),
      }));

      let current = '';
      for (const sec of sectionElements) {
        if (sec.el) {
          const rect = sec.el.getBoundingClientRect();
          if (rect.top <= 140) {
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Document Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-500 mb-6 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Privacy & Data Security Policy
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  UrService Private Limited
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
              <span><strong className="text-slate-700">Effective Date:</strong> 1 August 2026</span>
              <span><strong className="text-slate-700">Last Updated:</strong> September 2026</span>
              <span><strong className="text-slate-700">Version:</strong> 2.0</span>
            </div>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              This Privacy & Data Security Policy (&ldquo;Policy&rdquo;) describes how UrService (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, stores, shares, and protects the personal information of Users who access or use the UrService platform. This Policy is compliant with the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 of India.
            </p>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              By registering on or using the Platform, you consent to the collection, use, and disclosure of your personal information as described in this Policy. If you do not agree with this Policy, please do not use the Platform.
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-10 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Table of Contents
          </h2>
          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            {sections.map((s, idx) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`group flex items-center gap-2 py-1.5 text-sm transition-colors rounded-lg hover:text-indigo-600 ${
                  activeSection === s.id ? 'text-indigo-600 font-semibold' : 'text-slate-600'
                }`}
              >
                <span className="text-xs font-mono text-slate-400 group-hover:text-indigo-400 w-5 shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {s.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">

          {/* Section 1: Information We Collect */}
          <section id="collection" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Section 1 — Information We Collect</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">1.1 — Information Collected from Clients</h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>Full name, email address, phone number, and city of residence.</li>
                  <li>GPS/location data to facilitate nearby service discovery.</li>
                  <li>Service booking history, preferences, and communication records.</li>
                  <li>Device information, IP address, and browser type for analytics and security.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">1.2 — Information Collected from Vendors (KYC Data)</h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li>Full name, date of birth, gender, phone number, and email address.</li>
                  <li>Government-issued identity documents: Aadhaar Card, PAN Card, Passport, or Driving License.</li>
                  <li>Business details: business name, category, description, address, years of experience, and service radius.</li>
                  <li>Business documentation: shop licenses, trade licenses, GST registration certificates, and category-specific certifications.</li>
                  <li>Profile photograph and business logo.</li>
                  <li>Bank account details for payment processing (account holder name, bank name, account number, IFSC code, UPI ID).</li>
                  <li>GPS coordinates of the primary service location.</li>
                </ul>
              </div>
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-900 font-medium">
                  <strong>Note:</strong> Vendor KYC data, including government IDs and verified identity records, may be disclosed to Clients and law enforcement authorities in cases of reported theft, property damage, or criminal misconduct as outlined in our{' '}
                  <Link href="/terms#theft-clause" className="text-indigo-600 hover:text-indigo-500 font-semibold underline underline-offset-2">Terms of Service (Article 5)</Link>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Purpose of Data Use */}
          <section id="purpose" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Section 2 — Purpose of Data Collection & Use</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p>We collect and process your personal information for the following purposes:</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <p><strong className="text-slate-800">2.1</strong> To create and manage your account, verify your identity, and authenticate access to the Platform.</p>
                <p><strong className="text-slate-800">2.2</strong> To facilitate service discovery, matching service requests from Clients with relevant Vendors based on location, category, and availability.</p>
                <p><strong className="text-slate-800">2.3</strong> To process service bookings, send appointment confirmations, reminders, and OTP/SMS notifications.</p>
                <p><strong className="text-slate-800">2.4</strong> To verify Vendor credentials through the mandatory KYC process and maintain platform safety.</p>
                <p><strong className="text-slate-800">2.5</strong> To process payments, generate invoices, and facilitate financial transactions between Clients and Vendors.</p>
                <p><strong className="text-slate-800">2.6</strong> To communicate important updates, policy changes, and promotional offers (with opt-out available).</p>
                <p><strong className="text-slate-800">2.7</strong> To monitor, analyse, and improve the Platform&apos;s performance, security, and user experience.</p>
                <p><strong className="text-slate-800">2.8</strong> To comply with legal obligations and respond to lawful requests from government authorities.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Data Sharing */}
          <section id="sharing" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Section 3 — Data Sharing & Disclosure</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">3.1</strong> We do not sell, rent, or trade your personal data to third-party advertisers or data brokers.</p>
              <p><strong className="text-slate-800">3.2</strong> Your data may be shared in the following necessary and limited circumstances:</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <p><strong className="text-slate-700">Between Client and Vendor:</strong> Limited contact and booking information is shared between parties to fulfill scheduled service bookings.</p>
                <p><strong className="text-slate-700">Law Enforcement & Legal Obligations:</strong> We may disclose personal information, including Vendor KYC data, to law enforcement agencies, courts, or regulatory authorities when required by law, court order, or in response to reports of theft, property damage, or criminal misconduct.</p>
                <p><strong className="text-slate-700">Service Providers:</strong> We may share data with trusted third-party service providers (e.g., payment processors, SMS gateway providers, cloud hosting) who assist in operating the Platform, subject to confidentiality obligations.</p>
                <p><strong className="text-slate-700">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, User data may be transferred as part of the transaction, with prior notice to affected Users.</p>
              </div>
            </div>
          </section>

          {/* Section 4: Data Security */}
          <section id="security" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Section 4 — Data Security Measures</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">4.1</strong> We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Encryption of data in transit using TLS/SSL protocols.</li>
                <li>Encrypted storage of sensitive data including passwords and identity documents.</li>
                <li>Role-based access controls ensuring only authorized personnel can access sensitive data.</li>
                <li>Regular security audits and vulnerability assessments.</li>
                <li>Secure authentication mechanisms including OTP-based phone verification.</li>
              </ul>
              <p><strong className="text-slate-800">4.2</strong> While we take reasonable measures to protect your data, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security and Users accept this inherent risk.</p>
            </div>
          </section>

          {/* Section 5: Data Retention */}
          <section id="retention" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Section 5 — Data Retention</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">5.1</strong> We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable law.</p>
              <p><strong className="text-slate-800">5.2</strong> Upon account deletion or termination, we will delete or anonymize your personal data within a reasonable timeframe, except where retention is required for:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Compliance with legal, regulatory, or tax obligations.</li>
                <li>Resolution of pending disputes or enforcement of agreements.</li>
                <li>Prevention of fraud and maintaining platform security records.</li>
              </ul>
              <p><strong className="text-slate-800">5.3</strong> Vendor KYC documents and identity records may be retained for a minimum period as mandated by applicable law, even after account termination.</p>
            </div>
          </section>

          {/* Section 6: Your Rights */}
          <section id="rights" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Section 6 — Your Rights & Choices</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p>Subject to applicable law, you have the following rights regarding your personal data:</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <p><strong className="text-slate-800">6.1 Right of Access:</strong> You may request a copy of the personal information we hold about you.</p>
                <p><strong className="text-slate-800">6.2 Right to Correction:</strong> You may request correction of inaccurate or incomplete personal information through your profile settings or by contacting support.</p>
                <p><strong className="text-slate-800">6.3 Right to Deletion:</strong> You may request deletion of your account and personal data, subject to our legal retention obligations.</p>
                <p><strong className="text-slate-800">6.4 Right to Withdraw Consent:</strong> You may withdraw your consent to data processing at any time, which may result in limited access to Platform features.</p>
                <p><strong className="text-slate-800">6.5 Right to Object:</strong> You may opt out of promotional communications at any time through your account settings or by following the unsubscribe instructions in our communications.</p>
              </div>
              <p className="text-xs text-slate-500">
                To exercise any of these rights, please contact our Grievance Officer at the details provided in Section 10 below.
              </p>
            </div>
          </section>

          {/* Section 7: Cookies */}
          <section id="cookies" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Cookie className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Section 7 — Cookies & Tracking Technologies</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">7.1</strong> The Platform uses cookies, local storage, and similar tracking technologies to enhance user experience, remember preferences, and collect usage analytics.</p>
              <p><strong className="text-slate-800">7.2</strong> Types of cookies we may use:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong>Essential Cookies:</strong> Required for Platform functionality, authentication, and security.</li>
                <li><strong>Analytics Cookies:</strong> Used to understand how Users interact with the Platform and improve our services.</li>
                <li><strong>Preference Cookies:</strong> Used to remember your settings and preferences.</li>
              </ul>
              <p><strong className="text-slate-800">7.3</strong> You can control cookie settings through your browser preferences. Disabling essential cookies may affect Platform functionality.</p>
            </div>
          </section>

          {/* Section 8: Children's Privacy */}
          <section id="children" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Section 8 — Children&apos;s Privacy</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">8.1</strong> The Platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors.</p>
              <p><strong className="text-slate-800">8.2</strong> If we become aware that we have inadvertently collected personal information from a child under 18, we will take prompt steps to delete such information from our systems.</p>
            </div>
          </section>

          {/* Section 9: Policy Updates */}
          <section id="updates" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Section 9 — Changes to This Policy</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">9.1</strong> We reserve the right to update or modify this Privacy Policy at any time. Changes will be effective upon posting the revised Policy on the Platform with an updated &ldquo;Last Updated&rdquo; date.</p>
              <p><strong className="text-slate-800">9.2</strong> For material changes that significantly affect how we process your personal data, we will make reasonable efforts to notify you via email, in-app notification, or a prominent notice on the Platform.</p>
              <p><strong className="text-slate-800">9.3</strong> Your continued use of the Platform after any changes to this Policy constitutes your acceptance of the revised terms.</p>
            </div>
          </section>

          {/* Section 10: Contact */}
          <section id="contact" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Section 10 — Contact & Grievance Officer</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-4">
              <p>For any questions, concerns, or complaints regarding this Privacy Policy or the handling of your personal data, please contact:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">General Support</h4>
                  <p><strong>UrService</strong></p>
                  <p>Email: <a href="mailto:support@urservice.in" className="text-indigo-600 hover:text-indigo-500 font-medium">support@urservice.in</a></p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Grievance Officer</h4>
                  <p>Email: <a href="mailto:grievance@urservice.in" className="text-indigo-600 hover:text-indigo-500 font-medium">grievance@urservice.in</a></p>
                  <p>Response Time: Within 48 hours</p>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Jurisdiction: Hyderabad, Telangana, India. All disputes related to this Privacy Policy shall be governed by the laws of India.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Acknowledgement */}
        <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-sm text-slate-600 leading-relaxed">
            By continuing to use the UrService platform, you acknowledge that you have read, understood, and consent to the data practices described in this Privacy & Data Security Policy.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link
              href="/terms"
              className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
            >
              Terms of Service →
            </Link>
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-700 font-semibold transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-500 transition-all z-50 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
