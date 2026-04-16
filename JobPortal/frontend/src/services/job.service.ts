import { api } from './api'
import type { Job } from '../types'

class JobService {
  async getJobs(page = 1): Promise<{ jobs: Job[]; page: number; limit: number }> {
    const response = await api.get(`/public.php?endpoint=jobs&page=${page}&limit=20`)
    return response.data.data
  }

  async getJobById(id: number): Promise<Job> {
    const response = await api.get(`/public.php?endpoint=job&id=${id}`)
    return response.data.data.job
  }
}

export const jobService = new JobService()
