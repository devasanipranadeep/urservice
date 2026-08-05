'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { apiClient } from '../../../lib/api-client';

interface MeResponse {
  id: string;
  email: string;
  role: string;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Poll Supabase Auth every 5 seconds to check if they confirmed their email
  useEffect(() => {
    const interval = setInterval(() => {
      checkVerificationStatus(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkVerificationStatus = async (silent = false) => {
    if (!silent) setChecking(true);
    setErrorMsg(null);
    try {
      // 1. Force reload user metadata from Supabase
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user && user.email_confirmed_at) {
        // 2. Email is verified! Hit FastAPI `/me` to fetch role and redirect
        const me = await apiClient.get<MeResponse>('/me');
        if (me.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (me.role === 'vendor') {
          router.push('/vendor/dashboard');
        } else {
          router.push('/');
        }
      } else {
        if (!silent) {
          setErrorMsg('Email not verified yet. Please check your inbox and click the verification link.');
        }
      }
    } catch (err) {
      if (!silent) {
        setErrorMsg((err as Error).message || 'Failed to check status.');
      }
    } finally {
      if (!silent) setChecking(false);
    }
  };

  const handleLogout = async () => {
    router.push('/');
    setTimeout(async () => {
      await supabase.auth.signOut();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        {/* Mail Icon SVG */}
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5"
            ></path>
          </svg>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Verify Your Email
        </h2>
        <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
          We sent a verification link to your email. Please click the link to confirm your account and activate your profile.
        </p>

        <div className="space-y-4">
          <div className="text-xs text-slate-500 flex items-center justify-center space-x-2">
            {/* Pulsing Dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Checking verification status automatically...</span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <button
            onClick={() => checkVerificationStatus(false)}
            disabled={checking}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
          >
            {checking ? 'Checking Link...' : 'I have clicked the link'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-sm font-semibold rounded-xl text-slate-500 hover:text-slate-800 transition-all"
          >
            Sign Out & Log In Again
          </button>
        </div>
      </div>
    </div>
  );
}
