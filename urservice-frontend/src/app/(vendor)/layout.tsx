'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../hooks/use-session';
import { apiClient, ApiError } from '../../lib/api-client';

interface MeResponse {
  id: string;
  email: string;
  role: string;
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sessionState = useSession();
  const isLoading = sessionState.isLoading;
  const isUserAuthenticated = sessionState.isAuthenticated;

  const [profileLoading, setProfileLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isUserAuthenticated) {
      router.push('/login');
      return;
    }

    const checkRole = async () => {
      try {
        const me = await apiClient.get<MeResponse>('/me');
        if (me.role !== 'vendor') {
          // Role mismatch: Redirect to their proper dashboard
          if (me.role === 'admin') {
            router.push('/admin/dashboard');
          } else if (me.role === 'client') {
            router.push('/client/dashboard');
          } else {
            router.push('/login');
          }
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        if (err instanceof ApiError && err.detail === 'email_not_verified') {
          router.push('/verify-email');
        } else {
          router.push('/login');
        }
      } finally {
        setProfileLoading(false);
      }
    };

    checkRole();
  }, [isLoading, isUserAuthenticated, router]);

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-center items-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
          </div>
          <p className="text-slate-500 text-sm font-semibold tracking-wide animate-pulse">
            Securing Vendor Session...
          </p>
        </div>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
