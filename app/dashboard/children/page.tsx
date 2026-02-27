'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Child, ChildDevelopmentLevel, Observation } from '@/lib/supabase'
import { formatAge, getAgePlane, getAgePlaneLabel, getDevelopmentLevelLabel, getCurriculumAreaLabel, getObservationTypeLabel } from '@/lib/utils'

const CURRICULUM_AREAS = [
  'practical_life', 'sensorial', 'language', 'mathematics',
  'cultural_studies', 'social_emotional', 'executive_function',
  'gross_motor', 'fine_motor', 'art_music'
]

const OBSERVATION_TYPES = [
  { value: 'home_activity', label: 'Home Activity' },
  { value: 'school_observation', label: 'School Observation' },
  { value: 'milestone_reached', label: 'Milestone Reached' },
  { value: 'challenge_noted', label: 'Challenge Noted' },
  { value: 'interest_spark', label: 'Interest Spark' },
  { value: 'conference_notes', label: 'Conference Notes' },
  { value: 'general', label: 'General Note' },
]

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [devLevels, setDevLevels] = useState<ChildDevelopmentLevel[]>([])
  const [observations, setObservations] = useState<Observation[]>([])
  const [parentId, setParentId] = useState<string | null>(null)

  // Observation form
  const [showObsForm, setShowObsForm] = useState(false)
  const [obsType, setObsType] = useState('home_activity')
  const [obsArea, setObsArea] = useState('general')
  const [obsDescription, setObsDescription] = useState('')
  const [obsWentWell, setObsWentWell] = useState('')
  const [obsNeedsSupport, setObsNeedsSupport] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
      if (!parent) return
      setParentId(parent.id)

      const { data: kids } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parent.id)
        .order('created_at')

      if (kids && kids.length > 0) {
        setChildren(kids)
        setSelectedChildId(kids[0].id)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedChildId) return
    const loadChild = async () => {
      const [levels, obs] = await Promise.all([
        supabase.from('child_development_levels').select('*').eq('child_id', selectedChildId),
        supabase.from('observations').select('*').eq('child_id', selectedChildId).order('date', { ascending: false }).limit(20),
      ])
      setDevLevels(levels.data || [])
      setObservations(obs.data || [])
    }
    loadChild()
  }, [selectedChildId])

  const selectedChild = children.find(c => c.id === selectedChildId)

  const updateLevel = async (area: string, level: number) => {
    if (!selectedChildId) return
    await supabase.from('child_development_levels').upsert({
      child_id: selectedChildId,
      area,
      level,
    })
    setDevLevels(prev => prev.map(d => d.area === area ? { ...d, level } : d))
  }

  const saveObservation = async () => {
    if (!selectedChildId || !parentId || !obsDescription.trim()) return
    setSaving(true)

    await supabase.from('observations').insert({
      child_id: selectedChildId,
      parent_id: parentId,
      type: obsType,
      curriculum_area: obsArea,
      description: obsDescription.trim(),
      went_well: obsWentWell.trim() || null,
      needs_support: obsNeedsSupport.trim() || null,
    })

    // Reload observations
    const { data } = await supabase
      .from('observations')
      .select('*')
      .eq('child_id', selectedChildId)
      .order('date', { ascending: false })
      .limit(20)

    setObservations(data || [])
    setShowObsForm(false)
    setObsDescription('')
    setObsWentWell('')
    setObsNeedsSupport('')
    setSaving(false)
  }

  const levelColors = ['', 'bg-gray-200', 'bg-warm-300', 'bg-sage-400', 'bg-teal-400', 'bg-teal-600']

  return (
    <div className="max-w-3xl pb-20 sm:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-navy-600">Children</h1>
        {children.length > 1 && (
          <div className="flex gap-1">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  selectedChildId === child.id
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedChild && (
        <>
          {/* Child header */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-navy-600">{selectedChild.name}</h2>
                <p className="text-sm text-gray-500">
                  {formatAge(selectedChild.date_of_birth)} · {getAgePlaneLabel(getAgePlane(selectedChild.date_of_birth))}
                  {selectedChild.current_environment && (
                    <span> · {selectedChild.current_environment.replace(/_/g, ' ')}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Development levels */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Development Overview</h3>
            <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
              {CURRICULUM_AREAS.map(area => {
                const level = devLevels.find(d => d.area === area)?.level || 0
                return (
                  <div key={area} className="flex items-center justify-between p-3">
                    <span className="text-sm text-navy-600 font-medium">{getCurriculumAreaLabel(area)}</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(l => (
                        <button
                          key={l}
                          onClick={() => updateLevel(area, l)}
                          title={getDevelopmentLevelLabel(l)}
                          className={`w-7 h-7 rounded-full text-xs font-medium transition ${
                            l <= level
                              ? `${levelColors[l]} text-white`
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                      <span className="text-xs text-gray-400 ml-2 w-20 hidden sm:inline">
                        {getDevelopmentLevelLabel(level)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              1 = Emerging · 2 = Developing · 3 = Practicing · 4 = Proficient · 5 = Mastered
            </p>
          </div>

          {/* Observations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Observations</h3>
              <button
                onClick={() => setShowObsForm(true)}
                className="text-sm text-teal-500 hover:text-teal-600 font-medium"
              >
                + Add Observation
              </button>
            </div>

            {/* Observation form */}
            {showObsForm && (
              <div className="bg-white border border-teal-200 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <select
                      value={obsType}
                      onChange={e => setObsType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    >
                      {OBSERVATION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Curriculum Area</label>
                    <select
                      value={obsArea}
                      onChange={e => setObsArea(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    >
                      <option value="general">General</option>
                      {CURRICULUM_AREAS.map(a => (
                        <option key={a} value={a}>{getCurriculumAreaLabel(a)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">What did you observe?</label>
                  <textarea
                    value={obsDescription}
                    onChange={e => setObsDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    rows={3}
                    placeholder="Describe what you noticed..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">What went well? (optional)</label>
                    <input
                      type="text"
                      value={obsWentWell}
                      onChange={e => setObsWentWell(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      placeholder="Strengths, progress..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Needs support? (optional)</label>
                    <input
                      type="text"
                      value={obsNeedsSupport}
                      onChange={e => setObsNeedsSupport(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      placeholder="Challenges, areas to watch..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowObsForm(false)}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveObservation}
                    disabled={!obsDescription.trim() || saving}
                    className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg transition disabled:opacity-40"
                  >
                    {saving ? 'Saving...' : 'Save Observation'}
                  </button>
                </div>
              </div>
            )}

            {/* Observation list */}
            <div className="space-y-2">
              {observations.map(obs => (
                <div key={obs.id} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        {getObservationTypeLabel(obs.type)}
                      </span>
                      {obs.curriculum_area && obs.curriculum_area !== 'general' && (
                        <span className="text-xs text-gray-400">
                          {getCurriculumAreaLabel(obs.curriculum_area)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(obs.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{obs.description}</p>
                  {(obs.went_well || obs.needs_support) && (
                    <div className="mt-2 flex gap-4 text-xs">
                      {obs.went_well && (
                        <span className="text-sage-600">✓ {obs.went_well}</span>
                      )}
                      {obs.needs_support && (
                        <span className="text-warm-600">△ {obs.needs_support}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {observations.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No observations yet. Start by adding one above.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
