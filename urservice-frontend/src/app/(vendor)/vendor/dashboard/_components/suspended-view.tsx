'use client';

import { ShieldAlert } from 'lucide-react';
import BookingsPanel from './bookings-panel'; // Shared bookings list component
import ServicesPanel from './services-panel';

interface Vendor {
  id: string;
  business_name: string;
  suspension_reason?: string | null;
}

interface SuspendedViewProps {
  vendor: Vendor;
}

export default function SuspendedView({ vendor }: SuspendedViewProps) {
  return (
    <div className="space-y-8">
      {/* Suspension Alert banner */}
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-4 shadow-xl">
        <div className="p-3 bg-rose-100 border border-rose-200 text-rose-600 rounded-xl">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-rose-700">Account Suspended</h2>
          <p className="text-slate-700 text-sm font-medium">
            Reason: {vendor.suspension_reason || 'Suspended by administrator due to policy violation.'}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            During suspension, all service creations and updates are disabled. Your profile is hidden from client searches, but you can view your past bookings and list of services below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Read-only Bookings */}
          <BookingsPanel isReadOnly={true} />
        </div>
        <div className="space-y-8">
          {/* Read-only Services */}
          <ServicesPanel isReadOnly={true} />
        </div>
      </div>
    </div>
  );
}
