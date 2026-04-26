'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf8]" />}>
      <WelcomePageInner />
    </Suspense>
  )
}

function WelcomePageInner() {
  const router = useRouter()

  const [hasChildren, setHasChildren] = useState<boolean | null>(null)
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Not logged in — bounce to login. Once they log in they'll already be subscribed.
        router.push('/auth/login')
        return
      }

      const { data: parent } = await supabase
        .from('parents')
        .select('id, trial_ends_at')
        .eq('user_id', user.id)
        .single()

      if (parent) {
        setTrialEndsAt(parent.trial_ends_at || null)

        // Check if any children exist for this parent's families
        const { data: families } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('parent_id', parent.id)

        if (families && families.length > 0) {
          const familyIds = families.map(f => f.family_id)
          const { count } = await supabase
            .from('children')
            .select('id', { count: 'exact', head: true })
            .in('family_id', familyIds)
          setHasChildren((count || 0) > 0)
        } else {
          setHasChildren(false)
        }
      }
    }
    load()
  }, [])

  const continueHref = hasChildren ? '/dashboard' : '/onboarding'
  const continueLabel = hasChildren ? 'Go to Dashboard' : 'Continue Setup'

  // Calculate fallback trial end date (now + 7 days) if not yet in DB (webhook not fired)
  const trialEndDate = trialEndsAt
    ? new Date(trialEndsAt)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const trialEndStr = trialEndDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col">
      <header className="bg-navy-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="text-lg font-bold">Montessori Navigator</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-warm-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🌱</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-navy-700 mb-3">
            Welcome to Montessori Navigator
          </h1>

          <p className="text-navy-600/80 mb-6 leading-relaxed">
            Your 7-day free trial has started. You won&apos;t be charged until{' '}
            <span className="font-semibold text-navy-700">{trialEndStr}</span> —
            and you can cancel anytime before then.
          </p>

          <div className="bg-warm-50 rounded-xl p-5 mb-8 text-left">
            <p className="text-xs text-warm-700 font-medium uppercase tracking-wide mb-2">What&apos;s next</p>
            <ul className="text-sm text-navy-600 space-y-1.5">
              <li>{hasChildren ? '✓ Continue tracking your child' : '• Tell us about your family'}</li>
              <li>{hasChildren ? '✓ Explore observations &amp; plans' : '• Add your children'}</li>
              <li>• Start chatting with Abigail</li>
            </ul>
          </div>

          <Link
            href={continueHref}
            className="inline-block w-full bg-warm-500 hover:bg-warm-600 text-white font-medium py-3 px-6 rounded-lg transition"
          >
            {continueLabel} →
          </Link>

          <p className="mt-6 text-xs text-navy-600/50">
            Need help? Email <a href="mailto:hello@montessori.org" className="underline">hello@montessori.org</a>
          </p>
        </div>
      </main>
    </div>
  )
}
