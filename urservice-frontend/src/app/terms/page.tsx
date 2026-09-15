'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronUp, Scale, ShieldCheck, ShieldAlert, AlertTriangle, UserCheck, Lock, FileText, CreditCard, XCircle, Gavel, Mail, BookOpen } from 'lucide-react';
import Navbar from '../../components/Navbar';

const sections = [
  { id: 'definitions', title: 'Definitions & Interpretation', icon: BookOpen },
  { id: 'scope', title: 'Platform Scope & Intermediary Role', icon: Scale },
  { id: 'eligibility', title: 'Eligibility & Account Registration', icon: UserCheck },
  { id: 'vendor-kyc', title: 'Vendor Verification & KYC Protocol', icon: ShieldCheck },
  { id: 'theft-clause', title: 'Theft, Property Damage & Legal Assistance', icon: AlertTriangle },
  { id: 'service-bookings', title: 'Service Bookings & Obligations', icon: FileText },
  { id: 'payments', title: 'Payment Terms & Pricing', icon: CreditCard },
  { id: 'cancellation', title: 'Cancellation & Refund Policy', icon: XCircle },
  { id: 'conduct', title: 'User Conduct & Prohibited Activities', icon: UserCheck },
  { id: 'ip', title: 'Intellectual Property', icon: Lock },
  { id: 'liability', title: 'Limitation of Liability', icon: ShieldAlert },
  { id: 'indemnification', title: 'Indemnification', icon: ShieldCheck },
  { id: 'privacy', title: 'Data Privacy & Account Termination', icon: Lock },
  { id: 'dispute', title: 'Dispute Resolution & Governing Law', icon: Gavel },
  { id: 'contact', title: 'Contact Information', icon: Mail },
];

export default function TermsOfServicePage() {
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
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Terms of Service
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
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Client&rdquo;, or &ldquo;Vendor&rdquo;) and UrService (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) governing your access to and use of the UrService platform, including our website, mobile applications, and all related services. By registering, accessing, or using any part of the platform, you acknowledge that you have read, understood, and agree to be bound by these Terms in their entirety.
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

          {/* Section 1: Definitions */}
          <section id="definitions" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 1 — Definitions & Interpretation</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p>In these Terms, unless the context otherwise requires, the following expressions shall have the meanings set forth below:</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <p><strong className="text-slate-800">1.1 &ldquo;Platform&rdquo;</strong> refers to the UrService website, mobile application, and all related digital properties operated by the Company.</p>
                <p><strong className="text-slate-800">1.2 &ldquo;Client&rdquo;</strong> means any registered individual or entity that uses the Platform to discover, request, or book services from Vendors.</p>
                <p><strong className="text-slate-800">1.3 &ldquo;Vendor&rdquo;</strong> means any independent service provider who registers on the Platform to offer professional services to Clients.</p>
                <p><strong className="text-slate-800">1.4 &ldquo;Services&rdquo;</strong> means the on-demand local services listed on the Platform, including but not limited to home repair, cleaning, beauty, healthcare, education, and other professional services.</p>
                <p><strong className="text-slate-800">1.5 &ldquo;KYC&rdquo;</strong> means Know Your Customer — the mandatory identity verification process applicable to all Vendor registrations.</p>
                <p><strong className="text-slate-800">1.6 &ldquo;Booking&rdquo;</strong> means a service request initiated by a Client and accepted or assigned to a Vendor through the Platform.</p>
              </div>
            </div>
          </section>

          {/* Section 2: Platform Scope */}
          <section id="scope" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 2 — Platform Scope & Intermediary Role</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">2.1</strong> UrService operates strictly as a digital intermediary marketplace designed to facilitate connections between Clients seeking local services and independent Vendors offering such services.</p>
              <p><strong className="text-slate-800">2.2</strong> The Company does not directly employ, supervise, or control Vendors listed on the Platform. All Vendors operate as independent contractors and are solely responsible for the quality, timeliness, and legality of the services they provide.</p>
              <p><strong className="text-slate-800">2.3</strong> Registration on UrService does not constitute an employment relationship, agency, partnership, joint venture, or franchise arrangement between the Company and any Vendor or Client.</p>
              <p><strong className="text-slate-800">2.4</strong> The Company reserves the right to modify, suspend, or discontinue any aspect of the Platform at any time without prior notice, subject to applicable law.</p>
            </div>
          </section>

          {/* Section 3: Eligibility */}
          <section id="eligibility" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 3 — Eligibility & Account Registration</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">3.1</strong> You must be at least 18 years of age and possess the legal capacity to enter into binding contracts under applicable Indian law to register on the Platform.</p>
              <p><strong className="text-slate-800">3.2</strong> You agree to provide accurate, current, and complete information during registration and to maintain the accuracy of such information throughout your use of the Platform.</p>
              <p><strong className="text-slate-800">3.3</strong> Each User is permitted to maintain only one active account. Multiple accounts created by the same individual or entity may be suspended or terminated without notice.</p>
              <p><strong className="text-slate-800">3.4</strong> You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
              <p><strong className="text-slate-800">3.5</strong> The Company reserves the right to refuse registration, suspend, or terminate any account at its sole discretion if these Terms are violated.</p>
            </div>
          </section>

          {/* Section 4: Vendor KYC */}
          <section id="vendor-kyc" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 4 — Vendor Verification & KYC Protocol</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">4.1</strong> All Vendors are required to undergo mandatory identity verification before their accounts are approved and listed on the Platform. Accepted identity documents include Aadhaar Card, PAN Card, Passport, and Driving License.</p>
              <p><strong className="text-slate-800">4.2</strong> Vendors must also submit valid business documentation, including but not limited to shop licenses, trade licenses, GST registration certificates, and category-specific certifications where applicable.</p>
              <p><strong className="text-slate-800">4.3</strong> While the Company takes diligent measures to verify the authenticity of submitted documents, Clients are advised to exercise standard precautions when granting service personnel physical entry into private premises.</p>
              <p><strong className="text-slate-800">4.4</strong> Submission of falsified, fraudulent, or expired documents shall result in immediate and permanent account termination, and the Company reserves the right to report such incidents to relevant authorities.</p>
            </div>
          </section>

          {/* Section 5: Theft Clause — Highlighted */}
          <section id="theft-clause" className="scroll-mt-28">
            <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-5">
                <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0 shadow-md">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-amber-950">
                    Article 5 — Theft, Property Damage & Legal Assistance Clause
                  </h2>
                  <p className="text-xs text-amber-800 mt-0.5 font-medium">Critical Legal Notice — Please Read Carefully</p>
                </div>
              </div>

              <div className="text-sm text-amber-900 leading-relaxed space-y-3">
                <p><strong className="text-amber-950">5.1</strong> Clients acknowledge and agree that service bookings are performed on-site by independent third-party Vendors. UrService explicitly disclaims all liability for any unlawful conduct, theft, property damage, or personal loss arising from services rendered by Vendors.</p>
                <p><strong className="text-amber-950">5.2</strong> UrService operates solely as an intermediary and does not provide on-site supervision, insurance, or guarantees regarding the conduct of Vendors.</p>
              </div>

              <div className="mt-5 p-4 bg-white/80 border border-amber-200/80 rounded-xl">
                <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider mb-3">
                  5.3 — Mandatory Cooperation Protocol in the Event of Theft or Criminal Misconduct:
                </h4>
                <div className="space-y-2.5 text-sm text-slate-800">
                  <div className="flex gap-3">
                    <span className="text-amber-600 font-bold shrink-0">I.</span>
                    <p>The Client must report any suspected incident immediately to local police authorities and file a First Information Report (FIR), and simultaneously notify UrService Support.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-amber-600 font-bold shrink-0">II.</span>
                    <p>Upon receiving a formal complaint supported by a police report (FIR) or initial evidence, the accused Vendor&apos;s account will be <strong>immediately suspended</strong> pending investigation.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-amber-600 font-bold shrink-0">III.</span>
                    <p>UrService Administration will release the Vendor&apos;s complete verified identity records — including Aadhaar/Government ID, business details, registered phone number, and physical address — directly to the Client and law enforcement authorities to facilitate legal investigation.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-amber-600 font-bold shrink-0">IV.</span>
                    <p>Following conclusion of investigation, if the complaint is substantiated, the Vendor&apos;s account shall be <strong>permanently terminated</strong> with no possibility of reinstatement.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Service Bookings */}
          <section id="service-bookings" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 6 — Service Bookings & Obligations</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">6.1</strong> Clients may browse available services and Vendors, submit booking requests, and schedule appointments through the Platform.</p>
              <p><strong className="text-slate-800">6.2</strong> Vendors are obligated to honour confirmed bookings, maintain professional standards, respect Client privacy, and adhere to agreed appointment schedules.</p>
              <p><strong className="text-slate-800">6.3</strong> The Company does not guarantee the availability of any specific Vendor or service at any given time.</p>
              <p><strong className="text-slate-800">6.4</strong> Both Clients and Vendors agree to communicate honestly and in good faith regarding service requirements, pricing, and scheduling through the Platform.</p>
            </div>
          </section>

          {/* Section 7: Payment Terms */}
          <section id="payments" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 7 — Payment Terms & Pricing</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">7.1</strong> Service pricing is determined by individual Vendors. The Company does not set, control, or guarantee the accuracy of service prices listed on the Platform.</p>
              <p><strong className="text-slate-800">7.2</strong> Payment for services may be processed through the Platform&apos;s integrated payment system or directly between the Client and Vendor, as applicable.</p>
              <p><strong className="text-slate-800">7.3</strong> The Company may charge a service fee or commission on transactions processed through the Platform. Such fees will be clearly disclosed prior to booking confirmation.</p>
              <p><strong className="text-slate-800">7.4</strong> All applicable taxes, including GST, are the responsibility of the respective parties as mandated by law.</p>
            </div>
          </section>

          {/* Section 8: Cancellation */}
          <section id="cancellation" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <XCircle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 8 — Cancellation & Refund Policy</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">8.1</strong> Clients may cancel a booking subject to the cancellation policy applicable at the time of booking. Cancellation policies, including any applicable fees, will be displayed prior to booking confirmation.</p>
              <p><strong className="text-slate-800">8.2</strong> Vendors who repeatedly cancel confirmed bookings without valid justification may have their accounts suspended or terminated.</p>
              <p><strong className="text-slate-800">8.3</strong> Refund eligibility and processing timelines will be governed by the specific cancellation policy associated with each booking and applicable payment provider terms.</p>
            </div>
          </section>

          {/* Section 9: Conduct */}
          <section id="conduct" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 9 — User Conduct & Prohibited Activities</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">9.1</strong> Users shall not engage in any of the following prohibited activities:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Providing false, misleading, or fraudulent information during registration or at any subsequent time.</li>
                <li>Harassment, abuse, threats, or discriminatory behaviour towards any other User.</li>
                <li>Submitting fraudulent or false booking requests, reviews, or complaints.</li>
                <li>Attempting to circumvent the Platform to transact directly in order to evade applicable fees.</li>
                <li>Engaging in any activity that violates applicable local, state, or national laws.</li>
                <li>Attempting to reverse engineer, decompile, or tamper with the Platform&apos;s software or infrastructure.</li>
              </ul>
              <p><strong className="text-slate-800">9.2</strong> Violation of any of the above may result in immediate account suspension or permanent termination, and the Company reserves the right to pursue legal remedies.</p>
            </div>
          </section>

          {/* Section 10: Intellectual Property */}
          <section id="ip" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 10 — Intellectual Property</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">10.1</strong> All content, trademarks, logos, designs, software code, and proprietary materials on the Platform are the exclusive intellectual property of UrService and are protected under applicable intellectual property laws.</p>
              <p><strong className="text-slate-800">10.2</strong> Users may not copy, reproduce, distribute, modify, or create derivative works from any Platform content without prior written consent from the Company.</p>
              <p><strong className="text-slate-800">10.3</strong> Content uploaded by Users (including Vendor profiles, photos, and descriptions) remains the property of the respective User; however, by uploading content to the Platform, Users grant the Company a non-exclusive, royalty-free license to use, display, and distribute such content in connection with the operation of the Platform.</p>
            </div>
          </section>

          {/* Section 11: Limitation of Liability */}
          <section id="liability" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 11 — Limitation of Liability</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">11.1</strong> To the maximum extent permitted by applicable law, UrService, its directors, officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Platform.</p>
              <p><strong className="text-slate-800">11.2</strong> The Company&apos;s total aggregate liability to any User for any claims arising out of these Terms shall not exceed the total amount of fees paid by that User to the Company in the twelve (12) months preceding the event giving rise to the claim.</p>
              <p><strong className="text-slate-800">11.3</strong> The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
            </div>
          </section>

          {/* Section 12: Indemnification */}
          <section id="indemnification" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 12 — Indemnification</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">12.1</strong> You agree to indemnify, defend, and hold harmless UrService, its directors, officers, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Your use of or access to the Platform.</li>
                <li>Your violation of these Terms or any applicable law or regulation.</li>
                <li>Any content you submit, post, or transmit through the Platform.</li>
                <li>Your infringement of any third party&apos;s rights, including intellectual property rights.</li>
              </ul>
            </div>
          </section>

          {/* Section 13: Privacy & Termination */}
          <section id="privacy" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 13 — Data Privacy & Account Termination</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">13.1</strong> User personal data is collected, processed, and stored in accordance with our{' '}
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 font-semibold underline underline-offset-2">Privacy Policy</Link>,
                which forms an integral part of these Terms.
              </p>
              <p><strong className="text-slate-800">13.2</strong> The Company reserves the unilateral right to refuse service, suspend, or permanently terminate any account that violates these Terms, engages in misconduct, or poses a safety risk to other Users.</p>
              <p><strong className="text-slate-800">13.3</strong> Upon account termination, the Company may retain certain User data as required by law or for legitimate business purposes, subject to the Privacy Policy.</p>
            </div>
          </section>

          {/* Section 14: Dispute Resolution */}
          <section id="dispute" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Gavel className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 14 — Dispute Resolution & Governing Law</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p><strong className="text-slate-800">14.1</strong> These Terms shall be governed by and construed in accordance with the laws of India.</p>
              <p><strong className="text-slate-800">14.2</strong> Any dispute arising out of or in connection with these Terms shall first be attempted to be resolved through good-faith negotiation between the parties.</p>
              <p><strong className="text-slate-800">14.3</strong> If negotiation fails, disputes shall be referred to binding arbitration under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be Hyderabad, Telangana, India.</p>
              <p><strong className="text-slate-800">14.4</strong> The courts of Hyderabad, Telangana shall have exclusive jurisdiction over any matters not subject to arbitration.</p>
            </div>
          </section>

          {/* Section 15: Contact */}
          <section id="contact" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Article 15 — Contact Information</h2>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p>For any questions, concerns, or notices regarding these Terms of Service, please contact us at:</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <p><strong className="text-slate-800">UrService</strong></p>
                <p>Email: <a href="mailto:support@urservice.in" className="text-indigo-600 hover:text-indigo-500 font-medium">support@urservice.in</a></p>
                <p>Jurisdiction: Hyderabad, Telangana, India</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Acknowledgement */}
        <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-sm text-slate-600 leading-relaxed">
            By continuing to register, access, or use the UrService platform, you confirm that you have read, understood, and agree to comply with all terms stated above.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
            >
              Privacy Policy →
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
