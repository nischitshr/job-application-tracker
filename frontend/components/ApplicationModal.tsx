'use client';

import { useState, useEffect } from 'react';
import { Application } from '../types';
import { X, Loader2 } from 'lucide-react';

interface Props {
  application?: Application | null;
  onClose: () => void;
  onSubmit: (data: Partial<Application>) => Promise<void>;
}

export default function ApplicationModal({ application, onClose, onSubmit }: Props) {
  const isEditing = !!application;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    company_name: '',
    job_title: '',
    job_type: 'Internship',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (application) {
      setForm({
        company_name: application.company_name,
        job_title: application.job_title,
        job_type: application.job_type,
        status: application.status,
        applied_date: application.applied_date.split('T')[0],
        notes: application.notes ?? '',
      });
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-white font-semibold text-lg">
            {isEditing ? 'Edit application' : 'Add application'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Company name</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="Google"
                required
                className={inputClass}
              />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Job title</label>
              <input
                type="text"
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                placeholder="Software Engineering Intern"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Job type</label>
              <select
                value={form.job_type}
                onChange={(e) => setForm({ ...form, job_type: e.target.value })}
                className={inputClass}
              >
                <option value="Internship">Internship</option>
                <option value="FullTime">Full-time</option>
                <option value="PartTime">Part-time</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}
              >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Date applied</label>
              <input
                type="date"
                value={form.applied_date}
                onChange={(e) => setForm({ ...form, applied_date: e.target.value })}
                required
                className={inputClass}
              />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Notes <span className="text-slate-500">(optional)</span></label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Add any notes about this application..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg py-2.5 text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-medium rounded-lg py-2.5 text-sm transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditing ? 'Save changes' : 'Add application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
