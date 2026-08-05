'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendPhoneOtp, verifyPhoneOtp, formatPhoneNumber } from '../../../../lib/auth';
import { apiClient } from '../../../../lib/api-client';
import { ArrowLeft, Phone, ShieldCheck, User, MapPin, RefreshCw } from 'lucide-react';

export default function ClientRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [otp, setOtp] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!city.trim()) {
      setErrorMsg('Please enter your city.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('You must accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await sendPhoneOtp({ phone });
      setStep('otp');
      setInfoMsg(`OTP sent successfully to ${formatPhoneNumber(phone)}`);
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otp || otp.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit OTP sent to your mobile.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP with Supabase
      await verifyPhoneOtp({ phone, token: otp, role: 'client' });

      // 2. Create user profile in backend DB
      try {
        await apiClient.post('/api/profiles', {
          full_name: fullName.trim(),
          phone: formatPhoneNumber(phone),
          city: city.trim(),
        });
      } catch (profileErr) {
        // If profile creation returns 400 (already exists), ignore and proceed
        console.warn('Profile sync:', profileErr);
      }

      // 3. Redirect to Client Home
      router.push('/');
    } catch (err) {
      setErrorMsg((err as Error).message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center py-12 px-4 font-sans">
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

        <div className="mb-6 text-center pt-2">
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create Client Account
          </h2>
          <p className="text-slate-500 text-xs mt-1.5">
            Sign up with your mobile number to book local experts
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium text-center">
            {infoMsg}
          </div>
        )}

        {step === 'details' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
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
                  className="w-full pl-16 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors tracking-wide font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                City
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Security & Theft Disclaimer Notice */}
            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              <p className="font-bold text-amber-950 mb-1">
                🛡️ Platform Intermediary & Security Policy Notice:
              </p>
              UrService acts solely as an intermediary connecting clients with independent vendors. UrService is not liable for house theft or property loss. In the event of confirmed theft, UrService administration will immediately suspend the vendor and release the vendor&apos;s verified identity details to the client and legal authorities.
            </div>

            <div className="flex items-start pt-1">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white"
              />
              <label htmlFor="acceptTerms" className="ml-2.5 text-xs text-slate-500 select-none leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" target="_blank" className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
                  Privacy Policy
                </Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Enter 6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('details');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Edit Details
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
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Complete Registration'}
            </button>

            <div className="text-center pt-1">
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

        <div className="mt-6 pt-4 border-t border-slate-200 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

