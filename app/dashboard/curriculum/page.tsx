'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Hand, Eye, BookOpen, Calculator, FlaskConical, Globe, Landmark, Sparkles, Baby, Footprints, type LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getAllAreas, getStrandsByArea } from '@/lib/scope-sequence'
import { useChild } from '@/lib/child-context'
import ChildSwitcher from '@/components/app/ChildSwitcher'

const AREAS = getAllAreas()

const AREA_ICONS: Record<string, LucideIcon> = {
  practical_life: Hand,
  sensorial: Eye,
  language: BookOpen,
  mathematics: Calculator,
  science: FlaskConical,
  geography: Globe,
  history: Landmark,
  cosmic_studies: Sparkles,
  infants: Baby,
  toddlers: Footprints,
}

const AREA_COLORS: Record<string, string> = {
  practical_life: 'from-amber-500 to-orange-500',
  sensorial: 'from-pink-500 to-rose-500',
  language: 'from-blue-500 to-indigo-500',
  mathematics: 'from-emerald-500 to-warm-500',
  science: 'from-purple-500 to-violet-500',
  geography: 'from-cyan-500 to-blue-500',
  history: 'from-yellow-500 to-amber-500',
  cosmic_studies: 'from-indigo-500 to-purple-500',
  infants: 'from-rose-400 to-pink-400',
  toddlers: 'from-warm-400 to-emerald-400',
}

const AREA_DESCRIPTIONS: Record<string, string> = {
  practical_life: 'Activities that develop independence, coordination, concentration, and order through real-life tasks.',
  sensorial: 'Materials that refine the senses and help children classify and understand the world around them.',
  language: 'The progression from spoken language through writing to reading, grammar, and creative expression.',
  mathematics: 'Concrete materials that build understanding of number concepts, operations, and abstract math thinking.',
  science: 'Exploration of physical properties, living things, earth science, and the scientific method.',
  geography: 'Understanding of position, direction, landforms, continents, cultures, and the physical world.',
  history: 'Concepts of time, personal history, timelines, and the story of human civilization.',
  cosmic_studies: 'The great stories and experiments that show children how the universe works.',
  infants: 'Motor development, sensory exploration, language foundations, and social-emotional growth from birth to 18 months.',
  toddlers: 'Walking, talking, self-care, and the explosion of independence from 12 to 36 months.',
}

interface AreaProgress {
  mastered: number
  inProgress: number
}

export default function CurriculumPage() {
  const [search, setSearch] = useState('')
  const { children, selectedChildId, setSelectedChildId } = useChild()
  const [areaProgress, setAreaProgress] = useState<Record<string, AreaProgress>>({})

  const supabase = createClient()

  // Load progress when child changes
  useEffect(() => {
    if (!selectedChildId) return
    const loadProgress = async () => {
      const { data } = await supabase
        .from('child_skill_progress')
        .select('skill_area, status')
        .eq('child_id', selectedChildId)

      const progress: Record<string, AreaProgress> = {}
      if (data) {
        for (const row of data) {
          if (!progress[row.skill_area]) progress[row.skill_area] = { mastered: 0, inProgress: 0 }
          if (row.status === 'mastered') progress[row.skill_area].mastered++
          else if (row.status === 'in_progress') progress[row.skill_area].inProgress++
        }
      }
      setAreaProgress(progress)
    }
    loadProgress()
  }, [selectedChildId])

  const filteredAreas = search
    ? AREAS.filter(a =>
        a.label.toLowerCase().includes(search.toLowerCase()) ||
        AREA_DESCRIPTIONS[a.key]?.toLowerCase().includes(search.toLowerCase()) ||
        getStrandsByArea(a.key).some(s => s.toLowerCase().includes(search.toLowerCase()))
      )
    : AREAS

  // Total progress across all areas
  const totalMastered = Object.values(areaProgress).reduce((sum, p) => sum + p.mastered, 0)
  const totalInProgress = Object.values(areaProgress).reduce((sum, p) => sum + p.inProgress, 0)
  const totalSkills = AREAS.reduce((sum, a) => sum + a.count, 0)

  const first = children.find(c => c.id === selectedChildId)?.name.trim().split(/\s+/)[0]

  return (
    <div className="max-w-[900px] mx-auto pb-24 sm:pb-10">
      <div className="pt-2 mb-6">
        <Link
          href="/dashboard/children?tab=growth"
          className="tap-scale inline-flex items-center gap-1.5 min-h-[44px] text-[14px] font-medium text-[color:var(--mfa-ink-secondary)] hover:text-[color:var(--mfa-ink)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {first ? `${first}'s Growth` : 'Growth'}
        </Link>
        <h1 className="font-[family-name:var(--mfa-serif)] text-[32px] sm:text-[38px] leading-[1.05] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-1.5 mt-1">
          Montessori Learning
        </h1>
        <p className="text-[15px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-xl mb-4">
          Explore the skills and experiences that support {first ? `${first}'s` : 'your child\'s'} development — {totalSkills.toLocaleString()} skills across {AREAS.length} areas from the Foundation&apos;s Scope &amp; Sequence.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ChildSwitcher />
          {selectedChildId && totalMastered > 0 && (
            <span className="text-[13px] text-[color:var(--mfa-ink-muted)]">
              {totalMastered + totalInProgress} skills in motion · {totalMastered} confident
            </span>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-gradient-to-br from-[#f8f5ff] to-white border border-[#ede7f6] rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-[#4a2c82] mb-2">How to Use This Guide</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Browse each curriculum area to see the specific skills your child will develop at each age. Click into any area to <strong>check off skills</strong> as your child masters them. Each skill includes a parent-friendly explanation of what it means and why it matters.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--mfa-ink-muted)] pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search curriculum areas..."
          aria-label="Search curriculum areas"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-[52px] pl-11 pr-4 rounded-[16px] bg-white border border-[color:var(--mfa-border)] text-[15px] text-[color:var(--mfa-ink)] placeholder:text-[color:var(--mfa-ink-muted)] focus:ring-2 focus:ring-[color:var(--mfa-purple)] focus:border-transparent outline-none [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      {/* Area grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAreas.map(area => {
          const strands = getStrandsByArea(area.key)
          const prog = areaProgress[area.key]
          const hasProg = prog && (prog.mastered > 0 || prog.inProgress > 0)
          const AreaIcon = AREA_ICONS[area.key] || BookOpen
          return (
            <Link
              key={area.key}
              href={`/dashboard/curriculum/${area.key}`}
              className="tap-scale bg-white border border-[color:var(--mfa-border)] rounded-[16px] overflow-hidden hover:shadow-md transition group"
            >
              {/* Color bar */}
              <div className={`h-1.5 bg-gradient-to-r ${AREA_COLORS[area.key] || 'from-gray-400 to-gray-500'}`} />

              <div className="p-5">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[color:var(--mfa-surface-sage)] text-[color:var(--mfa-forest)] inline-flex items-center justify-center shrink-0" aria-hidden="true">
                    <AreaIcon size={20} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-navy-600 group-hover:text-warm-600 transition">
                        {area.label}
                      </h3>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {area.count} skills
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                      {AREA_DESCRIPTIONS[area.key] || ''}
                    </p>

                    {/* Progress bar (only shown when child has progress) */}
                    {selectedChildId && hasProg && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-500">
                            {prog.mastered} mastered{prog.inProgress > 0 ? ` · ${prog.inProgress} in progress` : ''}
                          </span>
                          <span className="text-[10px] text-warm-700 font-medium">
                            {Math.round((prog.mastered / area.count) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full flex">
                            <div
                              className="bg-warm-500 transition-all"
                              style={{ width: `${(prog.mastered / area.count) * 100}%` }}
                            />
                            <div
                              className="bg-amber-400 transition-all"
                              style={{ width: `${(prog.inProgress / area.count) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-3">
                      {strands.slice(0, 4).map(strand => (
                        <span key={strand} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px]">
                          {strand}
                        </span>
                      ))}
                      {strands.length > 4 && (
                        <span className="px-2 py-0.5 text-gray-400 text-[10px]">
                          +{strands.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
