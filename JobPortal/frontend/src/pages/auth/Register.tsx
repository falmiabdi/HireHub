import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'candidate' | 'company'>('candidate')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      await register({ email, password, role })
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">Register</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          required
          type="email"
          placeholder="Email"
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
        <select
          className="w-full rounded border px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value as 'candidate' | 'company')}
        >
          <option value="candidate">Candidate</option>
          <option value="company">Company</option>
        </select>
        <button disabled={loading} className="w-full rounded bg-orange-500 px-4 py-2 text-white">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </section>
  )
}
