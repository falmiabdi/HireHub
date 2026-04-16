import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-4xl font-bold">Build the Future of Hiring</h1>
      <p className="mt-3 text-gray-600">Smart, scalable, and made for three user roles.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/jobs" className="rounded bg-orange-500 px-4 py-2 text-white">
          Browse Jobs
        </Link>
        <Link to="/register" className="rounded border px-4 py-2">
          Register
        </Link>
      </div>
    </section>
  )
}
