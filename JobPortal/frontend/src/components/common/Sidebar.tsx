import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { companyService } from '../../services/company.service'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Building2,
  Settings,
  LogOut,
  X,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface SidebarItem {
  icon: typeof LayoutDashboard
  label: string
  path: string
  roles: ('admin' | 'company' | 'candidate')[]
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['admin', 'company', 'candidate'] },
  { icon: Briefcase, label: 'Jobs', path: '/jobs', roles: ['admin', 'candidate'] },
  { icon: FileText, label: 'My Applications', path: '/candidate/applications', roles: ['candidate'] },
  { icon: FileText, label: 'Applications', path: '/company/applications', roles: ['company'] },
  { icon: Building2, label: 'Companies', path: '/companies', roles: ['admin'] },
  { icon: Users, label: 'Users', path: '/admin/users', roles: ['admin'] },
  { icon: Users, label: 'Candidates', path: '/admin/candidates', roles: ['admin'] },
  { icon: Building2, label: 'Companies', path: '/admin/companies', roles: ['admin'] },
  { icon: Briefcase, label: 'Jobs', path: '/admin/jobs', roles: ['admin'] },
  { icon: Briefcase, label: 'My Jobs', path: '/company/jobs', roles: ['company'] },
  { icon: FileText, label: 'Post Job', path: '/company/post-job', roles: ['company'] },
  { icon: Settings, label: 'Profile', path: '/candidate/profile', roles: ['candidate'] },
  { icon: Settings, label: 'Profile', path: '/company/profile', roles: ['company'] },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [postedJobs, setPostedJobs] = useState<any[]>([])

  useEffect(() => {
    if (user?.role === 'company') {
      loadPostedJobs()
    }
  }, [user])

  const loadPostedJobs = async () => {
    try {
      const data = await companyService.getMyJobs(1, 5)
      setPostedJobs(data.jobs)
    } catch {
      console.error('Failed to load posted jobs')
    }
  }

  const roleItems = sidebarItems.filter(item => user && item.roles.includes(user.role))

  const getDashboardPath = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'admin': return '/admin'
      case 'company': return '/company'
      case 'candidate': return '/candidate'
      default: return '/'
    }
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'pending': return <Clock className="h-3 w-3 text-yellow-600" />
      case 'rejected': return <XCircle className="h-3 w-3 text-red-600" />
      default: return null
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-white shadow-xl z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
          w-64 flex flex-col
        `}
      >
        {/* Logo/Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <Link to={getDashboardPath()} className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HireHub</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-blue-600">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {roleItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                      transition-colors
                      ${isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Posted Jobs Section for Company */}
          {user?.role === 'company' && postedJobs.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Recent Jobs
              </h3>
              <ul className="space-y-1">
                {postedJobs.map((job) => (
                  <li key={job.job_id}>
                    <Link
                      to={`/company/jobs`}
                      onClick={onClose}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors group"
                    >
                      <span className="flex-1 truncate text-gray-700">{job.title}</span>
                      {getStatusIcon(job.approval_status)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Footer/Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
