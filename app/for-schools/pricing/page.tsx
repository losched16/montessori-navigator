'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SchoolPricingPage() {
  const [familyCount, setFamilyCount] = useState(50)
  const [schoolName, setSchoolName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pricePerFamily = 12
  const total = familyCount * pricePerFamily

  const handleSubscribe = async () => {
    setError('')

    if (!schoolName.trim()) {
      setError('Please enter your school name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'school', familyCount, schoolName, email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Failed to connect. Please try again.')
    } finally {
      setLoading(false)
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
            Pricing for Schools
          </h1>
          <p className="text-lg text-navy-600/70 max-w-2xl mx-auto">
            Give every family in your school access to Montessori Navigator.
            One simple price, billed annually.
          </p>
        </div>

        {/* Pricing card */}
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Price header */}
            <div className="bg-navy-700 text-white px-6 sm:px-8 py-8 text-center">
              <div className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">
                Per Family, Per Year
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">${pricePerFamily}</span>
                <span className="text-white/60 text-lg">/family/year</span>
              </div>
              <p className="text-white/50 text-sm mt-2">Billed annually</p>
            </div>

            {/* Calculator */}
            <div className="px-6 sm:px-8 py-8 space-y-6">
              {/* Family count */}
              <div>
                <label className="block text-sm font-medium text-navy-600 mb-2">
                  How many families are in your school?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={500}
                    value={familyCount}
                    onChange={e => setFamilyCount(Number(e.target.value))}
                    className="flex-1 accent-warm-500"
                  />
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={familyCount}
                    onChange={e => {
                      const val = Number(e.target.value)
                      if (val >= 1 && val <= 500) setFamilyCount(val)
                    }}
                    className="w-20 text-center border border-gray-200 rounded-lg px-2 py-2 text-navy-700 font-medium focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="bg-warm-50 rounded-xl p-5 text-center">
                <div className="text-sm text-navy-600/60 mb-1">Your annual total</div>
                <div className="text-3xl font-bold text-navy-700">
                  ${total.toLocaleString()}
                  <span className="text-lg font-normal text-navy-600/50">/year</span>
                </div>
                <div className="text-sm text-navy-600/50 mt-1">
                  {familyCount} families × ${pricePerFamily}/year
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    placeholder="e.g. Sunrise Montessori Academy"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-navy-700 placeholder:text-gray-300 focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-600 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@yourschool.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-navy-700 placeholder:text-gray-300 focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2.5">
                  {error}
                </div>
              )}

              {/* Subscribe button */}
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-warm-500 hover:bg-warm-600 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Redirecting to checkout...' : `Subscribe — $${total.toLocaleString()}/year`}
              </button>

              <p className="text-xs text-center text-navy-600/40">
                You&apos;ll be redirected to Stripe for secure payment.
                Cancel anytime from your school dashboard.
              </p>
            </div>
          </div>

          {/* What's included */}
          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 px-6 sm:px-8 py-8">
            <h2 className="text-lg font-bold text-navy-700 mb-4">What every family gets</h2>
            <ul className="space-y-3">
              {[
                'Abigail — AI-powered Montessori guide personalized to each child',
                '2,500+ articles and videos from the Montessori Foundation library',
                'Baby milestone tracking (0–36 months) with monthly development guides',
                'At-home learning plan generator with step-by-step activities',
                'Observation logging and progress tracking across 10 curriculum areas',
                '2,566 Montessori skills from the official Scope & Sequence',
                'Room-by-room home environment setup guides with AI Room Vision',
                'Progress reports for conferences and homeschool portfolios',
                'Co-parent sharing — both parents can track and contribute',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-warm-500 mt-0.5 shrink-0">✓</span>
                  <span className="text-navy-600 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQ */}
          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 px-6 sm:px-8 py-8">
            <h2 className="text-lg font-bold text-navy-700 mb-4">Common Questions</h2>
            <div className="space-y-5">
              <div>
                <h3 className="font-medium text-navy-700 text-sm">What happens after I subscribe?</h3>
                <p className="text-navy-600/60 text-sm mt-1">
                  You&apos;ll create your school admin account, then invite families via a shareable link or CSV upload. Families sign up with their own accounts.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-navy-700 text-sm">Can I change my family count later?</h3>
                <p className="text-navy-600/60 text-sm mt-1">
                  Yes. Contact us to adjust your family count and your subscription will be prorated at renewal.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-navy-700 text-sm">Can schools see family data?</h3>
                <p className="text-navy-600/60 text-sm mt-1">
                  No. Schools can see which families have joined, but all observations, conversations, and development data remain completely private to each family.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-navy-700 text-sm">Is there a minimum number of families?</h3>
                <p className="text-navy-600/60 text-sm mt-1">
                  No minimum — you can start with as few as 1 family. Most schools have 30–150 families.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-navy-600/40">
        <div className="max-w-5xl mx-auto px-4">
          © {new Date().getFullYear()} Montessori Navigator. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
