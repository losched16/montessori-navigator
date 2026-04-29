'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'

interface CapacityInfo {
  canEnroll: boolean
  reason?: string
  isTrial?: boolean
  limit?: number | null
  used?: number
}

export default function JoinSchoolPage() {
  const [school, setSchool] = useState<{ name: string; credentials: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [capacity, setCapacity] = useState<CapacityInfo | null>(null)

  // Signup form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Already logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)

  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      // Check if school exists
      const { data: schoolData } = await supabase
        .from('schools')
        .select('name, credentials')
        .eq('slug', slug)
        .single()

      if (!schoolData) {
        setError('School not found')
        setLoading(false)
        return
      }

      setSchool(schoolData)

      // Check if the school is open to enrollment (not at trial cap, not canceled)
      try {
        const res = await fetch(`/api/join/capacity?slug=${encodeURIComponent(slug)}`)
        const data = await res.json()
        setCapacity(data)
      } catch {
        setCapacity({ canEnroll: true })
      }

      // Check if user is already logged in
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setLoading(false)
    }
    load()
  }, [slug])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })

    if (authError) {
      setFormError(authError.message)
      setSubmitting(false)
      return
    }

    if (authData.user) {
      // Create parent profile
      const { data: parentData } = await supabase
        .from('parents')
        .insert({
          user_id: authData.user.id,
          display_name: name,
          email,
        })
        .select()
        .single()

      if (parentData) {
        // Generate family ID client-side. RLS SELECT on families requires
        // membership which doesn't exist yet, so .select() after insert
        // returns null. Skip the read-back, use the UUID directly.
        const familyId = crypto.randomUUID()
        const { error: familyErr } = await supabase
          .from('families')
          .insert({ id: familyId, name: `${name}'s Family` })

        if (familyErr) {
          setFormError('Family setup failed: ' + familyErr.message)
          setSubmitting(false)
          return
        }

        const { error: memberErr } = await supabase
          .from('family_members')
          .insert({
            family_id: familyId,
            parent_id: parentData.id,
            role: 'primary',
            permissions: 'full',
          })
        if (memberErr) console.error('Failed to link parent to family:', memberErr)

        // Associate with school
        const { data: schoolData } = await supabase
          .from('schools')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()

        if (schoolData) {
          const { error: enrollErr } = await supabase
            .from('school_families')
            .insert({
              school_id: schoolData.id,
              family_id: familyId,
            })
          if (enrollErr) console.error('Failed to enroll family in school:', enrollErr)
        }
      }

      router.push('/onboarding')
    }
  }

  const handleJoinExisting = async () => {
    setJoining(true)
    setFormError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setFormError('You appear to be signed out. Please refresh the page.')
        setJoining(false)
        return
      }

      // Get or create parent profile (e.g. user signed up as school admin
      // and now wants to join their own school as a parent)
      let { data: parent } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!parent) {
        const { data: newParent, error: parentErr } = await supabase
          .from('parents')
          .insert({
            user_id: user.id,
            email: user.email,
            display_name: user.email?.split('@')[0] || null,
          })
          .select('id')
          .single()
        if (parentErr || !newParent) {
          setFormError('Failed to create parent profile: ' + (parentErr?.message || 'unknown'))
          setJoining(false)
          return
        }
        parent = newParent
      }

      // Get or create family
      const { data: membership } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('parent_id', parent.id)
        .limit(1)
        .maybeSingle()

      let familyId = membership?.family_id

      if (!familyId) {
        familyId = crypto.randomUUID()
        const { error: famErr } = await supabase
          .from('families')
          .insert({ id: familyId, name: 'My Family' })
        if (famErr) {
          setFormError('Failed to create family: ' + famErr.message)
          setJoining(false)
          return
        }
        const { error: memErr } = await supabase
          .from('family_members')
          .insert({
            family_id: familyId,
            parent_id: parent.id,
            role: 'primary',
            permissions: 'full',
          })
        if (memErr) {
          setFormError('Failed to link parent to family: ' + memErr.message)
          setJoining(false)
          return
        }
      }

      // Get school
      const { data: schoolData } = await supabase
        .from('schools')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (!schoolData) {
        setFormError('School not found.')
        setJoining(false)
        return
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from('school_families')
        .select('id')
        .eq('school_id', schoolData.id)
        .eq('family_id', familyId)
        .maybeSingle()

      if (!existing) {
        const { error: enrollErr } = await supabase
          .from('school_families')
          .insert({
            school_id: schoolData.id,
            family_id: familyId,
          })
        if (enrollErr) {
          setFormError('Failed to enroll in school: ' + enrollErr.message)
          setJoining(false)
          return
        }
      }

      setJoined(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: any) {
      setFormError('Unexpected error: ' + (err?.message || 'unknown'))
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-navy-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">😔</div>
          <h1 className="text-xl font-bold text-navy-600 mb-2">{error}</h1>
          <Link href="/" className="text-warm-600 hover:text-warm-700 text-sm font-medium">
            Go to home page
          </Link>
        </div>
      </div>
    )
  }

  // Block enrollment if the school's trial is full or subscription inactive
  if (capacity && !capacity.canEnroll) {
    const trialFull = capacity.reason === 'trial_cap_reached'
    const inactive = capacity.reason === 'subscription_inactive'
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3"><Logo href="/" imgClassName="h-10 w-auto" /></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-3">{trialFull ? '⌛' : '🔒'}</div>
            <h2 className="text-lg font-semibold text-navy-600 mb-2">
              {trialFull
                ? `${school?.name || 'This school'} is currently testing the platform`
                : 'This school isn\'t accepting new families right now'}
            </h2>
            <p className="text-sm text-navy-600 mb-4 leading-relaxed">
              {trialFull
                ? `They're on a free trial and can only invite a few people during testing. Please reach out to your school admin — they'll add you directly once their account is active.`
                : 'Please contact your school admin to confirm enrollment.'}
            </p>
            <Link href="/" className="text-warm-600 hover:text-warm-700 text-sm font-medium">
              Go to home page
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3"><Logo href="/" imgClassName="h-10 w-auto" /></div>
          <p className="text-warm-600 italic">A Prepared Environment for Parents</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* School branding */}
          <div className="text-center mb-6 pb-6 border-b border-gray-100">
            <div className="text-4xl mb-3">🏫</div>
            <h2 className="text-lg font-semibold text-navy-600">{school?.name}</h2>
            {school?.credentials && (
              <p className="text-sm text-navy-600 mt-1">{school.credentials} Accredited</p>
            )}
            <p className="text-sm text-warm-600 mt-2">has invited you to join Montessori Family Alliance</p>
          </div>

          {joined ? (
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-navy-600 mb-2">You&apos;re connected!</h3>
              <p className="text-sm text-navy-600">Redirecting to your dashboard...</p>
            </div>
          ) : isLoggedIn ? (
            <div>
              <p className="text-sm text-navy-600 mb-4 text-center">
                You already have an account. Click below to connect your family with {school?.name}.
              </p>
              {formError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-3">{formError}</div>}
              <button
                onClick={handleJoinExisting}
                disabled={joining}
                className="w-full bg-warm-500 hover:bg-warm-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
              >
                {joining ? 'Joining...' : `Join ${school?.name}`}
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-navy-600 mb-4">Create your free account</h3>
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
                  <label className="block text-sm font-medium text-navy-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                    placeholder="you@email.com"
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
                {formError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{formError}</div>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-warm-500 hover:bg-warm-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
              <p className="text-center text-sm text-navy-600 mt-4">
                Already have an account?{' '}
                <Link href={`/auth/login?next=/join/${slug}`} className="text-warm-600 hover:text-warm-700 font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
