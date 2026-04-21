import { useState, useEffect } from 'react'
import { companyService, type Application } from '../../services/company.service'
import toast from 'react-hot-toast'
import { User, Mail, Phone, Calendar, ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react'

export default function Applicants() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(10)
  const [expandedApplications, setExpandedApplications] = useState<Set<number>>(new Set())
  const [selectedStatus, setSelectedStatus] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [sendingMessage, setSendingMessage] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadApplications()
  }, [page, selectedStatus])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const data = await companyService.getApplications(page, limit, selectedStatus || undefined)
      setApplications(data.applications)
      setTotal(data.total)
    } catch (error) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (applicationId: number) => {
    setExpandedApplications(prev => {
      const next = new Set(prev)
      if (next.has(applicationId)) {
        next.delete(applicationId)
      } else {
        next.add(applicationId)
      }
      return next
    })
  }

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    setUpdatingStatus(applicationId)
    try {
      await companyService.updateApplicationStatus(applicationId, newStatus)
      toast.success('Application status updated')
      loadApplications()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleSendMessage = async (applicationId: number) => {
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }
    setSendingMessage(applicationId)
    try {
      await companyService.sendMessageToCandidate(applicationId, message)
      toast.success('Message sent successfully')
      setMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(null)
    }
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'phone_screen', label: 'Phone Screen' },
    { value: 'interview_selection', label: 'Interview Selection' },
    { value: 'onsite_interview', label: 'Onsite Interview' },
    { value: 'retest', label: 'Retest' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      phone_screen: 'bg-purple-100 text-purple-800',
      interview_selection: 'bg-indigo-100 text-indigo-800',
      onsite_interview: 'bg-cyan-100 text-cyan-800',
      retest: 'bg-orange-100 text-orange-800',
      shortlisted: 'bg-green-100 text-green-800',
      hired: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
        <p className="mt-2 text-gray-600">Review and manage job applications</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded border px-4 py-2 focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
          <User className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No applications found</h3>
          <p className="mt-1 text-gray-600">No applications match your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.application_id} className="rounded-lg border bg-white shadow-sm">
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{application.candidate_name}</h3>
                      <p className="text-sm text-gray-600">{application.job_title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <button
                      onClick={() => toggleExpand(application.application_id)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {expandedApplications.has(application.application_id) ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show More
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {expandedApplications.has(application.application_id) && (
                <div className="px-6 py-4">
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {application.candidate_email}
                    </div>
                    {application.candidate_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {application.candidate_phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Applied: {new Date(application.applied_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="mb-2 font-medium text-gray-900">Cover Letter</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{application.cover_letter}</p>
                  </div>

                  <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {application.expected_salary && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Expected Salary:</span>
                        <span className="ml-2 text-sm text-gray-600">{application.expected_salary}</span>
                      </div>
                    )}
                    {application.experience_years && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Experience:</span>
                        <span className="ml-2 text-sm text-gray-600">{application.experience_years} years</span>
                      </div>
                    )}
                    {application.education_level && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Education:</span>
                        <span className="ml-2 text-sm text-gray-600">{application.education_level.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.availability_date && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Available From:</span>
                        <span className="ml-2 text-sm text-gray-600">{application.availability_date}</span>
                      </div>
                    )}
                    {application.portfolio_url && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Portfolio:</span>
                        <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-blue-600 hover:underline">
                          View Portfolio
                        </a>
                      </div>
                    )}
                    {application.linkedin_url && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">LinkedIn:</span>
                        <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-blue-600 hover:underline">
                          View Profile
                        </a>
                      </div>
                    )}
                    {(application.resume_used || application.candidate_resume) && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Resume/CV:</span>
                        <a 
                          href={application.resume_used || application.candidate_resume} 
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="ml-2 text-sm text-blue-600 hover:underline"
                        >
                          View Resume
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="mb-2 font-medium text-gray-900">Update Status</h4>
                    <div className="flex items-center gap-2">
                      <select
                        value={application.status}
                        onChange={(e) => handleStatusChange(application.application_id, e.target.value)}
                        disabled={updatingStatus === application.application_id}
                        className="rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {statusOptions.filter(opt => opt.value !== '').map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {updatingStatus === application.application_id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Send Message</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message to the candidate..."
                        className="flex-1 rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleSendMessage(application.application_id)}
                        disabled={sendingMessage === application.application_id}
                        className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {sendingMessage === application.application_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {total > limit && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / limit)}
            className="rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
