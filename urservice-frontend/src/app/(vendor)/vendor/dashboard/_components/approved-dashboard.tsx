'use client';

import AnalyticsPanel from './analytics-panel';
import BookingsPanel from './bookings-panel';
import ServicesPanel from './services-panel';
import { CreditCard, ArrowRight, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

interface Vendor {
  id: string;
  business_name: string;
  business_category: string;
  verification_status: string;
}

interface ApprovedDashboardProps {
  vendor: Vendor;
}

export default function ApprovedDashboard({ vendor }: ApprovedDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-50/50 via-slate-50 to-emerald-50/50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-emerald-600">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">Verified Professional Profile</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{vendor.business_name}</h2>
          <p className="text-slate-500 text-xs">
            Category: <span className="font-semibold text-slate-700">{vendor.business_category}</span>. Your services are now active and discoverable by clients.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 shrink-0">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Profile Live & Syncing</span>
        </div>
      </div>

      {/* Analytics Panel */}
      <AnalyticsPanel />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings (2/3 col) */}
        <div className="lg:col-span-2 space-y-8">
          <BookingsPanel />
        </div>

        {/* Services & Payments (1/3 col) */}
        <div className="space-y-8">
          <ServicesPanel />

          {/* Receive Payments ("coming soon" panel) */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300"></div>
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-md font-bold text-slate-800 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Receive Payments</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold tracking-wide uppercase">
                Coming Soon
              </span>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed">
              We are working on direct UPI and bank payout integrations. Soon you'll be able to receive customer payments instantly inside your bank account.
            </p>

            <div className="pt-2 flex items-center justify-between text-xs text-indigo-600 font-semibold cursor-not-allowed opacity-60">
              <span>Setup Payment Gateway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
