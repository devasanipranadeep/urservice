'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../../../hooks/use-session';
import { supabase } from '../../../../lib/supabase';
import { apiClient, ApiError } from '../../../../lib/api-client';

import NotificationBell from '@/components/notification-bell';

// Component imports
import PendingView from './_components/pending-view';
import ApprovedDashboard from './_components/approved-dashboard';
import RejectedView from './_components/rejected-view';
import SuspendedView from './_components/suspended-view';

interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  business_category: string;
  verification_status: string;
  rejection_reason?: string | null;
  suspension_reason?: string | null;
}

export default function VendorDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSession();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendorProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Vendor>('/api/vendors/me');
      setVendor(data);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        // Not registered as a vendor yet: Redirect to registration wizard
        router.push('/register/vendor');
      } else {
        setError(err instanceof ApiError ? err.detail : 'Failed to fetch dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!vendor) {
      fetchVendorProfile();
    }
  }, [authLoading, user, vendor]);

  const handleLogout = async () => {
    router.push('/');
    setTimeout(async () => {
      await supabase.auth.signOut();
    }, 100);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 p-8 font-sans animate-pulse">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Dashboard Header Skeleton */}
          <div className="flex justify-between items-center border-b border-slate-200 pb-5">
            <div className="space-y-2 w-1/3">
              <div className="h-7 bg-slate-100 rounded-lg"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
            <div className="h-10 bg-slate-100 rounded-lg w-24"></div>
          </div>
          
          {/* Dashboard main layout skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto"></div>
              <div className="h-6 bg-slate-50 rounded w-2/3 mx-auto"></div>
              <div className="h-4 bg-slate-50 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="h-6 bg-slate-50 rounded w-1/4"></div>
                <div className="h-20 bg-slate-50 rounded-xl"></div>
                <div className="h-12 bg-slate-50 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Dashboard Shell Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-800">Vendor Space</h1>
            {vendor && (
              <p className="text-slate-500 text-xs font-mono">
                Vendor Account ID: {vendor.id}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-sm font-semibold rounded-lg text-rose-700 transition-colors shadow-sm"
            >
              Log Out
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Dashboard Branching on verification_status */}
        {vendor && (
          <div>
            {vendor.verification_status === 'pending' || vendor.verification_status === 'under_review' ? (
              <PendingView vendor={vendor} />
            ) : vendor.verification_status === 'approved' ? (
              <ApprovedDashboard vendor={vendor} />
            ) : vendor.verification_status === 'rejected' ? (
              <RejectedView vendor={vendor} onStatusChange={fetchVendorProfile} />
            ) : vendor.verification_status === 'suspended' ? (
              <SuspendedView vendor={vendor} />
            ) : (
              <div className="p-6 bg-white border border-slate-200 rounded-xl text-center">
                <p className="text-slate-500">Unknown verification status: {vendor.verification_status}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
