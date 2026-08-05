'use client';

import { useState } from 'react';
import { AlertTriangle, UploadCloud, CheckCircle2, ShieldAlert } from 'lucide-react';
import { apiClient, ApiError } from '../../../../../lib/api-client';

interface Vendor {
  id: string;
  business_name: string;
  rejection_reason?: string | null;
}

interface RejectedViewProps {
  vendor: Vendor;
  onStatusChange: () => void;
}

export default function RejectedView({ vendor, onStatusChange }: RejectedViewProps) {
  const [resubmitting, setResubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for document upload
  const [docCategory, setDocCategory] = useState<'identity' | 'business_proof'>('identity');
  const [docType, setDocType] = useState<string>('identity_document');
  const [file, setFile] = useState<File | null>(null);

  const handleResubmit = async () => {
    setResubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await apiClient.patch(`/api/vendors/me/resubmit`, {});
      onStatusChange(); // Trigger dashboard refetch
    } catch (err: any) {
      setError(err instanceof ApiError ? err.detail : 'Failed to resubmit application.');
    } finally {
      setResubmitting(false);
    }
  };

  const handleDocCategoryChange = (val: 'identity' | 'business_proof') => {
    setDocCategory(val);
    setDocType(val === 'identity' ? 'identity_document' : 'shop_license');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('document_category', docCategory);
    formData.append('file', file);

    try {
      await apiClient.post(`/api/vendors/me/documents`, formData);
      setSuccessMsg('Document re-uploaded successfully! You can now resubmit your application.');
      setFile(null);
      // Reset input element
      const fileInput = document.getElementById('corrected-doc') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err instanceof ApiError ? err.detail : 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Rejection Alert */}
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-4 shadow-xl">
        <div className="p-3 bg-rose-100 border border-rose-200 text-rose-600 rounded-xl shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-rose-700">Application Rejected</h2>
          <p className="text-slate-700 text-sm font-semibold">
            Reason: {vendor.rejection_reason || 'Information provided did not meet validation guidelines.'}
          </p>
          <p className="text-slate-500 text-xs">
            Please review the reason above, re-upload the corrected documents below, and click "Resubmit for Verification".
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Re-upload documents panel */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-200 pb-3">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            <span>Upload Corrected Document</span>
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Document Category</label>
              <select
                value={docCategory}
                onChange={(e) => handleDocCategoryChange(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="identity">Identity Proof (Aadhaar, Passport, etc.)</option>
                <option value="business_proof">Business Proof (Licenses, Certificates)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Document Type</label>
              {docCategory === 'identity' ? (
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="identity_document">Identity Document</option>
                </select>
              ) : (
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="shop_license">Shop License</option>
                  <option value="trade_license">Trade License</option>
                  <option value="registration_certificate">Registration Certificate</option>
                  <option value="category_certificate">Category Certificate</option>
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Document File (PDF, PNG, JPG - Max 5MB)</label>
              <input
                id="corrected-doc"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-sm font-semibold rounded-lg text-slate-100 transition-colors shadow-lg shadow-indigo-100"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>

        {/* Resubmit Application panel */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-200 pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>Resubmit Profile</span>
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Once you have uploaded the necessary corrected documents, you can resubmit your vendor profile for verification.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              Our administrators will review your update. The standard review process takes another 24–48 hours.
            </p>
          </div>

          <button
            onClick={handleResubmit}
            disabled={resubmitting}
            className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 text-sm font-bold rounded-lg text-slate-100 transition-colors shadow-lg shadow-emerald-100"
          >
            {resubmitting ? 'Resubmitting...' : 'Resubmit for Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}
