import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, LogOut, Menu, Rocket, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const getDashboardLink = () => {
    if (hasRole('admin')) return '/admin'
    if (hasRole('company')) return '/company'
    if (hasRole('candidate')) return '/candidate'
    return '/'
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
            <Rocket className="h-8 w-8 text-[#3172B1]" />
          </motion.div>
          <span>
            <span className="text-slate-900">Hire</span>
            <span className="text-[#F99F1F]">Hub</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/jobs" className="text-slate-700 transition hover:text-[#3172B1]">
            Jobs
          </Link>
          <Link to="/companies" className="text-slate-700 transition hover:text-[#3172B1]">
            Companies
          </Link>
          <Link to="/about" className="text-slate-700 transition hover:text-[#3172B1]">
            About
          </Link>
          <Link to="/contact" className="text-slate-700 transition hover:text-[#3172B1]">
            Contact
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-[#3172B1] hover:text-[#3172B1]"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-[#3172B1] transition hover:bg-[#50ADDD]/10"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-[#F99F1F] to-[#F5D89B] px-5 py-2 text-slate-950 shadow-lg shadow-[#F99F1F]/20 transition hover:shadow-[#F99F1F]/30"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        <button
          className="rounded-full border border-slate-200 p-2 text-slate-700 transition hover:border-[#3172B1] hover:text-[#3172B1] md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Toggle mobile menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-200 bg-white px-4 pb-4 md:hidden"
          >
            <Link to="/jobs" className="block py-3 text-slate-700 transition hover:text-[#3172B1]">
              Jobs
            </Link>
            <Link to="/companies" className="block py-3 text-slate-700 transition hover:text-[#3172B1]">
              Companies
            </Link>
            <Link to="/about" className="block py-3 text-slate-700 transition hover:text-[#3172B1]">
              About
            </Link>
            <Link to="/contact" className="block py-3 text-slate-700 transition hover:text-[#3172B1]">
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block rounded-xl border border-slate-200 px-4 py-3 text-slate-700 transition hover:border-[#3172B1] hover:text-[#3172B1]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl border border-red-200 px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-3 text-[#3172B1] transition hover:text-[#50ADDD]">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block rounded-xl bg-gradient-to-r from-[#F99F1F] to-[#F5D89B] px-4 py-3 text-center text-slate-950 transition hover:shadow-lg hover:shadow-[#F99F1F]/20"
                >
                  Register
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
