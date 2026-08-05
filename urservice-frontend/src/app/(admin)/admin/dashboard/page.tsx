'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../../../hooks/use-session';
import { supabase } from '../../../../lib/supabase';
import { apiClient, ApiError } from '../../../../lib/api-client';
import NotificationBell from '@/components/notification-bell';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Eye, 
  Check, 
  X, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  FileText,
  Filter
} from 'lucide-react';

interface Stats {
  total_clients: number;
  total_vendors: number;
  active_vendors: number;
  status_counts: {
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
}

interface VendorListItem {
  id: string;
  user_id: string;
  vendor_name: string;
  business_name: string;
  business_category: string;
  city: string;
  created_at: string;
  verification_status: string;
  rejection_reason?: string;
  suspension_reason?: string;
}

interface VendorListResponse {
  items: VendorListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useSession();

  // Stats State
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Queue State
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [totalVendors, setTotalVendors] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [queueLoading, setQueueLoading] = useState(true);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');

  // Rejected Queue State
  const [rejectedVendors, setRejectedVendors] = useState<VendorListItem[]>([]);
  const [totalRejectedVendors, setTotalRejectedVendors] = useState(0);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [rejectedTotalPages, setRejectedTotalPages] = useState(1);
  const [rejectedQueueLoading, setRejectedQueueLoading] = useState(true);

  // Suspended Queue State
  const [suspendedVendors, setSuspendedVendors] = useState<VendorListItem[]>([]);
  const [totalSuspendedVendors, setTotalSuspendedVendors] = useState(0);
  const [suspendedPage, setSuspendedPage] = useState(1);
  const [suspendedTotalPages, setSuspendedTotalPages] = useState(1);
  const [suspendedQueueLoading, setSuspendedQueueLoading] = useState(true);

  // Action Reason Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'reject' | 'suspend'>('reject');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const handleLogout = async () => {
    router.push('/');
    setTimeout(async () => {
      await supabase.auth.signOut();
    }, 100);
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await apiClient.get<Stats>('/api/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchQueue = async () => {
    setQueueLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      if (categoryFilter) queryParams.append('category', categoryFilter);
      if (cityFilter) queryParams.append('city', cityFilter);
      queryParams.append('page', page.toString());
      queryParams.append('page_size', '10');

      const data = await apiClient.get<VendorListResponse>(`/api/admin/vendors?${queryParams.toString()}`);
      setVendors(data.items);
      setTotalVendors(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setQueueLoading(false);
    }
  };

  const fetchRejectedQueue = async () => {
    setRejectedQueueLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('status', 'rejected');
      queryParams.append('page', rejectedPage.toString());
      queryParams.append('page_size', '10');

      const data = await apiClient.get<VendorListResponse>(`/api/admin/vendors?${queryParams.toString()}`);
      setRejectedVendors(data.items);
      setTotalRejectedVendors(data.total);
      setRejectedTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to fetch rejected queue:', err);
    } finally {
      setRejectedQueueLoading(false);
    }
  };

  const fetchSuspendedQueue = async () => {
    setSuspendedQueueLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('status', 'suspended');
      queryParams.append('page', suspendedPage.toString());
      queryParams.append('page_size', '10');

      const data = await apiClient.get<VendorListResponse>(`/api/admin/vendors?${queryParams.toString()}`);
      setSuspendedVendors(data.items);
      setTotalSuspendedVendors(data.total);
      setSuspendedTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to fetch suspended queue:', err);
    } finally {
      setSuspendedQueueLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRejectedQueue();
    fetchSuspendedQueue();
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [page, statusFilter, categoryFilter, cityFilter]);

  useEffect(() => {
    fetchRejectedQueue();
  }, [rejectedPage]);

  useEffect(() => {
    fetchSuspendedQueue();
  }, [suspendedPage]);

  const handleRefresh = () => {
    fetchStats();
    fetchQueue();
    fetchRejectedQueue();
    fetchSuspendedQueue();
  };

  const handleApprove = async (vendorId: string) => {
    if (!confirm('Are you sure you want to approve this vendor application?')) return;
    try {
      await apiClient.post(`/api/admin/vendors/${vendorId}/approve`, {});
      alert('Vendor application approved successfully.');
      handleRefresh();
    } catch (err: any) {
      alert(err instanceof ApiError ? err.detail : 'Failed to approve vendor.');
    }
  };

  const openActionModal = (vendorId: string, type: 'reject' | 'suspend') => {
    setSelectedVendorId(vendorId);
    setModalType(type);
    setActionReason('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId || !actionReason.trim()) return;

    setSubmittingAction(true);
    try {
      const endpoint = `/api/admin/vendors/${selectedVendorId}/${modalType}`;
      await apiClient.post(endpoint, { reason: actionReason.trim() });
      alert(`Vendor application ${modalType}ed successfully.`);
      setIsModalOpen(false);
      handleRefresh();
    } catch (err: any) {
      alert(err instanceof ApiError ? err.detail : `Failed to ${modalType} vendor.`);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Dashboard Shell Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-800">Admin Control Center</h1>
            <p className="text-slate-500 text-xs font-medium">
              Logged in as: <span className="font-mono text-slate-600">{user?.email}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-sm cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-sm font-semibold rounded-lg text-rose-700 transition-colors shadow-sm"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Stats Section */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center space-x-4 shadow-md">
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Clients</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats.total_clients}</p>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center space-x-4 shadow-md">
              <div className="p-3 bg-sky-50 border border-sky-200 text-sky-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Vendors</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats.total_vendors}</p>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center space-x-4 shadow-md">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Vendors</p>
                <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.active_vendors}</p>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center space-x-4 shadow-md">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Pending Queue</p>
                <p className="text-2xl font-bold text-amber-700 mt-0.5">{stats.status_counts.pending}</p>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center space-x-4 shadow-md">
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Suspended</p>
                <p className="text-2xl font-bold text-rose-700 mt-0.5">{stats.status_counts.suspended}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Verification Queue Section */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-xl">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              <span>Vendor Registry & Verification Queue</span>
            </h2>

            {/* Filter Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                </select>
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="Home Cleaning">Home Cleaning</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Salon & Beauty">Salon & Beauty</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                </select>
              </div>

              <div>
                <select
                  value={cityFilter}
                  onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="">All Cities</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          {queueLoading ? (
            <div className="space-y-4 py-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 border border-slate-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <Users className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-slate-500 font-medium text-sm">No vendors match your search filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4">Vendor Name</th>
                    <th className="px-6 py-4">Business Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4">Registered Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 bg-white">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{vendor.vendor_name}</td>
                      <td className="px-6 py-4 text-slate-600">{vendor.business_name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium">
                          {vendor.business_category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{vendor.city}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          vendor.verification_status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          vendor.verification_status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                          vendor.verification_status === 'suspended' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                          'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          {vendor.verification_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => router.push(`/admin/dashboard/vendors/${vendor.id}`)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-lg inline-flex items-center transition-colors cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        {vendor.verification_status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(vendor.id)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-lg inline-flex items-center transition-colors cursor-pointer"
                            title="Approve Vendor"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        
                        {vendor.verification_status !== 'rejected' && vendor.verification_status !== 'suspended' && (
                          <button
                            onClick={() => openActionModal(vendor.id, 'reject')}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg inline-flex items-center transition-colors cursor-pointer"
                            title="Reject Vendor"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        
                        {vendor.verification_status === 'approved' && (
                          <button
                            onClick={() => openActionModal(vendor.id, 'suspend')}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg inline-flex items-center transition-colors cursor-pointer"
                            title="Suspend Vendor"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!queueLoading && vendors.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{vendors.length}</span> of <span className="font-semibold text-slate-700">{totalVendors}</span> vendors
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600 px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rejected Vendors Section */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Rejected Vendors</span>
            </h2>
          </div>

          {/* Table Container */}
          {rejectedQueueLoading ? (
            <div className="space-y-4 py-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 border border-slate-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : rejectedVendors.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-slate-500 font-medium text-sm">No rejected vendors found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4">Vendor Name</th>
                    <th className="px-6 py-4">Business Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4">Rejection Reason</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 bg-white">
                  {rejectedVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{vendor.vendor_name}</td>
                      <td className="px-6 py-4 text-slate-600">{vendor.business_name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium">
                          {vendor.business_category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{vendor.city}</td>
                      <td className="px-6 py-4 text-rose-600 font-medium text-xs max-w-xs truncate" title={vendor.rejection_reason}>
                        {vendor.rejection_reason || 'No reason provided'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => router.push(`/admin/dashboard/vendors/${vendor.id}`)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-lg inline-flex items-center transition-colors cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleApprove(vendor.id)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-lg inline-flex items-center transition-colors cursor-pointer"
                          title="Approve / Restore Vendor"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!rejectedQueueLoading && rejectedVendors.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{rejectedVendors.length}</span> of <span className="font-semibold text-slate-700">{totalRejectedVendors}</span> rejected vendors
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRejectedPage((p) => Math.max(p - 1, 1))}
                  disabled={rejectedPage === 1}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600 px-3">
                  Page {rejectedPage} of {rejectedTotalPages}
                </span>
                <button
                  onClick={() => setRejectedPage((p) => Math.min(p + 1, rejectedTotalPages))}
                  disabled={rejectedPage === rejectedTotalPages}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Suspended Vendors Section */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Suspended Vendors</span>
            </h2>
          </div>

          {/* Table Container */}
          {suspendedQueueLoading ? (
            <div className="space-y-4 py-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 border border-slate-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : suspendedVendors.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-slate-500 font-medium text-sm">No suspended vendors found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4">Vendor Name</th>
                    <th className="px-6 py-4">Business Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4">Suspension Reason</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 bg-white">
                  {suspendedVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{vendor.vendor_name}</td>
                      <td className="px-6 py-4 text-slate-600">{vendor.business_name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium">
                          {vendor.business_category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{vendor.city}</td>
                      <td className="px-6 py-4 text-rose-600 font-medium text-xs max-w-xs truncate" title={vendor.suspension_reason}>
                        {vendor.suspension_reason || 'No reason provided'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => router.push(`/admin/dashboard/vendors/${vendor.id}`)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-lg inline-flex items-center transition-colors cursor-pointer"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleApprove(vendor.id)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-lg inline-flex items-center transition-colors cursor-pointer"
                          title="Restore / Approve Vendor"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!suspendedQueueLoading && suspendedVendors.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{suspendedVendors.length}</span> of <span className="font-semibold text-slate-700">{totalSuspendedVendors}</span> suspended vendors
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSuspendedPage((p) => Math.max(p - 1, 1))}
                  disabled={suspendedPage === 1}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600 px-3">
                  Page {suspendedPage} of {suspendedTotalPages}
                </span>
                <button
                  onClick={() => setSuspendedPage((p) => Math.min(p + 1, suspendedTotalPages))}
                  disabled={suspendedPage === suspendedTotalPages}
                  className="p-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Reason Input Modal (for Reject / Suspend) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-slate-800 capitalize">
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
                <label htmlFor="action-reason-textarea" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Reason for {modalType}
                </label>
                <textarea
                  required
                  id="action-reason-textarea"
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-sm font-semibold text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction || !actionReason.trim()}
                  className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-all cursor-pointer ${
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
