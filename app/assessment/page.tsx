'use client'

import { useState } from 'react'
import Link from 'next/link'

// =============================================
// ASSESSMENT QUESTIONS
// =============================================

const SECTIONS = [
  {
    key: 'child_info',
    title: 'About Your Child',
    description: 'Help us understand where your child is right now',
    questions: [
      {
        key: 'child_name',
        label: "What's your child's first name?",
        type: 'text',
        placeholder: 'First name',
      },
      {
        key: 'child_age',
        label: 'How old is your child?',
        type: 'select',
        options: [
          { value: '0-12 months', label: 'Under 1 year' },
          { value: '12-18 months', label: '12–18 months' },
          { value: '18-24 months', label: '18–24 months' },
          { value: '2 years', label: '2 years old' },
          { value: '3 years', label: '3 years old' },
          { value: '4 years', label: '4 years old' },
          { value: '5 years', label: '5 years old' },
          { value: '6-9 years', label: '6–9 years old' },
          { value: '9-12 years', label: '9–12 years old' },
          { value: '12+ years', label: '12+ years old' },
        ],
      },
      {
        key: 'current_setting',
        label: 'Where does your child currently spend their days?',
        type: 'select',
        options: [
          { value: 'home_with_parent', label: 'Home with a parent/caregiver' },
          { value: 'daycare', label: 'Daycare or preschool' },
          { value: 'montessori_school', label: 'A Montessori school' },
          { value: 'traditional_school', label: 'A traditional/public school' },
          { value: 'homeschool', label: 'Homeschooled' },
        ],
      },
    ],
  },
  {
    key: 'child_temperament',
    title: 'Your Child\'s Nature',
    description: 'There are no right or wrong answers — every child is different',
    questions: [
      {
        key: 'independence_level',
        label: 'How does your child handle doing things independently?',
        type: 'choices',
        options: [
          { value: 'seeks_independence', label: 'Wants to do everything themselves — even when it takes longer' },
          { value: 'growing', label: 'Enjoys some independence but still looks to adults for direction' },
          { value: 'prefers_help', label: 'Usually prefers help or watches before trying' },
          { value: 'varies', label: 'It depends on the activity and their mood' },
        ],
      },
      {
        key: 'concentration',
        label: 'When your child is interested in something, how long do they typically focus?',
        type: 'choices',
        options: [
          { value: 'deep_focus', label: 'Can be absorbed for 20+ minutes — hard to interrupt' },
          { value: 'moderate', label: 'Focuses well for 5–15 minutes on things they like' },
          { value: 'short', label: 'Tends to move between activities quickly' },
          { value: 'context_dependent', label: 'Depends entirely on what it is' },
        ],
      },
      {
        key: 'order_preference',
        label: 'Does your child notice or care about order and routine?',
        type: 'choices',
        options: [
          { value: 'loves_order', label: 'Very much — gets upset when things are out of place or routine changes' },
          { value: 'some_order', label: 'Likes some routine but is flexible' },
          { value: 'flexible', label: 'Not particularly — goes with the flow' },
          { value: 'resists_structure', label: 'Actively resists structure and routine' },
        ],
      },
      {
        key: 'social_style',
        label: 'How does your child interact with other children?',
        type: 'choices',
        options: [
          { value: 'social_leader', label: 'Outgoing — often leads or initiates play' },
          { value: 'cooperative', label: 'Enjoys playing with others and cooperates well' },
          { value: 'observer', label: 'Tends to watch first, then joins when comfortable' },
          { value: 'independent_player', label: 'Prefers to play alone most of the time' },
        ],
      },
    ],
  },
  {
    key: 'family_values',
    title: 'Your Family\'s Values',
    description: 'What matters to you as a parent',
    questions: [
      {
        key: 'education_priority',
        label: 'What matters most to you in your child\'s education?',
        type: 'choices',
        options: [
          { value: 'independence_confidence', label: 'Independence and self-confidence' },
          { value: 'academic_excellence', label: 'Strong academic foundations' },
          { value: 'social_emotional', label: 'Social skills and emotional intelligence' },
          { value: 'creativity', label: 'Creativity and self-expression' },
          { value: 'all_balanced', label: 'A balance of all of these' },
        ],
      },
      {
        key: 'discipline_approach',
        label: 'How do you typically handle discipline at home?',
        type: 'choices',
        options: [
          { value: 'natural_consequences', label: 'Natural consequences and conversation' },
          { value: 'positive_discipline', label: 'Redirection, choices, and positive reinforcement' },
          { value: 'traditional', label: 'Clear rules with rewards and time-outs' },
          { value: 'still_figuring_out', label: "We're still figuring out what works" },
        ],
      },
      {
        key: 'screen_time',
        label: 'What role does screen time play in your home?',
        type: 'choices',
        options: [
          { value: 'minimal', label: 'Very limited — we prioritize hands-on activities' },
          { value: 'moderate', label: 'Moderate — some TV/tablet but we balance it' },
          { value: 'regular', label: 'Regular part of our day — educational shows and apps' },
          { value: 'working_on_reducing', label: "More than we'd like — working on reducing it" },
        ],
      },
      {
        key: 'involvement_willingness',
        label: 'How involved are you willing to be in your child\'s education?',
        type: 'choices',
        options: [
          { value: 'very_involved', label: 'Very — I want to actively participate and learn alongside them' },
          { value: 'supportive', label: "Supportive — I'll follow the school's lead and reinforce at home" },
          { value: 'trust_experts', label: "I trust the experts — I'd rather the school handle education" },
          { value: 'limited_time', label: 'I want to be involved but have limited time' },
        ],
      },
    ],
  },
  {
    key: 'home_environment',
    title: 'Your Home',
    description: 'A few questions about your home setup',
    questions: [
      {
        key: 'child_access',
        label: 'Can your child access their clothes, snacks, or toys independently at home?',
        type: 'choices',
        options: [
          { value: 'fully_accessible', label: 'Yes — we\'ve set things up at their level' },
          { value: 'somewhat', label: 'Some things — we\'re working on it' },
          { value: 'not_yet', label: 'Not really — most things are out of reach' },
          { value: 'safety_concerns', label: "We've kept things up high for safety reasons" },
        ],
      },
      {
        key: 'outdoor_access',
        label: 'Does your child have regular access to outdoor play and nature?',
        type: 'choices',
        options: [
          { value: 'daily', label: 'Daily — outside time is non-negotiable for us' },
          { value: 'regular', label: 'Several times a week' },
          { value: 'weather_dependent', label: 'When weather permits' },
          { value: 'limited', label: 'Limited — we live in an urban area without easy outdoor access' },
        ],
      },
      {
        key: 'montessori_familiarity',
        label: 'How familiar are you with Montessori education?',
        type: 'choices',
        options: [
          { value: 'well_read', label: "I've read Montessori books and understand the philosophy" },
          { value: 'some_knowledge', label: "I know the basics — child-led, hands-on, mixed ages" },
          { value: 'just_heard', label: "I've heard of it but don't know much" },
          { value: 'brand_new', label: "This is my first real exploration" },
        ],
      },
    ],
  },
]

// =============================================
// COMPONENT
// =============================================

interface AnalysisResult {
  headline: string
  alignment_level: string
  summary: string
  child_readiness: {
    score_label: string
    factors: Array<{ factor: string; status: string; detail: string }>
  }
  family_alignment: {
    score_label: string
    factors: Array<{ factor: string; status: string; detail: string }>
  }
  environment_readiness: {
    score_label: string
    factors: Array<{ factor: string; status: string; detail: string }>
  }
  top_strengths: string[]
  growth_areas: string[]
  next_steps: Array<{ step: string; why: string }>
  school_readiness_note: string
  encouragement: string
}

export default function AssessmentPage() {
  const [currentSection, setCurrentSection] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showFullResults, setShowFullResults] = useState(false)

  const section = SECTIONS[currentSection]
  const totalSections = SECTIONS.length

  const setAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const sectionComplete = () => {
    if (!section) return false
    return section.questions.every(q => {
      if (q.type === 'text') return (answers[q.key] || '').trim().length > 0
      return !!answers[q.key]
    })
  }

  const handleSubmit = async () => {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          childName: answers.child_name,
          childAge: answers.child_age,
        }),
      })
      const data = await res.json()
      if (data.analysis) {
        setResult(data.analysis)
      }
    } catch (error) {
      console.error('Assessment error:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const alignmentColors: Record<string, string> = {
    strong: 'from-teal-500 to-teal-600',
    good: 'from-blue-500 to-teal-500',
    moderate: 'from-violet-500 to-blue-500',
    exploring: 'from-purple-500 to-violet-500',
  }

  const statusIcons: Record<string, string> = {
    strength: '✦',
    developing: '→',
    opportunity: '○',
  }

  const statusColors: Record<string, string> = {
    strength: 'text-teal-600 bg-teal-50',
    developing: 'text-blue-600 bg-blue-50',
    opportunity: 'text-violet-600 bg-violet-50',
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8f5ff 0%, #faf8ff 50%, white 100%)' }}>
      {/* Header */}
      <header className="px-6 py-5 flex justify-between items-center max-w-3xl mx-auto">
        <Link href="/" className="text-lg font-bold text-[#1a0e2e]" style={{ fontFamily: 'Georgia, serif' }}>
          Navigator
        </Link>
        <Link href="/auth/signup" className="text-sm text-[#4a2c82] font-medium hover:underline">
          Sign up
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        {/* Results */}
        {result ? (
          <div>
            {/* Result header */}
            <div className={`rounded-2xl p-8 text-white mb-8 bg-gradient-to-br ${alignmentColors[result.alignment_level] || 'from-violet-500 to-blue-500'}`}>
              <div className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">Your Montessori Readiness Assessment</div>
              <h1 className="text-2xl font-bold leading-snug mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                {result.headline}
              </h1>
              <p className="text-white/75 leading-relaxed">{result.summary}</p>
            </div>

            {/* Readiness dimensions */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: 'Child Readiness', data: result.child_readiness },
                { label: 'Family Alignment', data: result.family_alignment },
                { label: 'Environment', data: result.environment_readiness },
              ].map((dim, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
                  <div className="text-lg font-bold text-[#1a0e2e]">{dim.data.score_label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{dim.label}</div>
                </div>
              ))}
            </div>

            {/* Strengths */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
              <h3 className="text-sm font-semibold text-[#1a0e2e] uppercase tracking-wide mb-3">Your Strengths</h3>
              <div className="space-y-2">
                {result.top_strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-teal-500 mt-0.5">✦</span>
                    <span className="text-sm text-gray-700 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth areas */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
              <h3 className="text-sm font-semibold text-[#1a0e2e] uppercase tracking-wide mb-3">Growth Opportunities</h3>
              <div className="space-y-2">
                {result.growth_areas.map((g, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-violet-500 mt-0.5">→</span>
                    <span className="text-sm text-gray-700 leading-relaxed">{g}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teaser gate for full results */}
            {!showFullResults ? (
              <div className="relative">
                {/* Blurred preview */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4 relative overflow-hidden">
                  <div className="blur-sm pointer-events-none">
                    <h3 className="text-sm font-semibold text-[#1a0e2e] uppercase tracking-wide mb-3">Detailed Analysis</h3>
                    <p className="text-sm text-gray-500">Your child shows strong indicators of readiness in several key areas including concentration and independence...</p>
                    <div className="mt-3 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔒</div>
                      <h4 className="font-semibold text-[#1a0e2e] mb-1">Full Report Available</h4>
                      <p className="text-sm text-gray-500 mb-3 max-w-xs">Detailed analysis, personalized next steps, and school readiness notes</p>
                      <div className="flex gap-2 justify-center">
                        <Link href="/auth/signup" className="px-5 py-2 bg-[#4a2c82] hover:bg-[#3d2470] text-white text-sm font-medium rounded-lg transition">
                          Sign Up Free
                        </Link>
                        <button
                          onClick={() => setShowFullResults(true)}
                          className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Full detailed factors */}
                {[
                  { title: 'Child Readiness', data: result.child_readiness },
                  { title: 'Family Alignment', data: result.family_alignment },
                  { title: 'Environment Readiness', data: result.environment_readiness },
                ].map((section, si) => (
                  <div key={si} className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
                    <h3 className="text-sm font-semibold text-[#1a0e2e] uppercase tracking-wide mb-3">
                      {section.title}: <span className="text-teal-600">{section.data.score_label}</span>
                    </h3>
                    <div className="space-y-3">
                      {section.data.factors.map((f, fi) => (
                        <div key={fi} className="flex items-start gap-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[f.status] || 'text-gray-500 bg-gray-50'}`}>
                            {statusIcons[f.status] || '•'} {f.status}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-[#1a0e2e]">{f.factor}</div>
                            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Next steps */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
                  <h3 className="text-sm font-semibold text-[#1a0e2e] uppercase tracking-wide mb-3">Recommended Next Steps</h3>
                  <div className="space-y-3">
                    {result.next_steps.map((ns, i) => (
                      <div key={i} className="p-3 bg-[#f8f5ff] rounded-lg">
                        <div className="text-sm font-medium text-[#1a0e2e]">{i + 1}. {ns.step}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{ns.why}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* School note */}
                {result.school_readiness_note && (
                  <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
                    <h3 className="text-sm font-semibold text-[#1a0e2e] uppercase tracking-wide mb-2">About School Readiness</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{result.school_readiness_note}</p>
                  </div>
                )}

                {/* Encouragement */}
                <div className="bg-gradient-to-br from-[#f8f5ff] to-white border border-[#ede7f6] rounded-xl p-6 mb-4">
                  <p className="text-sm text-[#4a2c82] italic leading-relaxed">{result.encouragement}</p>
                </div>
              </>
            )}

            {/* Final CTA */}
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-[#1a0e2e] mb-2">Ready to go deeper?</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                Montessori Navigator gives you personalized guidance, curriculum planning, and development tracking — all grounded in the Montessori Foundation&apos;s expertise.
              </p>
              <Link href="/auth/signup" className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-full text-sm transition hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #4a2c82 100%)', boxShadow: '0 4px 24px rgba(74,108,247,0.25)' }}>
                Start Using Navigator →
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Assessment intro */}
            {currentSection === 0 && !analyzing && (
              <div className="text-center mb-8 pt-8">
                <div className="text-4xl mb-3">🌱</div>
                <h1 className="text-2xl font-bold text-[#1a0e2e] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Is Montessori Right for Your Family?
                </h1>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  Answer a few questions about your child, your values, and your home. We&apos;ll give you a personalized readiness assessment — free, no login required.
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="flex items-center gap-1 mb-6 max-w-xs mx-auto">
              {SECTIONS.map((_, i) => (
                <div key={i} className="flex items-center gap-1 flex-1">
                  <div className={`h-1.5 rounded-full flex-1 transition-all ${
                    i < currentSection ? 'bg-[#4a2c82]' :
                    i === currentSection ? 'bg-[#8b9cf7]' :
                    'bg-gray-200'
                  }`} />
                </div>
              ))}
            </div>

            {/* Section */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#1a0e2e]">{section.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
              </div>

              <div className="space-y-5">
                {section.questions.map(q => (
                  <div key={q.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{q.label}</label>

                    {q.type === 'text' && (
                      <input
                        type="text"
                        value={answers[q.key] || ''}
                        onChange={e => setAnswer(q.key, e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4a2c82] focus:border-transparent outline-none"
                        placeholder={q.placeholder}
                      />
                    )}

                    {q.type === 'select' && (
                      <select
                        value={answers[q.key] || ''}
                        onChange={e => setAnswer(q.key, e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4a2c82] focus:border-transparent outline-none"
                      >
                        <option value="">Select...</option>
                        {q.options!.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}

                    {q.type === 'choices' && (
                      <div className="space-y-2">
                        {q.options!.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setAnswer(q.key, opt.value)}
                            className={`w-full text-left p-3 rounded-lg border text-sm transition ${
                              answers[q.key] === opt.value
                                ? 'border-[#4a2c82] bg-[#f8f5ff] text-[#1a0e2e]'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                {currentSection > 0 ? (
                  <button
                    onClick={() => setCurrentSection(prev => prev - 1)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Back
                  </button>
                ) : <div />}

                {currentSection < totalSections - 1 ? (
                  <button
                    onClick={() => setCurrentSection(prev => prev + 1)}
                    disabled={!sectionComplete()}
                    className="px-6 py-2.5 bg-[#4a2c82] hover:bg-[#3d2470] text-white text-sm font-medium rounded-lg transition disabled:opacity-40"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!sectionComplete() || analyzing}
                    className="px-6 py-2.5 text-white text-sm font-medium rounded-lg transition disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #4a2c82 100%)' }}
                  >
                    {analyzing ? 'Analyzing...' : 'Get My Results'}
                  </button>
                )}
              </div>
            </div>

            {/* Loading state */}
            {analyzing && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <div className="w-2 h-2 bg-[#4a2c82] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#4a2c82] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#4a2c82] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-sm text-gray-500">Analyzing your responses...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
