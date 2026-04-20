import { api } from './api'

export interface CandidateDashboard {
  total_applications: number
  pending_applications: number
  shortlisted_applications: number
  rejected_applications: number
  saved_jobs_count: number
  recent_applications: Application[]
  recommended_jobs: Job[]
}

export interface Job {
  job_id: number
  title: string
  description: string
  company_name: string
  company_id: number
  location: string
  job_type: string
  experience_level: string
  salary_range?: string
  deadline?: string
  posted_at: string
}

export interface Application {
  application_id: number
  job_id: number
  job_title: string
  company_name: string
  cover_letter: string
  expected_salary?: string
  resume_used?: string
  status: string
  applied_at: string
}

export interface CandidateProfile {
  profile_id: number
  user_id: number
  phone?: string
  country?: string
  address?: string
  field?: string
  experience?: string
  education?: string
  gender?: string
  summary?: string
  resume_path?: string
  profile_picture?: string
}

export const candidateService = {
  getDashboard(): Promise<CandidateDashboard> {
    return api.get('/candidate.php?action=dashboard').then(r => r.data.data)
  },

  getMyApplications(page = 1, limit = 20, status?: string): Promise<{ applications: Application[]; total: number }> {
    let url = `/candidate.php?action=my_applications&page=${page}&limit=${limit}`
    if (status) url += `&status=${status}`
    return api.get(url).then(r => r.data.data)
  },

  getSavedJobs(page = 1, limit = 20): Promise<{ jobs: Job[]; total: number }> {
    return api.get(`/candidate.php?action=saved_jobs&page=${page}&limit=${limit}`).then(r => r.data.data)
  },

  saveJob(jobId: number): Promise<void> {
    return api.post(`/candidate.php?action=save_job&job_id=${jobId}`)
  },

  unsaveJob(jobId: number): Promise<void> {
    return api.delete(`/candidate.php?action=unsave_job&job_id=${jobId}`)
  },

  applyForJob(jobId: number, applicationData: { cover_letter?: string; expected_salary?: string; resume_used?: string }): Promise<{ application_id: number }> {
    return api.post(`/candidate.php?action=apply&job_id=${jobId}`, applicationData).then(r => r.data.data)
  },

  withdrawApplication(applicationId: number): Promise<void> {
    return api.delete(`/candidate.php?action=withdraw_application&application_id=${applicationId}`)
  },

  getProfile(): Promise<{ profile: CandidateProfile }> {
    return api.get('/candidate.php?action=profile').then(r => r.data.data)
  },

  updateProfile(profileData: Partial<CandidateProfile>): Promise<void> {
    return api.put('/candidate.php?action=update_profile', profileData)
  },

  uploadResume(file: File): Promise<{ resume_path: string }> {
    const formData = new FormData()
    formData.append('resume', file)
    return api.post('/candidate.php?action=upload_resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data)
  },

  getJobRecommendations(limit = 10): Promise<{ jobs: Job[] }> {
    return api.get(`/candidate.php?action=job_recommendations&limit=${limit}`).then(r => r.data.data)
  },
}
