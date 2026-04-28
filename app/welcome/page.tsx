'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf8]" />}>
      <WelcomePageInner />
    </Suspense>
  )
}

function WelcomePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState<'loading' | 'ready' | 'linking' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const run = async () => {
      // No session id — fall back to dashboard if logged in, else home
      if (!sessionId) {
        const { data: { user } } = await supabase.auth.getUser()
        router.push(user ? '/dashboard' : '/')
        return
      }

      try {
        // Fetch session details from Stripe
        const sessionRes = await fetch(`/api/stripe/session?id=${encodeURIComponent(sessionId)}`)
        const sessionData = await sessionRes.json()
        if (!sessionRes.ok) {
          setErrorMsg(sessionData.error || 'Failed to load session.')
          setStatus('error')
          return
        }

        if (sessionData.trialEnd) {
          setTrialEndsAt(new Date(sessionData.trialEnd))
        } else {
          setTrialEndsAt(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        }

        // Check if logged in
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          // Not logged in — bounce to signup with the session id (and prefill email)
          const params = new URLSearchParams()
          params.set('session_id', sessionId)
          if (sessionData.email) params.set('email', sessionData.email)
          router.replace(`/auth/signup?${params.toString()}`)
          return
        }

        // Logged in — link this session to the parent record (covers cases
        // where the user was already signed in when they checked out)
        setStatus('linking')
        const linkRes = await fetch('/api/stripe/link-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        if (!linkRes.ok) {
          const linkData = await linkRes.json()
          // Non-fatal — webhook will likely catch up. Continue to onboarding.
          console.warn('link-session failed (will retry via webhook):', linkData.error)
        }

        // Decide where to send the user: onboarding if no children yet, else dashboard
        const { data: parent } = await supabase
          .from('parents')
          .select('id')
          .eq('user_id', user.id)
          .single()

        let nextPath = '/onboarding'
        if (parent) {
          const { data: famMembers } = await supabase
            .from('family_members')
            .select('family_id')
            .eq('parent_id', parent.id)
          const familyIds = (famMembers || []).map(f => f.family_id)
          if (familyIds.length > 0) {
            const { count } = await supabase
              .from('children')
              .select('id', { count: 'exact', head: true })
              .in('family_id', familyIds)
            if ((count || 0) > 0) nextPath = '/dashboard'
          }
        }

        setStatus('ready')
        // Small delay so user sees the success message before redirect
        setTimeout(() => router.push(nextPath), 1500)
      } catch (err: any) {
        setErrorMsg(err?.message || 'Something went wrong.')
        setStatus('error')
      }
    }
    run()
  }, [sessionId])

  const trialEndStr = trialEndsAt
    ? trialEndsAt.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : ''

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-warm-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">{status === 'error' ? '⚠️' : '🌱'}</span>
          </div>

          {status === 'error' ? (
            <>
              <h1 className="text-2xl font-bold text-navy-700 mb-3">Something went wrong</h1>
              <p className="text-navy-600/80 mb-6">{errorMsg}</p>
              <Link href="/pricing" className="inline-block bg-warm-500 hover:bg-warm-600 text-white font-medium py-3 px-6 rounded-lg transition">
                Back to Pricing
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-navy-700 mb-3">
                Trial Started!
              </h1>
              <p className="text-navy-600/80 mb-6 leading-relaxed">
                {trialEndStr ? (
                  <>Your 7-day free trial is active until <span className="font-semibold text-navy-700">{trialEndStr}</span>. You won&apos;t be charged until then — cancel anytime.</>
                ) : (
                  <>Your 7-day free trial is active. Setting up your account…</>
                )}
              </p>
              <p className="text-sm text-navy-600/60">
                {status === 'linking' || status === 'loading' ? 'Setting up your account…' : 'Redirecting to your account…'}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
