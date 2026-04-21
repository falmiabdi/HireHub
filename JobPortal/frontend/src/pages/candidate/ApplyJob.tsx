import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { candidateService } from '../../services/candidate.service'
import { jobService } from '../../services/job.service'
import toast from 'react-hot-toast'
import { FileText, Loader2, ArrowLeft } from 'lucide-react'

export default function ApplyJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [canUpdate, setCanUpdate] = useState(false)

  const [formData, setFormData] = useState({
    cover_letter: '',
    expected_salary: '',
    experience_years: '',
    education_level: '',
    availability_date: '',
    portfolio_url: '',
    linkedin_url: '',
  })

  useEffect(() => {
    loadJobDetails()
    loadCandidateProfile()
    checkExistingApplication()
  }, [id])

  const loadCandidateProfile = async () => {
    try {
      const profileData = await candidateService.getProfile()
      if (profileData && profileData.profile) {
        setFormData(prev => ({
          ...prev,
          expected_salary: profileData.profile.expected_salary || '',
          experience_years: profileData.profile.experience_years || '',
          education_level: profileData.profile.education_level || '',
          availability_date: profileData.profile.availability_date || '',
          portfolio_url: profileData.profile.portfolio_url || '',
          linkedin_url: profileData.profile.linkedin_url || '',
        }))
      }
    } catch (error) {
      console.error('Failed to load candidate profile:', error)
    }
  }

  const loadJobDetails = async () => {
    try {
      const jobData = await jobService.getJobById(Number(id))
      setJob(jobData)
    } catch (error) {
      toast.error('Failed to load job details')
    } finally {
      setLoading(false)
    }
  }

  const checkExistingApplication = async () => {
    try {
      const applications = await candidateService.getMyApplications(1, 100)
      const existing = applications.applications.find((app: any) => app.job_id === Number(id))
      
      if (existing) {
        setExistingApplication(existing)
        // Check if can update (within 4 hours)
        const appliedAt = new Date(existing.applied_at)
        const now = new Date()
        const hoursSinceApplied = (now.getTime() - appliedAt.getTime()) / (1000 * 60 * 60)
        setCanUpdate(hoursSinceApplied <= 4)
        
        // Pre-fill form with existing data
        setFormData({
          cover_letter: existing.cover_letter || '',
          expected_salary: existing.expected_salary || '',
          experience_years: '',
          education_level: '',
          availability_date: '',
          portfolio_url: '',
          linkedin_url: '',
        })
      }
    } catch (error) {
      console.error('Failed to check existing application:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.role !== 'candidate') {
      toast.error('Only candidates can apply to jobs')
      return
    }

    setSubmitting(true)
    try {
      if (existingApplication && canUpdate) {
        // Update existing application
        await candidateService.updateApplication(existingApplication.application_id, formData)
        toast.success('Application updated successfully!')
      } else if (existingApplication && !canUpdate) {
        toast.error('Cannot update application after 4 hours')
        return
      } else {
        // Create new application
        await candidateService.applyForJob(Number(id), formData)
        toast.success('Application submitted successfully!')
      }
      navigate('/candidate')
    } catch (error) {
      toast.error(existingApplication ? 'Failed to update application' : 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!job) {
    return <div className="p-8">Job not found.</div>
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h1>
        <p className="mt-2 text-gray-600">{job.company_name} - {job.location}</p>
      </div>

      {existingApplication && !canUpdate && (
        <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-yellow-800">
          <p className="font-medium">You have already applied for this job.</p>
          <p className="text-sm text-yellow-700">Applications can only be updated within 4 hours of submission.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5" />
            Application Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Letter *
              </label>
              <textarea
                required
                rows={6}
                value={formData.cover_letter}
                onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us why you're interested in this position and what makes you a great candidate..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Salary
                </label>
                <input
                  type="text"
                  value={formData.expected_salary}
                  onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value })}
                  className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 50000 - 70000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Level
              </label>
              <select
                value={formData.education_level}
                onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select education level</option>
                <option value="high_school">High School</option>
                <option value="associate">Associate Degree</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability Date
              </label>
              <input
                type="date"
                value={formData.availability_date}
                onChange={(e) => setFormData({ ...formData, availability_date: e.target.value })}
                className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio URL
              </label>
              <input
                type="url"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://your-portfolio.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || (existingApplication && !canUpdate)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {existingApplication ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              existingApplication ? 'Update Application' : 'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
