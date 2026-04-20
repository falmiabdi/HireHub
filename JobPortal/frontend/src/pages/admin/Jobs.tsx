import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, CheckCircle, XCircle, Clock, Eye, Trash2, Loader2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService, type Job } from '../../services/admin.service'

export default function AdminJobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectJobId, setRejectJobId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const limit = 20

  useEffect(() => {
    loadJobs()
  }, [filter, page])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const approvalStatus = filter === 'all' ? undefined : filter
      const result = await adminService.getJobs(page, limit, undefined, approvalStatus)
      setJobs(result.jobs)
      setTotal(result.total)
    } catch {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (jobId: number) => {
    setProcessingId(jobId)
    try {
      await adminService.approveJob(jobId)
      toast.success('Job approved successfully')
      loadJobs()
    } catch {
      toast.error('Failed to approve job')
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectModal = (jobId: number) => {
    setRejectJobId(jobId)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const handleReject = async () => {
    if (!rejectJobId) return
    setProcessingId(rejectJobId)
    try {
      await adminService.rejectJob(rejectJobId, rejectReason || 'No reason provided')
      toast.success('Job rejected')
      setRejectModalOpen(false)
      loadJobs()
    } catch {
      toast.error('Failed to reject job')
    } finally {
      setProcessingId(null)
      setRejectJobId(null)
    }
  }

  const handleDelete = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    setProcessingId(jobId)
    try {
      await adminService.deleteJob(jobId)
      toast.success('Job deleted')
      loadJobs()
    } catch {
      toast.error('Failed to delete job')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"><Clock className="h-3 w-3" /> Pending</span>
      case 'approved':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"><CheckCircle className="h-3 w-3" /> Approved</span>
      case 'rejected':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"><XCircle className="h-3 w-3" /> Rejected</span>
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">{status}</span>
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin')} className="text-gray-600 hover:text-gray-900">
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold">Job Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All Jobs
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
            >
              Pending ({total})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
            >
              Rejected
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs or companies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full md:w-64 rounded-lg border pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJobs.map(job => (
                  <tr key={job.job_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-500">{job.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{job.company_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{job.location || 'N/A'}</td>
                    <td className="px-6 py-4">{getStatusBadge(job.approval_status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(job.posted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {job.approval_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(job.job_id)}
                              disabled={processingId === job.job_id}
                              className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200 disabled:opacity-50"
                              title="Approve"
                            >
                              {processingId === job.job_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => openRejectModal(job.job_id)}
                              disabled={processingId === job.job_id}
                              className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate(`/jobs/${job.job_id}`)}
                          className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(job.job_id)}
                          disabled={processingId === job.job_id}
                          className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} jobs
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Job</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this job:</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
              rows={3}
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processingId ? 'Processing...' : 'Reject Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
