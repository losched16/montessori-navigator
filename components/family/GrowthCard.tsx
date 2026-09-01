'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getParentLevelLabel, getAreaLabel } from '@/lib/family-home'

interface GrowthCardProps {
  childName: string
  /** Up to three assessed areas, already selected by the caller */
  areas: Array<{ area: string; level: number }>
}

// Growth snapshot: max three areas, parent-friendly labels, no raw numbers.
export default function GrowthCard({ childName, areas }: GrowthCardProps) {
  return (
    <section
      aria-label={`${childName}'s growth snapshot`}
      className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-6"
    >
      <div className="space-y-4 mb-5">
        {areas.map(({ area, level }) => (
          <div key={area} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-[color:var(--mfa-ink)]">{getAreaLabel(area)}</div>
              <div className="text-[13px] text-[color:var(--mfa-ink-secondary)]">{getParentLevelLabel(level)}</div>
            </div>
            <div className="flex gap-1.5 shrink-0" aria-hidden="true">
              {[1, 2, 3, 4, 5].map(i => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: i <= level ? 'var(--mfa-sage)' : 'var(--mfa-surface-sage)' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/dashboard/children?tab=journey"
        className="tap-scale inline-flex items-center gap-1 min-h-[44px] text-[15px] font-semibold text-[color:var(--mfa-purple)]"
      >
        See {childName}&apos;s Journey
        <ChevronRight size={17} aria-hidden="true" />
      </Link>
    </section>
  )
}
