import { Award, Heart, Target } from 'lucide-react'
import { heroImage } from '../../assets/images'

export default function About() {
  return (
    <div className="animate-fade-in">
      <section
        className="relative py-20 text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">About HireHub</h1>
          <p className="mx-auto mt-4 max-w-3xl text-xl text-slate-100">
            Empowering India’s talent and employers with faster hiring, better matches, and modern career tools.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold">What We Do</h2>
          <p className="mt-6 text-lg text-gray-600">
            HireHub brings together candidates, recruiters, and companies in a secure, intelligent hiring ecosystem.
            Our platform is built for scalable hiring across India, with a focus on verified employers and meaningful
            career opportunities.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold">Why HireHub?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <Target className="mx-auto h-8 w-8 text-blue-600" />
              <h3 className="mt-3 text-xl font-semibold">Focused on Talent</h3>
              <p className="mt-2 text-gray-600">
                We help candidates discover jobs that match their skills, experience, and career goals.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <Heart className="mx-auto h-8 w-8 text-blue-600" />
              <h3 className="mt-3 text-xl font-semibold">Trusted Partners</h3>
              <p className="mt-2 text-gray-600">
                Employers are verified, application workflows are clear, and candidate privacy is respected.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <Award className="mx-auto h-8 w-8 text-blue-600" />
              <h3 className="mt-3 text-xl font-semibold">Impactful Hiring</h3>
              <p className="mt-2 text-gray-600">
                From job discovery to offer management, every step is designed to move hiring forward faster.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
