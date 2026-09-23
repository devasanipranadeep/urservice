import { supabase } from './supabase';

interface SendOtpParams {
  phone: string;
}

interface VerifyOtpParams {
  phone: string;
  token: string;
  role?: 'client' | 'vendor' | 'admin';
}

/**
 * Formats a phone number to standard E.164 format (+91XXXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return phone.startsWith('+') ? phone : `+${phone}`;
}

/**
 * Sends a 6-digit OTP code to the provided phone number.
 */
export async function sendPhoneOtp({ phone }: SendOtpParams) {
  const formattedPhone = formatPhoneNumber(phone);
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Verifies the 6-digit OTP code sent to the phone number.
 * If user role is provided, updates user metadata.
 */
export async function verifyPhoneOtp({ phone, token, role }: VerifyOtpParams) {
  const formattedPhone = formatPhoneNumber(phone);
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: token.trim(),
    type: 'sms',
  });

  if (error) {
    throw error;
  }

  if (role && data.session) {
    await supabase.auth.updateUser({
      data: { role },
    });
  }

  return data;
}

interface SendEmailOtpParams {
  email: string;
}

interface VerifyEmailOtpParams {
  email: string;
  token: string;
  role?: 'client' | 'vendor' | 'admin';
}

/**
 * Sends a 6-digit OTP code to the provided email address.
 */
export async function sendEmailOtp({ email }: SendEmailOtpParams) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Verifies the 6-digit OTP code sent to the email address.
 * If user role is provided, updates user metadata.
 */
export async function verifyEmailOtp({ email, token, role }: VerifyEmailOtpParams) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'email',
  });

  if (error) {
    throw error;
  }

  if (role && data.session) {
    await supabase.auth.updateUser({
      data: { role },
    });
  }

  return data;
}
