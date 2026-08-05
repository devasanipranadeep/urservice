import { z } from 'zod';

export const ClientRegistrationSchema = z
  .object({
    full_name: z.string().min(2, { message: 'Full name must be at least 2 characters' }).max(100),
    phone: z.string().min(10, { message: 'Mobile number must be at least 10 digits' }).max(20),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
    city: z.string().min(2, { message: 'City name must be at least 2 characters' }).max(100),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms and Conditions to proceed',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ClientRegistrationInput = z.infer<typeof ClientRegistrationSchema>;
