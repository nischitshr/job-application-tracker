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

  const confirmDelete = async () => {
    if (!deletingId) return;
    await api.delete(`/applications/${deletingId}`);
    setDeletingId(null);
    fetchApplications();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Applied', count: applications.filter(a => a.status === 'Applied').length, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { label: 'Interviewing', count: applications.filter(a => a.status === 'Interviewing').length, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
    { label: 'Offer', count: applications.filter(a => a.status === 'Offer').length, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    { label: 'Rejected', count: applications.filter(a => a.status === 'Rejected').length, color: 'text-red-500', bg: 'bg-red-50 border-red-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-blue-600 font-bold text-lg tracking-tight">JobTracker</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
            >
              <LogOut size={15} />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page title + add button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
            <p className="text-sm text-gray-400 mt-0.5">{total} total</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Plus size={15} />
            Add application
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stats.map(s => (
            <div key={s.label} className={`border rounded-lg p-4 ${s.bg}`}>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or role..."
              className="w-full border border-gray-300 rounded-md pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s || 'All status'}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-400 text-sm">No applications yet.</p>
            <button
              onClick={() => { setEditing(null); setShowModal(true); }}
              className="mt-3 text-sm text-blue-600 font-medium hover:underline"
            >
              Add your first one
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Applied</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{app.company_name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{app.job_title}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{JOB_TYPE_LABELS[app.job_type]}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                      {new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setEditing(app); setShowModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingId(app.id)}
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
            <p className="text-sm text-gray-500 mt-1">This cannot be undone.</p>
            <div className="flex gap-2 mt-5">
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