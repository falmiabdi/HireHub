import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jobService } from '../../services/job.service'
import type { Job } from '../../types'

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    jobService.getJobs(1).then((data) => setJobs(data.jobs)).catch(() => setJobs([]))
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="text-2xl font-semibold">Jobs</h2>
      <div className="mt-6 grid gap-4">
        {jobs.map((job) => (
          <Link key={job.job_id} to={`/jobs/${job.job_id}`} className="rounded border bg-white p-4">
            <h3 className="font-semibold">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company_name ?? 'Company'} - {job.location}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
