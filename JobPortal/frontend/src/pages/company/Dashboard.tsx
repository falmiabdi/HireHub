import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Users, FileText, UserCheck, Building2, PlusCircle, Trash2, Eye, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { companyService, type CompanyDashboard as DashboardData, type Job } from '../../services/company.service'

export default function CompanyDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingJob, setDeletingJob] = useState<number | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [dashData, jobsData] = await Promise.all([
        companyService.getDashboard(),
        companyService.getMyJobs(1, 10),
      ])
      setDashboard(dashData)
      setJobs(jobsData.jobs)
    } catch (error: any) {
      console.error('Failed to load dashboard:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load dashboard data'
      if (errorMessage.includes('Company profile not found')) {
        toast.error('Please complete your company profile first')
      } else {
        toast.error(errorMessage)
      }
      // Still try to load jobs even if dashboard fails
      try {
        const jobsData = await companyService.getMyJobs(1, 10)
        setJobs(jobsData.jobs)
      } catch (jobsError) {
        console.error('Failed to load jobs:', jobsError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    setDeletingJob(jobId)
    try {
      await companyService.deleteJob(jobId)
      toast.success('Job deleted successfully')
      setJobs(jobs.filter(j => j.job_id !== jobId))
      const dashData = await companyService.getDashboard()
      setDashboard(dashData)
    } catch (error) {
      toast.error('Failed to delete job')
    } finally {
      setDeletingJob(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your company profile, post jobs, and review applicants</p>
      </div>

      {dashboard && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Briefcase} label="Total Jobs" value={dashboard.total_jobs} color="blue" />
            <StatCard icon={UserCheck} label="Active Jobs" value={dashboard.active_jobs} color="green" />
            <StatCard icon={FileText} label="Total Applications" value={dashboard.total_applications} color="amber" />
            <StatCard icon={Users} label="Pending Applications" value={dashboard.pending_applications} color="purple" />
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <QuickActionCard
              icon={Building2}
              title="Company Profile"
              description="Update your company information and manage your profile."
              link="/company/profile"
              linkText="View Profile"
            />
            <QuickActionCard
              icon={PlusCircle}
              title="Post New Job"
              description="Create and manage job listings to attract candidates."
              link="/company/jobs/new"
              linkText="Post Job"
            />
          </div>

          <div className="rounded-lg border bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Previously Posted Jobs</h3>
                <Link to="/company/jobs" className="text-sm text-blue-600 hover:text-blue-800">
                  View All →
                </Link>
              </div>
            </div>

            {jobs.length > 0 ? (
              <div className="divide-y">
                {jobs.map((job) => (
                  <div key={job.job_id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                    <div>
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.location} • {job.job_type}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/company/applicants?job_id=${job.job_id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4" />
                        View Applicants
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job.job_id)}
                        disabled={deletingJob === job.job_id}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingJob === job.job_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs posted yet</h3>
                <p className="mt-1 text-gray-600">Get started by posting your first job listing.</p>
                <Link
                  to="/company/post-job"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <PlusCircle className="h-5 w-5" />
                  Post a Job
                </Link>
              </div>
            )}
          </div>

          {dashboard.recent_applications.length > 0 && (
            <div className="mt-8 rounded-lg border bg-white shadow-sm">
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                  <Link to="/company/applications" className="text-sm text-blue-600 hover:text-blue-800">
                    View All →
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 font-medium text-gray-700">Candidate</th>
                      <th className="px-6 py-3 font-medium text-gray-700">Job</th>
                      <th className="px-6 py-3 font-medium text-gray-700">Status</th>
                      <th className="px-6 py-3 font-medium text-gray-700">Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dashboard.recent_applications.map((app) => (
                      <tr key={app.application_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{app.candidate_name}</td>
                        <td className="px-6 py-4 text-gray-700">{app.job_title}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{new Date(app.applied_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Briefcase; label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({ icon: Icon, title, description, link, linkText }: {
  icon: typeof Building2
  title: string
  description: string
  link: string
  linkText: string
}) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 rounded-lg bg-blue-50 p-3 w-fit">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <Link
        to={link}
        className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        {linkText}
      </Link>
    </div>
  )
}
