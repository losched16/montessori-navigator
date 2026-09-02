'use client'

import { useState } from 'react'
import { ChevronRight, Star, Sprout, NotebookPen, TrendingUp } from 'lucide-react'
import type { Child, Observation } from '@/lib/supabase'
import { getCurriculumAreaLabel } from '@/lib/utils'
import {
  getHomeActivities, getParentLevelLabel, getAreaLabel,
  getActiveSensitivePeriods, getAgeMonths, type HomeActivity,
} from '@/lib/family-home'
import {
  buildRecentGrowth, relativeDay,
  type MilestoneRow, type SkillRow, type DevLevelRow, type GrowthHighlight,
} from '@/lib/child-story'
import { getGuideForChildAge } from '@/lib/monthly-development'
import ActivityDetailSheet from '@/components/family/ActivityDetailSheet'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import type { ChildTab } from './ChildTabs'
import { trackEvent } from '@/lib/analytics'
import { getAgePlane } from '@/lib/utils'

const HIGHLIGHT_ICONS: Record<GrowthHighlight['kind'], typeof Star> = {
  milestone: Star,
  skill: Sprout,
  moment: NotebookPen,
  level: TrendingUp,
}
const HIGHLIGHT_COLORS: Record<GrowthHighlight['kind'], string> = {
  milestone: 'bg-[var(--mfa-gold-soft)] text-[color:var(--mfa-ochre)]',
  skill: 'bg-[color:var(--mfa-sage-soft)] text-[color:var(--mfa-sage)]',
  moment: 'bg-[color:var(--mfa-clay-soft)] text-[color:var(--mfa-clay)]',
  level: 'bg-[color:var(--mfa-sage-soft)] text-[color:var(--mfa-forest)]',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-[family-name:var(--mfa-serif)] text-[21px] sm:text-[24px] font-semibold text-[color:var(--mfa-navy)] tracking-tight mb-3">
      {children}
    </h2>
  )
}

// Overview: what's happening with this child right now. Five sections max.
export default function OverviewTab({ child, devLevels, observations, milestones, skills, onGoToTab, onLogMoment }: {
  child: Child
  devLevels: DevLevelRow[]
  observations: Observation[]
  milestones: MilestoneRow[]
  skills: Array<SkillRow & { name?: string }>
  onGoToTab: (tab: ChildTab) => void
  onLogMoment: () => void
}) {
  const [openActivity, setOpenActivity] = useState<HomeActivity | null>(null)
  const first = child.name.trim().split(/\s+/)[0]

  // Right Now — up to 3 focus areas from assessed levels, else peak sensitive periods
  const assessed = devLevels
    .filter((l): l is { area: string; level: number } => !!l.level)
    .sort((a, b) => b.level - a.level)
    .slice(0, 3)
  const peaks = getActiveSensitivePeriods(child).filter(p => p.isPeak).slice(0, 3)
  const focus: Array<{ title: string; sub: string }> = assessed.length > 0
    ? assessed.map(a => ({ title: getAreaLabel(a.area), sub: getParentLevelLabel(a.level) }))
    : peaks.map(p => ({ title: p.name, sub: 'Strong interest' }))

  // Try This Next — first Home activity pick (rotates daily)
  const nextActivity = getHomeActivities(child)[0]

  const highlights = buildRecentGrowth(observations, milestones, skills, devLevels)
  const latest = observations[0]

  // Development insight — monthly guide for ≤36mo, sensitive period otherwise
  const ageMonths = getAgeMonths(child.date_of_birth)
  const guide = ageMonths !== null && ageMonths <= 36 && child.date_of_birth
    ? getGuideForChildAge(child.date_of_birth) : null
  const peakInsight = !guide ? peaks[0] : null

  return (
    <div className="space-y-8">
      {/* 1. Current focus */}
      {focus.length > 0 && (
        <section aria-label="Right now">
          <SectionTitle>Right Now</SectionTitle>
          <div className="grid grid-cols-3 gap-2.5">
            {focus.map(f => (
              <div key={f.title} className="rounded-[16px] bg-[color:var(--mfa-surface-sage)] p-3.5">
                <div className="text-[14px] font-semibold text-[color:var(--mfa-ink)] leading-snug mb-0.5">{f.title}</div>
                <div className="text-[12.5px] text-[color:var(--mfa-forest)]">{f.sub}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Suggested next step */}
      {nextActivity && (
        <section aria-label="Try this next">
          <SectionTitle>Try This Next</SectionTitle>
          <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5">
            <div className="font-[family-name:var(--mfa-serif)] text-[19px] font-semibold text-[color:var(--mfa-ink)] leading-snug mb-1">
              {nextActivity.name}
            </div>
            <div className="text-[13px] text-[color:var(--mfa-ink-muted)] mb-4">
              {nextActivity.category} · {nextActivity.duration}{nextActivity.ages ? ` · ${nextActivity.ages}` : ''}
            </div>
            <Button size="md" onClick={() => {
              setOpenActivity(nextActivity)
              trackEvent('activity_opened', {
                source: 'my_child_overview',
                activity_category: nextActivity.category,
                age_plane: getAgePlane(child.date_of_birth),
              })
            }}>
              Try This Activity
            </Button>
          </div>
        </section>
      )}

      {/* 3. Recent growth */}
      {highlights.length > 0 && (
        <section aria-label="Recent growth">
          <SectionTitle>Recent Growth</SectionTitle>
          <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] divide-y divide-[color:var(--mfa-border)]">
            {highlights.map((h, i) => {
              const Icon = HIGHLIGHT_ICONS[h.kind]
              return (
                <div key={i} className="flex items-center gap-3 p-4">
                  <span className={`w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0 ${HIGHLIGHT_COLORS[h.kind]}`} aria-hidden="true">
                    <Icon size={17} />
                  </span>
                  <p className="text-[14.5px] leading-snug text-[color:var(--mfa-ink)] line-clamp-2">{h.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 4. Latest moment */}
      <section aria-label="Latest moment">
        <SectionTitle>Latest Moment</SectionTitle>
        {latest ? (
          <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5">
            <p className="font-[family-name:var(--mfa-serif)] text-[18px] leading-snug font-medium text-[color:var(--mfa-ink)] mb-2">
              &ldquo;{latest.description}&rdquo;
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[13px] text-[color:var(--mfa-ink-muted)]">{relativeDay(latest.date)}</span>
                {latest.curriculum_area && latest.curriculum_area !== 'general' && (
                  <Chip tone="sage">{getCurriculumAreaLabel(latest.curriculum_area)}</Chip>
                )}
              </div>
              <button
                onClick={() => onGoToTab('moments')}
                className="tap-scale inline-flex items-center gap-0.5 min-h-[44px] shrink-0 text-[14px] font-semibold text-[color:var(--mfa-navy)]"
              >
                See All Moments
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[20px] bg-[color:var(--mfa-surface-sage)] border border-[color:var(--mfa-border)] p-5">
            <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mb-3.5">
              What {first} repeats, chooses and does independently can reveal a lot.
            </p>
            <Button size="md" variant="secondary" onClick={onLogMoment}>Log a Moment</Button>
          </div>
        )}
      </section>

      {/* 5. One development insight */}
      {guide ? (
        <section aria-label="Development insight">
          <SectionTitle>{first} at {guide.monthLabel}</SectionTitle>
          <div className="rounded-[20px] bg-[color:var(--mfa-purple-soft)] border border-[color:var(--mfa-border)] p-5">
            <p className="font-[family-name:var(--mfa-serif)] text-[18px] font-medium text-[color:var(--mfa-ink)] leading-snug mb-1.5">
              {guide.tagline}
            </p>
            <p className="text-[14px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mb-3.5 line-clamp-3">
              {guide.brainDevelopment}
            </p>
            <Button size="md" variant="secondary" href="/dashboard/development">
              View Development Guide
            </Button>
          </div>
        </section>
      ) : peakInsight ? (
        <section aria-label="Development insight">
          <SectionTitle>Sensitive Period: {peakInsight.name}</SectionTitle>
          <div className="rounded-[20px] bg-[color:var(--mfa-purple-soft)] border border-[color:var(--mfa-border)] p-5">
            <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink)] mb-1.5">
              {peakInsight.description.replace('Your child', first)}
            </p>
            <p className="text-[13.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)]">
              {peakInsight.parentTip}
            </p>
          </div>
        </section>
      ) : null}

      <ActivityDetailSheet activity={openActivity} childName={first} onClose={() => setOpenActivity(null)} />
    </div>
  )
}
