import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { jobService } from '../../services/job.service'
import type { Job } from '../../types'

export default function JobDetail() {
  const { id } = useParams()
  const [job, setJob] = useState<Job | null>(null)

  useEffect(() => {
    if (!id) return
    jobService.getJobById(Number(id)).then(setJob).catch(() => setJob(null))
  }, [id])

  if (!job) return <div className="p-8">Job not found.</div>

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h2 className="text-3xl font-bold">{job.title}</h2>
      <p className="mt-2 text-gray-600">{job.company_name} - {job.location}</p>
      <p className="mt-6 whitespace-pre-wrap">{job.description}</p>
    </section>
  )
}
