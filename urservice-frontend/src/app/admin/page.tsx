'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { apiClient, ApiError } from '../../lib/api-client';
import { ArrowLeft, Mail, Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react';

interface MeResponse {
  id: string;
  email: string;
  role: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign in with Supabase using email + password
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      // 2. Verify admin role via backend
      try {
        const me = await apiClient.get<MeResponse>('/me');
        if (me.role !== 'admin') {
          // Not an admin — sign out and show error
          await supabase.auth.signOut();
          setErrorMsg('Access denied. This login is restricted to administrators only.');
          setLoading(false);
          return;
        }
        // Admin verified — redirect to dashboard
        router.push('/admin/dashboard');
      } catch (err) {
        await supabase.auth.signOut();
        if (err instanceof ApiError) {
          if (err.detail === 'email_not_verified') {
            setErrorMsg('Your email address has not been verified. Please check your inbox.');
          } else {
            setErrorMsg(err.message || 'Failed to verify admin privileges.');
          }
        } else {
          setErrorMsg('Failed to verify admin privileges. Please try again.');
        }
        setLoading(false);
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 font-sans">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full opacity-40 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-scale-in">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"></div>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="absolute top-4 left-4 text-slate-500 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded-lg inline-flex items-center"
          title="Back to Homepage"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Admin Badge */}
        <div className="flex justify-center mb-6 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Portal
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Sign in with your administrator credentials
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2"
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              'Sign In as Admin'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            This portal is restricted to authorized administrators.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Not an admin?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
              Go to User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
