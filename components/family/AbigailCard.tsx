'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useChild } from '@/lib/child-context'
import { trackEvent, getSafeChildAnalyticsContext } from '@/lib/analytics'

// Prominent purple entry point into the existing chat experience.
export default function AbigailCard({ childName }: { childName?: string }) {
  const { selectedChild } = useChild()
  const trackClick = (source: 'card' | 'chip') =>
    trackEvent('home_abigail_clicked', { source, ...getSafeChildAnalyticsContext(selectedChild) })
  const n = childName || 'your child'
  const chips = [
    { label: 'Behavior', prompt: `I need help with a behavior challenge with ${n}.` },
    { label: 'Independence', prompt: `How can I build more independence for ${n} at home?` },
    { label: 'Learning', prompt: `What should ${n} be learning right now?` },
    { label: 'Routines', prompt: `Help me improve our daily routines with ${n}.` },
  ]

  return (
    <section
      aria-label="Ask Abigail"
      className="rounded-[20px] bg-[color:var(--mfa-purple-soft)] border border-[color:var(--mfa-border)] p-6"
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="w-9 h-9 rounded-full bg-[color:var(--mfa-purple)] text-white inline-flex items-center justify-center" aria-hidden="true">
          <Sparkles size={18} />
        </span>
        <h2 className="font-[family-name:var(--mfa-serif)] text-[22px] font-semibold text-[color:var(--mfa-ink)] tracking-tight">
          Ask Abigail
        </h2>
      </div>
      <p className="text-[15px] text-[color:var(--mfa-ink-secondary)] mb-4">
        What&apos;s happening in your family today?
      </p>

      <Link
        href="/dashboard/chat"
        onClick={() => trackClick('card')}
        className="tap-scale flex items-center min-h-[56px] px-5 rounded-2xl bg-white border border-[color:var(--mfa-border)] text-[15px] text-[color:var(--mfa-ink-muted)] hover:border-[color:var(--mfa-purple)] transition mb-3.5"
      >
        Ask about behavior, learning, routines...
      </Link>

      <div className="flex flex-wrap gap-2">
        {chips.map(chip => (
          <Link
            key={chip.label}
            href={`/dashboard/chat?q=${encodeURIComponent(chip.prompt)}`}
            onClick={() => trackClick('chip')}
            className="tap-scale inline-flex items-center min-h-[44px] px-4 rounded-full bg-white/70 text-[14px] font-medium text-[color:var(--mfa-purple)] hover:bg-white transition"
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
