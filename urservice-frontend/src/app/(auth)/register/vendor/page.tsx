'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Phone, User, Calendar, LogOut, Check, ArrowRight, ArrowLeft, Upload, FileText, Landmark, Sparkles } from 'lucide-react';
import TermsPrivacyModal from '../../../../components/terms-privacy-modal';

import { sendPhoneOtp, verifyPhoneOtp, formatPhoneNumber } from '../../../../lib/auth';
import { apiClient } from '../../../../lib/api-client';
import { useSession } from '../../../../hooks/use-session';
import { SERVICE_CATEGORIES } from '../../../../lib/constants';
import {
  PersonalInfoSchema,
  BusinessInfoSchema,
  IdentityVerificationSchema,
  BusinessVerificationSchema,
  BankDetailsSchema,
  FinalStepSchema,
} from '../../../../lib/validators/vendor-registration';

const STEPS = [
  'Personal Information',
  'Business Details',
  'Identity Proof',
  'Business Verification',
  'Availability & Terms',
];

async function compressImage(file: File, maxDimension = 1200, quality = 0.8): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
          const compressedFile = new File([blob], compressedName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
}

export default function VendorRegistrationWizard() {
  const router = useRouter();
  const { session, isAuthenticated } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');

  // Phone OTP state for Step 1
  const [otpStep, setOtpStep] = useState<'info' | 'otp'>('info');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Global wizard form state holds text inputs
  const [wizardData, setWizardData] = useState<any>({
    personal: {},
    business: {},
    bank: {},
    availability: {},
    identity_type: '',
    gst: '',
  });

  // Global wizard files state holds raw File objects in-memory
  const [wizardFiles, setWizardFiles] = useState<Record<string, File>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  // Geolocation states
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [addressName, setAddressName] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  // --- React Hook Form setups for individual steps ---
  
  // Step 1 Form
  const s1Form = useForm({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: {
      full_name: wizardData.personal.full_name || '',
      phone: wizardData.personal.phone || '',
      dob: wizardData.personal.dob || '',
      gender: wizardData.personal.gender || '',
    },
  });

  // Step 2 Form
  const s2Form = useForm({
    resolver: zodResolver(BusinessInfoSchema),
    defaultValues: {
      business_name: wizardData.business.business_name || '',
      business_category: wizardData.business.business_category || '',
      business_description: wizardData.business.business_description || '',
      years_experience: wizardData.business.years_experience || 0,
      service_radius_km: wizardData.business.service_radius_km || 10,
      house_number: wizardData.business.house_number || '',
      street: wizardData.business.street || '',
      area: wizardData.business.area || '',
      city: wizardData.business.city || '',
      state: wizardData.business.state || '',
      pincode: wizardData.business.pincode || '',
    },
  });

  // Step 3 Form
  const s3Form = useForm({
    resolver: zodResolver(IdentityVerificationSchema),
    defaultValues: {
      identity_type: wizardData.identity_type || '',
    },
  });

  // Step 4 Form
  const s4Form = useForm({
    resolver: zodResolver(BusinessVerificationSchema),
    defaultValues: {
      gst: wizardData.gst || '',
    },
  });

  // Step 5 Form
  const s5Form = useForm({
    resolver: zodResolver(BankDetailsSchema),
    defaultValues: {
      account_holder_name: wizardData.bank.account_holder_name || '',
      bank_name: wizardData.bank.bank_name || '',
      account_number: wizardData.bank.account_number || '',
      ifsc_code: wizardData.bank.ifsc_code || '',
      upi_id: wizardData.bank.upi_id || '',
    },
  });

  // Step 6 Form
  const s6Form = useForm({
    resolver: zodResolver(FinalStepSchema),
    defaultValues: {
      working_days: wizardData.availability.working_days || [],
      working_hours_start: wizardData.availability.working_hours_start || '09:00',
      working_hours_end: wizardData.availability.working_hours_end || '18:00',
      emergency_availability: wizardData.availability.emergency_availability || false,
      latitude: wizardData.availability.latitude || null,
      longitude: wizardData.availability.longitude || null,
      acceptTerms: false,
      acceptPrivacy: false,
      acceptAgreement: false,
    },
  });

  // Pre-populate fields if user is already logged in
  useEffect(() => {
    if (session?.user) {
      if (session.user.phone) {
        s1Form.setValue('phone', session.user.phone.replace(/\+91/, ''));
      }
      const metadata = session.user.user_metadata;
      if (metadata?.full_name) {
        s1Form.setValue('full_name', metadata.full_name);
      }
    }
  }, [session, s1Form]);

  // --- Geolocation hooks ---
  const resolveAddress = async (lat: number | null | undefined, lon: number | null | undefined) => {
    if (!lat || !lon) return;
    setAddressLoading(true);
    setAddressName(null);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setAddressName(data.display_name);
        } else {
          setAddressName('Address not found');
        }
      } else {
        setAddressName('Failed to fetch address details');
      }
    } catch (err) {
      console.error(err);
      setAddressName('Error resolving address details');
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchGeolocation = () => {
    setGeoLoading(true);
    setGeoError(null);
    setAddressName(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        s6Form.setValue('latitude', lat);
        s6Form.setValue('longitude', lon);
        setGeoLoading(false);
      },
      (error) => {
        setGeoError('Location permission denied or timed out. Please fill coordinates manually.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  };

  // Run geo check on step 5 load
  useEffect(() => {
    if (currentStep === 5) {
      fetchGeolocation();
    }
  }, [currentStep]);

  const watchedLat = s6Form.watch('latitude');
  const watchedLon = s6Form.watch('longitude');

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (watchedLat && watchedLon) {
        resolveAddress(watchedLat, watchedLon);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [watchedLat, watchedLon]);

  // --- Helper to handle local file upload change with automatic compression & validation ---
  const handleFileChange = async (key: string, file: File | null) => {
    if (!file) {
      const updatedFiles = { ...wizardFiles };
      delete updatedFiles[key];
      setWizardFiles(updatedFiles);

      const updatedPreviews = { ...filePreviews };
      delete updatedPreviews[key];
      setFilePreviews(updatedPreviews);
      return;
    }

    // Size limit check for non-image files (e.g. PDFs)
    if (!file.type.startsWith('image/')) {
      if (file.size > 3 * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds the 3MB limit. Please upload a document under 3MB.`);
        return;
      }
      setWizardFiles((prev) => ({ ...prev, [key]: file }));
      setFilePreviews((prev) => ({ ...prev, [key]: 'pdf_icon' }));
      return;
    }

    // For images, automatically compress to ensure total payload stays small and fast
    try {
      const compressed = await compressImage(file, 1200, 0.8);
      setWizardFiles((prev) => ({ ...prev, [key]: compressed }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(compressed);
    } catch {
      setWizardFiles((prev) => ({ ...prev, [key]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Wizard Step Navigation & Validation ---
  const handleNextStep = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    if (currentStep === 1) {
      const isValid = await s1Form.trigger();
      if (!isValid) return;

      const personalValues = s1Form.getValues();
      setWizardData((prev: any) => ({ ...prev, personal: personalValues }));

      // If user is not authenticated yet, perform Phone OTP verification in Step 1
      if (!isAuthenticated) {
        if (otpStep === 'info') {
          setIsOtpLoading(true);
          try {
            await sendPhoneOtp({ phone: personalValues.phone });
            setOtpStep('otp');
            setInfoMsg(`OTP sent successfully to ${formatPhoneNumber(personalValues.phone)}`);
          } catch (err) {
            setErrorMsg((err as Error).message || 'Failed to send OTP to your phone number.');
          } finally {
            setIsOtpLoading(false);
          }
          return;
        }

        if (otpStep === 'otp') {
          if (!otpCode || otpCode.trim().length < 6) {
            setErrorMsg('Please enter the 6-digit OTP code sent to your phone.');
            return;
          }

          setIsOtpLoading(true);
          try {
            await verifyPhoneOtp({
              phone: personalValues.phone,
              token: otpCode,
              role: 'vendor',
            });
            // Ensure public.users row with role="vendor" exists in application database
            try {
              await apiClient.post('/api/profiles/ensure-user', {
                role: 'vendor',
                full_name: personalValues.full_name?.trim() || 'Vendor Partner',
                phone: formatPhoneNumber(personalValues.phone),
                city: 'Not Set',
              });
            } catch (ensureErr) {
              console.warn('ensure-user call notice:', ensureErr);
            }
            setCurrentStep(2);
          } catch (err) {
            setErrorMsg((err as Error).message || 'Invalid or expired OTP code.');
          } finally {
            setIsOtpLoading(false);
          }
          return;
        }
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const isValid = await s2Form.trigger();
      if (!isValid) return;
      setWizardData((prev: any) => ({ ...prev, business: s2Form.getValues() }));
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const isValid = await s3Form.trigger();
      if (!isValid) return;
      
      // Ensure the identity document has been uploaded
      if (!wizardFiles['identity_file']) {
        setErrorMsg('Please upload a valid identity verification document.');
        return;
      }
      setWizardData((prev: any) => ({
        ...prev,
        identity_type: s3Form.getValues().identity_type,
      }));
      setCurrentStep(4);
    } else if (currentStep === 4) {
      const isValid = await s4Form.trigger();
      if (!isValid) return;

      // Validate required category conditional fields
      const category = s2Form.getValues().business_category;
      if (category === 'Healthcare' && !wizardFiles['category_certificate']) {
        setErrorMsg('Healthcare category requires uploading a Clinic License.');
        return;
      }
      if (category === 'Education' && !wizardFiles['category_certificate']) {
        setErrorMsg('Education category requires uploading Educational Certificates.');
        return;
      }
      if (category === 'Beauty & Salon' && !wizardFiles['category_certificate']) {
        setErrorMsg('Beauty & Salon category requires uploading a Salon License.');
        return;
      }

      setWizardData((prev: any) => ({
        ...prev,
        gst: s4Form.getValues().gst,
      }));
      setCurrentStep(5);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setInfoMsg(null);
    if (currentStep === 1) {
      if (otpStep === 'otp') {
        setOtpStep('info');
        return;
      }
      router.push('/');
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // --- Final Submit Action ---
  const onSubmitFinal = async (s6Data: any) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    // Profile photo is strictly required
    if (!wizardFiles['profile_photo']) {
      setErrorMsg('Please upload a valid profile photo to proceed.');
      setIsSubmitting(false);
      return;
    }

    // Check total upload payload size
    let totalBytes = 0;
    Object.values(wizardFiles).forEach((f) => {
      if (f && f instanceof File) totalBytes += f.size;
    });
    if (totalBytes > 4 * 1024 * 1024) {
      setErrorMsg('The total size of the uploaded documents exceeds 4MB. Please upload compressed images or PDFs.');
      setIsSubmitting(false);
      return;
    }

    try {
      const personalData = wizardData.personal;

      // Ensure user record with vendor role exists in application database
      try {
        await apiClient.post('/api/profiles/ensure-user', {
          role: 'vendor',
          full_name: personalData.full_name?.trim() || 'Vendor Partner',
          phone: formatPhoneNumber(personalData.phone),
          city: wizardData.business?.city || 'Not Set',
        });
      } catch (ensureErr) {
        console.warn('ensure-user check notice:', ensureErr);
      }

      // 2. Build Multipart FormData payload
      const payloadData = {
        personal: {
          full_name: personalData.full_name,
          phone: personalData.phone,
          dob: personalData.dob,
          gender: personalData.gender,
        },
        business: wizardData.business,
        bank: {
          account_holder_name: personalData.full_name || 'Not Provided',
          bank_name: 'Not Provided',
          account_number: '0000000000',
          ifsc_code: 'ABCD0000000',
          upi_id: '',
        },
        availability: {
          working_days: s6Data.working_days,
          working_hours_start: s6Data.working_hours_start,
          working_hours_end: s6Data.working_hours_end,
          emergency_availability: s6Data.emergency_availability,
          latitude: s6Data.latitude,
          longitude: s6Data.longitude,
        },
        identity_type: wizardData.identity_type,
        gst: wizardData.gst || null,
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payloadData));

      // Append raw files to the multipart request payload
      formData.append('profile_photo', wizardFiles['profile_photo']);
      formData.append('identity_file', wizardFiles['identity_file']);
      
      if (wizardFiles['business_logo']) {
        formData.append('business_logo', wizardFiles['business_logo']);
      }
      if (wizardFiles['shop_license']) {
        formData.append('shop_license', wizardFiles['shop_license']);
      }
      if (wizardFiles['trade_license']) {
        formData.append('trade_license', wizardFiles['trade_license']);
      }
      if (wizardFiles['registration_certificate']) {
        formData.append('registration_certificate', wizardFiles['registration_certificate']);
      }
      if (wizardFiles['category_certificate']) {
        formData.append('category_certificate', wizardFiles['category_certificate']);
      }

      // 3. Post to /api/vendors/register with current JWT
      await apiClient.post('/api/vendors/register', formData);
      router.push('/vendor/dashboard');
    } catch (err) {
      setErrorMsg((err as Error).message || 'Registration wizard submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to resolve step 4 conditionally required document label
  const getCategoryDocumentLabel = () => {
    const category = s2Form.getValues().business_category;
    if (category === 'Healthcare') return 'Clinic License (Required)';
    if (category === 'Education') return 'Educational Certificates (Required)';
    if (category === 'Beauty & Salon') return 'Salon License (Required)';
    return 'Other Categories Proof (Optional)';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center py-12 px-4 font-sans">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        {/* Back to Home Button */}
        {currentStep === 1 && (
          <Link
            href="/"
            className="absolute top-4 left-4 text-slate-500 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded-lg inline-flex items-center"
            title="Back to Homepage"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}

        {/* Wizard Progress Indicator */}
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
            Step {currentStep} of {STEPS.length}
          </span>
          <h2 className="text-xl font-extrabold text-slate-800 mt-1">{STEPS[currentStep - 1]}</h2>
          <span className="text-slate-500 text-xs font-medium mt-1">
            {Math.round((currentStep / STEPS.length) * 100)}% Complete
          </span>

          {/* Bar track */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex gap-0.5 mt-3">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-full rounded-full transition-all duration-300 ${
                  idx + 1 <= currentStep ? 'bg-indigo-500' : 'bg-slate-200'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* --- STEP 1: Personal Info --- */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {infoMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium text-center">
                {infoMsg}
              </div>
            )}

            {otpStep === 'info' ? (
              <form className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                  <input
                    type="text"
                    {...s1Form.register('full_name')}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {s1Form.formState.errors.full_name?.message && (
                    <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s1Form.formState.errors.full_name.message)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mobile Number</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-500 text-sm font-semibold flex items-center gap-1">
                      <Phone className="w-4 h-4 text-slate-400" />
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      {...s1Form.register('phone')}
                      onChange={(e) => s1Form.setValue('phone', e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-16 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-medium tracking-wide"
                    />
                  </div>
                  {s1Form.formState.errors.phone?.message && (
                    <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s1Form.formState.errors.phone.message)}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date of Birth</label>
                    <input
                      type="date"
                      {...s1Form.register('dob')}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {s1Form.formState.errors.dob?.message && (
                      <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s1Form.formState.errors.dob.message)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gender</label>
                    <select
                      {...s1Form.register('gender')}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {s1Form.formState.errors.gender?.message && (
                      <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s1Form.formState.errors.gender.message)}</p>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4 py-2">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Enter 6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('info');
                        setErrorMsg(null);
                        setInfoMsg(null);
                      }}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Edit Info
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-center text-lg tracking-widest font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => sendPhoneOtp({ phone: s1Form.getValues().phone })}
                    className="text-xs text-slate-500 hover:text-indigo-600 font-medium cursor-pointer"
                  >
                    Resend OTP Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- STEP 2: Business Info --- */}
        {currentStep === 2 && (
          <form className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Business Name</label>
                <input
                  type="text"
                  {...s2Form.register('business_name')}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {s2Form.formState.errors.business_name?.message && (
                  <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s2Form.formState.errors.business_name.message)}</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Category</label>
                <select
                  {...s2Form.register('business_category')}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Category</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {s2Form.formState.errors.business_category?.message && (
                  <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s2Form.formState.errors.business_category.message)}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Business Description</label>
              <textarea
                rows={2}
                {...s2Form.register('business_description')}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
              {s2Form.formState.errors.business_description?.message && (
                <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s2Form.formState.errors.business_description.message)}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Experience (Years)</label>
                <input
                  type="number"
                  {...s2Form.register('years_experience')}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {s2Form.formState.errors.years_experience?.message && (
                  <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s2Form.formState.errors.years_experience.message)}</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Service Radius (km)</label>
                <input
                  type="number"
                  {...s2Form.register('service_radius_km')}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {s2Form.formState.errors.service_radius_km?.message && (
                  <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s2Form.formState.errors.service_radius_km.message)}</p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">Business Address</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Flat/House No.</label>
                  <input
                    type="text"
                    {...s2Form.register('house_number')}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {s2Form.formState.errors.house_number?.message && (
                    <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s2Form.formState.errors.house_number.message)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Street</label>
                  <input
                    type="text"
                    {...s2Form.register('street')}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {s2Form.formState.errors.street?.message && (
                    <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s2Form.formState.errors.street.message)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Area/Locality</label>
                  <input
                    type="text"
                    {...s2Form.register('area')}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {s2Form.formState.errors.area?.message && (
                    <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s2Form.formState.errors.area.message)}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">City</label>
                  <input
                    type="text"
                    {...s2Form.register('city')}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {s2Form.formState.errors.city?.message && (
                    <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s2Form.formState.errors.city.message)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">State</label>
                  <input
                    type="text"
                    {...s2Form.register('state')}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {s2Form.formState.errors.state?.message && (
                    <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s2Form.formState.errors.state.message)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pincode</label>
                  <input
                    type="text"
                    {...s2Form.register('pincode')}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {s2Form.formState.errors.pincode?.message && (
                    <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s2Form.formState.errors.pincode.message)}</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}

        {/* --- STEP 3: Identity Verification --- */}
        {currentStep === 3 && (
          <form className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Select Document Type</label>
              <select
                {...s3Form.register('identity_type')}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select Document</option>
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
              </select>
              {s3Form.formState.errors.identity_type?.message && (
                <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{String(s3Form.formState.errors.identity_type.message)}</p>
              )}
            </div>

            {/* Custom Dropzone File Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Upload Identity Document (PDF or JPG/PNG, Max 5MB)
              </label>

              <div
                onClick={() => document.getElementById('identityFile')?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-slate-450 bg-slate-50 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col justify-center items-center"
              >
                <input
                  type="file"
                  id="identityFile"
                  onChange={(e) => handleFileChange('identity_file', e.target.files?.[0] || null)}
                  accept="application/pdf,image/jpeg,image/png"
                  className="hidden"
                />

                <Upload className="w-7 h-7 text-slate-500 mb-1.5" />
                {wizardFiles['identity_file'] ? (
                  <div className="space-y-1">
                    <p className="text-xs text-indigo-600 font-semibold truncate max-w-sm">
                      {wizardFiles['identity_file'].name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Click to replace
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-700 font-semibold">Click to select files</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">PDF, JPG, PNG up to 5MB</p>
                  </>
                )}
              </div>

              {/* Display visual thumbnail preview if image */}
              {filePreviews['identity_file'] && filePreviews['identity_file'] !== 'pdf_icon' && (
                <div className="mt-2 flex justify-center">
                  <div className="relative w-28 h-16 border border-slate-200 rounded-lg overflow-hidden">
                    <img src={filePreviews['identity_file']} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {/* --- STEP 4: Business Verification --- */}
        {currentStep === 4 && (
          <form className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 pb-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">GSTIN Number (Optional)</label>
                <input
                  type="text"
                  {...s4Form.register('gst')}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Shop / Trade License (Optional)</label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => document.getElementById('shopLicense')?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors w-full justify-center cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{wizardFiles['shop_license']?.name || 'Upload License'}</span>
                  </button>
                  <input
                    type="file"
                    id="shopLicense"
                    onChange={(e) => handleFileChange('shop_license', e.target.files?.[0] || null)}
                    accept="application/pdf,image/jpeg,image/png"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Category Conditional Certificates Section */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                Category Conditional Certificates
              </h3>
              <p className="text-slate-500 text-[10px]">
                Provide proof of licensing or certification based on your selected service category.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  {getCategoryDocumentLabel()}
                </label>
                
                <div
                  onClick={() => document.getElementById('catCertFile')?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-slate-450 bg-slate-50 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col justify-center items-center"
                >
                  <input
                    type="file"
                    id="catCertFile"
                    onChange={(e) => handleFileChange('category_certificate', e.target.files?.[0] || null)}
                    accept="application/pdf,image/jpeg,image/png"
                    className="hidden"
                  />

                  <FileText className="w-7 h-7 text-slate-500 mb-1.5" />
                  {wizardFiles['category_certificate'] ? (
                    <div className="space-y-1">
                      <p className="text-xs text-indigo-600 font-semibold truncate max-w-sm">
                        {wizardFiles['category_certificate'].name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Click to replace
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-slate-700 font-semibold">Click to select files</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">PDF, JPG, PNG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}



        {/* --- STEP 5: Profile & Availability & Geolocation --- */}
        {currentStep === 5 && (
          <form onSubmit={s6Form.handleSubmit(onSubmitFinal)} className="space-y-3">
            
            {/* Profile Photo Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-200 pb-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Profile Photo (Required, Max 2MB)
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {filePreviews['profile_photo'] ? (
                      <img src={filePreviews['profile_photo']} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('profilePhotoFile')?.click()}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                  >
                    Select Photo
                  </button>
                  <input
                    type="file"
                    id="profilePhotoFile"
                    onChange={(e) => handleFileChange('profile_photo', e.target.files?.[0] || null)}
                    accept="image/jpeg,image/png"
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Business Logo (Optional, Max 2MB)
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {filePreviews['business_logo'] ? (
                      <img src={filePreviews['business_logo']} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('businessLogoFile')?.click()}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                  >
                    Select Logo
                  </button>
                  <input
                    type="file"
                    id="businessLogoFile"
                    onChange={(e) => handleFileChange('business_logo', e.target.files?.[0] || null)}
                    accept="image/jpeg,image/png"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Geolocation Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                  Service Geolocation Coordinates
                </h4>
                <button
                  type="button"
                  onClick={fetchGeolocation}
                  disabled={geoLoading}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] font-semibold text-indigo-600 hover:text-indigo-500 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {geoLoading ? 'Fetching...' : 'Re-fetch Location'}
                </button>
              </div>

              {geoError && (
                <p className="text-amber-600 text-[10px] font-medium">{geoError}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={s6Form.watch('latitude') || ''}
                    onChange={(e) => s6Form.setValue('latitude', parseFloat(e.target.value) || null)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={s6Form.watch('longitude') || ''}
                    onChange={(e) => s6Form.setValue('longitude', parseFloat(e.target.value) || null)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Resolved Address Display */}
              {addressLoading ? (
                <div className="flex items-center space-x-2 text-indigo-400 text-xs pt-0.5">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-500"></span>
                  <span>Resolving exact place name...</span>
                </div>
              ) : addressName ? (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg pt-0.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Exact Place / Address</p>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{addressName}</p>
                </div>
              ) : null}
            </div>

            {/* Availability Days / Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Working Days</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const daysSelected = s6Form.watch('working_days') || [];
                    const isSelected = daysSelected.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          if (isSelected) {
                            s6Form.setValue('working_days', daysSelected.filter((d: string) => d !== day));
                          } else {
                            s6Form.setValue('working_days', [...daysSelected, day]);
                          }
                        }}
                        className={`py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                {s6Form.formState.errors.working_days?.message && (
                  <p className="text-rose-600 text-[10px] mt-0.5 font-medium">{s6Form.formState.errors.working_days.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Working Hours</label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="time"
                      {...s6Form.register('working_hours_start')}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none"
                    />
                    <span className="text-slate-500 text-xs">to</span>
                    <input
                      type="time"
                      {...s6Form.register('working_hours_end')}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">24/7 Availability</p>
                    <p className="text-[9px] text-slate-500">Emergency support</p>
                  </div>
                  <input
                    type="checkbox"
                    {...s6Form.register('emergency_availability')}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Vendor Code of Conduct & Anti-Theft Policy Notice */}
            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed mb-3">
              <p className="font-bold text-amber-950 mb-1">
                ⚖️ Partner Security & Accountability Notice:
              </p>
              Vendors operate as independent service providers. UrService holds zero tolerance for theft or property damage. Any theft or criminal misconduct will result in immediate permanent account suspension and full disclosure of your verified KYC documents, address, and contact information to the client and law enforcement.
            </div>

            {/* Checkboxes Agreements */}
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Legal Agreements</span>
                <button
                  type="button"
                  onClick={() => {
                    setLegalModalTab('terms');
                    setLegalModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Review & Tick in Pop-up</span>
                </button>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  {...s6Form.register('acceptTerms')}
                  className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 text-indigo-600 bg-white cursor-pointer"
                />
                <label htmlFor="acceptTerms" className="ml-2 text-xs text-slate-600">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLegalModalTab('terms');
                      setLegalModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </label>
              </div>
              {s6Form.formState.errors.acceptTerms?.message && (
                <p className="text-rose-600 text-[10px]">{s6Form.formState.errors.acceptTerms.message}</p>
              )}

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptPrivacy"
                  {...s6Form.register('acceptPrivacy')}
                  className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 text-indigo-600 bg-white cursor-pointer"
                />
                <label htmlFor="acceptPrivacy" className="ml-2 text-xs text-slate-600">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLegalModalTab('privacy');
                      setLegalModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {s6Form.formState.errors.acceptPrivacy?.message && (
                <p className="text-rose-600 text-[10px]">{s6Form.formState.errors.acceptPrivacy.message}</p>
              )}

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptAgreement"
                  {...s6Form.register('acceptAgreement')}
                  className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 text-indigo-600 bg-white cursor-pointer"
                />
                <label htmlFor="acceptAgreement" className="ml-2 text-xs text-slate-600">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLegalModalTab('terms');
                      setLegalModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 cursor-pointer"
                  >
                    Vendor Partner Agreement
                  </button>
                </label>
              </div>
              {s6Form.formState.errors.acceptAgreement?.message && (
                <p className="text-rose-600 text-[10px]">{s6Form.formState.errors.acceptAgreement.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              {isSubmitting ? 'Submitting Wizard...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* Action Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-5">
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-black hover:text-black transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          Want to sign up as a regular client instead?{' '}
          <Link href="/register/client" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
            Register Client
          </Link>
        </div>
      </div>

      <TermsPrivacyModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        defaultTab={legalModalTab}
        initialAccepted={{
          terms: s6Form.watch('acceptTerms'),
          privacy: s6Form.watch('acceptPrivacy'),
        }}
        onAccept={(state) => {
          if (state.terms) {
            s6Form.setValue('acceptTerms', true, { shouldValidate: true });
            s6Form.setValue('acceptAgreement', true, { shouldValidate: true });
          }
          if (state.privacy) {
            s6Form.setValue('acceptPrivacy', true, { shouldValidate: true });
          }
        }}
      />
    </div>
  );
}
