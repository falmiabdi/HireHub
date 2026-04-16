import { Award, Heart, Target } from 'lucide-react'

export default function About() {
  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 py-20 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">About JobPortal</h1>
          <p className="mx-auto mt-4 max-w-3xl text-xl">
            Build the Future of Hiring: Smart, Scalable and made for India.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="mt-6 text-lg text-gray-600">
            We connect high-quality candidates and verified companies through secure, role-based
            workflows that simplify discovery, applications, and hiring decisions.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold">Our Values</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <Target className="mx-auto h-8 w-8 text-blue-600" />
              <h3 className="mt-3 text-xl font-semibold">Innovation</h3>
              <p className="mt-2 text-gray-600">Data-driven matching and streamlined hiring tools.</p>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <Heart className="mx-auto h-8 w-8 text-blue-600" />
              <h3 className="mt-3 text-xl font-semibold">Trust</h3>
              <p className="mt-2 text-gray-600">
                Verified organizations, clear permissions, and secure APIs.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <Award className="mx-auto h-8 w-8 text-blue-600" />
              <h3 className="mt-3 text-xl font-semibold">Excellence</h3>
              <p className="mt-2 text-gray-600">
                Better candidate journeys and stronger employer outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
