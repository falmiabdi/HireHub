import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  ArrowRight,
  Briefcase,
  Clock,
  MapPin,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import heroImage from '../../assets/hero.png'
import { jobService } from '../../services/job.service'
import type { Job } from '../../types'

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [typedText, setTypedText] = useState('Build the Future of Hiring')
  const [typingIndex, setTypingIndex] = useState(0)
  const [typingSubIndex, setTypingSubIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 })
  const navigate = useNavigate()

  useEffect(() => {
    void loadFeaturedJobs()
  }, [])

  useEffect(() => {
    const words = ['Build the Future of Hiring', 'Smart & Scalable', 'Made for India', 'AI-Powered Job Portal']
    const current = words[typingIndex % words.length]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typingSubIndex <= current.length) {
          setTypedText(current.slice(0, typingSubIndex))
          setTypingSubIndex((prev) => prev + 1)
        }
        if (typingSubIndex === current.length + 1) {
          setIsDeleting(true)
          setTypingSubIndex((prev) => prev - 1)
        }
      } else {
        if (typingSubIndex >= 0) {
          setTypedText(current.slice(0, typingSubIndex))
          setTypingSubIndex((prev) => prev - 1)
        }
        if (typingSubIndex === -1) {
          setIsDeleting(false)
          setTypingIndex((prev) => prev + 1)
          setTypingSubIndex(0)
        }
      }
    }, typingSubIndex === current.length ? 1200 : isDeleting ? 40 : 80)

    return () => clearTimeout(timeout)
  }, [typingIndex, typingSubIndex, isDeleting])

  const loadFeaturedJobs = async () => {
    try {
      const data = await jobService.getJobs(1)
      setFeaturedJobs(data.jobs?.slice(0, 6) ?? [])
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const query = new URLSearchParams({
      search: searchKeyword,
      location: searchLocation,
    }).toString()

    navigate(`/jobs?${query}`)
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  }

  return (
    <div className="overflow-hidden bg-[#FDFDFD] text-slate-950">
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#3172B1] via-[#50ADDD] to-[#3172B1] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-[#50ADDD] blur-3xl animate-pulse" />
          <div className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-[#F99F1F] blur-3xl animate-pulse delay-1000" />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#3172B1] blur-3xl animate-pulse delay-500" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col px-6 py-20 lg:flex-row lg:items-center lg:py-28">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10 flex-1"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#F5D89B]/20 px-4 py-2 text-sm text-slate-950 shadow-lg shadow-[#3172B1]/20 backdrop-blur"
            >
              <Sparkles className="h-5 w-5 text-[#F99F1F]" />
              AI-Powered Job Portal for modern hiring
            </motion.div>

            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Build the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#50ADDD] to-[#F99F1F]">Hiring</span>
            </h1>

            <div className="mt-8 text-2xl font-semibold leading-tight sm:text-3xl">
              <span className="block text-white/80">Smart, scalable, &amp; ready for India.</span>
              <span className="block text-[#F99F1F]">{typedText}<span className="animate-pulse">|</span></span>
            </div>

            <p className="mt-8 max-w-2xl text-lg text-white/80">
              Connect with top talent and dream jobs across India, powered by intelligent matching and beautiful UX.
            </p>

            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10 rounded-3xl bg-white/10 p-4 shadow-2xl shadow-black/15 backdrop-blur-xl"
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                  <input
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    type="text"
                    placeholder="Job title, keywords, or company"
                    className="w-full rounded-2xl border border-white/20 bg-white/95 px-12 py-4 text-slate-950 outline-none shadow-sm shadow-black/5 focus:border-[#3172B1] focus:ring-4 focus:ring-[#50ADDD]/20"
                  />
                </div>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70" />
                  <input
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    type="text"
                    placeholder="Location"
                    className="w-full rounded-2xl border border-white/20 bg-white/95 px-12 py-4 text-slate-950 outline-none shadow-sm shadow-black/5 focus:border-[#3172B1] focus:ring-4 focus:ring-[#50ADDD]/20"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-[#F99F1F] to-[#F5D89B] px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-xl shadow-[#F99F1F]/25 transition hover:-translate-y-0.5 hover:shadow-[#F99F1F]/35"
                >
                  Search Jobs
                </button>
              </div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <div className="rounded-3xl border border-white/20 bg-white/10 p-4 text-left">
                <p className="text-sm uppercase text-white/70">Trusted by</p>
                <div className="mt-4 flex items-center gap-4 opacity-90">
                  <span className="rounded-full bg-white/15 px-3 py-2 text-sm text-slate-950">Indeed</span>
                  <span className="rounded-full bg-white/15 px-3 py-2 text-sm text-slate-950">Glassdoor</span>
                  <span className="rounded-full bg-white/15 px-3 py-2 text-sm text-slate-950">HireMee</span>
                </div>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-4 text-left">
                <p className="text-sm uppercase text-white/70">Performance</p>
                <p className="mt-2 text-xl font-semibold text-white">95% match rate</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mt-16 flex-1 lg:mt-0"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3172B1] to-[#50ADDD] opacity-30 blur-3xl"
            />
            <motion.img
              src={heroImage}
              alt="Job Search"
              className="relative mx-auto w-full max-w-xl rounded-[40px] shadow-2xl shadow-black/20"
              animate={{ y: [0, -18, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
              animate={{ y: [0, -24, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute left-4 top-12 rounded-full bg-[#50ADDD]/20 p-3 text-white shadow-lg shadow-black/20"
            >
              <Briefcase className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 24, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute right-4 bottom-12 rounded-full bg-[#F99F1F]/20 p-3 text-white shadow-lg shadow-black/20"
            >
              <Users className="h-6 w-6 text-white" />
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 320" className="w-full">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </section>

      <section className="bg-[#FDFDFD] py-20 text-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="grid gap-8 rounded-[32px] bg-white p-10 shadow-2xl shadow-slate-200/80 lg:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h2 className="text-4xl font-bold text-slate-950 sm:text-5xl">If you can dream it, you can do it.</h2>
              <p className="mt-4 text-lg text-slate-600">NEVER GIVE UP. Every opportunity today brings you closer to your dream career.</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button className="rounded-3xl bg-[#F99F1F] px-8 py-4 text-slate-950 font-semibold shadow-lg shadow-[#F99F1F]/20 transition hover:-translate-y-0.5">
                  Start Your Journey
                </button>
                <button className="rounded-3xl border border-slate-300 px-8 py-4 text-slate-700 transition hover:bg-slate-100">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative grid gap-4 sm:grid-cols-2">
              {['Today', 'Tomorrow', 'Success', 'Growth'].map((label) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.03 }}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm"
                >
                  <p className="text-2xl font-bold text-slate-950">{label}</p>
                </motion.div>
              ))}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 right-10 text-6xl"
              >
                🚀
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20" ref={ref}>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {} }
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-[#3172B1]">Featured Opportunities</p>
            <h2 className="mt-4 text-4xl font-bold text-slate-950">Discover your next career move</h2>
            <p className="mt-3 text-lg text-slate-600">Browse top roles from India’s leading companies.</p>
          </motion.div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#3172B1] border-t-transparent" />
            </div>
          ) : (
            <motion.div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              {featuredJobs.map((job) => (
                <motion.div
                  key={job.job_id}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.03 }}
                  className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-xl shadow-slate-200/50 transition"
                >
                  <Link to={`/jobs/${job.job_id}`} className="space-y-4 block">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-950">{job.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{job.company_name}</p>
                      </div>
                      <div className="rounded-2xl bg-[#50ADDD]/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#3172B1]">
                        {job.job_type ?? 'Full-Time'}
                      </div>
                    </div>
                    <div className="grid gap-3 text-slate-600">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        {job.location || 'Remote'}
                      </div>
                      {job.posted_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          Posted: {new Date(job.posted_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <button className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F99F1F] to-[#F5D89B] px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-[#F99F1F]/20 transition hover:-translate-y-0.5">
                      Apply Now
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
