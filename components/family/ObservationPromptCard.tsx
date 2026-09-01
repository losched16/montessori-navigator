'use client'

import { Eye } from 'lucide-react'
import Button from '@/components/ui/Button'

// Gentle invitation to observe — shown when there's no recent observation.
// Deliberately no "it's been N days" guilt counters.
export default function ObservationPromptCard({ prompt }: { prompt: string }) {
  return (
    <section
      aria-label="Observation prompt"
      className="rounded-[20px] bg-[color:var(--mfa-surface-sage)] border border-[color:var(--mfa-border)] p-6"
    >
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-[color:var(--mfa-forest)] mb-2.5">
        <Eye size={14} aria-hidden="true" />
        Notice something today
      </div>
      <p className="font-[family-name:var(--mfa-serif)] text-[20px] leading-snug font-medium text-[color:var(--mfa-ink)] mb-4">
        {prompt}
      </p>
      <Button href="/dashboard/children?tab=moments&log=1" variant="secondary" size="md">
        Log a Moment
      </Button>
    </section>
  )
}
