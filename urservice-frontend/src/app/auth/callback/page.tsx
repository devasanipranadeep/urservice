'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { apiClient, ApiError } from '../../../lib/api-client';

interface MeResponse {
  id: string;
  email: string;
  role: string;
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Exchange the URL hash/code for a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setStatus('error');
          setErrorMsg('Failed to establish session from Google sign-in. Please try again.');
          return;
        }

        const role = searchParams.get('role') || 'client';
        const intent = searchParams.get('intent') || 'login';
        const user = session.user;

        // 2. Update user metadata with the intended role
        await supabase.auth.updateUser({
          data: { role },
        });

        // 3. Check if this user already exists in the backend
        try {
          const me = await apiClient.get<MeResponse>('/me');

          // Existing user — redirect to dashboard based on role
          if (me.role === 'admin') {
            router.push('/admin/dashboard');
          } else if (me.role === 'vendor') {
            // If they came from vendor registration, send back to wizard
            if (intent === 'register' && role === 'vendor') {
              router.push('/register/vendor');
            } else {
              router.push('/vendor/dashboard');
            }
          } else {
            router.push('/');
          }
        } catch (err) {
          if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
            // New user — need to ensure they exist in backend
            try {
              await apiClient.post('/api/profiles/ensure-google-user', {
                role,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                phone: '',
                city: '',
              });
            } catch (ensureErr) {
              // If profile creation fails with 400 (already exists), that's fine
              if (ensureErr instanceof ApiError && ensureErr.status !== 400) {
                throw ensureErr;
              }
            }

            // Redirect based on intent
            if (intent === 'register' && role === 'vendor') {
              router.push('/register/vendor');
            } else {
              router.push('/');
            }
          } else if (err instanceof ApiError && err.detail === 'email_not_verified') {
            router.push('/verify-email');
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setErrorMsg((err as Error).message || 'An unexpected error occurred during sign-in.');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 font-sans">
      {status === 'processing' ? (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <h2 className="text-lg font-bold text-slate-800">Completing sign-in...</h2>
          <p className="text-sm text-slate-500">Please wait while we set up your account.</p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto">
            <span className="text-rose-600 text-xl font-bold">!</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">Sign-in Failed</h2>
          <p className="text-sm text-rose-600">{errorMsg}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 font-sans">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <h2 className="text-lg font-bold text-slate-800">Loading...</h2>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
