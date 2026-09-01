'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Observation } from '@/lib/supabase'
import { getCurriculumAreaLabel } from '@/lib/utils'
import { DEV_AREAS } from '@/lib/child-story'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'

const OBSERVATION_TYPES = [
  { value: 'home_activity', label: 'Home Activity' },
  { value: 'school_observation', label: 'School Observation' },
  { value: 'milestone_reached', label: 'Milestone Reached' },
  { value: 'challenge_noted', label: 'Challenge Noted' },
  { value: 'interest_spark', label: 'Interest Spark' },
  { value: 'conference_notes', label: 'Conference Notes' },
  { value: 'general', label: 'General Note' },
]

const inputClasses = 'w-full px-3.5 py-2.5 border border-[color:var(--mfa-border)] rounded-xl text-[15px] bg-white text-[color:var(--mfa-ink)] focus:ring-2 focus:ring-[color:var(--mfa-purple)] focus:border-transparent outline-none'

// Quick moment capture: one required textarea, Montessori details collapsed.
// Saves to the existing `observations` table — "moment" is only the UX label.
export default function MomentComposer({ open, onClose, childId, childName, parentId, onSaved }: {
  open: boolean
  onClose: () => void
  childId: string
  childName: string
  parentId: string | null
  onSaved: (obs: Observation) => void
}) {
  const [description, setDescription] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [type, setType] = useState('home_activity')
  const [area, setArea] = useState('general')
  const [wentWell, setWentWell] = useState('')
  const [needsSupport, setNeedsSupport] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const reset = () => {
    setDescription(''); setWentWell(''); setNeedsSupport('')
    setType('home_activity'); setArea('general'); setShowDetails(false)
  }

  const save = async () => {
    if (!description.trim() || !parentId || saving) return
    setSaving(true)
    const { data, error } = await supabase.from('observations').insert({
      child_id: childId,
      parent_id: parentId,
      type,
      curriculum_area: area,
      description: description.trim(),
      went_well: wentWell.trim() || null,
      needs_support: needsSupport.trim() || null,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      onSaved(data as Observation)
      reset()
      onClose()
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="What did you notice?">
      <div className="pb-4 space-y-4">
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          autoFocus
          placeholder={`${childName} spent a long time...`}
          className={`${inputClasses} resize-none text-[16px] leading-relaxed`}
          aria-label="Describe the moment"
        />

        <button
          onClick={() => setShowDetails(v => !v)}
          aria-expanded={showDetails}
          className="tap-scale inline-flex items-center gap-1 min-h-[44px] text-[14px] font-medium text-[color:var(--mfa-ink-secondary)] hover:text-[color:var(--mfa-ink)]"
        >
          Add Montessori details
          {showDetails ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
        </button>

        {showDetails && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-[12px] font-medium text-[color:var(--mfa-ink-secondary)] mb-1">Type</span>
                <select value={type} onChange={e => setType(e.target.value)} className={inputClasses}>
                  {OBSERVATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-[12px] font-medium text-[color:var(--mfa-ink-secondary)] mb-1">Area</span>
                <select value={area} onChange={e => setArea(e.target.value)} className={inputClasses}>
                  <option value="general">General</option>
                  {DEV_AREAS.map(a => <option key={a} value={a}>{getCurriculumAreaLabel(a)}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="block text-[12px] font-medium text-[color:var(--mfa-ink-secondary)] mb-1">What went well?</span>
              <input type="text" value={wentWell} onChange={e => setWentWell(e.target.value)}
                placeholder="Strengths, progress..." className={inputClasses} />
            </label>
            <label className="block">
              <span className="block text-[12px] font-medium text-[color:var(--mfa-ink-secondary)] mb-1">Where might support help?</span>
              <input type="text" value={needsSupport} onChange={e => setNeedsSupport(e.target.value)}
                placeholder="Challenges, areas to watch..." className={inputClasses} />
            </label>
          </div>
        )}

        <Button size="lg" onClick={save} disabled={!description.trim() || saving} className="w-full">
          {saving ? 'Saving...' : 'Save Moment'}
        </Button>
      </div>
    </BottomSheet>
  )
}
