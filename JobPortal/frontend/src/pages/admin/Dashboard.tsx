import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, Building2, Briefcase, FileText, UserCheck, Clock } from 'lucide-react'
import { adminService, type DashboardStats, type Analytics, type ActivityLog } from '../../services/admin.service'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsData, analyticsData, logsData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAnalytics(),
        adminService.getActivityLogs(1, 10),
      ])
      setStats(statsData)
      setAnalytics(analyticsData)
      setActivities(logsData.logs)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of platform statistics and recent activities</p>
      </div>

      {stats && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={Users} label="Total Candidates" value={stats.total_candidates} color="blue" link="/admin/candidates" />
            <StatCard icon={Building2} label="Total Companies" value={stats.total_companies} color="green" link="/admin/companies" />
            <StatCard icon={Briefcase} label="Total Jobs" value={stats.total_jobs} color="amber" link="/admin/jobs" />
            <StatCard icon={FileText} label="Total Applications" value={stats.total_applications} color="purple" />
            <StatCard icon={UserCheck} label="Active Jobs" value={stats.active_jobs} color="pink" />
            <StatCard icon={Clock} label="Pending Jobs" value={stats.pending_jobs ?? 0} color="red" link="/admin/jobs" />
          </div>

          {analytics && (
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <ChartCard title="Job Types Distribution">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={analytics.jobs_by_type} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                      {analytics.jobs_by_type.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Candidate Demographics">
                <ResponsiveContainer width="100%" height={250}>
                  <DoughnutChart data={analytics.applications_by_status} />
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Company Industries">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.top_companies.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="job_count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Education Level Distribution">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={analytics.registrations_by_period} dataKey="count" nameKey="period" cx="50%" cy="50%" outerRadius={80} label>
                      {analytics.registrations_by_period.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          <div className="rounded-lg border bg-white shadow-sm">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-700">ID</th>
                    <th className="px-6 py-3 font-medium text-gray-700">Activity</th>
                    <th className="px-6 py-3 font-medium text-gray-700">User</th>
                    <th className="px-6 py-3 font-medium text-gray-700">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <tr key={activity.log_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">#{activity.log_id}</td>
                        <td className="px-6 py-4 text-gray-700">{activity.details}</td>
                        <td className="px-6 py-4 text-gray-700">User #{activity.user_id}</td>
                        <td className="px-6 py-4 text-gray-500">{formatTimeAgo(activity.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No recent activities found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, link }: { icon: typeof Users; label: string; value: number; color: string; link?: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
    red: 'bg-red-50 text-red-600',
  }

  const content = (
    <div className={`rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${link ? 'cursor-pointer' : ''}`}>
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

  return link ? <Link to={link}>{content}</Link> : content
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  )
}

function DoughnutChart({ data }: { data: { status: string; count: number }[] }) {
  return (
    <PieChart>
      <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  )
}
