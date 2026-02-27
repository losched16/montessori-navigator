'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Child, LearningPlan } from '@/lib/supabase'
import { getCurriculumAreaLabel, formatAge } from '@/lib/utils'

const CURRICULUM_AREAS = [
  'practical_life', 'sensorial', 'language', 'mathematics',
  'cultural_studies', 'social_emotional', 'executive_function',
]

const PLAN_TYPES = [
  { value: 'daily', label: 'Daily Plan', desc: '3-5 activities for today' },
  { value: 'weekly', label: 'Weekly Plan', desc: '5 days of structured activities' },
  { value: 'focus', label: 'Focus Plan', desc: 'Deep dive into one area' },
  { value: 'catchup', label: 'Catch-up Plan', desc: 'Build foundational skills' },
]

export default function PlansPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [plans, setPlans] = useState<LearningPlan[]>([])
  const [viewingPlan, setViewingPlan] = useState<LearningPlan | null>(null)

  // Generator form
  const [showGenerator, setShowGenerator] = useState(false)
  const [planType, setPlanType] = useState('daily')
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [constraints, setConstraints] = useState('')
  const [generating, setGenerating] = useState(false)

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
    const loadPlans = async () => {
      const { data } = await supabase
        .from('learning_plans')
        .select('*')
        .eq('child_id', selectedChildId)
        .order('created_at', { ascending: false })
        .limit(20)
      setPlans(data || [])
    }
    loadPlans()
  }, [selectedChildId])

  const selectedChild = children.find(c => c.id === selectedChildId)

  const toggleFocus = (area: string) => {
    setFocusAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    )
  }

  const handleGenerate = async () => {
    if (!selectedChildId || focusAreas.length === 0) return
    setGenerating(true)

    try {
      const res = await fetch('/api/learning-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: selectedChildId,
          planType,
          focusAreas,
          constraints: constraints.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (data.plan) {
        // Reload plans
        const { data: updated } = await supabase
          .from('learning_plans')
          .select('*')
          .eq('child_id', selectedChildId)
          .order('created_at', { ascending: false })
          .limit(20)
        setPlans(updated || [])
        setShowGenerator(false)
        setFocusAreas([])
        setConstraints('')

        // View the new plan
        if (updated && updated.length > 0) {
          setViewingPlan(updated[0])
        }
      }
    } catch (error) {
      console.error('Failed to generate plan:', error)
    } finally {
      setGenerating(false)
    }
  }

  const renderPlanContent = (plan: LearningPlan) => {
    const content = plan.content
    if (!content) return null

    // Weekly plan
    if (content.days) {
      return (
        <div className="space-y-6">
          {content.summary && <p className="text-sm text-gray-600 italic">{content.summary}</p>}
          {content.days.map((day: any, di: number) => (
            <div key={di}>
              <h4 className="font-medium text-navy-600 mb-2">
                Day {day.day}{day.theme ? `: ${day.theme}` : ''}
              </h4>
              <div className="space-y-3">
                {(day.activities || []).map((activity: any, ai: number) => renderActivity(activity, ai))}
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Daily/focus/catchup plan
    if (content.activities) {
      return (
        <div className="space-y-4">
          {content.summary && <p className="text-sm text-gray-600 italic">{content.summary}</p>}
          {content.activities.map((activity: any, i: number) => renderActivity(activity, i))}
        </div>
      )
    }

    return <p className="text-sm text-gray-500">Plan content not available</p>
  }

  const renderActivity = (activity: any, index: number) => (
    <div key={index} className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h5 className="font-medium text-navy-600 text-sm">{activity.name}</h5>
        {activity.estimated_minutes && (
          <span className="text-xs text-gray-400 whitespace-nowrap">{activity.estimated_minutes} min</span>
        )}
      </div>
      {activity.curriculum_area && (
        <span className="inline-block text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full mb-2">
          {getCurriculumAreaLabel(activity.curriculum_area)}
        </span>
      )}
      {activity.materials && activity.materials.length > 0 && (
        <div className="text-xs text-gray-500 mb-2">
          <span className="font-medium">Materials:</span> {activity.materials.join(', ')}
          {activity.materials_available === false && (
            <span className="text-warm-600 ml-1">(may need to acquire)</span>
          )}
        </div>
      )}
      {activity.presentation_steps && activity.presentation_steps.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-medium text-gray-500 mb-1">Presentation:</div>
          <ol className="text-xs text-gray-600 space-y-0.5 ml-4 list-decimal">
            {activity.presentation_steps.map((step: string, si: number) => (
              <li key={si}>{step}</li>
            ))}
          </ol>
        </div>
      )}
      {activity.observe_for && (
        <div className="text-xs text-sage-600 mt-1">
          <span className="font-medium">Observe for:</span> {activity.observe_for}
        </div>
      )}
      {activity.extensions && (
        <div className="text-xs text-teal-600 mt-1">
          <span className="font-medium">Extension:</span> {activity.extensions}
        </div>
      )}
      {activity.notes && (
        <div className="text-xs text-gray-500 mt-1 italic">{activity.notes}</div>
      )}
    </div>
  )

  return (
    <div className="max-w-3xl pb-20 sm:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-navy-600">Learning Plans</h1>
        <button
          onClick={() => { setShowGenerator(true); setViewingPlan(null) }}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition"
        >
          + Generate Plan
        </button>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-1 mb-6">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => { setSelectedChildId(child.id); setViewingPlan(null) }}
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

      {/* Generator */}
      {showGenerator && (
        <div className="bg-white border border-teal-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-navy-600 mb-1">Generate a Learning Plan</h3>
          <p className="text-sm text-gray-500 mb-4">
            for {selectedChild?.name} · {selectedChild ? formatAge(selectedChild.date_of_birth) : ''}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
              <div className="grid grid-cols-2 gap-2">
                {PLAN_TYPES.map(pt => (
                  <button
                    key={pt.value}
                    onClick={() => setPlanType(pt.value)}
                    className={`text-left p-3 rounded-lg border text-sm transition ${
                      planType === pt.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-navy-600">{pt.label}</div>
                    <div className="text-xs text-gray-500">{pt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Focus Areas (select 1-3)</label>
              <div className="flex flex-wrap gap-2">
                {CURRICULUM_AREAS.map(area => (
                  <button
                    key={area}
                    onClick={() => toggleFocus(area)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition ${
                      focusAreas.includes(area)
                        ? 'border-teal-500 bg-teal-50 text-teal-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {getCurriculumAreaLabel(area)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Constraints (optional)</label>
              <input
                type="text"
                value={constraints}
                onChange={e => setConstraints(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                placeholder='e.g., "only 30 minutes today", "no messy activities", "rainy day"'
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowGenerator(false)}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={focusAreas.length === 0 || generating}
                className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-40"
              >
                {generating ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing a plan */}
      {viewingPlan && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-navy-600">{viewingPlan.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {viewingPlan.plan_type} plan · Created {new Date(viewingPlan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => setViewingPlan(null)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
          {renderPlanContent(viewingPlan)}
        </div>
      )}

      {/* Plan list */}
      {!viewingPlan && (
        <div className="space-y-2">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setViewingPlan(plan)}
              className="w-full text-left p-4 bg-white border border-gray-100 rounded-xl hover:border-teal-200 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-navy-600 text-sm">{plan.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {plan.plan_type} · {new Date(plan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {plan.focus_areas && plan.focus_areas.length > 0 && (
                      <span> · {plan.focus_areas.map(a => getCurriculumAreaLabel(a as string)).join(', ')}</span>
                    )}
                  </div>
                </div>
                <span className="text-gray-300">→</span>
              </div>
            </button>
          ))}
          {plans.length === 0 && !showGenerator && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No learning plans yet. Generate your first one above.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
