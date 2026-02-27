'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { SchoolEvaluation } from '@/lib/supabase'

// =============================================
// TOUR OBSERVATION QUESTIONNAIRE
// =============================================
const TOUR_SECTIONS = [
  {
    key: 'environment',
    title: 'The Environment',
    description: 'What you saw in the classroom spaces',
    questions: [
      { key: 'materials_accessible', label: 'Were materials on low, open shelves accessible to children?', type: 'rating' },
      { key: 'materials_organized', label: 'Were materials organized, complete, and in good condition?', type: 'rating' },
      { key: 'child_sized', label: 'Was furniture child-sized (tables, chairs, sinks)?', type: 'rating' },
      { key: 'beauty_order', label: 'Did the space feel beautiful, calm, and orderly?', type: 'rating' },
      { key: 'natural_materials', label: 'Were materials primarily natural (wood, glass, metal) rather than plastic?', type: 'rating' },
      { key: 'environment_notes', label: 'What stood out to you about the environment?', type: 'text' },
    ]
  },
  {
    key: 'children',
    title: 'The Children',
    description: 'What you observed about how children were engaged',
    questions: [
      { key: 'children_choosing', label: 'Were children freely choosing their own work?', type: 'rating' },
      { key: 'concentration', label: 'Did you see children deeply concentrated on activities?', type: 'rating' },
      { key: 'mixed_ages', label: 'Were there mixed ages in the classroom (3-year span)?', type: 'rating' },
      { key: 'independence', label: 'Were children working independently without constant adult direction?', type: 'rating' },
      { key: 'movement', label: 'Were children moving freely and purposefully?', type: 'rating' },
      { key: 'children_notes', label: 'What did you notice about the children?', type: 'text' },
    ]
  },
  {
    key: 'teachers',
    title: 'The Teachers',
    description: 'How adults interacted with children',
    questions: [
      { key: 'teacher_observing', label: 'Did teachers spend more time observing than directing?', type: 'rating' },
      { key: 'teacher_tone', label: 'Was the teacher\'s tone calm, respectful, and unhurried?', type: 'rating' },
      { key: 'individual_attention', label: 'Did you see one-on-one presentations with individual children?', type: 'rating' },
      { key: 'no_rewards_punishment', label: 'Was the classroom free of visible reward charts, sticker systems, or time-out chairs?', type: 'rating' },
      { key: 'grace_courtesy', label: 'Did adults model grace and courtesy in their interactions?', type: 'rating' },
      { key: 'teacher_notes', label: 'What was your impression of the teachers?', type: 'text' },
    ]
  },
  {
    key: 'curriculum',
    title: 'Curriculum & Schedule',
    description: 'Structure of the day and learning approach',
    questions: [
      { key: 'work_cycle', label: 'Is there an uninterrupted work cycle of at least 2-3 hours?', type: 'rating' },
      { key: 'all_areas', label: 'Did you see all Montessori curriculum areas (practical life, sensorial, language, math, cultural)?', type: 'rating' },
      { key: 'no_worksheets', label: 'Was learning hands-on rather than worksheet or screen based?', type: 'rating' },
      { key: 'outdoor_time', label: 'Is there daily outdoor time and connection to nature?', type: 'rating' },
      { key: 'curriculum_notes', label: 'Any observations about the curriculum or daily schedule?', type: 'text' },
    ]
  },
  {
    key: 'overall_feel',
    title: 'Overall Impression',
    description: 'Your gut feeling and general observations',
    questions: [
      { key: 'would_child_thrive', label: 'Can you picture your child thriving here?', type: 'rating' },
      { key: 'parent_welcomed', label: 'Did you feel welcomed and respected as a parent?', type: 'rating' },
      { key: 'authentic_feel', label: 'Did the school feel authentically Montessori (not just using the name)?', type: 'rating' },
      { key: 'overall_notes', label: 'What was your overall impression? Anything else noteworthy?', type: 'text' },
    ]
  },
]

const CREDENTIALS_INFO = [
  {
    abbrev: 'AMI',
    name: 'Association Montessori Internationale',
    description: 'Founded by Maria Montessori herself. The most rigorous and traditional Montessori training. AMI schools tend to follow Montessori methodology most closely.',
    strengths: 'Deep philosophical grounding, rigorous teacher training (typically 1-2 years full-time), strong emphasis on authentic materials and methods.',
    considerations: 'Can feel strict to parents used to conventional education. Less flexibility in adapting methods. Fewer accredited schools available.',
    rigor: 5,
  },
  {
    abbrev: 'AMS',
    name: 'American Montessori Society',
    description: 'The largest Montessori organization in the US. AMS training incorporates Montessori principles with some modern educational research and adaptations.',
    strengths: 'Broad availability, balanced approach, strong teacher support network, incorporates current child development research.',
    considerations: 'Quality can vary more between schools. Some traditionalists consider it less rigorous than AMI. Important to evaluate individual schools.',
    rigor: 4,
  },
  {
    abbrev: 'MACTE',
    name: 'Montessori Accreditation Council for Teacher Education',
    description: 'An accrediting body that evaluates Montessori teacher training programs. MACTE accreditation means the training program meets established standards.',
    strengths: 'Provides quality assurance for teacher training programs. Recognized by the US Department of Education.',
    considerations: 'MACTE accredits training programs, not individual schools. A MACTE-trained teacher is well-prepared, but school quality depends on many factors.',
    rigor: 4,
  },
  {
    abbrev: 'IMC',
    name: 'International Montessori Council',
    description: 'A newer accreditation body that evaluates schools (not just teacher training). Focuses on whole-school quality and authentic Montessori practice.',
    strengths: 'Holistic school evaluation, attention to both pedagogy and environment, growing recognition.',
    considerations: 'Less established than AMI or AMS. Smaller network of schools.',
    rigor: 3,
  },
  {
    abbrev: 'None',
    name: 'No Formal Credential',
    description: '"Montessori" is not a trademarked term — any school can use it. Schools without recognized credentials may or may not follow authentic Montessori practices.',
    strengths: 'Some unaffiliated schools have excellent Montessori-trained staff and authentic programs. Don\'t dismiss them automatically.',
    considerations: 'Without credential verification, the tour observation becomes especially important. Ask about individual teacher training backgrounds. Look closely at the environment and methodology.',
    rigor: 1,
  },
]

const RATING_LABELS = ['', 'Not observed', 'Concerning', 'Somewhat', 'Mostly yes', 'Clearly yes']

type ViewMode = 'list' | 'new_evaluation' | 'credentials' | 'view_debrief' | 'compare'

export default function SchoolsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [evaluations, setEvaluations] = useState<SchoolEvaluation[]>([])
  const [selectedEvaluation, setSelectedEvaluation] = useState<SchoolEvaluation | null>(null)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [comparisonResult, setComparisonResult] = useState<any>(null)
  const [parentId, setParentId] = useState<string | null>(null)

  // Tour form state
  const [schoolName, setSchoolName] = useState('')
  const [credentials, setCredentials] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [currentSection, setCurrentSection] = useState(0)
  const [observations, setObservations] = useState<Record<string, Record<string, any>>>({})
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [comparing, setComparing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
      if (!parent) return
      setParentId(parent.id)
      await loadEvaluations(parent.id)
    }
    load()
  }, [])

  const loadEvaluations = async (pid: string) => {
    const { data } = await supabase
      .from('school_evaluations')
      .select('*')
      .eq('parent_id', pid)
      .order('created_at', { ascending: false })
    setEvaluations(data || [])
  }

  const setRating = (sectionKey: string, questionKey: string, value: any) => {
    setObservations(prev => ({
      ...prev,
      [sectionKey]: { ...(prev[sectionKey] || {}), [questionKey]: value }
    }))
  }

  const getRating = (sectionKey: string, questionKey: string) => {
    return observations[sectionKey]?.[questionKey] || 0
  }

  const getText = (sectionKey: string, questionKey: string) => {
    return observations[sectionKey]?.[questionKey] || ''
  }

  const startNewEvaluation = () => {
    setSchoolName('')
    setCredentials('')
    setAgeRange('')
    setCurrentSection(0)
    setObservations({})
    setAdditionalNotes('')
    setViewMode('new_evaluation')
  }

  const submitEvaluation = async () => {
    if (!schoolName.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/school-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'debrief',
          schoolName: schoolName.trim(),
          credentials,
          ageRange,
          observations,
          additionalNotes: additionalNotes.trim(),
        }),
      })

      const data = await res.json()
      if (data.debrief && parentId) {
        await loadEvaluations(parentId)
        // Find the newly created evaluation and show it
        const { data: latest } = await supabase
          .from('school_evaluations')
          .select('*')
          .eq('parent_id', parentId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (latest) {
          setSelectedEvaluation(latest)
          setViewMode('view_debrief')
        }
      }
    } catch (error) {
      console.error('Evaluation submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompare = async () => {
    if (compareIds.length < 2) return
    setComparing(true)

    try {
      const res = await fetch('/api/school-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'compare', evaluationIds: compareIds }),
      })

      const data = await res.json()
      if (data.comparison) {
        setComparisonResult(data.comparison)
      }
    } catch (error) {
      console.error('Comparison error:', error)
    } finally {
      setComparing(false)
    }
  }

  const toggleCompare = (id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const alignmentColors: Record<string, string> = {
    strong: 'bg-green-100 text-green-700',
    moderate: 'bg-blue-100 text-blue-700',
    mixed: 'bg-yellow-100 text-yellow-700',
    concerning: 'bg-red-100 text-red-700',
  }

  const section = TOUR_SECTIONS[currentSection]

  return (
    <div className="max-w-3xl pb-20 sm:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy-600">School Evaluation</h1>
          <p className="text-sm text-gray-500 mt-0.5">Evaluate, compare, and choose with confidence</p>
        </div>
        {viewMode !== 'new_evaluation' && (
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('credentials')}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                viewMode === 'credentials' ? 'bg-navy-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Credentials Guide
            </button>
            <button
              onClick={startNewEvaluation}
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition"
            >
              + New Tour
            </button>
          </div>
        )}
      </div>

      {/* =============================================
           CREDENTIAL EXPLAINER
      ============================================= */}
      {viewMode === 'credentials' && (
        <div>
          <button onClick={() => setViewMode('list')} className="text-sm text-teal-500 hover:text-teal-600 mb-4 inline-block">
            ← Back to evaluations
          </button>

          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
            <h2 className="font-semibold text-navy-600 mb-1">Understanding Montessori Credentials</h2>
            <p className="text-sm text-gray-500 mb-4">
              Not all Montessori schools are created equal. Here&apos;s what the major credentials mean and how to evaluate them.
            </p>
          </div>

          <div className="space-y-3">
            {CREDENTIALS_INFO.map(cred => (
              <div key={cred.abbrev} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-navy-600">{cred.abbrev}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i <= cred.rigor ? 'bg-teal-500' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{cred.name}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{cred.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-xs font-semibold text-green-700 mb-1">Strengths</div>
                    <p className="text-xs text-green-800 leading-relaxed">{cred.strengths}</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="text-xs font-semibold text-amber-700 mb-1">Considerations</div>
                    <p className="text-xs text-amber-800 leading-relaxed">{cred.considerations}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =============================================
           EVALUATION LIST
      ============================================= */}
      {viewMode === 'list' && (
        <div>
          {/* Compare mode */}
          {evaluations.length >= 2 && (
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                {compareIds.length > 0
                  ? `${compareIds.length} selected for comparison`
                  : 'Select schools to compare'
                }
              </span>
              {compareIds.length >= 2 && (
                <button
                  onClick={handleCompare}
                  disabled={comparing}
                  className="px-3 py-1.5 bg-navy-600 hover:bg-navy-700 text-white text-sm rounded-lg transition disabled:opacity-40"
                >
                  {comparing ? 'Comparing...' : 'Compare Selected'}
                </button>
              )}
            </div>
          )}

          {/* Comparison result */}
          {comparisonResult && (
            <div className="bg-white border border-navy-200 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-navy-600">School Comparison</h3>
                <button onClick={() => { setComparisonResult(null); setCompareIds([]) }} className="text-xs text-gray-400 hover:text-gray-600">
                  Close
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-4">{comparisonResult.comparison_summary}</p>

              {comparisonResult.categories && comparisonResult.categories.map((cat: any, i: number) => (
                <div key={i} className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{cat.category}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.schools?.map((s: any, si: number) => {
                      const ratingColors: Record<string, string> = {
                        strong: 'border-green-200 bg-green-50',
                        good: 'border-blue-200 bg-blue-50',
                        mixed: 'border-yellow-200 bg-yellow-50',
                        weak: 'border-red-200 bg-red-50',
                      }
                      return (
                        <div key={si} className={`p-2 rounded-lg border ${ratingColors[s.rating] || 'border-gray-200'}`}>
                          <div className="text-xs font-medium text-navy-600">{s.name}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{s.note}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {comparisonResult.recommendation && (
                <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                  <div className="text-xs font-semibold text-teal-700 mb-1">Recommendation</div>
                  <p className="text-sm text-teal-800">{comparisonResult.recommendation}</p>
                </div>
              )}
            </div>
          )}

          {/* Evaluation cards */}
          <div className="space-y-2">
            {evaluations.map(ev => {
              const debrief = ev.ai_debrief as any
              return (
                <div key={ev.id} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    {evaluations.length >= 2 && (
                      <button
                        onClick={() => toggleCompare(ev.id)}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center text-xs shrink-0 ${
                          compareIds.includes(ev.id) ? 'bg-navy-600 border-navy-600 text-white' : 'border-gray-300'
                        }`}
                      >
                        {compareIds.includes(ev.id) && '✓'}
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedEvaluation(ev); setViewMode('view_debrief') }}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-navy-600">{ev.school_name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {ev.credentials && <span>{ev.credentials} · </span>}
                            {ev.visit_date
                              ? new Date(ev.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : new Date(ev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            }
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {debrief?.overall_alignment && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${alignmentColors[debrief.overall_alignment] || 'bg-gray-100 text-gray-600'}`}>
                              {debrief.overall_alignment}
                            </span>
                          )}
                          {debrief?.overall_score && (
                            <span className="text-sm font-bold text-navy-600">{debrief.overall_score}/10</span>
                          )}
                          <span className="text-gray-300">→</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )
            })}
            {evaluations.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🏫</div>
                <h3 className="text-lg font-semibold text-navy-600 mb-1">No evaluations yet</h3>
                <p className="text-sm text-gray-500 mb-4">Tour a school, then come here to record and analyze your observations</p>
                <div className="flex justify-center gap-3">
                  <button onClick={startNewEvaluation} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition">
                    Record a Tour
                  </button>
                  <button onClick={() => setViewMode('credentials')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition">
                    Learn About Credentials
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================
           NEW EVALUATION FORM
      ============================================= */}
      {viewMode === 'new_evaluation' && (
        <div>
          <button onClick={() => setViewMode('list')} className="text-sm text-teal-500 hover:text-teal-600 mb-4 inline-block">
            ← Back
          </button>

          {/* School info header (always visible) */}
          {currentSection === 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
              <h2 className="font-semibold text-navy-600 mb-4">School Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    placeholder="Name of the school you visited"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credentials</label>
                    <select
                      value={credentials}
                      onChange={e => setCredentials(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select or unsure</option>
                      <option value="AMI">AMI</option>
                      <option value="AMS">AMS</option>
                      <option value="MACTE">MACTE-trained staff</option>
                      <option value="IMC">IMC</option>
                      <option value="Multiple">Multiple credentials</option>
                      <option value="None">No formal credential</option>
                      <option value="Unknown">I don&apos;t know</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age range</label>
                    <select
                      value={ageRange}
                      onChange={e => setAgeRange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select</option>
                      <option value="0-3">Infant/Toddler (0-3)</option>
                      <option value="3-6">Primary/Early Childhood (3-6)</option>
                      <option value="6-9">Lower Elementary (6-9)</option>
                      <option value="6-12">Elementary (6-12)</option>
                      <option value="0-6">Infant through Primary (0-6)</option>
                      <option value="0-12">Full program (0-12)</option>
                      <option value="0-18">Full program with adolescent</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { if (schoolName.trim()) setCurrentSection(1) }}
                disabled={!schoolName.trim()}
                className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-40"
              >
                Start Tour Evaluation
              </button>
            </div>
          )}

          {/* Tour observation sections */}
          {currentSection > 0 && currentSection <= TOUR_SECTIONS.length && (
            <div>
              {/* Progress */}
              <div className="flex items-center gap-1 mb-4">
                {TOUR_SECTIONS.map((s, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium ${
                      i + 1 < currentSection ? 'bg-teal-100 text-teal-600' :
                      i + 1 === currentSection ? 'bg-teal-500 text-white' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {i + 1 < currentSection ? '✓' : i + 1}
                    </div>
                    {i < TOUR_SECTIONS.length - 1 && (
                      <div className={`w-4 h-0.5 ${i + 1 < currentSection ? 'bg-teal-300' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="mb-4">
                  <h2 className="font-semibold text-navy-600">{section.title}</h2>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>

                <div className="space-y-4">
                  {section.questions.map(q => (
                    <div key={q.key}>
                      <label className="block text-sm text-gray-700 mb-2">{q.label}</label>
                      {q.type === 'rating' ? (
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(r => (
                            <button
                              key={r}
                              onClick={() => setRating(section.key, q.key, r)}
                              className={`flex-1 py-2 text-xs rounded-lg border transition ${
                                getRating(section.key, q.key) === r
                                  ? 'bg-teal-500 border-teal-500 text-white'
                                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              {RATING_LABELS[r]}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={getText(section.key, q.key)}
                          onChange={e => setRating(section.key, q.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                          rows={2}
                          placeholder="Your observations..."
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentSection(prev => prev - 1)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Back
                  </button>
                  {currentSection < TOUR_SECTIONS.length ? (
                    <button
                      onClick={() => setCurrentSection(prev => prev + 1)}
                      className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition"
                    >
                      Next Section
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentSection(TOUR_SECTIONS.length + 1)}
                      className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition"
                    >
                      Review & Submit
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Final review / submit */}
          {currentSection > TOUR_SECTIONS.length && (
            <div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
                <h2 className="font-semibold text-navy-600 mb-1">Almost done</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Add any additional thoughts, then submit for your AI debrief analysis.
                </p>

                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="text-sm font-medium text-navy-600">{schoolName}</div>
                  <div className="text-xs text-gray-500">
                    {credentials && <span>{credentials} · </span>}
                    {ageRange && <span>{ageRange} · </span>}
                    {Object.keys(observations).length} sections completed
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anything else? (optional)</label>
                  <textarea
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    rows={3}
                    placeholder="Any other thoughts, questions, or things you noticed..."
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentSection(TOUR_SECTIONS.length)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={submitEvaluation}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition disabled:opacity-50"
                  >
                    {submitting ? 'Analyzing your tour...' : 'Get AI Debrief'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =============================================
           VIEW DEBRIEF
      ============================================= */}
      {viewMode === 'view_debrief' && selectedEvaluation && (() => {
        const debrief = selectedEvaluation.ai_debrief as any
        if (!debrief) return (
          <div className="text-center py-12 text-gray-500">No analysis available for this evaluation.</div>
        )

        return (
          <div>
            <button onClick={() => { setViewMode('list'); setSelectedEvaluation(null) }} className="text-sm text-teal-500 hover:text-teal-600 mb-4 inline-block">
              ← Back to evaluations
            </button>

            {/* School header */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-navy-600">{selectedEvaluation.school_name}</h2>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {selectedEvaluation.credentials && <span>{selectedEvaluation.credentials} · </span>}
                    {selectedEvaluation.age_range}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-navy-600">{debrief.overall_score}<span className="text-lg text-gray-400">/10</span></div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${alignmentColors[debrief.overall_alignment] || 'bg-gray-100'}`}>
                    {debrief.overall_alignment} alignment
                  </span>
                </div>
              </div>
              {debrief.summary && (
                <p className="text-sm text-gray-700 mt-3 leading-relaxed">{debrief.summary}</p>
              )}
            </div>

            {/* Green flags / Red flags */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {debrief.green_flags && debrief.green_flags.length > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Green Flags</div>
                  <div className="space-y-1.5">
                    {debrief.green_flags.map((f: string, i: number) => (
                      <div key={i} className="text-sm text-green-800 flex gap-1.5">
                        <span className="shrink-0">✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {debrief.red_flags && debrief.red_flags.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Red Flags</div>
                  <div className="space-y-1.5">
                    {debrief.red_flags.map((f: string, i: number) => (
                      <div key={i} className="text-sm text-red-800 flex gap-1.5">
                        <span className="shrink-0">⚠</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Strengths */}
            {debrief.strengths && debrief.strengths.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
                <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-3">Strengths</h3>
                <div className="space-y-3">
                  {debrief.strengths.map((s: any, i: number) => (
                    <div key={i}>
                      <div className="text-sm font-medium text-navy-600">{s.area}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{s.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Concerns */}
            {debrief.concerns && debrief.concerns.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
                <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-3">Areas of Concern</h3>
                <div className="space-y-3">
                  {debrief.concerns.map((c: any, i: number) => {
                    const severityColors: Record<string, string> = {
                      minor: 'bg-yellow-100 text-yellow-700',
                      moderate: 'bg-orange-100 text-orange-700',
                      significant: 'bg-red-100 text-red-700',
                    }
                    return (
                      <div key={i}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-navy-600">{c.area}</span>
                          {c.severity && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${severityColors[c.severity] || ''}`}>
                              {c.severity}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">{c.detail}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Questions to ask */}
            {debrief.questions_to_ask && debrief.questions_to_ask.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
                <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-3">Questions to Ask</h3>
                <div className="space-y-3">
                  {debrief.questions_to_ask.map((q: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-navy-600">&ldquo;{q.question}&rdquo;</div>
                      <div className="text-xs text-gray-500 mt-1">Why: {q.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Credential analysis */}
            {debrief.credential_analysis && (
              <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
                <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-3">Credential Analysis</h3>
                <div className="space-y-2">
                  <div><span className="text-xs text-gray-500">Credential:</span> <span className="text-sm text-navy-600 font-medium">{debrief.credential_analysis.credential}</span></div>
                  <div><span className="text-xs text-gray-500">What it means:</span> <span className="text-sm text-gray-700">{debrief.credential_analysis.meaning}</span></div>
                  <div><span className="text-xs text-gray-500">Keep in mind:</span> <span className="text-sm text-gray-700">{debrief.credential_analysis.considerations}</span></div>
                </div>
              </div>
            )}

            {/* Recommendation */}
            {debrief.recommendation && (
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-teal-700 uppercase tracking-wide mb-2">Recommendation</h3>
                <p className="text-sm text-teal-800 leading-relaxed">{debrief.recommendation}</p>
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
