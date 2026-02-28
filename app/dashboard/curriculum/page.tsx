'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getAllAreas, getStrandsByArea, getSkillsByArea } from '@/lib/scope-sequence'

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

export default function CurriculumPage() {
  const [search, setSearch] = useState('')

  const filteredAreas = search
    ? AREAS.filter(a =>
        a.label.toLowerCase().includes(search.toLowerCase()) ||
        AREA_DESCRIPTIONS[a.key]?.toLowerCase().includes(search.toLowerCase()) ||
        getStrandsByArea(a.key).some(s => s.toLowerCase().includes(search.toLowerCase()))
      )
    : AREAS

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-600">Curriculum Guide</h1>
        <p className="text-gray-500 text-sm mt-1">
          2,566 skills across 10 curriculum areas — from the Montessori Foundation&apos;s official Scope &amp; Sequence
        </p>
      </div>

      {/* Info card */}
      <div className="bg-gradient-to-br from-[#f8f5ff] to-white border border-[#ede7f6] rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-[#4a2c82] mb-2">How to Use This Guide</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Browse each curriculum area to see the specific skills your child will develop at each age. Each skill includes a <strong>parent-friendly explanation</strong> of what it means and why it matters. Use this to understand what to look for when observing your child and to track their progress in the Milestones section.
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
