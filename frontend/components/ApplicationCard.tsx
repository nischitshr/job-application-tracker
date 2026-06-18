'use client';

import { Application, ApplicationStatus } from '../types';
import { Building2, Briefcase, Calendar, Pencil, Trash2 } from 'lucide-react';

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  Applied: { label: 'Applied', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  Interviewing: { label: 'Interviewing', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  Offer: { label: 'Offer', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  Rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const jobTypeLabel: Record<string, string> = {
  Internship: 'Internship',
  FullTime: 'Full-time',
  PartTime: 'Part-time',
};

interface Props {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
}

export default function ApplicationCard({ application, onEdit, onDelete }: Props) {
  const status = statusConfig[application.status];
  const date = new Date(application.applied_date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Company + Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold truncate">{application.company_name}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}>
              {status.label}
            </span>
          </div>

          {/* Job title */}
          <div className="flex items-center gap-1.5 mt-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <p className="text-slate-400 text-sm truncate">{application.job_title}</p>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-500 text-xs">{jobTypeLabel[application.job_type]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-500 text-xs">{date}</span>
            </div>
          </div>

          {/* Notes */}
          {application.notes && (
            <p className="text-slate-500 text-xs mt-3 line-clamp-2">{application.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(application)}
            className="p-1.5 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(application.id)}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
