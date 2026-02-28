'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Child } from '@/lib/supabase'
import { formatAge } from '@/lib/utils'
import { getAllAreas, getStrandsByArea } from '@/lib/scope-sequence'

const AREAS = getAllAreas()

const AREA_ICONS: Record<string, string> = {
  practical_life: '🤲',
  sensorial: '👁️',
  language: '📖',
  mathematics: '🔢',
  science: '🔬',
  geography: '🌍',
  history: '📜',
  cosmic_studies: '🌌',
  infants: '👶',
  toddlers: '🧒',
}

const AREA_COLORS: Record<string, string> = {
  practical_life: 'from-amber-500 to-orange-500',
  sensorial: 'from-pink-500 to-rose-500',
  language: 'from-blue-500 to-indigo-500',
  mathematics: 'from-emerald-500 to-teal-500',
  science: 'from-purple-500 to-violet-500',
  geography: 'from-cyan-500 to-blue-500',
  history: 'from-yellow-500 to-amber-500',
  cosmic_studies: 'from-indigo-500 to-purple-500',
  infants: 'from-rose-400 to-pink-400',
  toddlers: 'from-teal-400 to-emerald-400',
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
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [areaProgress, setAreaProgress] = useState<Record<string, AreaProgress>>({})

  const supabase = createClient()

  // Load children
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
      if (!parent) return
      const { data: kids } = await supabase.from('children').select('*').eq('parent_id', parent.id).order('created_at')
      if (kids && kids.length > 0) {
        setChildren(kids)
        setSelectedChildId(kids[0].id)
      }
    }
    load()
  }, [])

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-600">Curriculum Guide</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalSkills} skills across {AREAS.length} curriculum areas — from the Montessori Foundation&apos;s official Scope &amp; Sequence
        </p>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2 sm:mb-0">Tracking progress for</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    selectedChildId === child.id
                      ? 'bg-teal-50 text-teal-600 font-medium border border-teal-200'
                      : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  {child.name}
                  {child.date_of_birth && <span className="text-gray-400 ml-1">· {formatAge(child.date_of_birth)}</span>}
                </button>
              ))}
            </div>
            {selectedChildId && totalMastered > 0 && (
              <div className="sm:ml-auto text-xs text-gray-500">
                {totalMastered} of {totalSkills} skills mastered
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="bg-gradient-to-br from-[#f8f5ff] to-white border border-[#ede7f6] rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-[#4a2c82] mb-2">How to Use This Guide</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Browse each curriculum area to see the specific skills your child will develop at each age. Click into any area to <strong>check off skills</strong> as your child masters them. Each skill includes a parent-friendly explanation of what it means and why it matters.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search curriculum areas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Area grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAreas.map(area => {
          const strands = getStrandsByArea(area.key)
          const prog = areaProgress[area.key]
          const hasProg = prog && (prog.mastered > 0 || prog.inProgress > 0)
          return (
            <Link
              key={area.key}
              href={`/dashboard/curriculum/${area.key}`}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition group"
            >
              {/* Color bar */}
              <div className={`h-1.5 bg-gradient-to-r ${AREA_COLORS[area.key] || 'from-gray-400 to-gray-500'}`} />

              <div className="p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{AREA_ICONS[area.key] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-navy-600 group-hover:text-teal-600 transition">
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
                          <span className="text-[10px] text-teal-600 font-medium">
                            {Math.round((prog.mastered / area.count) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full flex">
                            <div
                              className="bg-teal-500 transition-all"
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
