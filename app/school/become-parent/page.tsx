'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Smooth handoff page when a school admin clicks "Try parent experience"
// from the dashboard checklist.
//
// We render a brief warm intro instead of immediately POSTing — this is the
// admin's first time stepping into the parent side, and a one-screen "here's
// what we're about to do" reduces confusion. Click the button, we create
// the parent records server-side, then route to /dashboard where the parent
// onboarding flow takes over (add a child, etc).

export default function BecomeParentPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const setUp = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/school/become-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not set up parent view. Please try again.')
        setSubmitting(false)
        return
      }
      // Whether we just created it or it already existed — go to /dashboard.
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Could not set up parent view. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/school"
        className="inline-flex items-center gap-1 text-xs text-navy-600/60 hover:text-navy-700 mb-4"
      >
        ← Back to dashboard
      </Link>

      <div
        className="rounded-3xl p-8 sm:p-10 mb-6 text-white"
        style={{
          background:
            'linear-gradient(135deg, #1a0e2e 0%, #2d1b4e 50%, #4a2c82 100%)',
        }}
      >
        <div className="text-3xl mb-3">👨‍👩‍👧</div>
        <h1 className="font-serif text-3xl font-normal leading-tight mb-3"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          See what your families experience.
        </h1>
        <p className="text-[#e9e2f5] leading-relaxed">
          The best way to support your families is to feel what they feel. We&apos;ll
          set up a parent view linked to your account so you can move between your
          admin dashboard and the family experience anytime.
        </p>
      </div>

      <section className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-navy-700 mb-3">Here&apos;s what happens</h2>
        <ul className="space-y-3 text-sm text-navy-700">
          <li className="flex items-start gap-3">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span>
              We create a parent profile linked to <strong>your same email and login</strong>.
              No new account, no second password.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span>
              You&apos;ll see a <strong>&quot;Switch to Parent View&quot;</strong> chip in your
              header — flip between admin and parent views with one click.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span>
              On the parent side you can add your own child (real or sample) to see
              the full experience — observations, Abigail, curriculum tracking, all of it.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span>
              Your school admin role is unchanged. None of your school&apos;s family data
              is visible from the parent side.
            </span>
          </li>
        </ul>
      </section>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <button
          onClick={setUp}
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-3 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition disabled:opacity-50 text-sm"
        >
          {submitting ? 'Setting up your parent view…' : 'Set up my parent view →'}
        </button>
        <Link
          href="/school"
          className="text-xs text-navy-600/60 hover:text-navy-700"
        >
          Maybe later
        </Link>
      </div>
    </div>
  )
}
