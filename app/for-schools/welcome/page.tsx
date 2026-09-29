'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase'

export default function SchoolWelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf8]" />}>
      <SchoolWelcomePageInner />
    </Suspense>
  )
}

function SchoolWelcomePageInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const router = useRouter()
  const signupHref = sessionId
    ? `/auth/signup/school?session_id=${encodeURIComponent(sessionId)}`
    : '/auth/signup/school'
  // Existing accounts log in and come straight back here to finish linking.
  const loginHref = sessionId
    ? `/auth/login?next=${encodeURIComponent(`/for-schools/welcome?session_id=${sessionId}`)}`
    : '/auth/login'

  // Already signed in (a head of school who previewed the app before buying):
  // link this account to the new school now instead of sending them through
  // signup, which they'd skip. The webhook usually links them already; claim
  // is idempotent either way.
  const [linking, setLinking] = useState<'idle' | 'working' | 'error'>('idle')
  const [linkError, setLinkError] = useState('')
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    ;(async () => {
      const { data: { user } } = await createClient().auth.getUser()
      if (!user || cancelled) return
      setLinking('working')
      for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
        const res = await fetch('/api/school/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        if (res.ok) { router.push('/school'); return }
        if (res.status !== 404) {
          const body = await res.json().catch(() => ({}))
          setLinkError(body.error || 'We couldn’t connect your account to your school.')
          setLinking('error')
          return
        }
        // 404 = the Stripe webhook hasn't created the school yet; give it a moment.
        await new Promise(r => setTimeout(r, 2000))
      }
      if (!cancelled) {
        setLinkError('We’re still finishing your school’s setup. Refresh this page in a minute.')
        setLinking('error')
      }
    })()
    return () => { cancelled = true }
  }, [sessionId, router])

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <Link href={loginHref} className="text-sm text-navy-600 hover:text-navy-700 font-medium">Log in</Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-navy-700 mb-3">
          Your subscription is active!
        </h1>
        <p className="text-lg text-navy-600/70 mb-8">
          Welcome to Montessori Family Alliance. Let&apos;s get your school set up so families can start using the platform.
        </p>

        {linking === 'working' && (
          <div className="mb-8 rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700">
            Connecting your account to your school…
          </div>
        )}
        {linking === 'error' && (
          <div role="alert" className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {linkError}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 sm:px-8 py-8 text-left space-y-6">
          <h2 className="text-lg font-bold text-navy-700">Next Steps</h2>

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-warm-100 text-warm-600 flex items-center justify-center font-bold text-sm shrink-0">1</div>
              <div>
                <h3 className="font-medium text-navy-700">Create your admin account, or log in</h3>
                <p className="text-sm text-navy-600/60 mt-0.5">New here? Sign up with the email you used for billing. Already have a Family Alliance account? Just log in. Either way you&apos;ll be linked as the school admin automatically.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-warm-100 text-warm-600 flex items-center justify-center font-bold text-sm shrink-0">2</div>
              <div>
                <h3 className="font-medium text-navy-700">Set up your school profile</h3>
                <p className="text-sm text-navy-600/60 mt-0.5">Add your school name, logo, and credentials from the school dashboard.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-warm-100 text-warm-600 flex items-center justify-center font-bold text-sm shrink-0">3</div>
              <div>
                <h3 className="font-medium text-navy-700">Invite your families</h3>
                <p className="text-sm text-navy-600/60 mt-0.5">Share your unique school link or upload a CSV of parent emails. Families will receive an invitation to create their accounts.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={signupHref}
            className="bg-warm-500 hover:bg-warm-600 text-white font-semibold px-8 py-3.5 rounded-xl transition text-center"
          >
            Create Your Account
          </Link>
          <Link
            href={loginHref}
            className="border border-gray-200 text-navy-600 font-medium px-8 py-3.5 rounded-xl hover:bg-gray-50 transition text-center"
          >
            Already have an account? Log in
          </Link>
        </div>
      </main>
    </div>
  )
}
