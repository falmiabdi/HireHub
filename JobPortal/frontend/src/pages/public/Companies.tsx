export default function Companies() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white px-8 py-12 shadow-xl shadow-slate-200/50">
        <h2 className="text-3xl font-bold text-slate-900">Companies</h2>
        <p className="mt-4 text-lg text-slate-600">
          Discover verified employers, post roles, and manage hiring in one place. Our company dashboard is built
          for fast job posting, applicant screening, and real-time candidate tracking.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xl font-semibold text-slate-900">Verified Employers</h3>
            <p className="mt-3 text-slate-600">
              Only trusted organizations with clear profiles can post jobs and review candidates.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xl font-semibold text-slate-900">Fast Job Posting</h3>
            <p className="mt-3 text-slate-600">
              Create and publish job listings quickly, then connect with high-quality applicants.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xl font-semibold text-slate-900">Built for Growth</h3>
            <p className="mt-3 text-slate-600">
              Scale your hiring process with better visibility, tracking, and candidate communication.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
