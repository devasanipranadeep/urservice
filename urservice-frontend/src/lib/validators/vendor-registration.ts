import { z } from 'zod';

export const PersonalInfoSchema = z.object({
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters' }).max(100),
  phone: z.string().min(10, { message: 'Mobile number must be at least 10 digits' }).max(20),
  dob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Please enter a valid date of birth',
    })
    .refine((val) => {
      const dobDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      return age >= 18;
    }, {
      message: 'You must be at least 18 years old to register as a vendor',
    }),
  gender: z.string().min(2, { message: 'Please select a gender' }),
});

export const BusinessInfoSchema = z.object({
  business_name: z.string().min(2, { message: 'Business name must be at least 2 characters' }).max(100),
  business_category: z.string().min(2, { message: 'Please select a business category' }),
  business_description: z.string().min(5, { message: 'Business description must be at least 5 characters' }).max(500),
  years_experience: z.coerce.number().int().nonnegative({ message: 'Years of experience must be 0 or more' }),
  service_radius_km: z.coerce.number().int().nonnegative({ message: 'Service radius must be 0 or more' }),
  house_number: z.string().min(1, { message: 'Flat/House number is required' }).max(50),
  street: z.string().min(1, { message: 'Street name is required' }).max(100),
  area: z.string().min(1, { message: 'Area/Locality is required' }).max(100),
  city: z.string().min(2, { message: 'City name must be at least 2 characters' }).max(100),
  state: z.string().min(2, { message: 'State name must be at least 2 characters' }).max(100),
  pincode: z.string().min(5, { message: 'Pincode must be at least 5 characters' }).max(10),
});

export const IdentityVerificationSchema = z.object({
  identity_type: z.string().min(2, { message: 'Please select an identity proof type' }),
});

export const BusinessVerificationSchema = z.object({
  gst: z.string().max(20).optional(),
});

export const BankDetailsSchema = z.object({
  account_holder_name: z.string().min(2, { message: 'Account holder name must be at least 2 characters' }).max(100),
  bank_name: z.string().min(2, { message: 'Bank name must be at least 2 characters' }).max(100),
  account_number: z.string().min(5, { message: 'Account number must be at least 5 characters' }).max(30),
  ifsc_code: z.string().refine((val) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val.toUpperCase()), {
    message: 'Invalid IFSC code. Pattern: 4 letters, 0, 6 alphanumeric (e.g. SBIN0012345)',
  }),
  upi_id: z.string().max(50).optional(),
});

export const FinalStepSchema = z.object({
  working_days: z.array(z.string()).min(1, { message: 'Please select at least one working day' }),
  working_hours_start: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Format must be HH:MM' }),
  working_hours_end: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Format must be HH:MM' }),
  emergency_availability: z.boolean().default(false),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms and Conditions',
  }),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Privacy Policy',
  }),
  acceptAgreement: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Vendor Partner Agreement',
  }),
});
