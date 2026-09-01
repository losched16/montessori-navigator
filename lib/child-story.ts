// My Child (Phase 2) — presentation helpers that turn existing rows
// (observations, milestones, skill progress, development levels) into the
// parent-facing "story" shapes used by the unified My Child tabs.
// No schema changes; "moment" is the UX label for an observation.

import type { Observation } from '@/lib/supabase'
import { getCurriculumAreaLabel } from '@/lib/utils'
import { getAreaLabel, getParentLevelLabel } from '@/lib/family-home'

export interface MilestoneRow {
  id: string
  curriculum_area: string
  milestone_name: string
  description: string | null
  age_plane: string | null
  achieved: boolean
  achieved_date: string | null
}

export interface SkillRow {
  skill_index: number
  skill_area: string
  status: 'not_started' | 'in_progress' | 'mastered'
  date_mastered: string | null
}

export interface DevLevelRow {
  area: string
  level: number | null
}

// ── Journey events ──

export type JourneyEventKind = 'moment' | 'milestone' | 'skill'

export interface JourneyEvent {
  id: string
  kind: JourneyEventKind
  date: string // ISO date
  title: string
  sub: string
}

export function buildJourneyEvents(
  observations: Observation[],
  milestones: MilestoneRow[],
  skills: Array<SkillRow & { name?: string }>,
): JourneyEvent[] {
  const events: JourneyEvent[] = []

  observations.forEach(o => {
    events.push({
      id: `obs-${o.id}`,
      kind: 'moment',
      date: o.date,
      title: o.description,
      sub: [
        'Moment',
        o.curriculum_area && o.curriculum_area !== 'general' ? getCurriculumAreaLabel(o.curriculum_area) : null,
      ].filter(Boolean).join(' · '),
    })
  })

  milestones.filter(m => m.achieved && m.achieved_date).forEach(m => {
    events.push({
      id: `ms-${m.id}`,
      kind: 'milestone',
      date: m.achieved_date!,
      title: m.milestone_name,
      sub: `Milestone · ${getCurriculumAreaLabel(m.curriculum_area)}`,
    })
  })

  skills.filter(s => s.status === 'mastered' && s.date_mastered).forEach(s => {
    events.push({
      id: `sk-${s.skill_area}-${s.skill_index}`,
      kind: 'skill',
      date: s.date_mastered!,
      title: s.name || `New ${s.skill_area.replace(/_/g, ' ')} skill feeling confident`,
      sub: 'Montessori Learning',
    })
  })

  return events.sort((a, b) => b.date.localeCompare(a.date))
}

export interface JourneyMonthGroup {
  key: string // YYYY-MM
  label: string // "September 2026"
  events: JourneyEvent[]
}

export function groupEventsByMonth(events: JourneyEvent[], maxEvents = 60): JourneyMonthGroup[] {
  const groups: Record<string, JourneyEvent[]> = {}
  events.slice(0, maxEvents).forEach(e => {
    const key = e.date.slice(0, 7)
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  })
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, evts]) => ({
      key,
      label: new Date(key + '-15').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      events: evts,
    }))
}

// ── This Month plain-language summary ──

export function buildMonthSummary(
  events: JourneyEvent[],
  devLevels: DevLevelRow[],
): string[] {
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthEvents = events.filter(e => e.date.startsWith(thisMonth))
  const moments = monthEvents.filter(e => e.kind === 'moment').length
  const milestones = monthEvents.filter(e => e.kind === 'milestone').length
  const skills = monthEvents.filter(e => e.kind === 'skill').length

  const lines: string[] = []
  if (moments > 0) lines.push(`${moments} moment${moments === 1 ? '' : 's'} captured`)
  if (milestones > 0) lines.push(`${milestones} milestone${milestones === 1 ? '' : 's'} reached`)
  if (skills > 0) lines.push(`${skills} skill${skills === 1 ? '' : 's'} grown confident`)

  const strongest = devLevels
    .filter((l): l is { area: string; level: number } => !!l.level && l.level >= 4)
    .sort((a, b) => b.level - a.level)[0]
  if (strongest) {
    lines.push(`${getAreaLabel(strongest.area)} showing strong interest`)
  }
  return lines
}

// ── Recent growth (Overview, max 3) ──

export interface GrowthHighlight {
  kind: JourneyEventKind | 'level'
  text: string
}

export function buildRecentGrowth(
  observations: Observation[],
  milestones: MilestoneRow[],
  skills: Array<SkillRow & { name?: string }>,
  devLevels: DevLevelRow[],
): GrowthHighlight[] {
  const items: GrowthHighlight[] = []

  const latestMilestone = milestones
    .filter(m => m.achieved && m.achieved_date)
    .sort((a, b) => (b.achieved_date || '').localeCompare(a.achieved_date || ''))[0]
  if (latestMilestone) items.push({ kind: 'milestone', text: latestMilestone.milestone_name })

  const latestSkill = skills
    .filter(s => s.status === 'mastered' && s.date_mastered)
    .sort((a, b) => (b.date_mastered || '').localeCompare(a.date_mastered || ''))[0]
  if (latestSkill?.name) items.push({ kind: 'skill', text: latestSkill.name })

  // A meaningful recent observation (interest/milestone types first)
  const notable = observations.find(o => o.type === 'interest_spark' || o.type === 'milestone_reached')
    || observations[0]
  if (notable && items.length < 3) {
    items.push({ kind: 'moment', text: notable.description })
  }

  // Development level with momentum
  if (items.length < 3) {
    const strong = devLevels
      .filter((l): l is { area: string; level: number } => !!l.level && l.level >= 4)
      .sort((a, b) => b.level - a.level)[0]
    if (strong) {
      items.push({ kind: 'level', text: `${getAreaLabel(strong.area)} moved into ${getParentLevelLabel(strong.level)}` })
    }
  }

  return items.slice(0, 3)
}

// ── Development area descriptions (Growth cards) ──

export const AREA_BLURBS: Record<string, string> = {
  practical_life: 'Everyday tasks — pouring, dressing, preparing food, caring for the home.',
  sensorial: 'Refining the senses — sorting, matching, noticing fine differences.',
  language: 'Words, sounds, conversation, and the path toward writing and reading.',
  mathematics: 'Counting, quantity, patterns and early number work.',
  cultural_studies: 'The wider world — nature, geography, people and how things work.',
  social_emotional: 'Feelings, friendships, empathy and grace and courtesy.',
  executive_function: 'Focus, memory, patience and finishing what was started.',
  gross_motor: 'Whole-body movement — climbing, balancing, carrying, running.',
  fine_motor: 'Hand control — grasping, threading, drawing, buttoning.',
  art_music: 'Making and noticing beauty — drawing, singing, rhythm, craft.',
}

export const DEV_AREAS = [
  'practical_life', 'sensorial', 'language', 'mathematics',
  'cultural_studies', 'social_emotional', 'executive_function',
  'gross_motor', 'fine_motor', 'art_music',
] as const

// ── Seasonal reflection (kept from legacy Journey, prompt-only) ──

export function getSeasonPrompt(): { title: string; prompt: string } {
  const quarter = Math.ceil((new Date().getMonth() + 1) / 3)
  const prompts = [
    { title: 'Winter Reflection', prompt: 'What seeds were planted this season? What quiet growth did you notice?' },
    { title: 'Spring Reflection', prompt: "What's emerging? What new interests or abilities are blooming?" },
    { title: 'Summer Reflection', prompt: 'What flourished? Where did your child surprise you with growth?' },
    { title: 'Autumn Reflection', prompt: 'What has your child mastered this year? What are you most grateful for?' },
  ]
  return prompts[quarter - 1]
}

export function relativeDay(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
