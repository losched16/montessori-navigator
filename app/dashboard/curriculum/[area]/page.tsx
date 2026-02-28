'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Child, ChildSkillProgress, SkillStatus } from '@/lib/supabase'
import { formatAge } from '@/lib/utils'
import { getSkillsByArea, getStrandsByArea, getSkillsWithIndicesByArea, type ScopeSequenceSkill } from '@/lib/scope-sequence'

const AREA_LABELS: Record<string, string> = {
  practical_life: 'Practical Life',
  sensorial: 'Sensorial',
  language: 'Language Arts',
  mathematics: 'Mathematics',
  science: 'Science',
  geography: 'Geography',
  history: 'History',
  cosmic_studies: 'Cosmic Studies',
  infants: 'Infants',
  toddlers: 'Toddlers',
}

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

type SkillWithIndex = ScopeSequenceSkill & { index: number }

export default function CurriculumAreaPage() {
  const params = useParams()
  const area = params.area as string
  const [search, setSearch] = useState('')
  const [selectedStrand, setSelectedStrand] = useState<string>('all')
  const [expandedSkill, setExpandedSkill] = useState<number | null>(null)
  const [ageFilter, setAgeFilter] = useState<string>('all')

  // Child context
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [progressMap, setProgressMap] = useState<Map<number, ChildSkillProgress>>(new Map())
  const [loadingProgress, setLoadingProgress] = useState(false)

  const supabase = createClient()

  const allSkillsWithIdx = getSkillsWithIndicesByArea(area)
  const allSkills = getSkillsByArea(area)
  const strands = getStrandsByArea(area)
  const areaLabel = AREA_LABELS[area] || area

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

  // Load skill progress when child changes
  useEffect(() => {
    if (!selectedChildId) return
    loadProgress()
  }, [selectedChildId])

  const loadProgress = async () => {
    if (!selectedChildId) return
    setLoadingProgress(true)
    const { data } = await supabase
      .from('child_skill_progress')
      .select('*')
      .eq('child_id', selectedChildId)
      .eq('skill_area', area)

    const map = new Map<number, ChildSkillProgress>()
    if (data) {
      for (const row of data) {
        map.set(row.skill_index, row as ChildSkillProgress)
      }
    }
    setProgressMap(map)
    setLoadingProgress(false)
  }

  const cycleStatus = async (skillIndex: number) => {
    if (!selectedChildId) return
    const current = progressMap.get(skillIndex)
    const currentStatus: SkillStatus = current?.status || 'not_started'

    // Cycle: not_started → in_progress → mastered → not_started
    let newStatus: SkillStatus
    if (currentStatus === 'not_started') newStatus = 'in_progress'
    else if (currentStatus === 'in_progress') newStatus = 'mastered'
    else newStatus = 'not_started'

    // Optimistic update
    setProgressMap(prev => {
      const next = new Map(prev)
      if (newStatus === 'not_started') {
        next.delete(skillIndex)
      } else {
        const today = new Date().toISOString().split('T')[0]
        next.set(skillIndex, {
          ...(current || { id: '', child_id: selectedChildId, skill_index: skillIndex, skill_area: area, notes: null, created_at: '', updated_at: '' }),
          status: newStatus,
          date_started: newStatus === 'in_progress' ? today : (current?.date_started || today),
          date_mastered: newStatus === 'mastered' ? today : null,
        } as ChildSkillProgress)
      }
      return next
    })

    // Persist
    if (newStatus === 'not_started') {
      await supabase
        .from('child_skill_progress')
        .delete()
        .eq('child_id', selectedChildId)
        .eq('skill_index', skillIndex)
    } else {
      const today = new Date().toISOString().split('T')[0]
      await supabase.from('child_skill_progress').upsert({
        child_id: selectedChildId,
        skill_index: skillIndex,
        skill_area: area,
        status: newStatus,
        date_started: newStatus === 'in_progress' ? today : (current?.date_started || today),
        date_mastered: newStatus === 'mastered' ? today : null,
      }, { onConflict: 'child_id,skill_index' })
    }
  }

  const getStatusIcon = (skillIndex: number) => {
    const progress = progressMap.get(skillIndex)
    if (!progress) return { icon: '○', color: 'text-gray-300 hover:text-gray-400', label: 'Not started' }
    if (progress.status === 'in_progress') return { icon: '◐', color: 'text-amber-400 hover:text-amber-500', label: 'In progress' }
    if (progress.status === 'mastered') return { icon: '●', color: 'text-teal-500 hover:text-teal-600', label: 'Mastered' }
    return { icon: '○', color: 'text-gray-300 hover:text-gray-400', label: 'Not started' }
  }

  // Calculate progress counts
  const masteredCount = Array.from(progressMap.values()).filter(p => p.status === 'mastered').length
  const inProgressCount = Array.from(progressMap.values()).filter(p => p.status === 'in_progress').length
  const progressPercent = allSkills.length > 0 ? Math.round((masteredCount / allSkills.length) * 100) : 0

  if (allSkills.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">📋</div>
        <h1 className="text-xl font-semibold text-navy-600 mb-2">Area Not Found</h1>
        <Link href="/dashboard/curriculum" className="text-sm text-teal-600 hover:underline">
          ← Back to Curriculum Guide
        </Link>
      </div>
    )
  }

  // Get unique ages from this area
  const allAges = Array.from(new Set(allSkills.flatMap(s => s.applicableAges)))

  // Filter skills (use indexed version)
  let filteredSkills = allSkillsWithIdx

  if (selectedStrand !== 'all') {
    filteredSkills = filteredSkills.filter(s => s.strand === selectedStrand)
  }

  if (ageFilter !== 'all') {
    filteredSkills = filteredSkills.filter(s => s.applicableAges.includes(ageFilter))
  }

  if (search.trim()) {
    const q = search.toLowerCase()
    filteredSkills = filteredSkills.filter(s =>
      s.skill.toLowerCase().includes(q) ||
      s.materialLesson.toLowerCase().includes(q) ||
      s.explanation.toLowerCase().includes(q) ||
      s.strand.toLowerCase().includes(q)
    )
  }

  // Group by strand for display
  const groupedByStrand: Record<string, SkillWithIndex[]> = {}
  for (const skill of filteredSkills) {
    if (!groupedByStrand[skill.strand]) groupedByStrand[skill.strand] = []
    groupedByStrand[skill.strand].push(skill)
  }

  // Calculate strand-level progress
  const getStrandProgress = (strandSkills: SkillWithIndex[]) => {
    let mastered = 0
    let inProg = 0
    for (const s of strandSkills) {
      const p = progressMap.get(s.index)
      if (p?.status === 'mastered') mastered++
      else if (p?.status === 'in_progress') inProg++
    }
    return { mastered, inProgress: inProg, total: strandSkills.length }
  }

  const getAgeBadgeColor = (age: string): string => {
    if (age.includes('Birth') || age.includes('month')) return 'bg-rose-50 text-rose-600'
    if (age === 'Age 3') return 'bg-purple-50 text-purple-600'
    if (age === 'Age 4') return 'bg-blue-50 text-blue-600'
    if (age === 'K') return 'bg-teal-50 text-teal-600'
    if (age === 'First' || age === 'Second' || age === 'Third') return 'bg-emerald-50 text-emerald-600'
    return 'bg-amber-50 text-amber-600'
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link href="/dashboard/curriculum" className="hover:text-teal-600 transition">Curriculum</Link>
        <span>→</span>
        <span className="text-gray-600">{areaLabel}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{AREA_ICONS[area] || '📋'}</span>
          <div>
            <h1 className="text-2xl font-bold text-navy-600">{areaLabel}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {allSkills.length} skills across {strands.length} strands
            </p>
          </div>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Tracking progress for</div>
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
        </div>
      )}

      {/* Progress Summary */}
      {selectedChildId && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-navy-600">
              {children.find(c => c.id === selectedChildId)?.name}&apos;s Progress
            </span>
            <span className="text-xs text-gray-400">
              {masteredCount} mastered · {inProgressCount} in progress · {allSkills.length - masteredCount - inProgressCount} remaining
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="h-full flex">
              <div
                className="bg-teal-500 transition-all duration-300"
                style={{ width: `${(masteredCount / allSkills.length) * 100}%` }}
              />
              <div
                className="bg-amber-400 transition-all duration-300"
                style={{ width: `${(inProgressCount / allSkills.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> Mastered ({progressPercent}%)
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> In Progress
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-200 inline-block" /> Not Started
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Strand filter */}
          <select
            value={selectedStrand}
            onChange={e => setSelectedStrand(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="all">All Strands</option>
            {strands.map(strand => (
              <option key={strand} value={strand}>{strand}</option>
            ))}
          </select>

          {/* Age filter */}
          <select
            value={ageFilter}
            onChange={e => setAgeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="all">All Ages</option>
            {allAges.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>

        <div className="mt-2 text-xs text-gray-400">
          Showing {filteredSkills.length} of {allSkills.length} skills
        </div>
      </div>

      {/* Skills grouped by strand */}
      {Object.entries(groupedByStrand).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedByStrand).map(([strand, skills]) => {
            const strandProg = getStrandProgress(skills)
            return (
              <div key={strand} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                {/* Strand header */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-navy-600">{strand}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{skills.length} skills</p>
                    </div>
                    {selectedChildId && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{strandProg.mastered}/{strandProg.total}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full flex">
                            <div
                              className="bg-teal-500 transition-all"
                              style={{ width: `${strandProg.total > 0 ? (strandProg.mastered / strandProg.total) * 100 : 0}%` }}
                            />
                            <div
                              className="bg-amber-400 transition-all"
                              style={{ width: `${strandProg.total > 0 ? (strandProg.inProgress / strandProg.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills list */}
                <div className="divide-y divide-gray-50">
                  {skills.map((skill) => {
                    const isExpanded = expandedSkill === skill.index
                    const statusInfo = getStatusIcon(skill.index)
                    return (
                      <div key={skill.index} className="px-5 py-3">
                        <div className="flex items-start gap-3">
                          {/* Status toggle */}
                          {selectedChildId && (
                            <button
                              onClick={() => cycleStatus(skill.index)}
                              className={`text-xl leading-none mt-0.5 shrink-0 transition ${statusInfo.color}`}
                              title={statusInfo.label}
                            >
                              {statusInfo.icon}
                            </button>
                          )}

                          {/* Skill content */}
                          <button
                            onClick={() => setExpandedSkill(isExpanded ? null : skill.index)}
                            className="flex-1 text-left min-w-0"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-relaxed ${
                                  progressMap.get(skill.index)?.status === 'mastered'
                                    ? 'text-teal-700'
                                    : progressMap.get(skill.index)?.status === 'in_progress'
                                      ? 'text-amber-700'
                                      : 'text-gray-700'
                                }`}>
                                  {skill.skill}
                                </p>
                                {skill.materialLesson && (
                                  <p className="text-[11px] text-gray-400 mt-1">
                                    Material: {skill.materialLesson}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {skill.applicableAges.slice(0, 3).map(age => (
                                  <span key={age} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${getAgeBadgeColor(age)}`}>
                                    {age}
                                  </span>
                                ))}
                                {skill.applicableAges.length > 3 && (
                                  <span className="text-[9px] text-gray-400">+{skill.applicableAges.length - 3}</span>
                                )}
                                <span className={`text-gray-400 text-xs ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                              </div>
                            </div>
                          </button>
                        </div>

                        {/* Expanded explanation */}
                        {isExpanded && skill.explanation && (
                          <div className="mt-3 ml-8 p-4 bg-[#f8f5ff] rounded-lg border border-[#ede7f6]">
                            <div className="text-xs font-semibold text-[#4a2c82] uppercase tracking-wide mb-2">
                              What This Means for Your Child
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                              {skill.explanation}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              <span className="text-[10px] text-gray-500">Applicable ages:</span>
                              {skill.applicableAges.map(age => (
                                <span key={age} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${getAgeBadgeColor(age)}`}>
                                  {age}
                                </span>
                              ))}
                            </div>
                            {progressMap.get(skill.index)?.date_mastered && (
                              <div className="mt-2 text-[10px] text-teal-600">
                                ✓ Mastered on {progressMap.get(skill.index)!.date_mastered}
                              </div>
                            )}
                            {progressMap.get(skill.index)?.date_started && progressMap.get(skill.index)?.status === 'in_progress' && (
                              <div className="mt-2 text-[10px] text-amber-600">
                                Started on {progressMap.get(skill.index)!.date_started}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="font-medium text-navy-600 mb-1">No skills found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Back link */}
      <div className="mt-8">
        <Link href="/dashboard/curriculum" className="text-sm text-teal-600 hover:underline">
          ← Back to Curriculum Guide
        </Link>
      </div>
    </div>
  )
}
