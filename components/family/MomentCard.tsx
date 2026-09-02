'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Observation } from '@/lib/supabase'
import { getCurriculumAreaLabel, getObservationTypeLabel } from '@/lib/utils'
import Chip from '@/components/ui/Chip'

function relativeDay(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

// A single recent meaningful moment (observation from the last ~2 days).
export default function MomentCard({ observation, childName }: {
  observation: Observation
  childName: string
}) {
  return (
    <section
      aria-label="Recent moment"
      className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-6"
    >
      <p className="font-[family-name:var(--mfa-serif)] text-[19px] leading-snug font-medium text-[color:var(--mfa-ink)] mb-2.5">
        {observation.description}
      </p>
      <div className="text-[13px] text-[color:var(--mfa-ink-secondary)] mb-3">
        {childName} · {relativeDay(observation.date)}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {observation.curriculum_area && observation.curriculum_area !== 'general' && (
            <Chip tone="sage">{getCurriculumAreaLabel(observation.curriculum_area)}</Chip>
          )}
          <Chip tone="neutral">{getObservationTypeLabel(observation.type)}</Chip>
        </div>
        <Link
          href="/dashboard/children?tab=moments"
          className="tap-scale inline-flex items-center gap-0.5 min-h-[44px] shrink-0 text-[14px] font-semibold text-[color:var(--mfa-navy)]"
        >
          See Moments
          <ChevronRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
