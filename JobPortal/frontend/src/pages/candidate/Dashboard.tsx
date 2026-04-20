import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Heart, CheckCircle, XCircle, Clock, Search, MapPin, Building2, Loader2, Bookmark, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { candidateService, type CandidateDashboard as DashboardData, type Job } from '../../services/candidate.service'

export default function CandidateDashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const data = await candidateService.getDashboard()
      setDashboard(data)
      const saved = await candidateService.getSavedJobs(1, 100)
      setSavedJobIds(new Set(saved.jobs.map(j => j.job_id)))
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSaveJob = async (jobId: number) => {
    try {
      if (savedJobIds.has(jobId)) {
        await candidateService.unsaveJob(jobId)
        setSavedJobIds(prev => {
          const next = new Set(prev)
          next.delete(jobId)
          return next
        })
        toast.success('Job removed from saved')
      } else {
        await candidateService.saveJob(jobId)
        setSavedJobIds(prev => new Set(prev).add(jobId))
        toast.success('Job saved successfully')
      }
    } catch (error) {
      toast.error('Failed to update saved job')
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
        <p className="mt-2 text-gray-600">Find your dream job and start your journey towards a brighter future today.</p>
      </div>

      {dashboard && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard icon={FileText} label="Total Applications" value={dashboard.total_applications} color="blue" />
            <StatCard icon={Clock} label="Pending" value={dashboard.pending_applications} color="amber" />
            <StatCard icon={CheckCircle} label="Shortlisted" value={dashboard.shortlisted_applications} color="green" />
            <StatCard icon={XCircle} label="Rejected" value={dashboard.rejected_applications} color="red" />
            <StatCard icon={Bookmark} label="Saved Jobs" value={dashboard.saved_jobs_count} color="purple" />
          </div>

          {/* Quick Actions */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              icon={User}
              title="My Profile"
              description="Update your profile and resume"
              link="/candidate/profile"
              color="blue"
            />
            <QuickActionCard
              icon={FileText}
              title="My Applications"
              description="View all your job applications"
              link="/candidate/applications"
              color="green"
            />
            <QuickActionCard
              icon={Bookmark}
              title="Saved Jobs"
              description="Jobs you've bookmarked"
              link="/jobs?saved=true"
              color="purple"
            />
            <QuickActionCard
              icon={Search}
              title="Browse Jobs"
              description="Find new opportunities"
              link="/jobs"
              color="amber"
            />
          </div>

          <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Search Jobs</h2>
                <p className="text-blue-100">Find the perfect opportunity for your skills</p>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by job title, company, or keywords..."
                    className="w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-400 md:w-80"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-white px-6 py-3 font-medium text-blue-700 hover:bg-blue-50"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Posted Jobs</h2>
              <Link to="/jobs" className="text-sm text-blue-600 hover:text-blue-800">
                View All Jobs →
              </Link>
            </div>

            {dashboard.recommended_jobs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dashboard.recommended_jobs.map((job) => (
                  <JobCard key={job.job_id} job={job} isSaved={savedJobIds.has(job.job_id)} onToggleSave={() => handleSaveJob(job.job_id)} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-white p-8 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs available</h3>
                <p className="mt-1 text-gray-600">Check back later for new opportunities.</p>
              </div>
            )}
          </div>

          {dashboard.recent_applications.length > 0 && (
            <div className="rounded-lg border bg-white shadow-sm">
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">My Recent Applications</h3>
                  <Link to="/candidate/applications" className="text-sm text-blue-600 hover:text-blue-800">
                    View All →
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 font-medium text-gray-700">Job</th>
                      <th className="px-6 py-3 font-medium text-gray-700">Company</th>
                      <th className="px-6 py-3 font-medium text-gray-700">Status</th>
                      <th className="px-6 py-3 font-medium text-gray-700">Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dashboard.recent_applications.map((app) => (
                      <tr key={app.application_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{app.job_title}</td>
                        <td className="px-6 py-4 text-gray-700">{app.company_name}</td>
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

function QuickActionCard({ icon: Icon, title, description, link, color }: { icon: typeof User; title: string; description: string; link: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
  }

  return (
    <Link to={link} className={`rounded-lg border bg-white p-4 shadow-sm transition-colors ${colorClasses[color]}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 bg-white`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof FileText; label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function JobCard({ job, isSaved, onToggleSave }: { job: Job; isSaved: boolean; onToggleSave: () => void }) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
        <button
          onClick={onToggleSave}
          className={`rounded-full p-1.5 transition-colors ${isSaved ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
        >
          <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="mb-3 space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="line-clamp-1">{job.company_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{job.location}</span>
        </div>
      </div>
      <p className="mb-4 line-clamp-2 text-sm text-gray-600">{job.description.substring(0, 150)}...</p>
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
          job.job_type === 'Full-time' ? 'bg-blue-100 text-blue-800' :
          job.job_type === 'Part-time' ? 'bg-green-100 text-green-800' :
          job.job_type === 'Contract' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {job.job_type}
        </span>
        <Link
          to={`/jobs/${job.job_id}`}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
