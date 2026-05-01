'use client'

import Link from 'next/link'
import Script from 'next/script'
import Logo from '@/components/ui/Logo'

export default function DemoPage() {

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-5">
            <Link href="/schools" className="hidden sm:inline text-sm text-navy-600 hover:text-navy-700 font-medium">For Schools</Link>
            <Link href="/for-schools/pricing" className="hidden sm:inline text-sm text-navy-600 hover:text-navy-700 font-medium">Pricing</Link>
            <Link href="/auth/login" className="text-sm text-navy-600 hover:text-navy-700 font-medium">Log in</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-warm-50 text-warm-700 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full mb-4">
            ✨ Free 30-Minute Demo
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-700 mb-3">
            See Family Alliance in Action
          </h1>
          <p className="text-lg text-navy-600/70 max-w-2xl mx-auto">
            Pick a time that works for you. We&apos;ll walk you through the full platform — Abigail,
            curriculum tracking, the school admin dashboard, and how families experience it — and answer
            any questions about pricing, setup, or rollout.
          </p>
        </div>

        {/* What you'll see */}
        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl mb-2">💬</div>
            <h3 className="text-sm font-semibold text-navy-700 mb-1">Abigail in action</h3>
            <p className="text-xs text-navy-600/60 leading-relaxed">
              See how parents get instant, philosophy-aligned answers 24/7
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-sm font-semibold text-navy-700 mb-1">Admin dashboard</h3>
            <p className="text-xs text-navy-600/60 leading-relaxed">
              Family management, invitations, and engagement insights
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="text-sm font-semibold text-navy-700 mb-1">Rollout plan</h3>
            <p className="text-xs text-navy-600/60 leading-relaxed">
              How to introduce Family Alliance to your families
            </p>
          </div>
        </div>

        {/* Calendar embed.
            GHL's form_embed.js scans for iframes once at load and listens for
            postMessage events to auto-resize. We render the iframe at a real
            height so the calendar is visible even if the resize script is slow
            or blocked. The Script component (afterInteractive) loads it after
            hydration so the iframe is already in the DOM when the script runs. */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <iframe
            src="https://link.montessori.org/widget/booking/jL5UH3XkPE9pQd3SSAz8"
            style={{ width: '100%', height: '820px', border: 'none', display: 'block' }}
            scrolling="no"
            id="jL5UH3XkPE9pQd3SSAz8_1777473426543"
            title="Schedule a demo"
          />
        </div>
        <Script
          src="https://link.montessori.org/js/form_embed.js"
          strategy="afterInteractive"
        />

        {/* Footer copy */}
        <div className="text-center mt-10 text-sm text-navy-600/60">
          Prefer to dive in yourself? <Link href="/for-schools/pricing" className="text-warm-600 hover:text-warm-700 font-medium underline">Start a 14-day free trial →</Link>
        </div>
      </main>
    </div>
  )
}
