export interface User {
  id: number
  email: string
  role: 'admin' | 'company' | 'candidate'
  status: 'active' | 'inactive' | 'banned'
  profile_image?: string
}

export interface Job {
  job_id: number
  company_id: number
  title: string
  description: string
  location: string
  job_type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid'
  posted_date: string
  status: 'open' | 'closed' | 'expired'
  company_name?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    access_token: string
    refresh_token: string
    user: User
  }
}
