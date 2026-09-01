'use client'

import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { useChild } from '@/lib/child-context'
import { getAllMonthlyGuides, getGuideForChildAge } from '@/lib/monthly-development'
import { formatAge } from '@/lib/utils'
import MonthlyDevelopment from '@/components/journey/MonthlyDevelopment'
import MonthSelector from '@/components/journey/MonthSelector'
import ChildSwitcher from '@/components/app/ChildSwitcher'
import Button from '@/components/ui/Button'

export default function DevelopmentPage() {
  const { selectedChild } = useChild()
  const allGuides = getAllMonthlyGuides()

  // (kept local — importing family-home here would pull the activity corpus)
  const ageMonths = selectedChild?.date_of_birth
    ? Math.floor((Date.now() - new Date(selectedChild.date_of_birth).getTime()) / (30.44 * 86400000))
    : null
  const isBabyToddler = ageMonths !== null && ageMonths <= 36
  const first = selectedChild?.name.trim().split(/\s+/)[0]

  // Determine child's current month guide (only meaningful ≤36 months)
  const childGuide = isBabyToddler && selectedChild?.date_of_birth
    ? getGuideForChildAge(selectedChild.date_of_birth)
    : undefined

  const [selectedGuideId, setSelectedGuideId] = useState<string>(
    childGuide?.id || allGuides[0]?.id || 'month-1'
  )

  // Update selection when child changes
  useEffect(() => {
    if (childGuide) setSelectedGuideId(childGuide.id)
  }, [childGuide?.id])

  const selectedGuide = allGuides.find(g => g.id === selectedGuideId) || allGuides[0]

  return (
    <div className="max-w-3xl mx-auto pb-24 sm:pb-10">
      <div className="pt-2 mb-6">
        <h1 className="font-[family-name:var(--mfa-serif)] text-[32px] sm:text-[38px] leading-[1.05] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-1.5">
          Development Guide
        </h1>
        <p className="text-[15px] text-[color:var(--mfa-ink-secondary)] mb-4">
          Month-by-month milestones and Montessori activities from birth to three.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ChildSwitcher />
          {selectedChild && isBabyToddler && (
            <span className="text-[13.5px] font-medium text-[color:var(--mfa-forest)]">
              {first} · {formatAge(selectedChild.date_of_birth)}
            </span>
          )}
        </div>
      </div>

      {/* An older child isn't served by a baby guide — say so and route to Growth */}
      {selectedChild && !isBabyToddler && (
        <div className="rounded-[20px] bg-[color:var(--mfa-purple-soft)] border border-[color:var(--mfa-border)] p-5 mb-6">
          <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink)] mb-1">
            This guide covers birth to 36 months — {first} is {formatAge(selectedChild.date_of_birth)} now.
          </p>
          <p className="text-[13.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mb-3.5">
            For {first}&apos;s stage, the Growth tab shows development areas, milestones and Montessori learning.
          </p>
          <Button size="md" variant="secondary" href="/dashboard/children?tab=growth">
            See {first}&apos;s Growth
            <ChevronRight size={15} aria-hidden="true" />
          </Button>
        </div>
      )}

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
          childName={isBabyToddler ? selectedChild?.name : undefined}
        />
      )}
    </div>
  )
}
