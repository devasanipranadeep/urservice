'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '../../../../hooks/use-session';
import { supabase } from '../../../../lib/supabase';
import { apiClient, ApiError } from '../../../../lib/api-client';
import NotificationBell from '@/components/notification-bell';
import { Camera, MapPin, Phone, User, Calendar, LogOut, Edit2, X, Upload, Home, Clock, Trash2 } from 'lucide-react';

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  city: string;
  profile_photo_url: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  client_id: string;
  vendor_id: string;
  service_id: string;
  status: string;
  scheduled_at: string;
  created_at: string;
  vendor: {
    business_name: string;
    business_logo_url: string | null;
  };
  service: {
    name: string;
    price: number;
  };
}

function ClientDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'dashboard';

  // Active Tab State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const { user } = useSession();

  // Profile and Bookings States
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [signedPhotoUrl, setSignedPhotoUrl] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // File Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Reschedule Modal States
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      // 1. Fetch Profile
      const profileData = await apiClient.get<ProfileData>('/api/profiles/me');
      setProfile(profileData);
      
      // Initialize edit fields
      setEditName(profileData.full_name);
      setEditPhone(profileData.phone || '');
      setEditCity(profileData.city);

      // 2. Fetch Photo URL if path exists
      if (profileData.profile_photo_url) {
        const photoRes = await apiClient.get<{ signedUrl: string | null }>('/api/profiles/me/photo-url');
        setSignedPhotoUrl(photoRes.signedUrl);
        if (photoRes.signedUrl && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('profile-updated', { detail: { signedUrl: photoRes.signedUrl } }));
        }
      }

      // 3. Fetch Bookings
      const bookingsData = await apiClient.get<Booking[]>('/api/bookings/me');
      setBookings(bookingsData);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // Profile doesn't exist yet, we will prompt user to create one
        setApiError('profile_not_created');
      } else {
        setApiError((err as Error).message || 'Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    router.push('/');
    setTimeout(async () => {
      await supabase.auth.signOut();
    }, 100);
  };

  // Edit Profile submission
  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await apiClient.patch<ProfileData>('/api/profiles/me', {
        full_name: editName,
        phone: editPhone || null,
        city: editCity,
      });
      setProfile(updated);
      setIsEditOpen(false);
    } catch (err) {
      setEditError((err as Error).message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // Profile create submission (in case profile doesn't exist yet)
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const created = await apiClient.post<ProfileData>('/api/profiles', {
        full_name: editName,
        phone: editPhone || null,
        city: editCity,
      });
      setProfile(created);
      setApiError(null);
    } catch (err) {
      setEditError((err as Error).message || 'Failed to create profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // Reschedule handlers
  const openRescheduleModal = (bookingId: string, currentScheduledAt: string) => {
    setRescheduleBookingId(bookingId);
    // Convert current ISO scheduled_at to YYYY-MM-DDTHH:MM local format
    const dateObj = new Date(currentScheduledAt);
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
    setRescheduleDateTime(localISOTime);
    setRescheduleError(null);
    setIsRescheduleOpen(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleBookingId || !rescheduleDateTime) return;

    const selectedDate = new Date(rescheduleDateTime);
    if (selectedDate <= new Date()) {
      setRescheduleError('Please choose a date and time in the future.');
      return;
    }

    setRescheduleLoading(true);
    setRescheduleError(null);
    try {
      await apiClient.patch(`/api/bookings/${rescheduleBookingId}`, {
        scheduled_at: selectedDate.toISOString(),
      });
      alert('Booking rescheduled successfully.');
      setIsRescheduleOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      setRescheduleError(err instanceof ApiError ? err.detail : 'Failed to reschedule booking.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking appointment?')) return;
    try {
      await apiClient.patch(`/api/bookings/${bookingId}`, {
        status: 'cancelled',
      });
      alert('Booking cancelled successfully.');
      fetchDashboardData();
    } catch (err: any) {
      alert(err instanceof ApiError ? err.detail : 'Failed to cancel booking.');
    }
  };

  // Handle Drag & Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndUploadFile(e.target.files[0]);
    }
  };

  const validateAndUploadFile = async (file: File) => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setUploadError('Invalid format. Please upload a JPG or PNG image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File exceeds 2MB limit.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post<{ profile_photo_url: string; signedUrl: string }>('/api/profiles/me/photo', formData);
      setSignedPhotoUrl(res.signedUrl);
      if (profile) {
        setProfile({
          ...profile,
          profile_photo_url: res.profile_photo_url,
        });
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: { signedUrl: res.signedUrl } }));
      }
    } catch (err) {
      setUploadError((err as Error).message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'requested':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-indigo-50 border border-indigo-200 text-indigo-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 p-8 font-sans animate-pulse">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-4">
            <div className="space-y-2 w-1/3">
              <div className="h-8 bg-slate-100 rounded-xl"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-3/4"></div>
            </div>
            <div className="h-10 bg-slate-100 rounded-xl w-24"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6 md:col-span-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col items-center space-y-4">
                <div className="w-28 h-28 rounded-full bg-slate-200"></div>
                <div className="h-6 bg-slate-100 rounded-lg w-1/2"></div>
                <div className="h-4 bg-slate-100 rounded-lg w-1/3"></div>
                <div className="h-4 bg-slate-100 rounded-lg w-2/3"></div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="h-6 bg-slate-100 rounded-lg w-1/4"></div>
                <div className="space-y-3 mt-4">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-16 bg-slate-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile needs creation layout
  if (apiError === 'profile_not_created') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-800">Complete Your Profile</h2>
            <p className="text-slate-400 text-sm mt-2">Create your profile to start booking services.</p>
          </div>

          {editError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
              {editError}
            </div>
          )}

          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div>
              <label htmlFor="create-profile-name" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                required
                id="create-profile-name"
                name="full_name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="create-profile-phone" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Mobile Number</label>
              <input
                type="text"
                placeholder="10 digit number"
                id="create-profile-phone"
                name="phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="create-profile-city" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">City</label>
              <input
                type="text"
                required
                id="create-profile-city"
                name="city"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={editLoading}
              className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all"
            >
              {editLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Component Renders
  const renderProfileCard = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl"></div>
      
      <div className="relative group w-28 h-28 mb-4 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
        {signedPhotoUrl ? (
          <img
            src={signedPhotoUrl}
            alt={profile?.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-12 h-12 text-slate-600" />
        )}
        <button
          onClick={triggerFileInput}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center transition-opacity text-[10px] text-slate-200 font-semibold cursor-pointer"
        >
          <Camera className="w-5 h-5 mb-1" />
          Update Photo
        </button>
      </div>

      <h2 className="text-xl font-bold text-slate-800">{profile?.full_name}</h2>
      <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-6">Client Member</p>

      <div className="w-full space-y-3 text-left border-t border-slate-200 pt-5 text-sm text-slate-600">
        <div className="flex items-center space-x-3">
          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>{profile?.city}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Phone className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>{profile?.phone || 'Add phone number'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <User className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="truncate">{user?.email}</span>
        </div>
      </div>

      <button
        onClick={() => setIsEditOpen(true)}
        className="mt-6 flex items-center justify-center space-x-2 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
      >
        <Edit2 className="w-3.5 h-3.5" />
        <span>Edit Profile Details</span>
      </button>
    </div>
  );

  const renderPhotoUploaderCard = () => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
      <h3 className="text-sm font-bold text-slate-800">Profile Photo Upload</h3>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col justify-center items-center ${
          dragActive ? "border-blue-500 bg-blue-500/5" : "border-slate-200 hover:border-slate-300 bg-slate-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png"
          id="profile-photo-input"
          name="profile_photo"
          className="hidden"
        />
        <Upload className="w-8 h-8 text-slate-600 mb-3" />
        {uploading ? (
          <p className="text-slate-600 text-xs font-medium animate-pulse">Uploading file...</p>
        ) : (
          <>
            <p className="text-xs text-slate-700 font-semibold">Drag & drop your photo</p>
            <p className="text-[10px] text-slate-400 mt-1">or click to browse. JPG, PNG up to 2MB</p>
          </>
        )}
      </div>
      {uploadError && (
        <p className="text-rose-600 text-xs font-medium text-center">{uploadError}</p>
      )}
    </div>
  );

  const renderBookingsCard = (fullWidth: boolean) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-indigo-400" />
        <span>Your Active Bookings</span>
      </h2>

      {bookings.length === 0 ? (
        <div className="flex-1 border border-dashed border-slate-200 rounded-xl p-8 flex flex-col justify-center items-center text-center space-y-3 bg-slate-50">
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-700 text-sm font-semibold">No bookings found</p>
            <p className="text-slate-400 text-xs mt-1">Start browsing services to book your first provider appointment!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {bookings.map((booking) => {
            const isCancellable = booking.status.toLowerCase() !== 'cancelled' && booking.status.toLowerCase() !== 'completed';
            
            return (
              <div
                key={booking.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-slate-800 text-sm sm:text-base">
                    {booking.service?.name || 'General Service'}
                  </div>
                  <div className="text-xs text-indigo-600 font-medium">
                    Provider: <span className="text-slate-700">{booking.vendor?.business_name || 'Verified Vendor'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {new Date(booking.scheduled_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    {booking.service?.price && (
                      <span className="text-slate-600 pl-2 border-l border-slate-200 font-mono">
                        ₹{booking.service.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>

                  {isCancellable && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openRescheduleModal(booking.id, booking.scheduled_at)}
                        className="p-1.5 bg-white hover:bg-indigo-950/40 border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 rounded-lg inline-flex items-center transition-colors cursor-pointer"
                        title="Reschedule Appointment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="p-1.5 bg-white hover:bg-rose-950/30 border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 rounded-lg inline-flex items-center transition-colors cursor-pointer"
                        title="Cancel Appointment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              UrService Client Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage your service accounts, bookings, and profile settings</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 border border-indigo-200 hover:border-indigo-300 rounded-xl text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-all hover:bg-indigo-100/50"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-800 transition-all hover:bg-slate-200/50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {apiError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm text-center">
            {apiError}
          </div>
        )}

        {/* Tabs Controls */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3.5 text-xs uppercase tracking-wider font-bold transition-all relative cursor-pointer ${
              activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            Dashboard
            {activeTab === 'dashboard' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3.5 text-xs uppercase tracking-wider font-bold transition-all relative cursor-pointer ${
              activeTab === 'profile' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            Profile Details
            {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3.5 text-xs uppercase tracking-wider font-bold transition-all relative cursor-pointer ${
              activeTab === 'bookings' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            Manage Bookings
            {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
          </button>
        </div>

        {/* Tab panels */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6 md:col-span-1">
              {renderProfileCard()}
            </div>
            <div className="md:col-span-2">
              {renderBookingsCard(false)}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              {renderProfileCard()}
            </div>
            <div className="md:col-span-2">
              {renderPhotoUploaderCard()}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="max-w-3xl mx-auto">
            {renderBookingsCard(true)}
          </div>
        )}

      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Edit Profile</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label htmlFor="edit-profile-name" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  id="edit-profile-name"
                  name="full_name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-profile-phone" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Mobile Number</label>
                <input
                  type="text"
                  id="edit-profile-phone"
                  name="phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="edit-profile-city" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">City</label>
                <input
                  type="text"
                  required
                  id="edit-profile-city"
                  name="city"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-sm font-semibold rounded-xl text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Booking Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Reschedule Appointment</h3>
              <button
                onClick={() => setIsRescheduleOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reschedule-datetime-input" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Select New Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  id="reschedule-datetime-input"
                  name="scheduled_at"
                  value={rescheduleDateTime}
                  onChange={(e) => setRescheduleDateTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-sm font-semibold rounded-xl text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  {rescheduleLoading ? 'Updating...' : 'Save Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ClientDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans flex justify-center items-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    }>
      <ClientDashboardContent />
    </Suspense>
  );
}
