'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf8]" />}>
      <SignupPageInner />
    </Suspense>
  )
}

function SignupPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const prefillEmail = searchParams.get('email')

  const [name, setName] = useState('')
  const [email, setEmail] = useState(prefillEmail || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail)
  }, [prefillEmail])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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

    // Create parent profile
    const { data: parentData, error: profileError } = await supabase
      .from('parents')
      .insert({
        user_id: authData.user.id,
        display_name: name,
        email: email,
      })
      .select()
      .single()

    if (profileError) {
      setError('Account created but profile setup failed. Please try logging in.')
      setLoading(false)
      return
    }

    // Create a family for this parent
    if (parentData) {
      const { data: family } = await supabase
        .from('families')
        .insert({ name: `${name}'s Family` })
        .select()
        .single()

      if (family) {
        await supabase
          .from('family_members')
          .insert({
            family_id: family.id,
            parent_id: parentData.id,
            role: 'primary',
            permissions: 'full',
          })

        // Check if there's a school invite to associate with
        const schoolSlug = searchParams.get('school')
        if (schoolSlug) {
          const { data: school } = await supabase
            .from('schools')
            .select('id')
            .eq('slug', schoolSlug)
            .single()

          if (school) {
            await supabase
              .from('school_families')
              .insert({
                school_id: school.id,
                family_id: family.id,
              })
          }
        }
      }
    }

    // If they came from Stripe Checkout (session_id present), link the subscription
    if (sessionId) {
      try {
        await fetch('/api/stripe/link-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        // Even if link fails, webhook will eventually catch up via email match
      } catch (err) {
        console.error('link-session failed (webhook will retry):', err)
      }
      router.push('/onboarding')
      return
    }

    // Legacy plan param flow (kept for back-compat with old links)
    const planParam = searchParams.get('plan')
    if (planParam === 'monthly' || planParam === 'annual') {
      const plan = planParam === 'monthly' ? 'individual_monthly' : 'individual_annual'
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        })
        const data = await res.json()
        if (res.ok && data.url) {
          window.location.href = data.url
          return
        }
      } catch (err) {
        console.error('Checkout request failed:', err)
      }
    }

    router.push('/onboarding')
  }

  const fromCheckout = !!sessionId

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3"><Logo href="/" imgClassName="h-10 w-auto" /></div>
          <p className="text-warm-600 italic">A Prepared Environment for Parents</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {fromCheckout && (
            <div className="bg-warm-50 border border-warm-200 text-warm-700 text-sm rounded-lg p-3 mb-5">
              ✓ Trial started! Finish creating your account to access Montessori Family Alliance.
            </div>
          )}

          <h2 className="text-xl font-semibold text-navy-600 mb-2">
            {fromCheckout ? 'Finish Creating Your Account' : 'Create your account'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {fromCheckout ? 'One last step to get started' : 'Start your family’s Montessori journey'}
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                placeholder="First name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email {fromCheckout && <span className="text-xs text-gray-400">(from your trial signup)</span>}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-600"
                placeholder="you@email.com"
                required
                disabled={fromCheckout}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              className="w-full bg-warm-500 hover:bg-warm-600 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-warm-600 hover:text-warm-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
