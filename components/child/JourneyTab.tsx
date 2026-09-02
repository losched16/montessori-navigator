'use client'

import { NotebookPen, Star, Sprout } from 'lucide-react'
import type { Child } from '@/lib/supabase'
import { getAgeMonths } from '@/lib/family-home'
import { getGuideForChildAge } from '@/lib/monthly-development'
import {
  groupEventsByMonth, buildMonthSummary, getSeasonPrompt,
  type JourneyEvent, type DevLevelRow,
} from '@/lib/child-story'
import Button from '@/components/ui/Button'

const EVENT_ICONS = { moment: NotebookPen, milestone: Star, skill: Sprout }
const EVENT_COLORS = {
  moment: 'bg-[color:var(--mfa-clay-soft)] text-[color:var(--mfa-clay)]',
  milestone: 'bg-[var(--mfa-gold-soft)] text-[color:var(--mfa-ochre)]',
  skill: 'bg-[color:var(--mfa-sage-soft)] text-[color:var(--mfa-sage)]',
}

// Journey: the child's story over time — meaningful events grouped by month.
// Deliberately no streaks, usage counts, or engagement metrics.
export default function JourneyTab({ child, events, devLevels, onLogMoment }: {
  child: Child
  events: JourneyEvent[]
  devLevels: DevLevelRow[]
  onLogMoment: () => void
}) {
  const first = child.name.trim().split(/\s+/)[0]
  const summary = buildMonthSummary(events, devLevels)
  const months = groupEventsByMonth(events)
  const season = getSeasonPrompt()

  const ageMonths = getAgeMonths(child.date_of_birth)
  const guide = ageMonths !== null && ageMonths <= 36 && child.date_of_birth
    ? getGuideForChildAge(child.date_of_birth) : null

  return (
    <div className="space-y-8">
      {/* This Month — plain-language summary */}
      {summary.length > 0 && (
        <section aria-label="This month">
          <h2 className="font-[family-name:var(--mfa-serif)] text-[21px] sm:text-[24px] font-semibold text-[color:var(--mfa-navy)] tracking-tight mb-3">
            This Month
          </h2>
          <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5">
            <ul className="space-y-1.5">
              {summary.map((line, i) => (
                <li key={i} className="text-[15px] text-[color:var(--mfa-ink)] pl-4 relative">
                  <span className="absolute left-0 top-[0.5em] w-1.5 h-1.5 rounded-full bg-[color:var(--mfa-sage)]" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Contextual development-guide card for babies/toddlers (not inline guide) */}
      {guide && (
        <section aria-label="Development guide" className="rounded-[20px] bg-[color:var(--mfa-purple-soft)] border border-[color:var(--mfa-border)] p-5">
          <h3 className="font-[family-name:var(--mfa-serif)] text-[19px] font-semibold text-[color:var(--mfa-ink)] mb-1">
            {first} at {guide.monthLabel}
          </h3>
          <p className="text-[14px] text-[color:var(--mfa-ink-secondary)] mb-3.5">
            See typical development and Montessori ideas for this month.
          </p>
          <Button size="md" variant="secondary" href="/dashboard/development">
            View Development Guide
          </Button>
        </section>
      )}

      {/* Timeline */}
      {months.length === 0 ? (
        <section className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-7 text-center">
          <h3 className="font-[family-name:var(--mfa-serif)] text-[21px] font-semibold text-[color:var(--mfa-ink)] mb-2">
            {first}&apos;s story starts here.
          </h3>
          <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-sm mx-auto mb-5">
            Every moment you notice and every milestone you celebrate becomes part of {first}&apos;s journey.
          </p>
          <Button size="md" onClick={onLogMoment}>Log a Moment</Button>
        </section>
      ) : (
        months.map(month => (
          <section key={month.key} aria-label={month.label}>
            <h2 className="font-[family-name:var(--mfa-serif)] text-[21px] sm:text-[24px] font-semibold text-[color:var(--mfa-navy)] tracking-tight mb-3">
              {month.label}
            </h2>
            <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] divide-y divide-[color:var(--mfa-border)]">
              {month.events.map(event => {
                const Icon = EVENT_ICONS[event.kind]
                return (
                  <div key={event.id} className="flex items-start gap-3 p-4">
                    <span className={`w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0 mt-0.5 ${EVENT_COLORS[event.kind]}`} aria-hidden="true">
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14.5px] leading-snug text-[color:var(--mfa-ink)] line-clamp-3">{event.title}</p>
                      <p className="text-[12.5px] text-[color:var(--mfa-ink-muted)] mt-0.5">
                        {event.sub} · {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))
      )}

      {/* Seasonal reflection — saved through the moment composer (observations) */}
      <section aria-label="Seasonal reflection" className="rounded-[20px] bg-[color:var(--mfa-surface-warm)] border border-[color:var(--mfa-border)] p-5">
        <h3 className="font-[family-name:var(--mfa-serif)] text-[19px] font-semibold text-[color:var(--mfa-ink)] mb-1">
          {season.title}
        </h3>
        <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] italic mb-3.5">
          {season.prompt.replace('your child', first)}
        </p>
        <Button size="md" variant="secondary" onClick={onLogMoment}>Add Reflection</Button>
      </section>
    </div>
  )
}
