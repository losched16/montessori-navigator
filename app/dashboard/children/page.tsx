'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Observation } from '@/lib/supabase'
import { useChild } from '@/lib/child-context'
import { getSkillByIndex } from '@/lib/scope-sequence'
import { buildJourneyEvents, type MilestoneRow, type SkillRow, type DevLevelRow } from '@/lib/child-story'
import ChildProfileHeader from '@/components/child/ChildProfileHeader'
import ChildTabs, { type ChildTab } from '@/components/child/ChildTabs'
import OverviewTab from '@/components/child/OverviewTab'
import MomentsTab from '@/components/child/MomentsTab'
import JourneyTab from '@/components/child/JourneyTab'
import GrowthTab from '@/components/child/GrowthTab'
import MomentComposer from '@/components/child/MomentComposer'
import Toast from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'

const VALID_TABS: ChildTab[] = ['overview', 'journey', 'moments', 'growth']

// My Child — one destination for the whole child experience, in four tabs.
// All data comes from the existing tables; the selected child comes from the
// shared ChildProvider so it stays consistent everywhere.
export default function MyChildPage() {
  const { children, selectedChild, loading: childLoading } = useChild()
  const [tab, setTab] = useState<ChildTab>('overview')
  const [parentId, setParentId] = useState<string | null>(null)
  const [devLevels, setDevLevels] = useState<DevLevelRow[]>([])
  const [observations, setObservations] = useState<Observation[]>([])
  const [milestones, setMilestones] = useState<MilestoneRow[]>([])
  const [skills, setSkills] = useState<Array<SkillRow & { name?: string }>>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [composerOpen, setComposerOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; detail?: string } | null>(null)
  const supabase = createClient()

  const first = selectedChild?.name.trim().split(/\s+/)[0] || ''

  // Initial tab (and composer) from the URL: ?tab=moments&log=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlTab = params.get('tab') as ChildTab | null
    if (urlTab && VALID_TABS.includes(urlTab)) setTab(urlTab)
    if (params.get('log') === '1') setComposerOpen(true)
  }, [])

  const changeTab = useCallback((next: ChildTab) => {
    setTab(next)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', next)
    url.searchParams.delete('log')
    window.history.replaceState(null, '', url.toString())
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const loadParentId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).maybeSingle()
      setParentId(parent?.id || null)
    }
    loadParentId()
  }, [])

  // Load all child data whenever the selected child changes.
  useEffect(() => {
    if (!selectedChild) { if (!childLoading) setDataLoading(false); return }
    let cancelled = false
    setDataLoading(true)
    const load = async () => {
      const [levels, obs, ms, sk] = await Promise.all([
        supabase.from('child_development_levels').select('area, level').eq('child_id', selectedChild.id),
        supabase.from('observations').select('*').eq('child_id', selectedChild.id)
          .order('date', { ascending: false }).limit(100),
        supabase.from('milestones').select('id, curriculum_area, milestone_name, description, age_plane, achieved, achieved_date')
          .eq('child_id', selectedChild.id),
        supabase.from('child_skill_progress').select('skill_index, skill_area, status, date_mastered')
          .eq('child_id', selectedChild.id).neq('status', 'not_started'),
      ])
      if (cancelled) return
      setDevLevels(levels.data || [])
      setObservations(obs.data || [])
      setMilestones(ms.data || [])
      setSkills((sk.data || []).map(s => ({
        ...s,
        name: getSkillByIndex(s.skill_index)?.skill,
      })))
      setDataLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [selectedChild?.id, childLoading])

  const openComposer = () => setComposerOpen(true)

  const handleMomentSaved = (obs: Observation) => {
    setObservations(prev => [obs, ...prev])
    setToast({ message: 'Moment saved', detail: `${first}'s journey has been updated.` })
  }

  const handleLevelSaved = (area: string, level: number) => {
    setDevLevels(prev => {
      const existing = prev.find(l => l.area === area)
      return existing
        ? prev.map(l => l.area === area ? { ...l, level } : l)
        : [...prev, { area, level }]
    })
    setToast({ message: 'Growth updated' })
  }

  const loading = childLoading || (selectedChild && dataLoading)

  // No children yet
  if (!childLoading && children.length === 0) {
    return (
      <div className="max-w-[900px] mx-auto pb-24 sm:pb-10">
        <div className="rounded-[24px] bg-white border border-[color:var(--mfa-border)] p-6 sm:p-8 mt-2">
          <h1 className="font-[family-name:var(--mfa-serif)] text-[27px] sm:text-[32px] leading-[1.1] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-2.5">
            Let&apos;s meet your child.
          </h1>
          <p className="text-[16px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-xl mb-6">
            Add your child so Family Alliance can build a living picture of who they&apos;re becoming.
          </p>
          <Button size="lg" href="/onboarding">Add My Child</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto pb-24 sm:pb-10">
      {loading ? (
        <div className="space-y-5 pt-2" aria-hidden="true">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-none" />
          <Skeleton className="h-[120px] rounded-[20px]" />
          <Skeleton className="h-[180px] rounded-[20px]" />
        </div>
      ) : selectedChild && (
        <>
          <ChildProfileHeader onLogMoment={openComposer} />
          <ChildTabs active={tab} onChange={changeTab} />

          {tab === 'overview' && (
            <OverviewTab
              child={selectedChild}
              devLevels={devLevels}
              observations={observations}
              milestones={milestones}
              skills={skills}
              onGoToTab={changeTab}
              onLogMoment={openComposer}
            />
          )}
          {tab === 'journey' && (
            <JourneyTab
              child={selectedChild}
              events={buildJourneyEvents(observations, milestones, skills)}
              devLevels={devLevels}
              onLogMoment={openComposer}
            />
          )}
          {tab === 'moments' && (
            <MomentsTab
              observations={observations}
              childName={first}
              onLogMoment={openComposer}
            />
          )}
          {tab === 'growth' && (
            <GrowthTab
              child={selectedChild}
              devLevels={devLevels}
              milestones={milestones}
              skills={skills}
              onLevelSaved={handleLevelSaved}
            />
          )}

          <MomentComposer
            open={composerOpen}
            onClose={() => setComposerOpen(false)}
            childId={selectedChild.id}
            childName={first}
            parentId={parentId}
            onSaved={handleMomentSaved}
          />
        </>
      )}

      <Toast
        message={toast?.message || null}
        detail={toast?.detail}
        onDismiss={() => setToast(null)}
      />
    </div>
  )
}
