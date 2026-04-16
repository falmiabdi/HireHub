import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '../services/auth.service'
import type { User } from '../types'

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    role: 'admin' | 'company' | 'candidate'
    full_name?: string
    company_name?: string
    phone?: string
  }) => Promise<void>
  logout: () => void
  hasRole: (roles: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(authService.getCurrentUser())
    setLoading(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (email: string, password: string) => {
        const nextUser = await authService.login(email, password)
        setUser(nextUser)
      },
      register: async (data: {
        email: string
        password: string
        role: 'admin' | 'company' | 'candidate'
        full_name?: string
        company_name?: string
        phone?: string
      }) => authService.register(data),
      logout: () => {
        authService.logout()
        setUser(null)
      },
      hasRole: (roles: string | string[]) => {
        if (!user) return false
        return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
