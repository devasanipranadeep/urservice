'use client';

import { Clock, ShieldAlert } from 'lucide-react';

interface Vendor {
  business_name: string;
  business_category: string;
  verification_status: string;
}

interface PendingViewProps {
  vendor: Vendor;
}

export default function PendingView({ vendor }: PendingViewProps) {
  const isUnderReview = vendor.verification_status === 'under_review';

  return (
    <div className="p-8 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto shadow-xl">
      <div className="relative">
        <div className="w-20 h-20 bg-amber-50 border-2 border-amber-400 rounded-full flex items-center justify-center text-amber-500 animate-pulse">
          <Clock className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-amber-550 text-white rounded-full p-1 border border-white">
          <ShieldAlert className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">
          {isUnderReview ? 'Profile Under Review' : 'Registration Pending'}
        </h2>
        <p className="text-slate-500 text-sm">
          For business: <span className="font-semibold text-slate-700">{vendor.business_name}</span> ({vendor.business_category})
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md">
        <p className="text-amber-700 font-medium text-sm">
          Your documents are under review. Estimated review time: 24–48 hours.
        </p>
        <p className="text-slate-500 text-xs mt-2">
          We will notify you via email and update your dashboard status as soon as the review is complete.
        </p>
      </div>
    </div>
  );
}
