'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { HeroInsight } from '@/lib/family-home'
import Button from '@/components/ui/Button'
import BottomSheet from '@/components/ui/BottomSheet'
import { useChild } from '@/lib/child-context'
import { trackEvent, getSafeChildAnalyticsContext } from '@/lib/analytics'

// The dominant Home component: exactly ONE insight about the selected child.
export default function HeroInsightCard({ insight }: { insight: HeroInsight }) {
  const [showHow, setShowHow] = useState(false)
  const { selectedChild } = useChild()
  const chatHref = `/dashboard/chat?q=${encodeURIComponent(insight.abigailPrompt)}`
  const trackHeroChat = () =>
    trackEvent('home_abigail_clicked', { source: 'hero', ...getSafeChildAnalyticsContext(selectedChild) })

  return (
    <section
      aria-label="Today's insight"
      className="rounded-[24px] bg-white border border-[color:var(--mfa-border)] p-6 sm:p-8 shadow-[0_1px_3px_rgba(45,40,30,0.04)]"
    >
      <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[color:var(--mfa-clay)] mb-3">
        {insight.eyebrow}
      </div>
      <h2 className="font-[family-name:var(--mfa-serif)] text-[28px] sm:text-[35px] leading-[1.1] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-2.5">
        {insight.title}
      </h2>
      <p className="text-[16px] sm:text-[17px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-xl mb-5">
        {insight.description}
      </p>

      <div className="rounded-[16px] bg-[color:var(--mfa-surface-sage)] p-5 mb-5">
        <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[color:var(--mfa-forest)] mb-2">
          Try this today
        </div>
        <div className="font-[family-name:var(--mfa-serif)] text-[19px] font-semibold text-[color:var(--mfa-ink)] leading-snug mb-1">
          {insight.tryTitle}
        </div>
        <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mb-2.5">
          {insight.tryDetail}
        </p>
        <div className="text-[12px] font-medium text-[color:var(--mfa-ink-muted)]">{insight.meta}</div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button size="lg" onClick={() => setShowHow(true)} className="w-full sm:w-auto">
          Show Me How
        </Button>
        <Link
          href={chatHref}
          onClick={trackHeroChat}
          className="tap-scale inline-flex items-center justify-center gap-1 min-h-[48px] px-2 text-[15px] font-medium text-[color:var(--mfa-purple)]"
        >
          Ask Abigail about this
          <ChevronRight size={17} aria-hidden="true" />
        </Link>
      </div>

      <BottomSheet open={showHow} onClose={() => setShowHow(false)} title={insight.tryTitle}>
        <div className="pb-4 space-y-4">
          <p className="text-[15px] leading-relaxed text-[color:var(--mfa-ink)]">{insight.tryDetail}</p>
          {insight.moreDetail && (
            <div className="rounded-2xl bg-[color:var(--mfa-surface-warm)] p-4">
              <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--mfa-clay)] mb-1.5">
                From your Montessori guide
              </div>
              <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)]">{insight.moreDetail}</p>
            </div>
          )}
          <div className="text-[12px] font-medium text-[color:var(--mfa-ink-muted)]">{insight.meta}</div>
          <Button href={`/dashboard/chat?q=${encodeURIComponent(insight.abigailPrompt)}`} variant="soft" size="md" className="w-full">
            Ask Abigail about this
          </Button>
        </div>
      </BottomSheet>
    </section>
  )
}
