'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendPhoneOtp, verifyPhoneOtp, formatPhoneNumber } from '../../../lib/auth';
import { apiClient, ApiError } from '../../../lib/api-client';
import { ArrowLeft, Phone, ShieldCheck, RefreshCw } from 'lucide-react';

interface MeResponse {
  id: string;
  email: string;
  role: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await sendPhoneOtp({ phone });
      setStep('otp');
      setInfoMsg(`OTP sent successfully to ${formatPhoneNumber(phone)}`);
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to send OTP. Please check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!otp || otp.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit OTP sent to your mobile.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP with Supabase
      await verifyPhoneOtp({ phone, token: otp });

      // 2. Fetch authenticated profile from FastAPI backend
      try {
        const me = await apiClient.get<MeResponse>('/me');
        if (me.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (me.role === 'vendor') {
          router.push('/vendor/dashboard');
        } else {
          router.push('/');
        }
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
          // If user exists in auth but not profile, create basic client profile
          try {
            await apiClient.post('/api/profiles/ensure-google-user', {
              role: 'client',
              full_name: '',
              phone: formatPhoneNumber(phone),
              city: '',
            });
            router.push('/');
          } catch {
            router.push('/');
          }
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="absolute top-4 left-4 text-slate-500 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded-lg inline-flex items-center"
          title="Back to Homepage"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="mb-8 text-center pt-2">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Log in using your Mobile Number & OTP
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium text-center">
            {infoMsg}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-500 text-sm font-semibold flex items-center gap-1">
                  <Phone className="w-4 h-4 text-slate-400" />
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-16 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-medium tracking-wide"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Enter 6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Change Number
                </button>
              </div>
              <div className="relative flex items-center">
                <ShieldCheck className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-center text-lg tracking-widest font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Login'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors font-medium cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500 flex flex-col space-y-2">
          <span>New to UrService? Register as:</span>
          <div className="flex justify-center items-center space-x-4 mt-1">
            <Link
              href="/register/client"
              className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Client
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href="/register/vendor"
              className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Vendor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

