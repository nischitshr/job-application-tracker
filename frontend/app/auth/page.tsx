'use client';

import React from 'react';
import LoginForm from '../../components/auth/LoginForm';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-navy-900 to-navy-800 px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Left: Welcome panel */}
        <div className="flex items-center justify-center">
          <div className="text-white max-w-md">
            <h1 className="text-4xl font-bold mb-4">Welcome to Job Tracker</h1>
            <p className="text-navy-100/80 mb-6">Track your applications, interviews, and offers in one place.</p>
            <ul className="space-y-3 text-navy-100/80">
              <li>• Centralize your applications</li>
              <li>• Track interview stages</li>
              <li>• Log notes and follow-ups</li>
            </ul>
          </div>
        </div>

        {/* Right: Login form only */}
        <div className="flex items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
