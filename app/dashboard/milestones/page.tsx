'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getCurriculumAreaLabel } from '@/lib/utils'
import { useChild } from '@/lib/child-context'
import ChildSwitcher from '@/components/app/ChildSwitcher'
import { trackEvent, getSafeChildAnalyticsContext } from '@/lib/analytics'

interface Milestone {
  id: string
  curriculum_area: string
  milestone_name: string
  description: string | null
  age_plane: string
  achieved: boolean
  achieved_date: string | null
}

const AREA_ORDER = [
  'practical_life', 'sensorial', 'language', 'mathematics',
  'cultural_studies', 'social_emotional', 'executive_function',
  'gross_motor', 'fine_motor', 'art_music'
]

export default function MilestonesPage() {
  // Shared child context (Phase 2): one selected child everywhere.
  const { selectedChildId, selectedChild } = useChild()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [filterArea, setFilterArea] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (!selectedChildId) return
    setFilterArea('all')
    loadMilestones()
  }, [selectedChildId])

  const loadMilestones = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('milestones')
      .select('*')
      .eq('child_id', selectedChildId)
      .order('curriculum_area')
      .order('milestone_name')

    setMilestones(data || [])
    setLoading(false)
  }

  const initializeMilestones = async () => {
    if (!selectedChildId) return
    setInitializing(true)

    await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'initialize', childId: selectedChildId }),
    })

    await loadMilestones()
    setInitializing(false)
  }

  const toggleMilestone = async (milestoneId: string, currentAchieved: boolean) => {
    const ms = milestones.find(m => m.id === milestoneId)
    trackEvent('milestone_updated', {
      achieved: !currentAchieved,
      curriculum_area: ms?.curriculum_area,
      age_plane: getSafeChildAnalyticsContext(selectedChild).age_plane,
    })
    // Optimistic update
    setMilestones(prev => prev.map(m =>
      m.id === milestoneId
        ? { ...m, achieved: !currentAchieved, achieved_date: !currentAchieved ? new Date().toISOString().split('T')[0] : null }
        : m
    ))

    await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', milestoneId, achieved: !currentAchieved }),
    })
  }

  // Group milestones by area
  const areas = AREA_ORDER.filter(a => milestones.some(m => m.curriculum_area === a))
  const filteredMilestones = filterArea === 'all'
    ? milestones
    : milestones.filter(m => m.curriculum_area === filterArea)

  const groupedMilestones: Record<string, Milestone[]> = {}
  filteredMilestones.forEach(m => {
    if (!groupedMilestones[m.curriculum_area]) groupedMilestones[m.curriculum_area] = []
    groupedMilestones[m.curriculum_area].push(m)
  })

  // Progress stats
  const totalMilestones = milestones.length
  const achievedCount = milestones.filter(m => m.achieved).length

  // Per-area progress
  const areaProgress = areas.map(area => {
    const areaMs = milestones.filter(m => m.curriculum_area === area)
    const areaAchieved = areaMs.filter(m => m.achieved).length
    return {
      area,
      total: areaMs.length,
      achieved: areaAchieved,
      pct: areaMs.length > 0 ? Math.round((areaAchieved / areaMs.length) * 100) : 0,
    }
  })

  const first = selectedChild?.name.trim().split(/\s+/)[0]

  return (
    <div className="max-w-3xl mx-auto pb-24 sm:pb-10">
      <div className="pt-2 mb-6">
        <Link
          href="/dashboard/children?tab=growth"
          className="tap-scale inline-flex items-center gap-1.5 min-h-[44px] text-[14px] font-medium text-[color:var(--mfa-ink-secondary)] hover:text-[color:var(--mfa-ink)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {first ? `${first}'s Growth` : 'Growth'}
        </Link>
        <h1 className="font-[family-name:var(--mfa-serif)] text-[32px] sm:text-[38px] leading-[1.05] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-1.5 mt-1">
          Milestones
        </h1>
        <p className="text-[15px] text-[color:var(--mfa-ink-secondary)] mb-4">
          Developmental achievements you&apos;re noticing over time.
        </p>
        <ChildSwitcher />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading milestones...</div>
      ) : milestones.length === 0 ? (
        <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-10 text-center">
          <span className="w-11 h-11 rounded-full bg-[#F8EFD9] text-[color:var(--mfa-ochre)] inline-flex items-center justify-center mb-3" aria-hidden="true">
            <Star size={20} />
          </span>
          <h3 className="font-[family-name:var(--mfa-serif)] text-[21px] font-semibold text-[color:var(--mfa-ink)] mb-2">Set Up Milestones</h3>
          <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mb-5 max-w-md mx-auto">
            Load age-appropriate Montessori milestones for {first || 'your child'} to start celebrating developmental achievements.
          </p>
          <button
            onClick={initializeMilestones}
            disabled={initializing}
            className="tap-scale min-h-[48px] px-6 rounded-2xl bg-[color:var(--mfa-purple)] text-white text-[15px] font-semibold transition disabled:opacity-50"
          >
            {initializing ? 'Loading milestones...' : 'Load Milestones'}
          </button>
        </div>
      ) : (
        <>
          {/* Overview — plain-language, not a completion score */}
          <div className="bg-white border border-[color:var(--mfa-border)] rounded-[20px] p-5 mb-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-full bg-[#F8EFD9] text-[color:var(--mfa-ochre)] inline-flex items-center justify-center shrink-0" aria-hidden="true">
                <Star size={17} />
              </span>
              <div>
                <div className="text-[17px] font-semibold text-[color:var(--mfa-ink)]">
                  {achievedCount} milestone{achievedCount === 1 ? '' : 's'} reached
                </div>
                <div className="text-[12.5px] text-[color:var(--mfa-ink-muted)]">
                  {totalMilestones} tracked · every child moves at their own pace
                </div>
              </div>
            </div>

            {/* Per-area mini bars (double as filters) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {areaProgress.map(ap => (
                <button
                  key={ap.area}
                  onClick={() => setFilterArea(filterArea === ap.area ? 'all' : ap.area)}
                  aria-pressed={filterArea === ap.area}
                  className={`p-2.5 rounded-xl text-center transition min-h-[56px] ${
                    filterArea === ap.area
                      ? 'bg-[color:var(--mfa-sage-soft)] ring-1 ring-[color:var(--mfa-sage)]'
                      : 'bg-[color:var(--mfa-surface-warm)] hover:bg-[color:var(--mfa-surface-sage)]'
                  }`}
                >
                  <div className="text-[11.5px] font-medium text-[color:var(--mfa-ink-secondary)] truncate mb-1.5">{getCurriculumAreaLabel(ap.area)}</div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${ap.pct}%`, background: 'var(--mfa-sage)' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filter label */}
          {filterArea !== 'all' && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-warm-700 font-medium">Showing: {getCurriculumAreaLabel(filterArea)}</span>
              <button onClick={() => setFilterArea('all')} className="text-xs text-gray-400 hover:text-gray-600">Show all</button>
            </div>
          )}

          {/* Milestone checklist */}
          {Object.entries(groupedMilestones).map(([area, ms]) => (
            <div key={area} className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">{getCurriculumAreaLabel(area)}</h3>
              <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
                {ms.map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleMilestone(m.id, m.achieved)}
                    className="w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50/50 transition"
                  >
                    <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      m.achieved ? 'bg-warm-500 border-warm-500' : 'border-gray-300'
                    }`}>
                      {m.achieved && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-medium transition ${m.achieved ? 'text-warm-700' : 'text-navy-600'}`}>
                        {m.milestone_name}
                      </div>
                      {m.description && (
                        <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{m.description}</div>
                      )}
                      {m.achieved && m.achieved_date && (
                        <div className="text-xs text-warm-600 mt-0.5">
                          Achieved {new Date(m.achieved_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
