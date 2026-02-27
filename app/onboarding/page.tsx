'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const EDUCATION_CONTEXTS = [
  { value: 'montessori_school', label: 'Montessori School', desc: 'My child attends a Montessori school' },
  { value: 'homeschool', label: 'Homeschool', desc: 'We homeschool using Montessori methods' },
  { value: 'hybrid', label: 'Hybrid', desc: 'Combination of school and home education' },
  { value: 'public_supplementing', label: 'Public School + Home', desc: 'Public/private school, supplementing with Montessori at home' },
  { value: 'exploring', label: 'Exploring', desc: "I'm learning about Montessori and considering options" },
]

const EXPERIENCE_LEVELS = [
  { value: 'new', label: 'New to Montessori', desc: "I'm just getting started" },
  { value: 'familiar', label: 'Familiar', desc: "I understand the basics and some philosophy" },
  { value: 'experienced', label: 'Experienced', desc: "I've been practicing Montessori for a while" },
  { value: 'trained', label: 'Trained', desc: 'I have formal Montessori training or certification' },
]

const FOCUS_AREAS = [
  { value: 'curriculum_planning', label: 'Curriculum Planning', desc: 'Help planning what to teach and when' },
  { value: 'behavior_guidance', label: 'Behavior & Discipline', desc: 'Montessori approaches to behavior' },
  { value: 'school_selection', label: 'School Selection', desc: 'Evaluating and choosing a Montessori school' },
  { value: 'home_environment', label: 'Home Environment', desc: 'Setting up Montessori spaces at home' },
  { value: 'general_understanding', label: 'General Understanding', desc: 'Learning Montessori philosophy and methods' },
  { value: 'development_tracking', label: 'Development Tracking', desc: 'Observing and tracking my child\'s growth' },
]

const CHILD_ENVIRONMENTS = [
  { value: 'montessori_school', label: 'Montessori school' },
  { value: 'homeschool', label: 'Homeschooled' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'public_school', label: 'Public/private school' },
  { value: 'preschool', label: 'Preschool/daycare' },
  { value: 'not_yet_enrolled', label: 'Not yet enrolled' },
]

interface ChildEntry {
  name: string
  dateOfBirth: string
  environment: string
  schoolName: string
  notes: string
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [parentId, setParentId] = useState<string | null>(null)

  // Step 1: Family profile
  const [educationContext, setEducationContext] = useState('')
  const [experience, setExperience] = useState('')
  const [communicationStyle, setCommunicationStyle] = useState('gentle')

  // Step 2: Children
  const [children, setChildren] = useState<ChildEntry[]>([
    { name: '', dateOfBirth: '', environment: '', schoolName: '', notes: '' }
  ])

  // Step 3: Focus areas
  const [focusAreas, setFocusAreas] = useState<string[]>([])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getParent = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
      if (data) {
        setParentId(data.id)
      } else {
        // Create parent profile if it doesn't exist (e.g. signup happened before tables were created)
        const { data: newParent } = await supabase.from('parents').insert({
          user_id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || null,
          email: user.email,
        }).select('id').single()
        if (newParent) setParentId(newParent.id)
      }
    }
    getParent()
  }, [])

  const addChild = () => {
    setChildren([...children, { name: '', dateOfBirth: '', environment: '', schoolName: '', notes: '' }])
  }

  const updateChild = (index: number, field: keyof ChildEntry, value: string) => {
    const updated = [...children]
    updated[index][field] = value
    setChildren(updated)
  }

  const removeChild = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index))
    }
  }

  const toggleFocus = (value: string) => {
    setFocusAreas(prev =>
      prev.includes(value) ? prev.filter(f => f !== value) : [...prev, value]
    )
  }

  const handleComplete = async () => {
    if (!parentId) return
    setLoading(true)

    try {
      // Update parent profile
      await supabase.from('parents').update({
        education_context: educationContext,
        montessori_experience: experience,
        communication_style: communicationStyle,
      }).eq('id', parentId)

      // Create children
      for (const child of children) {
        if (!child.name.trim()) continue
        const { data: childData } = await supabase.from('children').insert({
          parent_id: parentId,
          name: child.name.trim(),
          date_of_birth: child.dateOfBirth || null,
          current_environment: child.environment || null,
          school_name: child.schoolName || null,
          notes: child.notes || null,
        }).select().single()

        // Initialize development levels for each child
        if (childData) {
          const areas = [
            'practical_life', 'sensorial', 'language', 'mathematics',
            'cultural_studies', 'social_emotional', 'executive_function',
            'gross_motor', 'fine_motor', 'art_music'
          ]
          await supabase.from('child_development_levels').insert(
            areas.map(area => ({ child_id: childData.id, area, level: null }))
          )
        }
      }

      // Save focus areas as preferences
      for (const focus of focusAreas) {
        await supabase.from('parent_preferences').upsert({
          parent_id: parentId,
          key: `focus_${focus}`,
          value: 'true',
        })
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-navy-600">Welcome to Navigator</h1>
          <p className="text-gray-500 mt-1">Let&apos;s set up your family&apos;s prepared environment</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                s === step ? 'bg-teal-500 text-white' :
                s < step ? 'bg-teal-100 text-teal-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 4 && <div className={`w-8 h-0.5 ${s < step ? 'bg-teal-300' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">

          {/* STEP 1: Family Profile */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-navy-600 mb-1">About Your Family</h2>
              <p className="text-gray-500 text-sm mb-6">This helps us personalize your experience</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">What describes your situation?</label>
                  <div className="space-y-2">
                    {EDUCATION_CONTEXTS.map(ctx => (
                      <button
                        key={ctx.value}
                        onClick={() => setEducationContext(ctx.value)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          educationContext === ctx.value
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm text-navy-600">{ctx.label}</div>
                        <div className="text-xs text-gray-500">{ctx.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Your Montessori experience</label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPERIENCE_LEVELS.map(exp => (
                      <button
                        key={exp.value}
                        onClick={() => setExperience(exp.value)}
                        className={`text-left p-3 rounded-lg border transition ${
                          experience === exp.value
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm text-navy-600">{exp.label}</div>
                        <div className="text-xs text-gray-500">{exp.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">How should Navigator talk to you?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'gentle', label: 'Warm & Encouraging' },
                      { value: 'direct', label: 'Clear & Practical' },
                      { value: 'detailed', label: 'Thorough & Detailed' },
                      { value: 'brief', label: 'Quick & Concise' },
                    ].map(style => (
                      <button
                        key={style.value}
                        onClick={() => setCommunicationStyle(style.value)}
                        className={`p-3 rounded-lg border text-sm font-medium transition ${
                          communicationStyle === style.value
                            ? 'border-teal-500 bg-teal-50 text-navy-600'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!educationContext || !experience}
                className="w-full mt-6 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2: Add Children */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-navy-600 mb-1">Your Children</h2>
              <p className="text-gray-500 text-sm mb-6">Add each child you&apos;d like to track</p>

              <div className="space-y-6">
                {children.map((child, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-navy-600">Child {index + 1}</span>
                      {children.length > 1 && (
                        <button onClick={() => removeChild(index)} className="text-xs text-red-400 hover:text-red-500">
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Name</label>
                        <input
                          type="text"
                          value={child.name}
                          onChange={e => updateChild(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                          placeholder="First name"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs text-gray-500 mb-1">Date of birth</label>
                        <input
                          type="date"
                          value={child.dateOfBirth}
                          onChange={e => updateChild(index, 'dateOfBirth', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Current environment</label>
                      <select
                        value={child.environment}
                        onChange={e => updateChild(index, 'environment', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select...</option>
                        {CHILD_ENVIRONMENTS.map(env => (
                          <option key={env.value} value={env.value}>{env.label}</option>
                        ))}
                      </select>
                    </div>

                    {(child.environment === 'montessori_school' || child.environment === 'public_school' || child.environment === 'preschool') && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">School name (optional)</label>
                        <input
                          type="text"
                          value={child.schoolName}
                          onChange={e => updateChild(index, 'schoolName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                          placeholder="School name"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Anything specific you want help with? (optional)</label>
                      <input
                        type="text"
                        value={child.notes}
                        onChange={e => updateChild(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        placeholder="e.g., struggling with transitions, loves animals, very active"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addChild}
                  className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-teal-400 hover:text-teal-500 transition"
                >
                  + Add another child
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium">
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!children.some(c => c.name.trim())}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Focus Areas */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-navy-600 mb-1">What Do You Need Most?</h2>
              <p className="text-gray-500 text-sm mb-6">Select all that apply — you can always change these later</p>

              <div className="space-y-2">
                {FOCUS_AREAS.map(area => (
                  <button
                    key={area.value}
                    onClick={() => toggleFocus(area.value)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      focusAreas.includes(area.value)
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                        focusAreas.includes(area.value) ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-300'
                      }`}>
                        {focusAreas.includes(area.value) && '✓'}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-navy-600">{area.label}</div>
                        <div className="text-xs text-gray-500">{area.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium">
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={focusAreas.length === 0}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Complete */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-navy-600 mb-1">You&apos;re All Set</h2>
              <p className="text-gray-500 text-sm mb-6">Here&apos;s a summary of your setup</p>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Profile</div>
                  <div className="text-sm text-navy-600">
                    <span className="font-medium">{EDUCATION_CONTEXTS.find(c => c.value === educationContext)?.label}</span>
                    {' · '}
                    <span>{EXPERIENCE_LEVELS.find(e => e.value === experience)?.label}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Children</div>
                  {children.filter(c => c.name.trim()).map((child, i) => (
                    <div key={i} className="text-sm text-navy-600">
                      <span className="font-medium">{child.name}</span>
                      {child.dateOfBirth && <span className="text-gray-500"> · Born {child.dateOfBirth}</span>}
                      {child.environment && (
                        <span className="text-gray-500"> · {CHILD_ENVIRONMENTS.find(e => e.value === child.environment)?.label}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Focus Areas</div>
                  <div className="flex flex-wrap gap-2">
                    {focusAreas.map(f => (
                      <span key={f} className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                        {FOCUS_AREAS.find(a => a.value === f)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium">
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Start Using Navigator'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
