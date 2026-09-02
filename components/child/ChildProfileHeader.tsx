'use client'

import { useState, useRef } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useChild } from '@/lib/child-context'
import { formatAge, getAgePlane, getAgePlaneLabel } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ChildSwitcherSheet from '@/components/app/ChildSwitcherSheet'

// Shared contextual header for every My Child tab: avatar (tap to update
// photo), name + age + plane, child switcher, and the primary action.
export default function ChildProfileHeader({ onLogMoment }: { onLogMoment: () => void }) {
  const { children, selectedChild } = useChild()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  if (!selectedChild) return null
  const multi = children.length > 1

  // Preserved from the legacy Children page: upload to the existing
  // `uploads` bucket and store the public URL on the child row.
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `child-photos/${selectedChild.id}.${ext}`
      await supabase.storage.from('uploads').upload(path, file, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path)
      await supabase.from('children').update({ profile_photo_url: publicUrl }).eq('id', selectedChild.id)
      window.location.reload()
    } catch (err) {
      console.error('Photo upload failed:', err)
      setUploadingPhoto(false)
    }
  }

  return (
    <div className="flex items-center gap-4 pt-2 pb-5">
      <button
        onClick={() => photoInputRef.current?.click()}
        aria-label={`Update ${selectedChild.name}'s photo`}
        className="tap-scale relative shrink-0 rounded-full group"
      >
        <Avatar name={selectedChild.name} src={selectedChild.profile_photo_url} size={64} />
        <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white border border-[color:var(--mfa-border)] inline-flex items-center justify-center text-[color:var(--mfa-ink-secondary)] group-hover:text-[color:var(--mfa-purple)]" aria-hidden="true">
          {uploadingPhoto
            ? <span className="w-3 h-3 border-2 border-[color:var(--mfa-purple)] border-t-transparent rounded-full animate-spin" />
            : <Plus size={14} />}
        </span>
      </button>
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

      <div className="min-w-0 flex-1">
        <button
          onClick={() => multi && setSwitcherOpen(true)}
          aria-label={multi ? `Viewing ${selectedChild.name}. Change child` : undefined}
          aria-haspopup={multi ? 'dialog' : undefined}
          className={`tap-scale inline-flex items-center gap-1.5 max-w-full min-h-[44px] -my-1 ${multi ? '' : 'cursor-default'}`}
        >
          <span className="font-[family-name:var(--mfa-serif)] text-[26px] sm:text-[30px] leading-tight font-semibold text-[color:var(--mfa-navy)] tracking-tight truncate">
            {selectedChild.name}
          </span>
          {multi && <ChevronDown size={20} className="text-[color:var(--mfa-ink-muted)] shrink-0" aria-hidden="true" />}
        </button>
        <div className="text-[13.5px] text-[color:var(--mfa-ink-secondary)]">
          {formatAge(selectedChild.date_of_birth)}
          <span className="text-[color:var(--mfa-ink-muted)]"> · {getAgePlaneLabel(getAgePlane(selectedChild.date_of_birth))}</span>
        </div>
      </div>

      <Button size="sm" onClick={onLogMoment} className="shrink-0 hidden min-[430px]:inline-flex">
        Log a Moment
      </Button>
      <button
        onClick={onLogMoment}
        aria-label="Log a Moment"
        className="tap-scale min-[430px]:hidden shrink-0 w-11 h-11 rounded-full bg-[color:var(--mfa-navy)] text-white inline-flex items-center justify-center"
      >
        <Plus size={20} aria-hidden="true" />
      </button>

      <ChildSwitcherSheet open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </div>
  )
}
