'use client'

import { useState, useEffect } from 'react'
import { useChild } from '@/lib/child-context'
import PageBanner from '@/components/ui/PageBanner'
import { getAllMonthlyGuides, getGuideForChildAge } from '@/lib/monthly-development'
import MonthlyDevelopment from '@/components/journey/MonthlyDevelopment'
import MonthSelector from '@/components/journey/MonthSelector'

export default function DevelopmentPage() {
  const { selectedChild } = useChild()
  const allGuides = getAllMonthlyGuides()

  // Determine child's current month guide
  const childGuide = selectedChild?.date_of_birth
    ? getGuideForChildAge(selectedChild.date_of_birth)
    : undefined

  const [selectedGuideId, setSelectedGuideId] = useState<string>(
    childGuide?.id || allGuides[0]?.id || 'month-1'
  )

  // Update selection when child changes
  useEffect(() => {
    if (childGuide) {
      setSelectedGuideId(childGuide.id)
    }
  }, [childGuide?.id])

  const selectedGuide = allGuides.find(g => g.id === selectedGuideId) || allGuides[0]

  return (
    <div className="max-w-3xl mx-auto pb-20 sm:pb-0">
      <PageBanner
        image="/images/environment/play-area.jpg"
        title="Baby Development Guide"
        subtitle="Month-by-month milestones and Montessori activities"
        objectPosition="center 30%"
      />

      {/* Month Selector */}
      <MonthSelector
        guides={allGuides}
        selectedId={selectedGuideId}
        onSelect={setSelectedGuideId}
        highlightedId={childGuide?.id}
      />

      {/* Selected Month Content */}
      {selectedGuide && (
        <MonthlyDevelopment
          guide={selectedGuide}
          childName={selectedChild?.name}
        />
      )}
    </div>
  )
}
