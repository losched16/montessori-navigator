'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function DemoPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Inject the GoHighLevel form embed script. The iframe in the markup
    // wires itself up to this script when it loads.
    const existing = document.querySelector('script[src*="link.montessori.org/js/form_embed.js"]')
    if (existing) return

    const script = document.createElement('script')
    script.src = 'https://link.montessori.org/js/form_embed.js'
    script.type = 'text/javascript'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Don't remove the script — other pages may still need it. The widget
      // handles re-initialization on its own.
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <header className="bg-navy-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">Montessori Family Alliance</Link>
          <div className="flex items-center gap-4">
            <Link href="/schools" className="hidden sm:inline text-sm text-white/70 hover:text-white">For Schools</Link>
            <Link href="/for-schools/pricing" className="hidden sm:inline text-sm text-white/70 hover:text-white">Pricing</Link>
            <Link href="/auth/login" className="text-sm text-white/70 hover:text-white">Log in</Link>
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

        {/* Calendar embed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div ref={containerRef}>
            <iframe
              src="https://link.montessori.org/widget/booking/WUbp5aI2sjXA1wbh0no1"
              style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '720px' }}
              scrolling="no"
              id="WUbp5aI2sjXA1wbh0no1_1777385964900"
              title="Schedule a demo"
            />
          </div>
        </div>

        {/* Footer copy */}
        <div className="text-center mt-10 text-sm text-navy-600/60">
          Prefer to dive in yourself? <Link href="/for-schools/pricing" className="text-warm-600 hover:text-warm-700 font-medium underline">Start a 14-day free trial →</Link>
        </div>
      </main>
    </div>
  )
}
