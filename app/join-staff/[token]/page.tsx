'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface InviteInfo {
  email: string
  schoolName: string | null
  status: string
  expired: boolean
}

export default function JoinStaffPage() {
  const params = useParams()
  const token = params.token as string
  const router = useRouter()
  const supabase = createClient()

  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Signup form (if not logged in)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      // Look up invitation (public read via service-role-less query)
      const { data: inv } = await supabase
        .from('invitations')
        .select('email, status, expires_at, school_id')
        .eq('token', token)
        .eq('type', 'school_staff')
        .maybeSingle()

      if (!inv) {
        setError('Invitation not found.')
        setLoading(false)
        return
      }

      // Look up school name (schools table has public SELECT policy)
      let schoolName: string | null = null
      if (inv.school_id) {
        const { data: school } = await supabase
          .from('schools')
          .select('name')
          .eq('id', inv.school_id)
          .maybeSingle()
        schoolName = school?.name || null
      }

      const expired = new Date(inv.expires_at) < new Date()

      setInvite({
        email: inv.email,
        schoolName,
        status: inv.status,
        expired,
      })

      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setLoading(false)
    }
    load()
  }, [token])

  const acceptInvite = async () => {
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/school/staff/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to accept invitation')
      setSubmitting(false)
      return
    }
    router.push('/school')
  }

  const handleSignupAndAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invite) return
    setSubmitting(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invite.email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setSubmitting(false)
      return
    }

    if (!authData.user) {
      setError('Account creation failed. Please try again.')
      setSubmitting(false)
      return
    }

    // Accept the invite
    const acceptRes = await fetch('/api/school/staff/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (!acceptRes.ok) {
      const data = await acceptRes.json()
      setError(data.error || 'Failed to accept invitation after signup')
      setSubmitting(false)
      return
    }

    router.push('/school')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-navy-600 text-sm">Loading invitation…</div>
      </div>
    )
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy-600 mb-2">{error || 'Invitation not found'}</h1>
          <Link href="/" className="text-warm-600 hover:text-warm-700 text-sm font-medium">
            Go to home page
          </Link>
        </div>
      </div>
    )
  }

  if (invite.expired || invite.status !== 'pending') {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⌛</div>
          <h1 className="text-xl font-bold text-navy-600 mb-2">
            {invite.expired ? 'This invitation has expired' : `This invitation is ${invite.status}`}
          </h1>
          <p className="text-sm text-navy-600 mb-4">
            Ask the school admin to send you a new invitation.
          </p>
          <Link href="/" className="text-warm-600 hover:text-warm-700 text-sm font-medium">
            Go to home page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-600 mb-1">Montessori Family Alliance</h1>
          <p className="text-warm-600 italic">School Administration</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6 pb-6 border-b border-gray-100">
            <div className="text-4xl mb-3">🏫</div>
            <h2 className="text-lg font-semibold text-navy-600">
              {invite.schoolName || 'A school'}
            </h2>
            <p className="text-sm text-warm-600 mt-2">
              has invited you to be an admin
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Invited as: {invite.email}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          {isLoggedIn ? (
            <>
              <p className="text-sm text-navy-600 text-center mb-5">
                You&apos;re already signed in. Click below to accept this invitation.
              </p>
              <button
                onClick={acceptInvite}
                disabled={submitting}
                className="w-full bg-warm-500 hover:bg-warm-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Accepting…' : `Accept &amp; Manage ${invite.schoolName || 'School'}`}
              </button>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-navy-600 mb-4">Create your admin account</h3>
              <form onSubmit={handleSignupAndAccept} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={invite.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-600 mb-1">Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="First name"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-600 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-warm-500 hover:bg-warm-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Creating account…' : 'Accept Invitation'}
                </button>
              </form>
              <p className="text-center text-sm text-navy-600 mt-4">
                Already have an account?{' '}
                <Link href={`/auth/login?next=/join-staff/${token}`} className="text-warm-600 hover:text-warm-700 font-medium">
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
