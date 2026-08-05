'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '@/lib/api-client';
import NotificationBell from '@/components/notification-bell';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Check, 
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  User,
  ExternalLink
} from 'lucide-react';

interface Address {
  house_number?: string;
  street?: string;
  area?: string;
  city: string;
  state: string;
  pincode: string;
}

interface Location {
  latitude?: number;
  longitude?: number;
}

interface PersonalInfo {
  full_name: string;
  phone?: string;
  email: string;
  profile_photo_url?: string;
}

interface BankDetails {
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id?: string;
}

interface DocumentDetail {
  id: string;
  document_type: string;
  document_category: string;
  file_url: string;
  signed_url: string;
  verification_status: string;
  remarks?: string;
  uploaded_at: string;
}

interface VendorDetail {
  id: string;
  user_id: string;
  business_name: string;
  business_category: string;
  business_description?: string;
  years_experience: number;
  service_radius_km: number;
  date_of_birth: string;
  gender: string;
  address: Address;
  location: Location;
  business_logo_url?: string;
  verification_status: string;
  rejection_reason?: string;
  suspension_reason?: string;
  working_days: string[];
  working_hours_start: string;
  working_hours_end: string;
  emergency_availability: boolean;
  created_at: string;
  updated_at: string;
  personal_info: PersonalInfo;
  bank_details?: BankDetails;
  documents: DocumentDetail[];
}

export default function VendorDetailPage({ params }: { params: any }) {
  const router = useRouter();
  
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Preview Document
  const [previewDoc, setPreviewDoc] = useState<DocumentDetail | null>(null);

  // Action Reason Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'reject' | 'suspend'>('reject');
  const [actionReason, setActionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Resolve Next.js Dynamic Params
  useEffect(() => {
    Promise.resolve(params).then((resolved) => {
      setVendorId(resolved.id);
    });
  }, [params]);

  const fetchVendorDetails = async () => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<VendorDetail>(`/api/admin/vendors/${vendorId}`);
      setVendor(data);
      if (data.documents && data.documents.length > 0) {
        setPreviewDoc(data.documents[0]);
      }
    } catch (err: any) {
      setError(err instanceof ApiError ? err.detail : 'Failed to load vendor details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorDetails();
  }, [vendorId]);

  const handleApprove = async () => {
    if (!vendor) return;
    if (!confirm('Are you sure you want to approve this vendor application?')) return;

    try {
      await apiClient.post(`/api/admin/vendors/${vendor.id}/approve`, {});
      alert('Vendor application approved successfully.');
      fetchVendorDetails();
    } catch (err: any) {
      alert(err instanceof ApiError ? err.detail : 'Failed to approve vendor.');
    }
  };

  const openActionModal = (type: 'reject' | 'suspend') => {
    setModalType(type);
    setActionReason('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || !actionReason.trim()) return;

    setSubmittingAction(true);
    try {
      const endpoint = `/api/admin/vendors/${vendor.id}/${modalType}`;
      await apiClient.post(endpoint, { reason: actionReason.trim() });
      alert(`Vendor application ${modalType}ed successfully.`);
      setIsModalOpen(false);
      fetchVendorDetails();
    } catch (err: any) {
      alert(err instanceof ApiError ? err.detail : `Failed to ${modalType} vendor.`);
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
          </div>
          <p className="text-slate-500 text-sm font-semibold tracking-wide">
            Loading Vendor Profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-8 flex flex-col justify-center items-center font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Failed to Load Profile</h2>
          <p className="text-slate-500 text-sm">{error || 'Vendor record not found.'}</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-sm font-semibold rounded-lg text-slate-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  // Address assembly helper
  const addressString = [
    vendor.address.house_number,
    vendor.address.street,
    vendor.address.area,
    vendor.address.city,
    vendor.address.state,
    vendor.address.pincode
  ].filter(Boolean).join(', ');

  // Map Iframe URL Setup
  const lat = vendor.location.latitude;
  const lng = vendor.location.longitude;
  const showMap = lat !== undefined && lat !== null && lng !== undefined && lng !== null;
  const mapUrl = showMap 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng! - 0.005}%2C${lat! - 0.005}%2C${lng! + 0.005}%2C${lat! + 0.005}&layer=mapnik&marker=${lat!}%2C${lng!}` 
    : '';

  // Document file type helper
  const isPdf = (url: string) => url.toLowerCase().includes('.pdf');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Action Shell */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center space-x-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
              <span>{vendor.personal_info.full_name}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                vendor.verification_status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                vendor.verification_status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                vendor.verification_status === 'suspended' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                {vendor.verification_status}
              </span>
            </h1>
            <p className="text-slate-500 text-xs font-mono">Vendor Profile UUID: {vendor.id}</p>
          </div>

          {/* Action Decision Row */}
          <div className="flex flex-wrap items-center gap-3">
            <NotificationBell />
            {vendor.verification_status !== 'approved' && (
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-xs font-bold text-white rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Approve Account</span>
              </button>
            )}
            {vendor.verification_status !== 'rejected' && vendor.verification_status !== 'suspended' && (
              <button
                onClick={() => openActionModal('reject')}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
                <span>Reject Application</span>
              </button>
            )}
            {vendor.verification_status === 'approved' && (
              <button
                onClick={() => openActionModal('suspend')}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Suspend Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Rejection / Suspension Banner */}
        {vendor.verification_status === 'rejected' && vendor.rejection_reason && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start space-x-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Application Rejected</p>
              <p className="text-rose-600 mt-0.5">{vendor.rejection_reason}</p>
            </div>
          </div>
        )}

        {vendor.verification_status === 'suspended' && vendor.suspension_reason && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Account Suspended</p>
              <p className="text-rose-600 mt-0.5">{vendor.suspension_reason}</p>
            </div>
          </div>
        )}

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* LEFT: Info Panels */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Details Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Personal Information</span>
              </h3>
              
              <div className="flex items-center space-x-4">
                {vendor.personal_info.profile_photo_url ? (
                  <img
                    src={vendor.personal_info.profile_photo_url}
                    alt="Vendor Profile"
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center font-bold text-xl">
                    {vendor.personal_info.full_name[0]}
                  </div>
                )}
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">{vendor.personal_info.full_name}</p>
                  <p className="text-slate-400 text-xs flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>DOB: {new Date(vendor.date_of_birth).toLocaleDateString()} ({vendor.gender})</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-xl">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>{vendor.personal_info.email}</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-xl">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  <span>{vendor.personal_info.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Business Details Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Business Details</span>
              </h3>

              {vendor.business_logo_url && (
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={vendor.business_logo_url}
                    alt="Business Logo"
                    className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1"
                  />
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Business Brand logo</p>
                    <p className="text-sm font-bold text-slate-700">{vendor.business_name}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase tracking-wider font-bold">Business Name</p>
                  <p className="text-slate-800 text-sm font-bold">{vendor.business_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase tracking-wider font-bold">Category</p>
                  <p className="text-slate-800 text-sm font-bold">{vendor.business_category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase tracking-wider font-bold">Experience</p>
                  <p className="text-slate-800 text-sm font-bold">{vendor.years_experience} Years</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase tracking-wider font-bold">Service Radius</p>
                  <p className="text-slate-800 text-sm font-bold">{vendor.service_radius_km} km</p>
                </div>
              </div>

              {vendor.business_description && (
                <div className="space-y-1 pt-2">
                  <p className="text-slate-500 uppercase tracking-wider text-xs font-bold">Description</p>
                  <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 border border-slate-200 rounded-xl">
                    {vendor.business_description}
                  </p>
                </div>
              )}

              <div className="space-y-1 pt-2">
                <p className="text-slate-500 uppercase tracking-wider text-xs font-bold">Operating Schedule</p>
                <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-3 border border-slate-200 rounded-xl">
                  <p className="font-semibold text-indigo-600">Days: {vendor.working_days.join(', ')}</p>
                  <p className="text-slate-400">Hours: {vendor.working_hours_start} - {vendor.working_hours_end}</p>
                  <p className="text-slate-600 mt-1">
                    Emergency availability: {vendor.emergency_availability ? '✅ Enabled' : '❌ Disabled'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Details Card */}
            {vendor.bank_details ? (
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-lg">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Settlement Bank Details</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
                  <div className="space-y-1">
                    <p className="text-slate-500 uppercase tracking-wider font-bold">Bank Name</p>
                    <p className="text-slate-800 font-bold">{vendor.bank_details.bank_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 uppercase tracking-wider font-bold">Holder Name</p>
                    <p className="text-slate-800 font-bold">{vendor.bank_details.account_holder_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 uppercase tracking-wider font-bold">Account Number</p>
                    <p className="text-slate-800 font-mono font-bold text-sm tracking-wide">{vendor.bank_details.account_number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 uppercase tracking-wider font-bold">IFSC Code</p>
                    <p className="text-slate-800 font-mono font-bold text-sm tracking-wide">{vendor.bank_details.ifsc_code}</p>
                  </div>
                </div>

                {vendor.bank_details.upi_id && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">UPI ID</span>
                    <span className="text-emerald-600 font-bold font-mono">{vendor.bank_details.upi_id}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center shadow-lg">
                <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 text-xs">No settlement bank details registered.</p>
              </div>
            )}

            {/* Location & Map Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Geographic Location</span>
              </h3>
              
              <div className="space-y-1">
                <p className="text-slate-500 uppercase tracking-wider text-xs font-bold">Registered Address</p>
                <p className="text-slate-700 text-xs leading-relaxed bg-slate-50 p-3 border border-slate-200 rounded-xl">
                  {addressString}
                </p>
              </div>

              {showMap ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xxs font-mono text-slate-500">
                    <span>LAT: {lat}</span>
                    <span>LNG: {lng}</span>
                  </div>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                    <iframe
                      src={mapUrl}
                      className="absolute inset-0 w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-slate-500 text-xs">Coordinates missing. Unable to display map.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Documents & Inline Preview */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Documents List Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-lg">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Verification Documents</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vendor.documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setPreviewDoc(doc)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      previewDoc?.id === doc.id
                        ? 'bg-indigo-50/50 border-indigo-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 capitalize truncate">
                        {doc.document_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xxs text-slate-500 uppercase tracking-wider font-semibold">
                        Category: {doc.document_category.replace(/_/g, ' ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-200 w-full">
                      <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                        doc.verification_status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        doc.verification_status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {doc.verification_status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Preview Pane */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-lg">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Document Preview
                </h3>
                {previewDoc?.signed_url && (
                  <a
                    href={previewDoc.signed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-500 transition-colors flex items-center space-x-1"
                  >
                    <span>Open External</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {previewDoc ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400">
                    File: <span className="font-mono text-slate-600">{previewDoc.file_url.split('/').pop()}</span>
                  </p>
                  
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-center min-h-[450px]">
                    {isPdf(previewDoc.signed_url) ? (
                      <iframe
                        src={previewDoc.signed_url}
                        className="w-full h-[550px] border-0 rounded-lg bg-white"
                        title={previewDoc.document_type}
                      />
                    ) : (
                      <img
                        src={previewDoc.signed_url}
                        alt={previewDoc.document_type}
                        className="max-w-full max-h-[550px] object-contain rounded-lg shadow-xl"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-xl">
                  <FileText className="w-12 h-12 text-slate-800 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Select a document above to view its contents inline.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Action Reason Input Modal (for Reject / Suspend) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-slate-900 capitalize">
                {modalType} Vendor Application
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="vendor-action-reason-textarea" className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                  Reason for {modalType}
                </label>
                <textarea
                  required
                  id="vendor-action-reason-textarea"
                  name="reason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Please state a reason for this ${modalType} (minimum 1 character required)...`}
                  rows={4}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors resize-none font-sans"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction || !actionReason.trim()}
                  className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed ${
                    modalType === 'reject'
                      ? 'bg-rose-600 hover:bg-rose-500 disabled:bg-rose-100 disabled:text-rose-400'
                      : 'bg-amber-600 hover:bg-amber-500 disabled:bg-amber-100 disabled:text-amber-400'
                  }`}
                >
                  {submittingAction ? `${modalType === 'reject' ? 'Rejecting' : 'Suspending'}...` : `Confirm ${modalType === 'reject' ? 'Rejection' : 'Suspension'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
