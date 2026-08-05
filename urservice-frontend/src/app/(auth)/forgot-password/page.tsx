'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { ForgotPasswordSchema, ForgotPasswordInput } from '../../../lib/validators/auth';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccessMsg('Recovery email sent. Please check your inbox for instructions.');
      reset();
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to send recovery email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Recover Password
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {errors.email && (
              <p className="text-rose-600 text-xs mt-1.5 font-medium">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
          >
            {isSubmitting ? 'Sending Link...' : 'Send Recovery Link'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
          Remember your password?{' '}
          <a
            href="/login"
            className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
