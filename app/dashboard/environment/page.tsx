'use client'

import { useState, useEffect } from 'react'
import { DoorOpen, Bed, UtensilsCrossed, Bath, BookOpen, TreePine, type LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useChild } from '@/lib/child-context'
import { getAgePlane, getAgePlaneLabel } from '@/lib/utils'
import ChildSwitcher from '@/components/app/ChildSwitcher'
import { ROOM_GUIDES, getRoomGuidesForAge, type RoomType, type RoomGuide } from '@/lib/environment-guide'

// Room icons are stored as lucide names in environment-guide data; render
// them as actual icons (previously the raw name string appeared in the tab).
const ROOM_ICONS: Record<string, LucideIcon> = {
  DoorOpen, Bed, UtensilsCrossed, Bath, BookOpen, TreePine,
}

import RoomHero from '@/components/environment/RoomHero'
import QuickWins from '@/components/environment/QuickWins'
import InspirationPhotos from '@/components/environment/InspirationPhotos'
import InspirationVideos from '@/components/environment/InspirationVideos'
import SetupGuide from '@/components/environment/SetupGuide'
import ShoppingGuide from '@/components/environment/ShoppingGuide'
import SafetyChecklist from '@/components/environment/SafetyChecklist'
import RelatedArticles from '@/components/environment/RelatedArticles'
import MySetupTracker from '@/components/environment/MySetupTracker'
import RoomVision from '@/components/environment/RoomVision'

export default function EnvironmentPage() {
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('entryway')
  const [parentId, setParentId] = useState<string | null>(null)
  const { selectedChild } = useChild()
  const supabase = createClient()

  useEffect(() => {
    const loadParent = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
      if (parent) setParentId(parent.id)
    }
    loadParent()
  }, [])

  // Determine age plane from selected child
  const agePlane = selectedChild?.date_of_birth
    ? getAgePlane(selectedChild.date_of_birth)
    : null

  // Get age-filtered guides or all guides
  const guides = agePlane
    ? getRoomGuidesForAge(agePlane as any)
    : ROOM_GUIDES

  const currentGuide = guides.find(g => g.room === selectedRoom) || guides[0]

  return (
    <div className="max-w-3xl mx-auto pb-24 sm:pb-10">
      <div className="pt-2 mb-6">
        <h1 className="font-[family-name:var(--mfa-serif)] text-[32px] sm:text-[38px] leading-[1.05] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-1.5">
          Montessori at Home
        </h1>
        <p className="text-[15px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-xl mb-4">
          Prepare spaces that invite independence and concentration, room by room.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ChildSwitcher />
          {selectedChild && agePlane && (
            <span className="text-[13px] text-[color:var(--mfa-ink-muted)]">
              Tips for {getAgePlaneLabel(agePlane as any)}
            </span>
          )}
        </div>
      </div>

      {/* Room tabs - horizontal scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory sm:snap-none">
        {ROOM_GUIDES.map(room => (
          <button
            key={room.room}
            onClick={() => setSelectedRoom(room.room)}
            aria-pressed={selectedRoom === room.room}
            className={`tap-scale flex items-center gap-2 px-5 py-3.5 sm:px-4 sm:py-2.5 rounded-[16px] text-sm font-medium whitespace-nowrap min-h-[48px] transition shrink-0 snap-start ${
              selectedRoom === room.room
                ? 'bg-[color:var(--mfa-purple)] text-white shadow-sm'
                : 'bg-white border border-[color:var(--mfa-border)] text-[color:var(--mfa-ink-secondary)] hover:text-[color:var(--mfa-purple)]'
            }`}
          >
            {(() => { const RoomIcon = ROOM_ICONS[room.icon]; return RoomIcon ? <RoomIcon size={18} aria-hidden="true" /> : null })()}
            {room.label}
          </button>
        ))}
      </div>

      {/* Room content sections */}
      {currentGuide && (
        <div>
          <RoomHero guide={currentGuide} />
          <QuickWins wins={currentGuide.quickWins} />
          <InspirationPhotos photos={currentGuide.inspirationPhotos} />
          <RoomVision room={selectedRoom} parentId={parentId} agePlane={agePlane} />
          <InspirationVideos videos={currentGuide.inspirationVideos} />
          <SetupGuide tips={currentGuide.setupTips} />
          <ShoppingGuide items={currentGuide.recommendedItems} />
          <SafetyChecklist guidelines={currentGuide.safetyGuidelines} />
          <RelatedArticles articleRefs={currentGuide.relatedArticles} />
          <MySetupTracker room={selectedRoom} parentId={parentId} />
        </div>
      )}
    </div>
  )
}
