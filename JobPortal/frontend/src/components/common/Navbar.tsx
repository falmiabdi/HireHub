import { Briefcase, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const dashboard = hasRole('admin')
    ? '/admin'
    : hasRole('company')
      ? '/company'
      : hasRole('candidate')
        ? '/candidate'
        : '/'

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Briefcase className="h-7 w-7 text-orange-500" />
          JobPortal
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/jobs">Jobs</Link>
          <Link to="/companies">Companies</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {user ? (
            <>
              <Link to={dashboard} className="flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link className="rounded bg-orange-500 px-3 py-1.5 text-white" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setIsOpen((v) => !v)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {isOpen && (
        <div className="space-y-2 border-t px-4 py-3 md:hidden">
          <Link className="block" to="/jobs">
            Jobs
          </Link>
          <Link className="block" to="/companies">
            Companies
          </Link>
          <Link className="block" to="/about">
            About
          </Link>
          <Link className="block" to="/contact">
            Contact
          </Link>
        </div>
      )}
    </nav>
  )
}
