'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Calendar, User, Phone, Mail, Award, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { apiClient, ApiError } from '../../../../../lib/api-client';
import { supabase } from '../../../../../lib/supabase';

interface ServiceDetail {
  id: string;
  name: string;
  price: number;
}

interface ClientDetail {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
}

interface Booking {
  id: string;
  client_id: string;
  vendor_id: string;
  service_id: string;
  status: string;
  scheduled_at: string;
  created_at: string;
  service?: ServiceDetail | null;
  client?: BookingClientDetail | null;
}

type BookingClientDetail = ClientDetail;

interface BookingsPanelProps {
  isReadOnly?: boolean;
}

export default function BookingsPanel({ isReadOnly = false }: BookingsPanelProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDateTime, setNewDateTime] = useState('');
  const isFetchingRef = useRef(false);

  const fetchBookings = useCallback(async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const list = await apiClient.get<Booking[]>('/api/bookings/vendor/me', { noCache: true });
      setBookings((prev) => {
        // If new bookings arrived during silent background update, broadcast events
        if (silent && list.length > prev.length) {
          window.dispatchEvent(new Event('bookings-updated'));
          window.dispatchEvent(new Event('refresh-notifications'));
        }
        return list;
      });
    } catch (err: any) {
      if (!silent) {
        setError(err instanceof ApiError ? err.detail : 'Failed to fetch bookings.');
      }
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const updated = await apiClient.patch<Booking>(`/api/bookings/${bookingId}`, {
        status: newStatus,
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: updated.status } : b))
      );
      window.dispatchEvent(new Event('bookings-updated'));
      window.dispatchEvent(new Event('refresh-notifications'));

      // Broadcast update across browser tabs
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('urservice_sync_channel');
          bc.postMessage({ type: 'booking-updated', booking_id: bookingId, status: updated.status });
          bc.close();
        }
      } catch (_) {}
    } catch (err: any) {
      setError(err instanceof ApiError ? err.detail : 'Failed to update booking status.');
    }
  };

  const startReschedule = (bookingId: string, currentVal: string) => {
    setReschedulingId(bookingId);
    try {
      const d = new Date(currentVal);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setNewDateTime(localISOTime);
    } catch {
      setNewDateTime('');
    }
  };

  const handleSaveReschedule = async (bookingId: string) => {
    if (!newDateTime) return;
    try {
      const updated = await apiClient.patch<Booking>(`/api/bookings/${bookingId}`, {
        scheduled_at: new Date(newDateTime).toISOString(),
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, scheduled_at: updated.scheduled_at } : b
        )
      );
      setReschedulingId(null);
      window.dispatchEvent(new Event('bookings-updated'));
      window.dispatchEvent(new Event('refresh-notifications'));

      // Broadcast reschedule across browser tabs
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('urservice_sync_channel');
          bc.postMessage({ type: 'booking-updated', booking_id: bookingId, scheduled_at: updated.scheduled_at });
          bc.close();
        }
      } catch (_) {}
    } catch (err: any) {
      setError(err instanceof ApiError ? err.detail : 'Failed to reschedule booking.');
    }
  };

  useEffect(() => {
    fetchBookings(false);

    // 1. Live background polling every 4 seconds
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchBookings(true);
    }, 4000);

    // 2. Immediate refresh when vendor tab gains focus or becomes visible
    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchBookings(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // 3. Instant cross-tab sync via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('urservice_sync_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'booking-created' || event.data?.type === 'booking-updated') {
            fetchBookings(true);
          }
        };
      }
    } catch (_) {}

    // 4. Supabase Realtime channel listener for instant push updates
    const channel = supabase
      .channel('vendor-live-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchBookings(true);
        }
      )
      .subscribe();

    // 5. Custom trigger listeners within current window
    const handleCustomTrigger = () => {
      fetchBookings(true);
    };
    window.addEventListener('refresh-vendor-bookings', handleCustomTrigger);
    window.addEventListener('bookings-updated', handleCustomTrigger);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      if (bc) bc.close();
      supabase.removeChannel(channel);
      window.removeEventListener('refresh-vendor-bookings', handleCustomTrigger);
      window.removeEventListener('bookings-updated', handleCustomTrigger);
    };
  }, [fetchBookings]);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'requested':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'confirmed':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-lg animate-pulse">
        <div className="h-6 w-1/4 bg-slate-200 rounded"></div>
        <div className="h-40 bg-slate-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-lg">
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span>Job Bookings</span>
        </h3>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => fetchBookings(true)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Refresh bookings list"
            aria-label="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {bookings.length} Total
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12 space-y-3 bg-slate-50 border border-slate-200 rounded-xl">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-700 text-sm font-semibold">No bookings scheduled yet</p>
          <p className="text-slate-400 text-xs">When clients book your services, they will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
          {bookings.map((booking) => {
            const isPending = booking.status.toLowerCase() === 'requested';
            const isConfirmed = booking.status.toLowerCase() === 'confirmed';
            const isInProgress = booking.status.toLowerCase() === 'in_progress';
            const isCancellable =
              booking.status.toLowerCase() !== 'cancelled' &&
              booking.status.toLowerCase() !== 'completed';

            return (
              <div
                key={booking.id}
                className="p-4 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-700 text-sm transition-all"
              >
                {/* Details Section */}
                <div className="space-y-2 flex-1">
                  <div className="font-semibold text-slate-800 text-sm md:text-base flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{booking.service?.name || 'Service Listing'}</span>
                    {isPending && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                        New Request
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-indigo-600 font-medium space-y-1">
                    <div>
                      Client:{' '}
                      <span className="text-slate-700 font-semibold">
                        {booking.client?.full_name || 'Client'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal flex flex-wrap gap-x-3 gap-y-1">
                      {booking.client?.email && (
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{booking.client.email}</span>
                        </span>
                      )}
                      {booking.client?.phone && (
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{booking.client.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(booking.scheduled_at)}</span>
                    {booking.service?.price && (
                      <span className="text-slate-700 pl-2 border-l border-slate-200 font-mono font-semibold">
                        ₹{booking.service.price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions & Status Section */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 self-end md:self-center">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${getStatusBadgeClass(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>

                  {!isReadOnly && (
                    <div className="flex items-center gap-2">
                      {reschedulingId === booking.id ? (
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 bg-white border border-slate-200 rounded-xl p-2 shadow-md">
                          <input
                            type="datetime-local"
                            value={newDateTime}
                            onChange={(e) => setNewDateTime(e.target.value)}
                            className="bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 font-sans"
                          />
                          <div className="flex gap-1.5 mt-1 sm:mt-0">
                            <button
                              onClick={() => handleSaveReschedule(booking.id)}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xxs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setReschedulingId(null)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xxs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {isConfirmed && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                            >
                              Start Job
                            </button>
                          )}
                          {isInProgress && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'completed')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                          )}
                          {isCancellable && (
                            <button
                              onClick={() => startReschedule(booking.id, booking.scheduled_at)}
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                              Reschedule
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
