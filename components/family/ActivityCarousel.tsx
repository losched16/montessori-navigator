'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import type { HomeActivity } from '@/lib/family-home'
import ActivityDetailSheet from '@/components/family/ActivityDetailSheet'
import { useChild } from '@/lib/child-context'
import { trackEvent, getSafeChildAnalyticsContext } from '@/lib/analytics'

// Horizontal snap carousel of 3–5 activity cards. Tapping a card opens the
// full presentation in a bottom sheet — no new routes needed in Phase 1.
export default function ActivityCarousel({ activities, childName, analyticsSource }: {
  activities: HomeActivity[]
  childName: string
  /** Where this carousel lives, for the generic activity_opened event */
  analyticsSource?: string
}) {
  const [openActivity, setOpenActivity] = useState<HomeActivity | null>(null)
  const { selectedChild } = useChild()

  const openWithTracking = (activity: HomeActivity) => {
    setOpenActivity(activity)
    trackEvent('activity_opened', {
      source: analyticsSource || 'unknown',
      activity_category: activity.category,
      age_plane: getSafeChildAnalyticsContext(selectedChild).age_plane,
    })
  }

  return (
    <>
      <div
        className="flex gap-3.5 overflow-x-auto -mx-4 px-4 sm:-mx-0 sm:px-0 pb-2 snap-x snap-mandatory scrollbar-hide"
        role="list"
        aria-label={`Activities for ${childName}`}
      >
        {activities.map(activity => (
          <button
            key={activity.id}
            role="listitem"
            onClick={() => openWithTracking(activity)}
            className="tap-scale snap-start shrink-0 w-[240px] sm:w-[256px] text-left rounded-[20px] bg-white border border-[color:var(--mfa-border)] overflow-hidden hover:shadow-md transition"
          >
            <div className="relative aspect-[4/3] bg-[color:var(--mfa-surface-warm)]">
              <Image
                src={activity.image}
                alt=""
                fill
                sizes="256px"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--mfa-sage)] mb-1">
                {activity.category}
              </div>
              <div className="text-[17px] font-semibold text-[color:var(--mfa-ink)] leading-snug mb-1 line-clamp-2">
                {activity.name}
              </div>
              <div className="text-[12.5px] text-[color:var(--mfa-ink-muted)] mb-2.5">
                {activity.duration}{activity.ages ? ` · ${activity.ages}` : ''}
              </div>
              <span className="inline-flex items-center gap-0.5 text-[14px] font-semibold text-[color:var(--mfa-purple)]">
                Try Activity
                <ChevronRight size={15} aria-hidden="true" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <ActivityDetailSheet
        activity={openActivity}
        childName={childName}
        onClose={() => setOpenActivity(null)}
      />
    </>
  )
}
