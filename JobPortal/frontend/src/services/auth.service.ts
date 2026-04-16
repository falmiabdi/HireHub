import { api } from './api'
import type { AuthResponse, User } from '../types'

class AuthService {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post<AuthResponse>('/auth.php?action=login', { email, password })
    const payload = response.data
    if (!payload.success) throw new Error(payload.message || 'Login failed')

    localStorage.setItem('access_token', payload.data.access_token)
    localStorage.setItem('refresh_token', payload.data.refresh_token)
    localStorage.setItem('user', JSON.stringify(payload.data.user))
    return payload.data.user
  }

  async register(data: {
    email: string
    password: string
    role: 'admin' | 'company' | 'candidate'
    full_name?: string
    company_name?: string
    phone?: string
  }): Promise<void> {
    const response = await api.post('/auth.php?action=register', data)
    if (!response.data.success) throw new Error(response.data.message || 'Registration failed')
  }

  logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('user')
    return user ? (JSON.parse(user) as User) : null
  }
}

export const authService = new AuthService()
