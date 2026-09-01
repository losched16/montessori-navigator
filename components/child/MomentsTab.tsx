'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Observation } from '@/lib/supabase'
import { getCurriculumAreaLabel, getObservationTypeLabel } from '@/lib/utils'
import { relativeDay } from '@/lib/child-story'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'

type MomentFilter = 'all' | 'milestones' | 'interests' | 'challenges'

const FILTERS: Array<{ key: MomentFilter; label: string; types: string[] | null }> = [
  { key: 'all', label: 'All', types: null },
  { key: 'milestones', label: 'Milestones', types: ['milestone_reached'] },
  { key: 'interests', label: 'Interests', types: ['interest_spark'] },
  { key: 'challenges', label: 'Challenges', types: ['challenge_noted'] },
]

// The observation journal. Feed of existing observations, framed as moments.
export default function MomentsTab({ observations, childName, onLogMoment }: {
  observations: Observation[]
  childName: string
  onLogMoment: () => void
}) {
  const [filter, setFilter] = useState<MomentFilter>('all')

  const activeTypes = FILTERS.find(f => f.key === filter)?.types
  const filtered = activeTypes
    ? observations.filter(o => activeTypes.includes(o.type))
    : observations

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[15px] text-[color:var(--mfa-ink-secondary)] mb-4">
          The small things tell the story.
        </p>
        <Button size="lg" onClick={onLogMoment} className="w-full sm:w-auto">
          <Plus size={19} aria-hidden="true" />
          Log a Moment
        </Button>
      </div>

      {observations.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter moments">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`tap-scale shrink-0 min-h-[44px] px-4 rounded-full text-[14px] font-medium transition ${
                filter === f.key
                  ? 'bg-[color:var(--mfa-clay-soft)] text-[color:var(--mfa-clay)]'
                  : 'bg-white border border-[color:var(--mfa-border)] text-[color:var(--mfa-ink-secondary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {observations.length === 0 ? (
        <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-7 text-center">
          <h3 className="font-[family-name:var(--mfa-serif)] text-[21px] font-semibold text-[color:var(--mfa-ink)] mb-2">
            Start noticing the small things.
          </h3>
          <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-sm mx-auto mb-5">
            What {childName} repeats, struggles with, chooses and does independently can reveal a lot.
          </p>
          <Button size="md" onClick={onLogMoment}>Log Your First Moment</Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-[14px] text-[color:var(--mfa-ink-muted)] py-6 text-center">
          No {filter} logged yet.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map(obs => (
            <article key={obs.id} className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5">
              <p className="text-[15.5px] leading-relaxed text-[color:var(--mfa-ink)] mb-2">{obs.description}</p>
              {(obs.went_well || obs.needs_support) && (
                <div className="space-y-1 mb-2.5">
                  {obs.went_well && (
                    <p className="text-[13.5px] text-[color:var(--mfa-forest)]">Went well: {obs.went_well}</p>
                  )}
                  {obs.needs_support && (
                    <p className="text-[13.5px] text-[color:var(--mfa-clay)]">Support: {obs.needs_support}</p>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {obs.curriculum_area && obs.curriculum_area !== 'general' && (
                    <Chip tone="sage">{getCurriculumAreaLabel(obs.curriculum_area)}</Chip>
                  )}
                  {obs.type !== 'general' && obs.type !== 'home_activity' && (
                    <Chip tone="clay">{getObservationTypeLabel(obs.type)}</Chip>
                  )}
                </div>
                <span className="text-[12.5px] text-[color:var(--mfa-ink-muted)] whitespace-nowrap">
                  {relativeDay(obs.date)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
