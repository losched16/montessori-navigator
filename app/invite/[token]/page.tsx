'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'

export default function InvitePage() {
  const [inviteInfo, setInviteInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const router = useRouter()
  const params = useParams()
  const token = params.token as string
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      // Get invite info
      try {
        const res = await fetch(`/api/invite/info?token=${token}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Invalid invitation')
        } else {
          setInviteInfo(data)
          if (data.status !== 'pending') {
            setError(`This invitation has already been ${data.status}`)
          } else if (data.expired) {
            setError('This invitation has expired')
          }
        }
      } catch {
        setError('Failed to load invitation details')
      }
      setLoading(false)
    }
    load()
  }, [token])

  const handleAccept = async () => {
    setAccepting(true)
    setError('')

    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to accept invitation')
      } else {
        setAccepted(true)
        // Redirect to dashboard after a moment
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    } catch {
      setError('Failed to accept invitation')
    }
    setAccepting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-navy-600">Loading invitation...</div>
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
          {accepted ? (
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold text-navy-600 mb-2">You&apos;re in!</h2>
              <p className="text-navy-600 text-sm mb-4">
                You&apos;ve been added to {inviteInfo?.familyName || 'the family'}. Redirecting to your dashboard...
              </p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-4xl mb-4">😔</div>
              <h2 className="text-xl font-semibold text-navy-600 mb-2">Invitation Issue</h2>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <Link href="/" className="text-warm-600 hover:text-warm-700 text-sm font-medium">
                Go to home page
              </Link>
            </div>
          ) : inviteInfo?.type === 'co_parent' ? (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">👨‍👩‍👧</div>
                <h2 className="text-xl font-semibold text-navy-600 mb-2">Family Invitation</h2>
                <p className="text-navy-600 text-sm">
                  You&apos;ve been invited to join <strong>{inviteInfo.familyName || 'a family'}</strong> on Montessori Family Alliance.
                </p>
              </div>

              <div className="bg-warm-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-navy-600">
                  By accepting, you&apos;ll be able to view and track the development of the children in this family.
                </p>
              </div>

              {isLoggedIn ? (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full bg-warm-500 hover:bg-warm-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
                >
                  {accepting ? 'Accepting...' : 'Accept Invitation'}
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-navy-600 text-center mb-2">
                    Sign in or create an account to accept this invitation.
                  </p>
                  <Link
                    href={`/auth/login?next=/invite/${token}`}
                    className="block w-full text-center bg-warm-500 hover:bg-warm-600 text-white font-medium py-3 rounded-lg transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={`/auth/signup?next=/invite/${token}`}
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-navy-600 font-medium py-3 rounded-lg transition"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </>
          ) : inviteInfo?.type === 'school_family' ? (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🏫</div>
                <h2 className="text-xl font-semibold text-navy-600 mb-2">School Invitation</h2>
                <p className="text-navy-600 text-sm">
                  <strong>{inviteInfo.schoolName || 'A school'}</strong> has invited you to join Montessori Family Alliance.
                </p>
              </div>

              {isLoggedIn ? (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full bg-warm-500 hover:bg-warm-600 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
                >
                  {accepting ? 'Joining...' : 'Join School Community'}
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-navy-600 text-center mb-2">
                    Sign in or create an account to join.
                  </p>
                  <Link
                    href={`/auth/login?next=/invite/${token}`}
                    className="block w-full text-center bg-warm-500 hover:bg-warm-600 text-white font-medium py-3 rounded-lg transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={`/auth/signup?next=/invite/${token}`}
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-navy-600 font-medium py-3 rounded-lg transition"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
