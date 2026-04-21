import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Phone, MapPin, GraduationCap, Briefcase, FileText, Upload, Loader2, Save, ArrowLeft, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { candidateService, type CandidateProfile } from '../../services/candidate.service'

export default function CandidateProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false)
  const [formData, setFormData] = useState<Partial<CandidateProfile>>({})

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await candidateService.getProfile()
      setProfile(data.profile)
      setFormData(data.profile || {})
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await candidateService.updateProfile(formData)
      toast.success('Profile updated successfully')
      loadProfile()
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingResume(true)
    try {
      const result = await candidateService.uploadResume(file)
      setFormData(prev => ({ ...prev, resume_path: result.resume_path }))
      toast.success('Resume uploaded successfully')
    } catch {
      toast.error('Failed to upload resume')
    } finally {
      setUploadingResume(false)
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingProfileImage(true)
    try {
      const result = await candidateService.uploadProfileImage(file)
      setFormData(prev => ({ ...prev, profile_image: result.profile_image }))
      toast.success('Profile picture uploaded successfully')
    } catch {
      toast.error('Failed to upload profile picture')
    } finally {
      setUploadingProfileImage(false)
    }
  }

  const getImageUrl = (path?: string) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost/JobPortal/JobPortal/backend'}${path}`
  }

  const handleChange = (field: keyof CandidateProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/candidate')} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Sidebar - Profile Summary */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col items-center">
              <div className="relative mb-3">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 overflow-hidden">
                  {formData.profile_image ? (
                    <img
                      src={getImageUrl(formData.profile_image)}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-blue-600" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700">
                  {uploadingProfileImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageUpload}
                    disabled={uploadingProfileImage}
                  />
                </label>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{profile?.full_name || 'Candidate'}</h2>
              <p className="text-sm text-gray-500">Job Seeker</p>
            </div>
            <div className="space-y-3 text-sm">
              {profile?.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.address && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resume Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">Resume</h3>
            {formData.resume_path ? (
              <div className="mb-4 rounded-lg bg-green-50 p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm font-medium">Resume Uploaded</span>
                </div>
                <a
                  href={formData.resume_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-sm text-blue-600 hover:underline"
                >
                  View Resume →
                </a>
              </div>
            ) : (
              <p className="mb-4 text-sm text-gray-500">No resume uploaded yet</p>
            )}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50">
              {uploadingResume ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              ) : (
                <>
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Upload Resume</span>
                </>
              )}
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" disabled={uploadingResume} />
            </label>
            <p className="mt-2 text-xs text-gray-500">PDF, DOC, or DOCX up to 5MB</p>
          </div>
        </div>

        {/* Main Form */}
        <div className="md:col-span-2">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Personal Information</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.full_name || ''}
                    onChange={e => handleChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+251 91 234 5678"
                    className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Country</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={e => handleChange('country', e.target.value)}
                    placeholder="Ethiopia"
                    className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Address / City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={e => handleChange('address', e.target.value)}
                    placeholder="Addis Ababa"
                    className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Field of Work</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.field || ''}
                    onChange={e => handleChange('field', e.target.value)}
                    placeholder="Software Development"
                    className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Experience Level</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.experience || ''}
                    onChange={e => handleChange('experience', e.target.value)}
                    className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select experience</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="junior">Junior (2-4 years)</option>
                    <option value="mid">Mid Level (4-7 years)</option>
                    <option value="senior">Senior (7+ years)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Education</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.education || ''}
                    onChange={e => handleChange('education', e.target.value)}
                    className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select education</option>
                    <option value="high_school">High School</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Gender</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.gender || ''}
                    onChange={e => handleChange('gender', e.target.value)}
                    className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Professional Summary</label>
              <textarea
                value={formData.summary || ''}
                onChange={e => handleChange('summary', e.target.value)}
                placeholder="Brief description about yourself, your skills, and career goals..."
                rows={4}
                className="w-full rounded-lg border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Skills</label>
              <textarea
                value={formData.skills || ''}
                onChange={e => handleChange('skills', e.target.value)}
                placeholder="Enter your skills separated by commas (e.g., React, TypeScript, Node.js, Python...)"
                rows={3}
                className="w-full rounded-lg border p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <p className="mt-1 text-xs text-gray-500">Separate skills with commas</p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => navigate('/candidate')}
                className="rounded-lg border px-6 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
