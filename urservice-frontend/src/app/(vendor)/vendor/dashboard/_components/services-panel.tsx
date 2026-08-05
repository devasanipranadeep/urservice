'use client';

import { useEffect, useState } from 'react';
import { Award, Plus, Edit2, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { apiClient, ApiError } from '../../../../../lib/api-client';
import ServiceFormModal from './service-form-modal';

interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  is_active: boolean;
}

interface ServicesPanelProps {
  isReadOnly?: boolean;
}

export default function ServicesPanel({ isReadOnly = false }: ServicesPanelProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const fetchServices = async () => {
    try {
      const list = await apiClient.get<Service[]>('/api/services/me');
      setServices(list);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.detail : 'Failed to fetch services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (serviceId: string) => {
    if (!confirm('Are you sure you want to deactivate this service listing?')) return;
    try {
      await apiClient.delete(`/api/services/${serviceId}`);
      // Refresh list
      fetchServices();
    } catch (err: any) {
      alert(err instanceof ApiError ? err.detail : 'Failed to deactivate service.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-lg animate-pulse">
        <div className="h-6 w-1/4 bg-slate-200 rounded"></div>
        <div className="h-24 bg-slate-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-lg">
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <span>Listed Services</span>
        </h3>
        {!isReadOnly && (
          <button
            onClick={handleAddClick}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-lg text-xs font-bold text-indigo-100 flex items-center space-x-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-center py-12 space-y-3 bg-slate-50 border border-slate-200 rounded-xl">
          <Award className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-500 text-sm font-medium">No services listed yet</p>
          {!isReadOnly && (
            <p className="text-slate-500 text-xs">Click the "Add Service" button above to get started.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
          {services.map((service) => (
            <div
              key={service.id}
              className={`p-4 rounded-xl border flex justify-between items-start transition-all shadow-sm ${
                service.is_active
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-slate-100/50 border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-1.5 max-w-[70%]">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-slate-800 text-sm leading-tight">{service.name}</h4>
                  {service.is_active ? (
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-550/10 text-emerald-600 border border-emerald-200 rounded-full font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-500 border border-slate-200 rounded-full font-semibold">
                      Inactive
                    </span>
                  )}
                </div>
                {service.description && (
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{service.description}</p>
                )}
                <div className="text-sm font-extrabold text-indigo-600">₹{service.price}</div>
              </div>

              {!isReadOnly && (
                <div className="flex space-x-2 shrink-0">
                  <button
                    onClick={() => handleEditClick(service)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                    title="Edit Service"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {service.is_active && (
                    <button
                      onClick={() => handleDeleteClick(service.id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-lg transition-colors"
                      title="Deactivate Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {!isReadOnly && (
        <ServiceFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchServices}
          service={selectedService}
        />
      )}
    </div>
  );
}
