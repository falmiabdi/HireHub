import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/public/Home'
import Jobs from './pages/public/Jobs'
import JobDetail from './pages/public/JobDetail'
import Companies from './pages/public/Companies'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminDashboard from './pages/admin/Dashboard'
import CompanyDashboard from './pages/company/Dashboard'
import CandidateDashboard from './pages/candidate/Dashboard'
import type { ReactNode } from 'react'
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
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gray-50">
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
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company/*"
                element={
                  <ProtectedRoute roles={['company']}>
                    <CompanyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/*"
                element={
                  <ProtectedRoute roles={['candidate']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
