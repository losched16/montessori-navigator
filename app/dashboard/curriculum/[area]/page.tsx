'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSkillsByArea, getStrandsByArea, getSkillsByStrand, type ScopeSequenceSkill } from '@/lib/scope-sequence'

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

export default function CurriculumAreaPage() {
  const params = useParams()
  const area = params.area as string
  const [search, setSearch] = useState('')
  const [selectedStrand, setSelectedStrand] = useState<string>('all')
  const [expandedSkill, setExpandedSkill] = useState<number | null>(null)
  const [ageFilter, setAgeFilter] = useState<string>('all')

  const allSkills = getSkillsByArea(area)
  const strands = getStrandsByArea(area)
  const areaLabel = AREA_LABELS[area] || area

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

  // Filter skills
  let filteredSkills = allSkills

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
  const groupedByStrand: Record<string, ScopeSequenceSkill[]> = {}
  for (const skill of filteredSkills) {
    if (!groupedByStrand[skill.strand]) groupedByStrand[skill.strand] = []
    groupedByStrand[skill.strand].push(skill)
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
          {Object.entries(groupedByStrand).map(([strand, skills]) => (
            <div key={strand} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              {/* Strand header */}
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-navy-600">{strand}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{skills.length} skills</p>
              </div>

              {/* Skills list */}
              <div className="divide-y divide-gray-50">
                {skills.map((skill, i) => {
                  const globalIdx = allSkills.indexOf(skill)
                  const isExpanded = expandedSkill === globalIdx
                  return (
                    <div key={globalIdx} className="px-5 py-3">
                      <button
                        onClick={() => setExpandedSkill(isExpanded ? null : globalIdx)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 leading-relaxed">
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

                      {/* Expanded explanation */}
                      {isExpanded && skill.explanation && (
                        <div className="mt-3 ml-0 p-4 bg-[#f8f5ff] rounded-lg border border-[#ede7f6]">
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
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
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
