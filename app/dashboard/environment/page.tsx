'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useChild } from '@/lib/child-context'
import { getAgePlane, getAgePlaneLabel } from '@/lib/utils'
import PageBanner from '@/components/ui/PageBanner'
import { ROOM_GUIDES, getRoomGuidesForAge, type RoomType, type RoomGuide } from '@/lib/environment-guide'

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
    <div className="max-w-3xl mx-auto pb-20 sm:pb-0">
      <PageBanner
        image="/images/environment/living-room-setup.jpg"
        title="Home Environment"
        subtitle="Design spaces that inspire independence and curiosity"
      />

      {/* Age filter badge */}
      {selectedChild && agePlane && (
        <div className="flex items-center gap-2 px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg mb-4">
          <span className="text-sm">👶</span>
          <span className="text-sm text-warm-700">
            Showing tips for <strong>{selectedChild.name}</strong> ({getAgePlaneLabel(agePlane as any)})
          </span>
        </div>
      )}

      {/* Room tabs - horizontal scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        {ROOM_GUIDES.map(room => (
          <button
            key={room.room}
            onClick={() => setSelectedRoom(room.room)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition shrink-0 ${
              selectedRoom === room.room
                ? 'bg-warm-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-warm-300 hover:text-warm-600'
            }`}
          >
            <span className="text-lg">{room.icon}</span>
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
