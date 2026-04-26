'use client'

import { useState } from 'react'
import Link from 'next/link'

type Plan = 'individual_monthly' | 'individual_annual'

export default function PricingPage() {
  const [loading, setLoading] = useState<Plan | null>(null)
  const [error, setError] = useState('')

  const handleSubscribe = async (plan: Plan) => {
    setError('')
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        setLoading(null)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Failed to connect. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <header className="bg-navy-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">Montessori Navigator</Link>
          <Link href="/auth/login" className="text-sm text-white/70 hover:text-white">Log in</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-700 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-lg text-navy-600/70 max-w-2xl mx-auto">
            Start with a 7-day free trial. No charge until your trial ends. Cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
          {/* Monthly */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 sm:px-8 py-8 text-center border-b border-gray-100">
              <div className="text-navy-600/60 text-sm font-medium uppercase tracking-wider mb-2">
                Monthly
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-navy-700">$8</span>
                <span className="text-navy-600/70">/month</span>
              </div>
              <p className="text-sm text-navy-600/60 mt-2">Billed monthly · Cancel anytime</p>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
              <FeatureList />
              <button
                onClick={() => handleSubscribe('individual_monthly')}
                disabled={loading !== null}
                className="mt-6 w-full bg-navy-700 hover:bg-navy-600 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50"
              >
                {loading === 'individual_monthly' ? 'Loading…' : 'Start 7-Day Free Trial'}
              </button>
            </div>
          </div>

          {/* Annual */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-warm-500 overflow-hidden flex flex-col relative">
            <div className="absolute top-3 right-3 bg-warm-500 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
              Save 38%
            </div>
            <div className="px-6 sm:px-8 py-8 text-center border-b border-gray-100">
              <div className="text-navy-600/60 text-sm font-medium uppercase tracking-wider mb-2">
                Annual
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-navy-700">$59</span>
                <span className="text-navy-600/70">/year</span>
              </div>
              <p className="text-sm text-navy-600/60 mt-2">
                ~$4.92/mo · Best value
              </p>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
              <FeatureList />
              <button
                onClick={() => handleSubscribe('individual_annual')}
                disabled={loading !== null}
                className="mt-6 w-full bg-warm-500 hover:bg-warm-600 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50"
              >
                {loading === 'individual_annual' ? 'Loading…' : 'Start 7-Day Free Trial'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-50 text-red-600 text-sm p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-navy-700 mb-6 text-center">Common Questions</h2>
          <div className="space-y-4">
            <Faq q="How does the free trial work?">
              You get full access to Montessori Navigator for 7 days. We collect your card up front, but you won&apos;t be charged until day 8. Cancel anytime during the trial and you won&apos;t be charged at all.
            </Faq>
            <Faq q="Can I cancel anytime?">
              Yes. Cancel from your account settings — no questions asked. If you cancel during the trial, you won&apos;t be charged.
            </Faq>
            <Faq q="What&apos;s the difference between monthly and annual?">
              Same features, both include the 7-day free trial. Annual saves you about 38% compared to paying monthly.
            </Faq>
            <Faq q="Can I switch plans later?">
              Yes. You can switch between monthly and annual from your account settings.
            </Faq>
          </div>
        </div>

        {/* School link */}
        <div className="text-center mt-16 text-sm text-navy-600/60">
          Running a Montessori school?{' '}
          <Link href="/for-schools/pricing" className="text-warm-600 hover:text-warm-700 font-medium underline">
            See school pricing →
          </Link>
        </div>
      </main>
    </div>
  )
}

function FeatureList() {
  return (
    <ul className="space-y-2.5 text-sm text-navy-600">
      <Feature>Abigail — your personal AI Montessori guide</Feature>
      <Feature>Track unlimited children</Feature>
      <Feature>Daily observation prompts &amp; logs</Feature>
      <Feature>2,566-skill Montessori curriculum tracker</Feature>
      <Feature>AI-powered at-home learning plans</Feature>
      <Feature>Baby Milestones (0–36 months)</Feature>
      <Feature>Library of 495+ Montessori articles</Feature>
      <Feature>Tomorrow&apos;s Child newsletter access</Feature>
      <Feature>Room Vision &amp; environment guides</Feature>
      <Feature>Progress reports for conferences</Feature>
    </ul>
  )
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-warm-500 mt-0.5 shrink-0">✓</span>
      <span>{children}</span>
    </li>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="bg-white rounded-lg border border-gray-100 overflow-hidden group">
      <summary className="px-5 py-4 cursor-pointer font-medium text-navy-700 list-none flex items-center justify-between">
        <span>{q}</span>
        <span className="text-warm-500 group-open:rotate-180 transition">⌄</span>
      </summary>
      <div className="px-5 pb-4 text-sm text-navy-600/80 leading-relaxed">
        {children}
      </div>
    </details>
  )
}
