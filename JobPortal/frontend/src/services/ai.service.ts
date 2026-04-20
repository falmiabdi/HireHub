import { api } from './api'
import type { Job } from '../types'

interface JobWithRequirements extends Job {
  requirements?: string
}

class AIService {
  // Simple AI-like job recommendation based on user profile
  // In a real implementation, this would call an AI API
  async getRecommendedJobs(userId: number): Promise<Job[]> {
    // Get user profile
    const profileResponse = await api.get(`/candidate.php?endpoint=profile&user_id=${userId}`)
    const profile = profileResponse.data.data

    // Get all jobs
    const jobsResponse = await api.get('/public.php?endpoint=jobs&page=1&limit=100')
    const jobs = jobsResponse.data.data.jobs

    // Simple matching logic
    const recommended = jobs.filter((job: JobWithRequirements) => {
      const skills = profile.skills ? profile.skills.toLowerCase() : ''
      const jobDesc = (job.description + (job.requirements || '')).toLowerCase()
      const locationMatch = !profile.location || job.location.toLowerCase().includes(profile.location.toLowerCase())

      // Check if job description contains user's skills
      const skillMatch = skills.split(',').some((skill: string) =>
        jobDesc.includes(skill.trim().toLowerCase())
      )

      return skillMatch && locationMatch
    }).slice(0, 10) // Top 10

    return recommended
  }
}

export const aiService = new AIService()