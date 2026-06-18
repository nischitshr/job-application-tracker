'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../../lib/api';

const applicationSchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(200),
  job_title: z.string().min(1, "Job title is required").max(200),
  job_type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  status: z.enum(['APPLIED', 'INTERVIEWING', 'OFFER_RECEIVED', 'REJECTED', 'ACCEPTED']).optional().default('APPLIED'),
  applied_date: z.string().min(1, "Applied date is required"),
  notes: z.string().max(2000).optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function NewApplicationPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applied_date: new Date().toISOString().split('T')[0],
      job_type: 'FULL_TIME',
      status: 'APPLIED'
    }
  });

  const onSubmit = async (data: ApplicationFormValues) => {
    try {
      setApiError(null);
      // Backend expects applied_date to be ISO date string
      const isoDate = new Date(data.applied_date).toISOString();
      await api.post('/applications', {
        ...data,
        applied_date: isoDate
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      setApiError(error.response?.data?.message || 'Failed to save application.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Application</h1>

      {apiError && (
        <div className="mb-4 bg-red-100 text-red-700 p-3 rounded text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              {...register('company_name')}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>}
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              {...register('job_title')}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.job_title && <p className="mt-1 text-sm text-red-600">{errors.job_title.message}</p>}
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Type</label>
            <select
              {...register('job_type')}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FREELANCE">Freelance</option>
            </select>
            {errors.job_type && <p className="mt-1 text-sm text-red-600">{errors.job_type.message}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              {...register('status')}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="OFFER_RECEIVED">Offer Received</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>

          {/* Applied Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Applied</label>
            <input
              type="date"
              {...register('applied_date')}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.applied_date && <p className="mt-1 text-sm text-red-600">{errors.applied_date.message}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            {...register('notes')}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none"
          ></textarea>
          {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Saving...' : 'Save Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
