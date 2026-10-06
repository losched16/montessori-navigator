'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Observation } from '@/lib/supabase'
import { useChild } from '@/lib/child-context'
import { formatAge, getAgePlane, getAgePlaneLabel, getCurriculumAreaLabel, getObservationTypeLabel } from '@/lib/utils'
import { getAreaLabel, getParentLevelLabel } from '@/lib/family-home'
import { getSkillByIndex } from '@/lib/scope-sequence'
import { DEV_AREAS, AREA_BLURBS, type MilestoneRow, type DevLevelRow } from '@/lib/child-story'
import ChildSwitcher from '@/components/app/ChildSwitcher'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'

// Journey Keepsake — a printable record of everything a child has
// accomplished: an optional written summary, growth by area, milestones,
// skills, and every Moment in date order. Data is read with the parent's own
// session, so family-based RLS decides access (co-parents included).

type Range = 'all' | 'school_year' | '6m' | '3m'
const RANGES: { value: Range; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'school_year', label: 'This school year' },
  { value: '6m', label: 'Last 6 months' },
  { value: '3m', label: 'Last 3 months' },
]

function rangeStart(range: Range): string | null {
  const now = new Date()
  if (range === 'all') return null
  if (range === 'school_year') {
    const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1 // school year starts Aug 1
    return `${year}-08-01`
  }
  const d = new Date(now)
  d.setMonth(d.getMonth() - (range === '6m' ? 6 : 3))
  return d.toISOString().slice(0, 10)
}

const longDate = (iso: string) =>
  new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
const shortDate = (iso: string) =>
  new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

interface SkillDone { name: string; area: string; date: string }
interface Summary { overview: string; strengths: string[]; closing: string }

export default function JourneyKeepsakePage() {
  const { selectedChild, loading: childLoading } = useChild()
  const supabase = createClient()
  const [range, setRange] = useState<Range>('school_year')
  const [loading, setLoading] = useState(true)
  const [moments, setMoments] = useState<Observation[]>([])
  const [milestones, setMilestones] = useState<MilestoneRow[]>([])
  const [skills, setSkills] = useState<SkillDone[]>([])
  const [levels, setLevels] = useState<DevLevelRow[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [summaryState, setSummaryState] = useState<'idle' | 'working' | 'error'>('idle')

  const start = rangeStart(range)

  useEffect(() => {
    if (!selectedChild) { if (!childLoading) setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setSummary(null)
    setSummaryState('idle')
    const id = selectedChild.id
    ;(async () => {
      let obsQ = supabase.from('observations').select('*').eq('child_id', id).order('date', { ascending: true }).limit(2000)
      let msQ = supabase.from('milestones')
        .select('id, curriculum_area, milestone_name, description, age_plane, achieved, achieved_date')
        .eq('child_id', id).eq('achieved', true).order('achieved_date', { ascending: true })
      let skQ = supabase.from('child_skill_progress').select('skill_index, skill_area, status, date_mastered')
        .eq('child_id', id).eq('status', 'mastered').order('date_mastered', { ascending: true })
      if (start) {
        obsQ = obsQ.gte('date', start)
        msQ = msQ.gte('achieved_date', start)
        skQ = skQ.gte('date_mastered', start)
      }
      const [obs, ms, sk, lv] = await Promise.all([
        obsQ, msQ, skQ,
        supabase.from('child_development_levels').select('area, level').eq('child_id', id),
      ])
      if (cancelled) return
      setMoments((obs.data as Observation[]) || [])
      setMilestones(((ms.data as MilestoneRow[]) || []).filter(m => m.achieved_date))
      setSkills(((sk.data as any[]) || []).filter(s => s.date_mastered).map(s => ({
        name: getSkillByIndex(s.skill_index)?.skill || `New ${String(s.skill_area).replace(/_/g, ' ')} skill`,
        area: s.skill_area,
        date: s.date_mastered,
      })))
      setLevels((lv.data as DevLevelRow[]) || [])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [selectedChild?.id, start, childLoading])

  const momentsByMonth = useMemo(() => {
    const groups: { key: string; label: string; items: Observation[] }[] = []
    for (const m of moments) {
      const key = (m.date || '').slice(0, 7)
      let g = groups[groups.length - 1]
      if (!g || g.key !== key) {
        g = { key, label: new Date(key + '-15T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), items: [] }
        groups.push(g)
      }
      g.items.push(m)
    }
    return groups
  }, [moments])

  const assessed = DEV_AREAS
    .map(area => ({ area, level: levels.find(l => l.area === area)?.level ?? null }))
    .filter(a => a.level)

  const firstDate = [moments[0]?.date, milestones[0]?.achieved_date, skills[0]?.date].filter(Boolean).sort()[0] as string | undefined
  const periodLabel = start
    ? `${longDate(start)} – ${longDate(new Date().toISOString().slice(0, 10))}`
    : firstDate ? `Since ${longDate(firstDate)}` : 'All time'

  const addSummary = async () => {
    if (!selectedChild) return
    setSummaryState('working')
    try {
      const res = await fetch('/api/progress-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: selectedChild.id,
          reportType: 'general',
          dateRangeStart: start,
          dateRangeEnd: null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.report) throw new Error(data.error || 'failed')
      setSummary({ overview: data.report.overview, strengths: data.report.strengths || [], closing: data.report.closing })
      setSummaryState('idle')
    } catch {
      setSummaryState('error')
    }
  }

  if (!childLoading && !selectedChild) {
    return (
      <div className="max-w-[760px] mx-auto py-16 text-center">
        <h1 className="font-[family-name:var(--mfa-serif)] text-[28px] font-semibold text-[color:var(--mfa-navy)] mb-3">Add your child first</h1>
        <p className="text-[color:var(--mfa-ink-secondary)] mb-6">Once you&apos;ve added your child and logged a few Moments, their Journey Keepsake will appear here.</p>
        <Button href="/onboarding">Add My Child</Button>
      </div>
    )
  }

  const first = selectedChild ? selectedChild.name.trim().split(/\s+/)[0] : ''
  const nothingYet = !loading && moments.length === 0 && milestones.length === 0 && skills.length === 0

  return (
    <div className="keepsake max-w-[820px] mx-auto pb-24 sm:pb-12 print:pb-0 print:max-w-none">
      <style>{`
        @page { margin: 16mm 14mm; }
        @media print {
          .keepsake { font-size: 11pt; }
          .keepsake .avoid-break { break-inside: avoid; }
          .keepsake h2 { break-after: avoid; }
        }
      `}</style>

      {/* ── Controls (screen only) ── */}
      <div className="print:hidden mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--mfa-clay)] mb-1">Journey Keepsake</div>
            <p className="text-[14.5px] text-[color:var(--mfa-ink-secondary)]">Everything {first || 'your child'} has accomplished, ready to print or save as a PDF.</p>
          </div>
          <Button onClick={() => window.print()} disabled={loading || nothingYet}>Print or save as PDF</Button>
        </div>
        <ChildSwitcher />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Time period">
          {RANGES.map(r => (
            <button key={r.value} type="button" onClick={() => setRange(r.value)} aria-pressed={range === r.value}
              className={`px-3.5 py-2 rounded-full text-[13.5px] font-semibold border transition ${range === r.value
                ? 'bg-[color:var(--mfa-navy)] text-white border-[color:var(--mfa-navy)]'
                : 'bg-white text-[color:var(--mfa-ink)] border-[color:var(--mfa-border)] hover:border-[color:var(--mfa-navy)]'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {(loading || childLoading) ? (
        <div className="space-y-4" aria-hidden="true">
          <Skeleton className="h-[160px] rounded-[20px]" />
          <Skeleton className="h-[240px] rounded-[20px]" />
          <Skeleton className="h-[320px] rounded-[20px]" />
        </div>
      ) : selectedChild && (
        <article className="bg-white rounded-[24px] border border-[color:var(--mfa-border)] p-6 sm:p-10 print:border-0 print:rounded-none print:p-0">
          {/* ── Cover ── */}
          <header className="border-b border-[color:var(--mfa-border)] pb-6 mb-8">
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--mfa-clay)] mb-2">A Montessori Journey</div>
            <h1 className="font-[family-name:var(--mfa-serif)] text-[34px] sm:text-[44px] leading-[1.05] font-semibold text-[color:var(--mfa-navy)] tracking-tight">
              {selectedChild.name}
            </h1>
            <p className="mt-2 text-[15px] text-[color:var(--mfa-ink-secondary)]">
              {[selectedChild.date_of_birth ? formatAge(selectedChild.date_of_birth) : null,
                selectedChild.date_of_birth ? getAgePlaneLabel(getAgePlane(selectedChild.date_of_birth)) : null,
                periodLabel].filter(Boolean).join(' · ')}
            </p>

            <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Moments captured', moments.length],
                ['Milestones reached', milestones.length],
                ['Skills grown confident', skills.length],
                ['Areas growing', assessed.length],
              ].map(([label, n]) => (
                <div key={label as string} className="rounded-[14px] bg-[color:var(--mfa-surface-warm)] px-4 py-3 avoid-break">
                  <dt className="text-[12px] font-semibold text-[color:var(--mfa-ink-secondary)]">{label}</dt>
                  <dd className="font-[family-name:var(--mfa-serif)] text-[28px] font-semibold text-[color:var(--mfa-navy)] leading-tight">{n as number}</dd>
                </div>
              ))}
            </dl>
          </header>

          {nothingYet && (
            <p className="text-[15px] text-[color:var(--mfa-ink-secondary)]">
              Nothing has been recorded for this period yet. Try “Everything”, or log a Moment and it will appear here.
            </p>
          )}

          {/* ── Written summary (optional, AI) ── */}
          {!nothingYet && (
            <section className="mb-10 avoid-break" aria-label="Summary">
              {summary ? (
                <div className="rounded-[18px] bg-[color:var(--mfa-surface-sage)] p-5 sm:p-6">
                  <h2 className="font-[family-name:var(--mfa-serif)] text-[22px] font-semibold text-[color:var(--mfa-navy)] mb-2">In summary</h2>
                  <p className="text-[15.5px] leading-relaxed text-[color:var(--mfa-ink)]">{summary.overview}</p>
                  {summary.strengths.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {summary.strengths.map((s, i) => <li key={i} className="text-[15px] text-[color:var(--mfa-ink)]">• {s}</li>)}
                    </ul>
                  )}
                  {summary.closing && <p className="mt-3 text-[15px] italic text-[color:var(--mfa-ink-secondary)]">{summary.closing}</p>}
                  <button type="button" onClick={() => setSummary(null)} className="print:hidden mt-3 text-[13px] font-semibold text-[color:var(--mfa-ink-secondary)] hover:underline">
                    Remove summary
                  </button>
                </div>
              ) : (
                <div className="print:hidden rounded-[18px] border border-dashed border-[color:var(--mfa-border)] p-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[14.5px] text-[color:var(--mfa-ink-secondary)] max-w-md">
                    Add a short written summary at the top, drawn from {first}&apos;s Moments, milestones and growth.
                  </p>
                  <Button variant="secondary" onClick={addSummary} disabled={summaryState === 'working'}>
                    {summaryState === 'working' ? 'Writing summary…' : 'Add a written summary'}
                  </Button>
                  {summaryState === 'error' && (
                    <p role="alert" className="w-full text-[13.5px] text-red-700">The summary couldn&apos;t be written just now. You can still print without it, or try again.</p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Growth by area ── */}
          {assessed.length > 0 && (
            <section className="mb-10" aria-label="Growth by area">
              <h2 className="font-[family-name:var(--mfa-serif)] text-[24px] font-semibold text-[color:var(--mfa-navy)] mb-1">Growth by area</h2>
              <p className="text-[13.5px] text-[color:var(--mfa-ink-secondary)] mb-4">Where {first} is today, as recorded in Family Alliance.</p>
              <div className="space-y-3">
                {assessed.map(({ area, level }) => (
                  <div key={area} className="avoid-break">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[15px] font-semibold text-[color:var(--mfa-ink)]">{getAreaLabel(area)}</span>
                      <span className="text-[13.5px] font-semibold text-[color:var(--mfa-navy)]">{getParentLevelLabel(level)}</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-[color:var(--mfa-surface-warm)] overflow-hidden print:border print:border-gray-300">
                      <div className="h-full rounded-full bg-[color:var(--mfa-navy)]" style={{ width: `${((level || 0) / 5) * 100}%` }} />
                    </div>
                    {AREA_BLURBS[area] && <p className="mt-1 text-[12.5px] text-[color:var(--mfa-ink-secondary)]">{AREA_BLURBS[area]}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Milestones ── */}
          {milestones.length > 0 && (
            <section className="mb-10" aria-label="Milestones reached">
              <h2 className="font-[family-name:var(--mfa-serif)] text-[24px] font-semibold text-[color:var(--mfa-navy)] mb-4">Milestones reached</h2>
              <ul className="divide-y divide-[color:var(--mfa-border)]">
                {milestones.map(m => (
                  <li key={m.id} className="py-2.5 flex gap-4 avoid-break">
                    <span className="w-[72px] shrink-0 text-[13px] font-semibold text-[color:var(--mfa-ochre)]">{shortDate(m.achieved_date!)}</span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold text-[color:var(--mfa-ink)]">⭐ {m.milestone_name}</span>
                      <span className="block text-[12.5px] text-[color:var(--mfa-ink-secondary)]">{getCurriculumAreaLabel(m.curriculum_area)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Skills ── */}
          {skills.length > 0 && (
            <section className="mb-10" aria-label="Skills grown confident">
              <h2 className="font-[family-name:var(--mfa-serif)] text-[24px] font-semibold text-[color:var(--mfa-navy)] mb-4">Skills grown confident</h2>
              <ul className="grid sm:grid-cols-2 print:grid-cols-2 gap-x-6 gap-y-2">
                {skills.map((s, i) => (
                  <li key={i} className="flex gap-3 text-[14.5px] text-[color:var(--mfa-ink)] avoid-break">
                    <span className="text-[color:var(--mfa-sage)]">🌱</span>
                    <span>{s.name} <span className="text-[12.5px] text-[color:var(--mfa-ink-secondary)]">· {shortDate(s.date)}</span></span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Every Moment, in order ── */}
          {moments.length > 0 && (
            <section aria-label="Moments">
              <h2 className="font-[family-name:var(--mfa-serif)] text-[24px] font-semibold text-[color:var(--mfa-navy)] mb-1">Moments</h2>
              <p className="text-[13.5px] text-[color:var(--mfa-ink-secondary)] mb-5">Every Moment captured, in the order it happened.</p>
              <div className="space-y-7">
                {momentsByMonth.map(g => (
                  <div key={g.key}>
                    <h3 className="text-[12px] font-bold tracking-[0.16em] uppercase text-[color:var(--mfa-clay)] mb-2 break-after-avoid">{g.label}</h3>
                    <ul className="space-y-3">
                      {g.items.map(m => (
                        <li key={m.id} className="rounded-[14px] border border-[color:var(--mfa-border)] p-4 avoid-break print:rounded-md">
                          <div className="flex flex-wrap items-center gap-x-2 text-[12.5px] text-[color:var(--mfa-ink-secondary)]">
                            <span className="font-semibold text-[color:var(--mfa-navy)]">{shortDate(m.date)}</span>
                            <span>· {getObservationTypeLabel(m.type)}</span>
                            {m.curriculum_area && m.curriculum_area !== 'general' && <span>· {getCurriculumAreaLabel(m.curriculum_area)}</span>}
                          </div>
                          {m.title && <p className="mt-1 text-[15px] font-semibold text-[color:var(--mfa-ink)]">{m.title}</p>}
                          <p className="mt-1 text-[15px] leading-relaxed text-[color:var(--mfa-ink)] whitespace-pre-line">{m.description}</p>
                          {m.went_well && <p className="mt-2 text-[13.5px] text-[color:var(--mfa-ink-secondary)]"><span className="font-semibold">What went well:</span> {m.went_well}</p>}
                          {m.next_steps && <p className="mt-1 text-[13.5px] text-[color:var(--mfa-ink-secondary)]"><span className="font-semibold">Next steps:</span> {m.next_steps}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-12 pt-5 border-t border-[color:var(--mfa-border)] text-[12px] text-[color:var(--mfa-ink-muted)]">
            Prepared {longDate(new Date().toISOString())} with Montessori Family Alliance · The Montessori Foundation
          </footer>
        </article>
      )}
    </div>
  )
}
