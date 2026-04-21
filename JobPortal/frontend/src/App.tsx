import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Sidebar from './components/common/Sidebar'
import Home from './pages/public/Home'
import Jobs from './pages/public/Jobs'
import JobDetail from './pages/public/JobDetail'
import Companies from './pages/public/Companies'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminDashboard from './pages/admin/Dashboard'
import AdminJobs from './pages/admin/Jobs'
import CompanyDashboard from './pages/company/Dashboard'
import CompanyProfile from './pages/company/Profile'
import CompanyJobs from './pages/company/Jobs'
import PostJob from './pages/company/PostJob'
import Applicants from './pages/company/Applicants'
import ApplyJob from './pages/candidate/ApplyJob'
import CandidateDashboard from './pages/candidate/Dashboard'
import CandidateProfile from './pages/candidate/Profile'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Menu, Bell } from 'lucide-react'
import './index.css'
function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode
  roles?: ('admin' | 'company' | 'candidate')[]
}) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </AuthProvider>
    </Router>
  )
}

function AppLayout({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        // Authenticated Layout - with Sidebar
        <div className="flex min-h-screen">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <header className="bg-white border-b px-4 py-3 flex items-center justify-between lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="font-semibold text-gray-900">HireHub</h1>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Bell className="h-6 w-6" />
              </button>
            </header>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                }
              />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/companies" element={<Companies />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company"
                element={
                  <ProtectedRoute roles={['company']}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/jobs"
                element={
                  <ProtectedRoute roles={['company']}>
                    <CompanyJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/profile"
                element={
                  <ProtectedRoute roles={['company']}>
                    <CompanyProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/post-job"
                element={
                  <ProtectedRoute roles={['company']}>
                    <PostJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/applicants"
                element={
                  <ProtectedRoute roles={['company']}>
                    <Applicants />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/:id/apply"
                element={
                  <ProtectedRoute roles={['candidate']}>
                    <ApplyJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate"
                element={
                  <ProtectedRoute roles={['candidate']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/profile"
                element={
                  <ProtectedRoute roles={['candidate']}>
                    <CandidateProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      ) : (
        // Public Layout - with Navbar and Footer
        <>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </>
      )}
    </div>
  )
}

function DashboardRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  
  switch (user.role) {
    case 'admin': return <Navigate to="/admin" replace />
    case 'company': return <Navigate to="/company" replace />
    case 'candidate': return <Navigate to="/candidate" replace />
    default: return <Navigate to="/" replace />
  }
}

export default App
