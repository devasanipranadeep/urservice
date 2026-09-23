'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X, Clock } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api-client';
import { useSession } from '@/hooks/use-session';

interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationFeedResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface UnreadCountResponse {
  count: number;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, isLoading } = useSession();

  const isFetchingCountRef = useRef(false);

  // Fetch count of unread notifications
  const fetchUnreadCount = async () => {
    if (!isAuthenticated || isFetchingCountRef.current) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    isFetchingCountRef.current = true;
    try {
      const res = await apiClient.get<UnreadCountResponse>('/api/notifications/me/unread-count');
      setUnreadCount(res.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    } finally {
      isFetchingCountRef.current = false;
    }
  };

  // Fetch recent notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await apiClient.get<NotificationFeedResponse>('/api/notifications/me?page=1&page_size=20');
      setNotifications(res.items);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mark a specific notification as read
  const handleMarkAsRead = async (id: string, isAlreadyRead: boolean) => {
    if (isAlreadyRead) return;
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(c - 1, 0));

      await apiClient.patch(`/api/notifications/${id}/read`, {});
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Revert on error
      fetchUnreadCount();
      fetchNotifications();
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      await apiClient.patch('/api/notifications/me/read-all', {});
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      fetchUnreadCount();
      fetchNotifications();
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch count on mount and set polling interval (every 30 seconds when active)
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    fetchUnreadCount();
    
    // Listen for custom trigger to refresh counts (useful after page action)
    const handleRefresh = () => {
      fetchUnreadCount();
      if (isOpen) fetchNotifications();
    };
    window.addEventListener('refresh-notifications', handleRefresh);

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('refresh-notifications', handleRefresh);
    };
  }, [isAuthenticated, isLoading]);

  // Fetch list of notifications when dropdown opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-slate-600 hover:text-indigo-600 flex items-center justify-center transition-all shadow-sm hover:shadow focus:outline-none cursor-pointer"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute -right-12 sm:right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[60] overflow-hidden font-sans animate-slide-down">
          
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xxs font-bold text-indigo-600 hover:text-indigo-500 flex items-center space-x-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-200">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-xxs text-slate-500">Loading alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Bell className="w-8 h-8 text-slate-350 mx-auto" />
                <p className="text-xs font-medium">All caught up!</p>
                <p className="text-[10px] text-slate-400">No new alerts to show.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.is_read)}
                  className={`w-full p-4 text-left flex items-start space-x-3 transition-colors ${
                    n.is_read ? 'hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-55/15'
                  }`}
                >
                  {/* Unread dot indicator */}
                  {!n.is_read && (
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-600 shadow-md"></span>
                  )}
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <p className={`text-xs truncate pr-2 ${n.is_read ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>
                        {n.title}
                      </p>
                      <span className="text-[9px] text-slate-400 flex items-center space-x-0.5 flex-shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>
                    <p className={`text-xxs leading-relaxed ${n.is_read ? 'text-slate-400' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
