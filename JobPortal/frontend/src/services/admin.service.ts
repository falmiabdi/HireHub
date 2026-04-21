import { api } from './api'

export interface DashboardStats {
  total_users: number
  total_companies: number
  total_candidates: number
  total_jobs: number
  active_jobs: number
  pending_jobs: number
  total_applications: number
  pending_companies: number
  recent_users: User[]
  recent_jobs: Job[]
  recent_applications: Application[]
}

export interface User {
  user_id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string
}

export interface Job {
  job_id: number
  title: string
  company_name: string
  location: string
  type: string
  status: string
  approval_status: 'pending' | 'approved' | 'rejected'
  posted_at: string
  approved_at?: string
  rejection_reason?: string
}

export interface Application {
  application_id: number
  candidate_name: string
  job_title: string
  company_name: string
  status: string
  applied_at: string
}

export interface Analytics {
  jobs_by_type: { type: string; count: number }[]
  jobs_by_location: { location: string; count: number }[]
  applications_by_status: { status: string; count: number }[]
  registrations_by_period: { period: string; count: number }[]
  top_companies: { company_id: number; name: string; job_count: number }[]
  top_jobs: { job_id: number; title: string; application_count: number }[]
}

export interface ActivityLog {
  log_id: number
  user_id: number
  action: string
  details: string
  created_at: string
}

export const adminService = {
  getDashboard(): Promise<DashboardStats> {
    return api.get('/admin.php?action=dashboard').then(r => r.data.data)
  },

  getAnalytics(period = 'month'): Promise<Analytics> {
    return api.get(`/admin.php?action=analytics&period=${period}`).then(r => r.data.data)
  },

  getActivityLogs(page = 1, limit = 50): Promise<{ logs: ActivityLog[]; total: number }> {
    return api.get(`/admin.php?action=activity_logs&page=${page}&limit=${limit}`).then(r => r.data.data)
  },

  getUsers(page = 1, limit = 20, role?: string, status?: string): Promise<{ users: User[]; total: number }> {
    let url = `/admin.php?action=users&page=${page}&limit=${limit}`
    if (role) url += `&role=${role}`
    if (status) url += `&status=${status}`
    return api.get(url).then(r => r.data.data)
  },

  getCompanies(page = 1, limit = 20, status?: string): Promise<{ companies: Company[]; total: number }> {
    let url = `/admin.php?action=companies&page=${page}&limit=${limit}`
    if (status) url += `&status=${status}`
    return api.get(url).then(r => r.data.data)
  },

  getJobs(page = 1, limit = 20, status?: string, approvalStatus?: string): Promise<{ jobs: Job[]; total: number }> {
    let url = `/admin.php?action=jobs&page=${page}&limit=${limit}`
    if (status) url += `&status=${status}`
    if (approvalStatus) url += `&approval_status=${approvalStatus}`
    return api.get(url).then(r => r.data.data)
  },

  getPendingJobs(page = 1, limit = 20): Promise<{ jobs: Job[]; total: number }> {
    return api.get(`/admin.php?action=pending_jobs&page=${page}&limit=${limit}`).then(r => r.data.data)
  },

  approveJob(jobId: number): Promise<void> {
    return api.put('/admin.php?action=approve_job', { job_id: jobId })
  },

  rejectJob(jobId: number, reason: string): Promise<void> {
    return api.put('/admin.php?action=reject_job', { job_id: jobId, reason })
  },

  deleteUser(id: number): Promise<void> {
    return api.delete(`/admin.php?action=delete_user&id=${id}`)
  },

  deleteJob(id: number): Promise<void> {
    return api.delete(`/admin.php?action=delete_job&id=${id}`)
  },

  verifyCompany(companyId: number, status: string): Promise<void> {
    return api.put('/admin.php?action=verify_company', { company_id: companyId, status })
  },

  updateUserStatus(userId: number, status: string): Promise<void> {
    return api.put('/admin.php?action=update_user_status', { user_id: userId, status })
  },

  uploadProfileImage(file: File): Promise<{ profile_image: string }> {
    const formData = new FormData()
    formData.append('profile_image', file)
    return api.post('/admin.php?action=upload_profile_image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data)
  },
}

interface Company {
  company_id: number
  name: string
  email: string
  industry: string
  status: string
  created_at: string
}
