'use client'

import { useState } from 'react'
import { ChevronRight, Check, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Child } from '@/lib/supabase'
import { getAgeMonths, getParentLevelLabel, getAreaLabel } from '@/lib/family-home'
import { getGuideForChildAge } from '@/lib/monthly-development'
import { getAllAreas } from '@/lib/scope-sequence'
import {
  AREA_BLURBS, DEV_AREAS,
  type MilestoneRow, type SkillRow, type DevLevelRow,
} from '@/lib/child-story'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'

const LEVELS = [1, 2, 3, 4, 5]
const CURRICULUM_LABELS: Record<string, string> = Object.fromEntries(
  getAllAreas().map(a => [a.key, a.label])
)

// Growth: development areas, milestones, Montessori learning, baby guide.
// The densest tab — raw 1–5 scores stay hidden behind descriptive labels.
export default function GrowthTab({ child, devLevels, milestones, skills, onLevelSaved }: {
  child: Child
  devLevels: DevLevelRow[]
  milestones: MilestoneRow[]
  skills: SkillRow[]
  onLevelSaved: (area: string, level: number) => void
}) {
  const [editingArea, setEditingArea] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const first = child.name.trim().split(/\s+/)[0]

  const ageMonths = getAgeMonths(child.date_of_birth)
  const guide = ageMonths !== null && ageMonths <= 36 && child.date_of_birth
    ? getGuideForChildAge(child.date_of_birth) : null

  const levelFor = (area: string) => devLevels.find(l => l.area === area)?.level || 0

  const saveLevel = async (area: string, level: number) => {
    if (saving) return
    setSaving(true)
    // Same upsert the legacy Children page used — no schema changes.
    await supabase.from('child_development_levels').upsert({
      child_id: child.id, area, level,
    })
    setSaving(false)
    setEditingArea(null)
    onLevelSaved(area, level)
  }

  // Milestones summary
  const achieved = milestones
    .filter(m => m.achieved)
    .sort((a, b) => (b.achieved_date || '').localeCompare(a.achieved_date || ''))
  const upNext = milestones.filter(m => !m.achieved).slice(0, 2)

  // Montessori learning — skill progress grouped by curriculum area
  const learning: Record<string, { practicing: number; confident: number }> = {}
  skills.forEach(s => {
    if (s.status === 'not_started') return
    if (!learning[s.skill_area]) learning[s.skill_area] = { practicing: 0, confident: 0 }
    if (s.status === 'mastered') learning[s.skill_area].confident++
    else learning[s.skill_area].practicing++
  })
  const learningAreas = Object.entries(learning)
    .sort(([, a], [, b]) => (b.practicing + b.confident) - (a.practicing + a.confident))
    .slice(0, 6)

  return (
    <div className="space-y-8">
      <p className="text-[15px] text-[color:var(--mfa-ink-secondary)] -mt-2">
        See what {first} is exploring, practicing and becoming confident in.
      </p>

      {/* Baby/toddler month guide — prominent for ≤36 months */}
      {guide && (
        <section aria-label="This month" className="rounded-[20px] bg-[color:var(--mfa-purple-soft)] border border-[color:var(--mfa-border)] p-5">
          <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[color:var(--mfa-purple)] mb-1.5">
            This Month · {guide.monthLabel}
          </div>
          <p className="font-[family-name:var(--mfa-serif)] text-[19px] font-semibold text-[color:var(--mfa-ink)] leading-snug mb-2">
            {guide.tagline}
          </p>
          <p className="text-[14px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mb-3.5">
            What you may notice, what {first} needs, and Montessori activities to try.
          </p>
          <Button size="md" variant="secondary" href="/dashboard/development">
            See {first}&apos;s Month-by-Month Guide
          </Button>
        </section>
      )}

      {/* Development areas */}
      <section aria-label="Development areas">
        <h2 className="font-[family-name:var(--mfa-serif)] text-[21px] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-3">
          Development Areas
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {DEV_AREAS.map(area => {
            const level = levelFor(area)
            return (
              <button
                key={area}
                onClick={() => setEditingArea(area)}
                className="tap-scale text-left rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[15.5px] font-semibold text-[color:var(--mfa-ink)]">{getAreaLabel(area)}</span>
                  <span className={`text-[12.5px] font-semibold ${level ? 'text-[color:var(--mfa-forest)]' : 'text-[color:var(--mfa-ink-muted)]'}`}>
                    {level ? getParentLevelLabel(level) : 'Not set'}
                  </span>
                </div>
                <p className="text-[13px] leading-snug text-[color:var(--mfa-ink-secondary)] mb-3 line-clamp-2">
                  {AREA_BLURBS[area]}
                </p>
                <div className="flex gap-1.5" aria-hidden="true">
                  {LEVELS.map(i => (
                    <span
                      key={i}
                      className="h-1.5 flex-1 rounded-full"
                      style={{ background: i <= level ? 'var(--mfa-sage)' : 'var(--mfa-surface-sage)' }}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Milestones */}
      <section aria-label="Milestones">
        <h2 className="font-[family-name:var(--mfa-serif)] text-[21px] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-3">
          Milestones
        </h2>
        <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5">
          {milestones.length === 0 ? (
            <>
              <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mb-4">
                Load age-appropriate Montessori milestones for {first} to start celebrating developmental achievements.
              </p>
              <Button size="md" variant="secondary" href="/dashboard/milestones">Set Up Milestones</Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-9 h-9 rounded-full bg-[#F8EFD9] text-[color:var(--mfa-ochre)] inline-flex items-center justify-center" aria-hidden="true">
                  <Star size={17} />
                </span>
                <span className="text-[16px] font-semibold text-[color:var(--mfa-ink)]">
                  {achieved.length} milestone{achieved.length === 1 ? '' : 's'} reached
                </span>
              </div>
              <ul className="space-y-2 mb-4">
                {achieved.slice(0, 3).map(m => (
                  <li key={m.id} className="flex items-start gap-2.5 text-[14.5px] text-[color:var(--mfa-ink)]">
                    <Check size={16} className="text-[color:var(--mfa-sage)] mt-0.5 shrink-0" aria-hidden="true" />
                    {m.milestone_name}
                  </li>
                ))}
                {upNext.map(m => (
                  <li key={m.id} className="flex items-start gap-2.5 text-[14.5px] text-[color:var(--mfa-ink-secondary)]">
                    <span className="w-4 h-4 rounded-full border-2 border-[color:var(--mfa-ink-muted)] mt-0.5 shrink-0" aria-hidden="true" />
                    {m.milestone_name}
                  </li>
                ))}
              </ul>
              <a
                href="/dashboard/milestones"
                className="tap-scale inline-flex items-center gap-0.5 min-h-[44px] text-[14px] font-semibold text-[color:var(--mfa-purple)]"
              >
                See All Milestones
                <ChevronRight size={15} aria-hidden="true" />
              </a>
            </>
          )}
        </div>
      </section>

      {/* Montessori learning (curriculum skill progress) */}
      <section aria-label="Montessori learning">
        <h2 className="font-[family-name:var(--mfa-serif)] text-[21px] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-3">
          Montessori Learning
        </h2>
        <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5">
          {learningAreas.length === 0 ? (
            <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mb-4">
              Explore the full Montessori scope &amp; sequence and track the skills {first} is working on.
            </p>
          ) : (
            <ul className="space-y-2.5 mb-4">
              {learningAreas.map(([area, counts]) => (
                <li key={area} className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-medium text-[color:var(--mfa-ink)]">
                    {CURRICULUM_LABELS[area] || area.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[13px] text-[color:var(--mfa-ink-secondary)] whitespace-nowrap">
                    {[
                      counts.practicing > 0 ? `${counts.practicing} practicing` : null,
                      counts.confident > 0 ? `${counts.confident} confident` : null,
                    ].filter(Boolean).join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <a
            href="/dashboard/curriculum"
            className="tap-scale inline-flex items-center gap-0.5 min-h-[44px] text-[14px] font-semibold text-[color:var(--mfa-purple)]"
          >
            Explore Full Curriculum
            <ChevronRight size={15} aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Level editing sheet — descriptive labels, no numbers */}
      <BottomSheet
        open={!!editingArea}
        onClose={() => setEditingArea(null)}
        title={editingArea ? getAreaLabel(editingArea) : undefined}
      >
        {editingArea && (
          <div className="pb-4">
            <p className="text-[14px] text-[color:var(--mfa-ink-secondary)] mb-3">
              Where does this feel right now for {first}?
            </p>
            <div role="radiogroup" aria-label="Development level" className="space-y-1.5">
              {LEVELS.map(level => {
                const selected = levelFor(editingArea) === level
                return (
                  <button
                    key={level}
                    role="radio"
                    aria-checked={selected}
                    disabled={saving}
                    onClick={() => saveLevel(editingArea, level)}
                    className={`tap-scale w-full flex items-center gap-3 p-3.5 min-h-[52px] rounded-2xl text-left transition ${
                      selected
                        ? 'bg-[color:var(--mfa-sage-soft)] border border-[color:var(--mfa-sage)]'
                        : 'border border-[color:var(--mfa-border)] hover:bg-[color:var(--mfa-surface-warm)]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 inline-flex items-center justify-center shrink-0 ${
                        selected ? 'border-[color:var(--mfa-sage)] bg-[color:var(--mfa-sage)]' : 'border-[color:var(--mfa-ink-muted)]'
                      }`}
                      aria-hidden="true"
                    >
                      {selected && <Check size={12} strokeWidth={3} className="text-white" />}
                    </span>
                    <span className="text-[15px] font-medium text-[color:var(--mfa-ink)]">
                      {getParentLevelLabel(level)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
