import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token expires (401), redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Types ─────────────────────────────────────────────────────────────────────
export type JobType = 'Internship' | 'FullTime' | 'PartTime';
export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface Application {
  id: string;
  company_name: string;
  job_title: string;
  job_type: JobType;
  status: ApplicationStatus;
  applied_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};

// ── Applications API ──────────────────────────────────────────────────────────
export const applicationsApi = {
  getAll: (params?: { status?: string; search?: string }) =>
    api.get<{ data: Application[]; total: number }>('/applications', { params }),

  getOne: (id: string) =>
    api.get<Application>(`/applications/${id}`),

  create: (data: Omit<Application, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Application>('/applications', data),

  update: (id: string, data: Partial<Application>) =>
    api.patch<Application>(`/applications/${id}`, data),

  delete: (id: string) =>
    api.delete<Application>(`/applications/${id}`),
};
