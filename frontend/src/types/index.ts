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
  user_id: string;
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

export interface PaginatedApplications {
  data: Application[];
  total: number;
  filters: {
    status?: string;
    search?: string;
  };
}
