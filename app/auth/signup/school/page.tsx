'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SchoolSignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!schoolName.trim()) {
      setError('School name is required')
      setLoading(false)
      return
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // Create the school
      const slug = generateSlug(schoolName) + '-' + Math.random().toString(36).substring(2, 6)
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: schoolName.trim(),
          slug,
          admin_user_id: authData.user.id,
        })
        .select()
        .single()

      if (schoolError) {
        setError('Account created but school setup failed: ' + schoolError.message)
        setLoading(false)
        return
      }

      // Create school staff entry
      if (school) {
        await supabase
          .from('school_staff')
          .insert({
            school_id: school.id,
            user_id: authData.user.id,
            role: 'admin',
          })
      }

      router.push('/school')
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-600 mb-1">Montessori Navigator</h1>
          <p className="text-warm-600 italic">School Administration</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-navy-600 mb-2">Register Your School</h2>
          <p className="text-navy-600 text-sm mb-6">
            Create a school account to invite and support your families on Montessori Navigator.
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                placeholder="First name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">School name</label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                placeholder="Springfield Montessori Academy"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                placeholder="admin@yourschool.edu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-600 hover:bg-navy-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating school...' : 'Register School'}
            </button>
          </form>

          <p className="text-center text-sm text-navy-600 mt-6">
            Already have a school account?{' '}
            <Link href="/auth/login" className="text-warm-600 hover:text-warm-700 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-center text-sm text-navy-600 mt-2">
            Looking for a parent account?{' '}
            <Link href="/auth/signup" className="text-warm-600 hover:text-warm-700 font-medium">
              Sign up as a parent
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
