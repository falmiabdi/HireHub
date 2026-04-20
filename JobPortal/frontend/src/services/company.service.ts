import { api } from './api'

export interface CompanyDashboard {
  total_jobs: number
  active_jobs: number
  total_applications: number
  pending_applications: number
  recent_applications: Application[]
  recent_jobs: Job[]
}

export interface Job {
  job_id: number
  title: string
  description: string
  location: string
  job_type: string
  experience_level: string
  salary_range?: string
  status: string
  posted_at: string
  application_count?: number
}

export interface Application {
  application_id: number
  candidate_name: string
  candidate_email: string
  job_title: string
  cover_letter: string
  expected_salary?: string
  resume_used?: string
  status: string
  applied_at: string
}

export interface CompanyProfile {
  company_id: number
  name: string
  email: string
  phone?: string
  website?: string
  industry?: string
  size?: string
  description?: string
  logo_path?: string
  address?: string
  ceo_name?: string
  director_name?: string
  status: string
}

export const companyService = {
  getDashboard(): Promise<CompanyDashboard> {
    return api.get('/company.php?action=dashboard').then(r => r.data.data)
  },

  getMyJobs(page = 1, limit = 20): Promise<{ jobs: Job[]; total: number }> {
    return api.get(`/company.php?action=my_jobs&page=${page}&limit=${limit}`).then(r => r.data.data)
  },

  getApplications(page = 1, limit = 20, status?: string): Promise<{ applications: Application[]; total: number }> {
    let url = `/company.php?action=applications&page=${page}&limit=${limit}`
    if (status) url += `&status=${status}`
    return api.get(url).then(r => r.data.data)
  },

  getJobApplications(jobId: number): Promise<{ applications: Application[] }> {
    return api.get(`/company.php?action=job_applications&job_id=${jobId}`).then(r => r.data.data)
  },

  postJob(jobData: Partial<Job>): Promise<{ job_id: number }> {
    return api.post('/company.php?action=post_job', jobData).then(r => r.data.data)
  },

  updateJob(jobId: number, jobData: Partial<Job>): Promise<void> {
    return api.put(`/company.php?action=update_job&id=${jobId}`, jobData)
  },

  deleteJob(jobId: number): Promise<void> {
    return api.delete(`/company.php?action=delete_job&id=${jobId}`)
  },

  updateApplicationStatus(applicationId: number, status: string, notes?: string): Promise<void> {
    return api.post('/company.php?action=update_application_status', { application_id: applicationId, status, notes })
  },

  getProfile(): Promise<{ profile: CompanyProfile }> {
    return api.get('/company.php?action=profile').then(r => r.data.data)
  },

  updateProfile(profileData: Partial<CompanyProfile>): Promise<void> {
    return api.put('/company.php?action=update_profile', profileData)
  },

  uploadLogo(file: File): Promise<{ logo_path: string }> {
    const formData = new FormData()
    formData.append('logo', file)
    return api.post('/company.php?action=upload_logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data)
  },
}
