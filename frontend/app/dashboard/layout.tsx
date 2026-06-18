'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/auth-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-navy-900 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-white">
                Job Tracker
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white">{user?.email}</span>
              <button
                onClick={logout}
                className="text-sm font-medium text-white/90 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
