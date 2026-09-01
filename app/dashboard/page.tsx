'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Observation } from '@/lib/supabase'
import { useChild } from '@/lib/child-context'
import {
  getHeroInsight, getHomeActivities, getTodayPrompt, getLearningRecommendation,
} from '@/lib/family-home'
import ChildSwitcher from '@/components/app/ChildSwitcher'
import HeroInsightCard from '@/components/family/HeroInsightCard'
import ActivityCarousel from '@/components/family/ActivityCarousel'
import AbigailCard from '@/components/family/AbigailCard'
import GrowthCard from '@/components/family/GrowthCard'
import EditorialCard from '@/components/family/EditorialCard'
import MomentCard from '@/components/family/MomentCard'
import ObservationPromptCard from '@/components/family/ObservationPromptCard'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'

function firstName(name: string | null | undefined): string {
  return (name || '').trim().split(/\s+/)[0]
}

export default function DashboardHome() {
  const { children, selectedChild, loading: childLoading } = useChild()
  const [parentName, setParentName] = useState('')
  const [devLevels, setDevLevels] = useState<Array<{ area: string; level: number | null }>>([])
  const [recentObs, setRecentObs] = useState<Observation | null>(null)
  const [childDataLoading, setChildDataLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: parent } = await supabase.from('parents').select('display_name').eq('user_id', user.id).maybeSingle()
      setParentName(firstName(parent?.display_name))
    }
    load()
  }, [])

  // Per-child data: development levels + most recent observation.
  // Reloads when the selected child changes.
  useEffect(() => {
    if (!selectedChild) { setChildDataLoading(false); return }
    let cancelled = false
    setChildDataLoading(true)
    const load = async () => {
      const [{ data: dl }, { data: obs }] = await Promise.all([
        supabase.from('child_development_levels').select('area, level').eq('child_id', selectedChild.id),
        supabase.from('observations').select('*').eq('child_id', selectedChild.id)
          .order('date', { ascending: false }).limit(1),
      ])
      if (cancelled) return
      setDevLevels(dl || [])
      setRecentObs(obs?.[0] || null)
      setChildDataLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [selectedChild?.id])

  const hourGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  const childFirst = selectedChild ? firstName(selectedChild.name) : ''
  const hasChild = !childLoading && children.length > 0 && !!selectedChild
  const noChild = !childLoading && children.length === 0

  // Recent moment window: observation from the last ~2 days
  const obsIsRecent = recentObs
    ? (Date.now() - new Date(recentObs.date).getTime()) / 86400000 <= 2
    : false

  // Growth snapshot: up to 3 assessed areas, strongest first
  const growthAreas = devLevels
    .filter((l): l is { area: string; level: number } => !!l.level)
    .sort((a, b) => b.level - a.level)
    .slice(0, 3)

  return (
    <div className="max-w-[900px] mx-auto pb-24 sm:pb-10">
      {/* ── Date + greeting ── */}
      <div className="pt-2 pb-5">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--mfa-clay)] mb-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="font-[family-name:var(--mfa-serif)] text-[32px] sm:text-[40px] leading-[1.05] font-semibold text-[color:var(--mfa-ink)] tracking-tight">
          {hourGreeting()}{parentName ? `, ${parentName}` : ''}.
        </h1>
      </div>

      {/* ── Child selector ── */}
      <div className="mb-6">
        <ChildSwitcher />
      </div>

      {/* ── Loading skeletons ── */}
      {(childLoading || (hasChild && childDataLoading)) && (
        <div className="space-y-6" aria-hidden="true">
          <Skeleton className="h-[340px] rounded-[24px]" />
          <div className="flex gap-3.5 overflow-hidden">
            <Skeleton className="h-[280px] w-[240px] shrink-0 rounded-[20px]" />
            <Skeleton className="h-[280px] w-[240px] shrink-0 rounded-[20px]" />
            <Skeleton className="h-[280px] w-[240px] shrink-0 rounded-[20px]" />
          </div>
          <Skeleton className="h-[180px] rounded-[20px]" />
        </div>
      )}

      {/* ── No child yet: personalize hero, nothing fake beneath ── */}
      {noChild && (
        <section className="rounded-[24px] bg-white border border-[color:var(--mfa-border)] p-6 sm:p-8">
          <h2 className="font-[family-name:var(--mfa-serif)] text-[27px] sm:text-[32px] leading-[1.1] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-2.5">
            Let&apos;s personalize Family Alliance.
          </h2>
          <p className="text-[16px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-xl mb-6">
            Tell us about your child so Abigail, activities and guidance can match their age and development.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button size="lg" href="/onboarding" className="w-full sm:w-auto">
              Add My Child
            </Button>
            <Button size="lg" variant="ghost" href="/dashboard/explore" className="w-full sm:w-auto">
              Explore Montessori first
            </Button>
          </div>
        </section>
      )}

      {/* ── Personalized feed ── */}
      {hasChild && !childDataLoading && selectedChild && (
        <div className="space-y-8">
          {/* 1. Today's insight hero */}
          <HeroInsightCard insight={getHeroInsight(selectedChild, devLevels)} />

          {/* 2. Activity carousel */}
          <section aria-label={`For ${childFirst} today`}>
            <SectionHeader title={`For ${childFirst} Today`} />
            <ActivityCarousel activities={getHomeActivities(selectedChild)} childName={childFirst} />
          </section>

          {/* 3. Ask Abigail */}
          <AbigailCard childName={childFirst} />

          {/* 4. Growth snapshot */}
          <section aria-label="Growth">
            <SectionHeader title={`${childFirst}'s Growth`} />
            {growthAreas.length > 0 ? (
              <GrowthCard childName={childFirst} areas={growthAreas} />
            ) : (
              <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-6">
                <h3 className="font-[family-name:var(--mfa-serif)] text-[20px] font-semibold text-[color:var(--mfa-ink)] mb-1.5">
                  Get to know {childFirst}&apos;s growth
                </h3>
                <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mb-4 max-w-md">
                  Start with a few simple observations and Family Alliance will begin building {childFirst}&apos;s developmental picture.
                </p>
                <Button href="/dashboard/children?tab=moments&log=1" variant="secondary" size="md">
                  Log a Moment
                </Button>
              </div>
            )}
          </section>

          {/* 5. One learning recommendation */}
          <section aria-label="Learn something useful">
            <SectionHeader title="Learn Something Useful" actionLabel="Library" actionHref="/dashboard/library" />
            <EditorialCard article={getLearningRecommendation(selectedChild)} />
          </section>

          {/* 6. Recent moment OR observation prompt */}
          {obsIsRecent && recentObs ? (
            <MomentCard observation={recentObs} childName={childFirst} />
          ) : (
            <ObservationPromptCard prompt={getTodayPrompt(selectedChild)} />
          )}
        </div>
      )}
    </div>
  )
}
