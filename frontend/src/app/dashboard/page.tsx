'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Application, ApplicationStatus, PaginatedApplications } from '@/types';
import ApplicationModal from '@/components/ApplicationModal';
import { Pencil, Trash2, Plus, Search, LogOut, X } from 'lucide-react';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: 'bg-blue-50 text-blue-700 border-blue-200',
  Interviewing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Offer: 'bg-green-50 text-green-700 border-green-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
};

const JOB_TYPE_LABELS: Record<string, string> = {
  Internship: 'Internship',
  FullTime: 'Full-time',
  PartTime: 'Part-time',
};

const STATUS_OPTIONS = ['', 'Applied', 'Interviewing', 'Offer', 'Rejected'] as const;

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const { data } = await api.get<PaginatedApplications>(`/applications?${params}`);
      setApplications(data.data);
      setTotal(data.total);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(fetchApplications, 300);
    return () => clearTimeout(t);
  }, [user, fetchApplications]);

  const handleCreate = async (data: Partial<Application>) => {
    await api.post('/applications', data);
    fetchApplications();
  };

  const handleUpdate = async (data: Partial<Application>) => {
    await api.patch(`/applications/${editing!.id}`, data);
    fetchApplications();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await api.delete(`/applications/${deletingId}`);
    setDeletingId(null);
    fetchApplications();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-gray-900">Job Tracker</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Applications</h1>
            <p className="text-sm text-gray-400 mt-0.5">{total} total</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-700 transition"
          >
            <Plus size={15} />
            Add
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Applied', count: applications.filter(a => a.status === 'Applied').length },
            { label: 'Interviewing', count: applications.filter(a => a.status === 'Interviewing').length },
            { label: 'Offer', count: applications.filter(a => a.status === 'Offer').length },
            { label: 'Rejected', count: applications.filter(a => a.status === 'Rejected').length },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-xl font-semibold text-gray-900 mt-0.5">{s.count}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full border border-gray-300 rounded-md pl-8 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus | '')}
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s || 'All status'}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No applications found.</p>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="mt-3 text-sm text-gray-900 font-medium hover:underline"
            >
              Add your first one
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Role</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{app.company_name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{app.job_title}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{JOB_TYPE_LABELS[app.job_type]}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setEditing(app); setShowModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <ApplicationModal
          application={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSubmit={editing ? handleUpdate : handleCreate}
        />
      )}

      {/* Delete confirmation */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-gray-900">Delete application?</h3>
            <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium rounded-md py-2 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white text-sm font-medium rounded-md py-2 hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
