'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Child } from '@/lib/supabase'
import { formatAge, getAgePlane, getAgePlaneLabel, getCurriculumAreaLabel } from '@/lib/utils'

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
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [filterArea, setFilterArea] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)

  const supabase = createClient()

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

  useEffect(() => {
    if (!selectedChildId) return
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

  const selectedChild = children.find(c => c.id === selectedChildId)

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
  const progressPct = totalMilestones > 0 ? Math.round((achievedCount / totalMilestones) * 100) : 0

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

  return (
    <div className="max-w-3xl pb-20 sm:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy-600">Milestones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track developmental achievements</p>
        </div>
        {children.length > 1 && (
          <div className="flex gap-1">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => { setSelectedChildId(child.id); setFilterArea('all') }}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  selectedChildId === child.id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading milestones...</div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">⭐</div>
          <h3 className="text-lg font-semibold text-navy-600 mb-2">Set Up Milestones</h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Load age-appropriate Montessori milestones for {selectedChild?.name || 'your child'} to start tracking developmental progress.
          </p>
          <button
            onClick={initializeMilestones}
            disabled={initializing}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {initializing ? 'Loading milestones...' : 'Load Milestones'}
          </button>
        </div>
      ) : (
        <>
          {/* Progress overview */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-navy-600">{achievedCount}<span className="text-gray-300 text-lg">/{totalMilestones}</span></div>
                <div className="text-xs text-gray-400">milestones achieved</div>
              </div>

              {/* Progress ring */}
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="3"
                    strokeDasharray={`${progressPct} ${100 - progressPct}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-teal-600">{progressPct}%</span>
                </div>
              </div>
            </div>

            {/* Per-area mini bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {areaProgress.map(ap => (
                <button
                  key={ap.area}
                  onClick={() => setFilterArea(filterArea === ap.area ? 'all' : ap.area)}
                  className={`p-2 rounded-lg text-center transition ${
                    filterArea === ap.area ? 'bg-teal-50 ring-1 ring-teal-300' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xs text-gray-500 truncate mb-1">{getCurriculumAreaLabel(ap.area)}</div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full" style={{ width: `${ap.pct}%` }} />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{ap.achieved}/{ap.total}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filter label */}
          {filterArea !== 'all' && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-teal-600 font-medium">Showing: {getCurriculumAreaLabel(filterArea)}</span>
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
                      m.achieved ? 'bg-teal-500 border-teal-500' : 'border-gray-300'
                    }`}>
                      {m.achieved && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-medium transition ${m.achieved ? 'text-teal-600' : 'text-navy-600'}`}>
                        {m.milestone_name}
                      </div>
                      {m.description && (
                        <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{m.description}</div>
                      )}
                      {m.achieved && m.achieved_date && (
                        <div className="text-xs text-teal-500 mt-0.5">
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
