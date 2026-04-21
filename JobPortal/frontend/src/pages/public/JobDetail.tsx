import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { jobService } from '../../services/job.service'
import type { Job } from '../../types'
import toast from 'react-hot-toast'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)

  useEffect(() => {
    if (!id) return
    jobService.getJobById(Number(id)).then(setJob).catch(() => setJob(null))
  }, [id])

  const handleApply = async () => {
    if (!user) {
      // Redirect to login with redirect back to this job
      navigate('/login', { state: { redirectTo: `/jobs/${id}` } })
      return
    }

    if (user.role !== 'candidate') {
      toast.error('Only candidates can apply to jobs')
      return
    }

    // Navigate to the application form
    navigate(`/jobs/${id}/apply`)
  }

  if (!job) return <div className="p-8">Job not found.</div>

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h2 className="text-3xl font-bold">{job.title}</h2>
      <p className="mt-2 text-gray-600">{job.company_name} - {job.location}</p>
      <p className="mt-6 whitespace-pre-wrap">{job.description}</p>
      <button
        onClick={handleApply}
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        {user ? 'Apply Now' : 'Login to Apply'}
      </button>
    </section>
  )
}
