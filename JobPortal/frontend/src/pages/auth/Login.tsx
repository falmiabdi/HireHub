import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          required
          type="email"
          placeholder="you@example.com"
          className="w-full rounded border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="w-full rounded border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading} className="w-full rounded bg-orange-500 px-4 py-2 text-white">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        New user?{' '}
        <Link className="text-orange-600" to="/register">
          Create an account
        </Link>
      </p>
    </section>
  )
}
