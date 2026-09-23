'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendPhoneOtp, verifyPhoneOtp, formatPhoneNumber } from '../../../lib/auth';
import { apiClient, ApiError } from '../../../lib/api-client';
import { supabase } from '../../../lib/supabase';
import {
  ArrowLeft,
  Phone,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface MeResponse {
  id: string;
  email: string;
  role: string;
}

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Authentication step & input states
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  // Status and feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Resend cooldown timer (in seconds)
  const [countdown, setCountdown] = useState(0);

  // Helper to normalize phone numbers (strips leading 0 or +91 if pasted, keeps 10 digits)
  const sanitizePhone = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.slice(2);
    } else if (digits.startsWith('0') && digits.length > 10) {
      digits = digits.slice(1);
    }
    return digits.slice(0, 10);
  };

  // Check if user is already authenticated on mount
  useEffect(() => {
    let isMounted = true;

    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          try {
            const me = await apiClient.get<MeResponse>('/me');
            if (me.role === 'admin') {
              router.replace('/admin/dashboard');
              return;
            } else if (me.role === 'vendor') {
              router.replace('/vendor/dashboard');
              return;
            }
          } catch {
            // If /me fails, proceed to home
          }
          router.replace('/');
          return;
        }
      } catch {
        // Ignore session read error
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    };

    checkExistingSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Handle countdown timer ticking down
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Focus OTP input automatically when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  // Auto-verify when 6 digits are reached
  useEffect(() => {
    if (step === 'otp' && otp.length === 6 && !loading && !isVerifying) {
      handleVerifyOtp();
    }
  }, [otp, step]);

  // Step 1: Send OTP to the mobile number
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanDigits = sanitizePhone(phone);
    if (cleanDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await sendPhoneOtp({ phone: cleanDigits });
      setStep('otp');
      setInfoMsg(`6-digit OTP code sent to ${formatPhoneNumber(cleanDigits)}`);
      setCountdown(30); // 30-second cooldown
    } catch (err) {
      let msg = (err as Error).message || 'Failed to send OTP code.';
      if (msg.toLowerCase().includes('failed to fetch')) {
        msg = 'Unable to connect to Supabase. Please ensure NEXT_PUBLIC_SUPABASE_URL in .env.local is set to your actual project URL.';
      } else if (msg.toLowerCase().includes('provider is not configured')) {
        msg = 'SMS service is currently unavailable. Please check your Supabase Phone Auth settings.';
      } else if (msg.toLowerCase().includes('rate limit')) {
        msg = 'Too many requests. Please wait a minute before requesting another OTP.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and navigate to the appropriate dashboard
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsVerifying(true);
    const cleanPhone = sanitizePhone(phone);

    try {
      // 1. Verify OTP with Supabase
      const data = await verifyPhoneOtp({ phone: cleanPhone, token: cleanOtp });

      if (!data?.session) {
        throw new Error('Verification completed, but active session was not created.');
      }

      // 2. Fetch authenticated profile from FastAPI backend
      try {
        const me = await apiClient.get<MeResponse>('/me');
        if (me?.role) {
          // Sync metadata to Supabase Auth so Navbar immediately reflects the role
          try {
            await supabase.auth.updateUser({ data: { role: me.role } });
          } catch { }

          if (me.role === 'admin') {
            router.push('/admin/dashboard');
            return;
          }
          if (me.role === 'vendor') {
            router.push('/vendor/dashboard');
            return;
          }
        }
        router.push('/');
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
          // If user exists in Auth but not in public profiles, ensure client profile
          try {
            await apiClient.post('/api/profiles/ensure-user', {
              role: 'client',
              phone: formatPhoneNumber(cleanPhone),
              full_name: 'Client User',
              city: 'Not Set',
            });
            try {
              await supabase.auth.updateUser({ data: { role: 'client' } });
            } catch { }
            router.push('/');
            return;
          } catch {
            router.push('/');
            return;
          }
        }
        router.push('/');
      }
    } catch (err) {
      let msg = (err as Error).message || 'Invalid or expired OTP code.';
      if (msg.toLowerCase().includes('token has expired') || msg.toLowerCase().includes('expired')) {
        msg = 'The OTP code has expired. Please tap Resend OTP to receive a new one.';
      } else if (msg.toLowerCase().includes('invalid token') || msg.toLowerCase().includes('token is invalid')) {
        msg = 'Incorrect OTP code. Please double-check and try again.';
      }
      setErrorMsg(msg);
      setOtp('');
      otpInputRef.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 text-slate-900 flex flex-col justify-center items-center px-4 py-8 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="absolute top-5 left-5 text-slate-400 hover:text-slate-800 transition-colors p-2 hover:bg-slate-100 rounded-xl inline-flex items-center group"
          title="Back to Homepage"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>

        {/* Header Section */}
        <div className="mb-7 text-center pt-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-3 border border-indigo-100/80 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to UrService
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Log in with your Mobile Number & OTP
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-700 text-xs font-medium leading-relaxed flex items-start gap-2">
            <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-700 text-xs font-medium leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* STEP 1: Mobile Number Input Form */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Mobile Number
              </label>

              {/* Grouped Phone Input to prevent layout shift or overlapping */}
              <div className="flex rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 overflow-hidden bg-slate-50/50 transition-all">
                <div className="flex items-center gap-1.5 px-3.5 bg-slate-100/80 border-r border-slate-200 text-slate-600 text-sm font-semibold select-none">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                  className="flex-1 px-4 py-3 bg-transparent text-slate-900 text-sm font-medium tracking-wider focus:outline-none placeholder:text-slate-400"
                  required
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                We will send a 6-digit OTP code to this mobile number.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || sanitizePhone(phone).length < 10}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: 6-Digit OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Enter 6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-semibold cursor-pointer"
                >
                  Change Number
                </button>
              </div>

              {/* Destination badge */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 mb-4">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {formatPhoneNumber(sanitizePhone(phone))}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> OTP Sent
                </span>
              </div>

              {/* Visual 6-Digit Boxes */}
              <div
                className="relative cursor-text"
                onClick={() => otpInputRef.current?.focus()}
              >
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const digit = otp[index] || '';
                    const isCurrent = index === otp.length;
                    return (
                      <div
                        key={index}
                        className={`flex-1 h-12 sm:h-13 flex items-center justify-center text-lg sm:text-xl font-bold font-mono rounded-xl border-2 transition-all ${digit
                            ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 shadow-sm'
                            : isCurrent
                              ? 'border-indigo-500 bg-white ring-2 ring-indigo-500/20'
                              : 'border-slate-200 bg-slate-50/50 text-slate-300'
                          }`}
                      >
                        {digit || (isCurrent ? <span className="animate-pulse text-indigo-400">|</span> : '•')}
                      </div>
                    );
                  })}
                </div>

                {/* Hidden Overlay Input to handle keyboard, mobile numeric keypad, backspace and paste */}
                <input
                  ref={otpInputRef}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="absolute inset-0 opacity-0 cursor-text w-full h-full"
                  autoComplete="one-time-code"
                  disabled={isVerifying}
                />
              </div>

              <p className="text-[11px] text-slate-400 text-center mt-2">
                Type or paste the 6-digit code sent to your phone
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || otp.trim().length < 6}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify OTP & Login</span>
                </>
              )}
            </button>

            {/* Resend OTP Section with Cooldown */}
            <div className="text-center pt-1">
              {countdown > 0 ? (
                <span className="text-xs text-slate-400 font-medium">
                  Resend OTP in{' '}
                  <span className="text-indigo-600 font-semibold">{countdown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading || isVerifying}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* Footer Links */}
        <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500">
          <Link
            href="/privacy"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            Privacy Policy
          </Link>
        </div>

        {/* Registration Options Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 flex flex-col space-y-2">
          <span>New to UrService? Register as:</span>
          <div className="flex justify-center items-center space-x-4">
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
