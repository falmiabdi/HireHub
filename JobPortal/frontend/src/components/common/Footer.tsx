export default function Footer() {
  return (
    <footer className="mt-16 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 py-10 text-center text-sm text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 sm:flex-row sm:justify-between">
        <p>HireHub - Smart, Scalable, and role-based hiring platform.</p>
        <span className="inline-flex items-center rounded-full border border-yellow-400 bg-yellow-500/10 px-4 py-1 text-yellow-200 shadow-sm shadow-yellow-500/20">
          <span className="mr-2 text-lg">/</span>
          Powered by modern hiring
        </span>
      </div>
    </footer>
  )
}
