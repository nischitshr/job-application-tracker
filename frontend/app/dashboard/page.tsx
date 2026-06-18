'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import api from '../../lib/api';

interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  job_type: string;
  status: string;
  applied_date: string;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/applications');
        // adjust depending on API response structure. e.g. response.data.items
        setApplications(response.data.data || response.data || []);
      } catch (error) {
        console.error('Failed to fetch applications', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchApplications();
    }
  }, [user]);

  if (isLoading || loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!user) return null; // Let the useEffect redirect

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Applications</h1>
        <Link
          href="/dashboard/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          + Add Application
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No applications found. <Link href="/dashboard/new" className="text-blue-600 hover:underline">Add your first one!</Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.company_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{app.job_title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${app.status === 'APPLIED' ? 'bg-blue-100 text-blue-800' : 
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                        app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(app.applied_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
