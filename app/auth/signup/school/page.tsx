'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'

export default function SchoolSignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf8]" />}>
      <SchoolSignupPageInner />
    </Suspense>
  )
}

function SchoolSignupPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If we have a session_id, look up the existing school created by the webhook
  const [existingSchoolId, setExistingSchoolId] = useState<string | null>(null)
  const [billingEmail, setBillingEmail] = useState<string | null>(null)
  const [prefilledSchoolName, setPrefilledSchoolName] = useState<string | null>(null)
  const [bootstrapped, setBootstrapped] = useState(!sessionId)

  const supabase = createClient()

  // Payment gate: school admin signup requires a Stripe checkout session.
  // Direct visitors are sent to /for-schools/pricing to start a trial first.
  useEffect(() => {
    if (!sessionId) {
      router.replace('/for-schools/pricing')
    }
  }, [sessionId])

  // On mount: if a session_id is present, fetch the Stripe session details
  // and find the school that the webhook already created for this customer.
  // If the webhook hasn't fired yet we retry a few times, since Stripe webhooks
  // usually arrive within a couple of seconds.
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

    const run = async () => {
      try {
        const sessionRes = await fetch(`/api/stripe/session?id=${encodeURIComponent(sessionId)}`)
        const sessionData = await sessionRes.json()
        if (!sessionRes.ok || cancelled) {
          if (!cancelled) setBootstrapped(true)
          return
        }

        if (sessionData.email) {
          setEmail(sessionData.email)
          setBillingEmail(sessionData.email)
        }

        if (sessionData.customerId) {
          // Retry up to 5 times (max ~10s) waiting for the webhook to create the school
          for (let attempt = 0; attempt < 5 && !cancelled; attempt++) {
            const { data: school } = await supabase
              .from('schools')
              .select('id, name')
              .eq('stripe_customer_id', sessionData.customerId)
              .maybeSingle()

            if (school) {
              if (!cancelled) {
                setExistingSchoolId(school.id)
                setPrefilledSchoolName(school.name || null)
                setSchoolName(school.name || '')
              }
              break
            }
            await wait(2000)
          }
        }
      } catch (err) {
        console.error('Failed to bootstrap school signup:', err)
      } finally {
        if (!cancelled) setBootstrapped(true)
      }
    }

    run()
    return () => { cancelled = true }
  }, [sessionId])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!sessionId || !existingSchoolId) {
      setError('Could not find your subscription. Please refresh, or contact support if this persists.')
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

    if (!authData.user) {
      setError('Account creation failed. Please try again.')
      setLoading(false)
      return
    }

    // Link to existing school created by Stripe webhook (uses service role)
    const claimRes = await fetch('/api/school/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, schoolName: schoolName.trim() }),
    })
    const claimData = await claimRes.json()
    if (!claimRes.ok) {
      setError(claimData.error || 'Failed to link your account to the school.')
      setLoading(false)
      return
    }

    router.push('/school')
  }

  if (!bootstrapped) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-navy-600 text-sm">Looking up your subscription…</div>
      </div>
    )
  }

  // Bootstrap finished but no school was found yet — show a wait-and-retry state
  // so the user doesn't try to submit a form that can't link properly.
  if (!existingSchoolId) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6"><Logo href="/" imgClassName="h-10 w-auto" /></div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-3xl mb-4">⏳</div>
            <h1 className="text-xl font-semibold text-navy-600 mb-2">Setting up your subscription</h1>
            <p className="text-sm text-gray-600 mb-6">
              Stripe is finalizing your trial. This usually takes a few seconds. Click refresh to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-warm-500 hover:bg-warm-600 text-white font-medium px-5 py-2.5 rounded-lg transition"
            >
              Refresh
            </button>
            <p className="text-xs text-gray-400 mt-6">
              Still stuck after a minute? Email <a href="mailto:hello@montessori.org" className="underline">hello@montessori.org</a> with your billing email.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const fromCheckout = !!existingSchoolId

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3"><Logo href="/" imgClassName="h-10 w-auto" /></div>
          <p className="text-warm-600 italic">School Administration</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {fromCheckout && (
            <div className="bg-warm-50 border border-warm-200 text-warm-700 text-sm rounded-lg p-3 mb-5">
              ✓ Subscription confirmed for <strong>{prefilledSchoolName || 'your school'}</strong>. Finish creating your admin account.
            </div>
          )}

          <h2 className="text-xl font-semibold text-navy-600 mb-2">
            {fromCheckout ? 'Create Your Admin Account' : 'Register Your School'}
          </h2>
          <p className="text-navy-600 text-sm mb-6">
            {fromCheckout
              ? 'You\'ll be linked as the admin on the school you just paid for.'
              : 'Create a school account to invite and support your families on Montessori Family Alliance.'}
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
              <label className="block text-sm font-medium text-navy-600 mb-1">
                School name {fromCheckout && <span className="text-xs text-gray-400">(from your subscription)</span>}
              </label>
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
              <label className="block text-sm font-medium text-navy-600 mb-1">
                Email {fromCheckout && billingEmail && <span className="text-xs text-gray-400">(from your subscription)</span>}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="admin@yourschool.edu"
                required
                disabled={fromCheckout && !!billingEmail}
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
              {loading
                ? (fromCheckout ? 'Creating admin account…' : 'Creating school…')
                : (fromCheckout ? 'Finish Setup →' : 'Register School')}
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
            <Link href="/pricing" className="text-warm-600 hover:text-warm-700 font-medium">
              Sign up as a parent
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
