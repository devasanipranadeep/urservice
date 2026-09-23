'use client';

import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { apiClient, ApiError } from '../../../../../lib/api-client';

interface AnalyticsData {
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
}

export default function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const stats = await apiClient.get<AnalyticsData>('/api/vendors/me/analytics', { noCache: true });
        setData(stats);
      } catch (err: any) {
        setError(err instanceof ApiError ? err.detail : 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();

    const handleRefresh = () => {
      fetchAnalytics();
    };
    window.addEventListener('bookings-updated', handleRefresh);
    window.addEventListener('refresh-vendor-bookings', handleRefresh);

    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchAnalytics();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('urservice_sync_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'booking-created' || event.data?.type === 'booking-updated') {
            fetchAnalytics();
          }
        };
      }
    } catch (_) {}

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchAnalytics();
    }, 10000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('bookings-updated', handleRefresh);
      window.removeEventListener('refresh-vendor-bookings', handleRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      if (bc) bc.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return null; // Silent fail or fallback to zeros
  }

  const statItems = [
    {
      title: 'Total Bookings',
      value: data.total_bookings,
      icon: Calendar,
      color: 'text-indigo-600 border-indigo-200 bg-indigo-50',
    },
    {
      title: 'Completed Jobs',
      value: data.completed_bookings,
      icon: CheckCircle,
      color: 'text-emerald-600 border-emerald-200 bg-emerald-50',
    },
    {
      title: 'Active Bookings',
      value: data.pending_bookings,
      icon: Clock,
      color: 'text-amber-700 border-amber-200 bg-amber-50',
    },
    {
      title: 'Cancelled Jobs',
      value: data.cancelled_bookings,
      icon: XCircle,
      color: 'text-rose-600 border-rose-200 bg-rose-50',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-slate-800">Business Analytics</h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-md"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">{item.title}</span>
                <span className="text-2xl font-extrabold text-slate-900">{item.value}</span>
              </div>
              <div className={`p-3 rounded-lg border ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
