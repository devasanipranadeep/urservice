'use client';

import { useState, useEffect } from 'react';
import { X, Award, Info, Landmark } from 'lucide-react';
import { apiClient, ApiError } from '../../../../../lib/api-client';

interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  is_active: boolean;
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  service?: Service | null; // If editing
}

export default function ServiceFormModal({ isOpen, onClose, onSave, service = null }: ServiceFormModalProps) {
  const isEdit = !!service;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (service) {
        setName(service.name);
        setDescription(service.description || '');
        setPrice(String(service.price));
      } else {
        setName('');
        setDescription('');
        setPrice('');
      }
      setValidationError(null);
    }
  }, [isOpen, service]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!name.trim() || name.length < 2) {
      setValidationError('Service name must be at least 2 characters.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setValidationError('Price must be a valid positive number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        description: description.trim() || null,
        price: numPrice,
      };

      if (isEdit && service) {
        await apiClient.patch(`/api/services/${service.id}`, payload);
      } else {
        await apiClient.post('/api/services', payload);
      }
      onSave();
      onClose();
    } catch (err: any) {
      setValidationError(err instanceof ApiError ? err.detail : 'Failed to save service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>{isEdit ? 'Edit Service' : 'Add New Service'}</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {validationError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start space-x-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Service Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Premium Home Deep Cleaning"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Includes full dust vacuuming, bathroom cleaning, kitchen degreasing..."
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Price (₹ INR) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500"
                className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-sm font-semibold rounded-lg text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-sm font-semibold rounded-lg text-slate-100 transition-colors shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
