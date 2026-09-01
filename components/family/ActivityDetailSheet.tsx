'use client'

import type { HomeActivity } from '@/lib/family-home'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'

// Full activity presentation in a sheet — shared by the Home carousel and the
// My Child Overview "Try This Next" card. No new routes needed.
export default function ActivityDetailSheet({ activity, childName, onClose }: {
  activity: HomeActivity | null
  childName: string
  onClose: () => void
}) {
  return (
    <BottomSheet open={!!activity} onClose={onClose} title={activity?.name}>
      {activity && (
        <div className="pb-4 space-y-4">
          <div className="text-[12px] font-medium text-[color:var(--mfa-ink-muted)]">
            {activity.category} · {activity.duration}{activity.ages ? ` · ${activity.ages}` : ''}
          </div>
          <p className="text-[15px] leading-relaxed text-[color:var(--mfa-ink)]">{activity.description}</p>

          {activity.materials.length > 0 && (
            <div>
              <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--mfa-clay)] mb-1.5">You'll need</div>
              <ul className="space-y-1">
                {activity.materials.map((m, i) => (
                  <li key={i} className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] pl-4 relative">
                    <span className="absolute left-0 top-[0.55em] w-1.5 h-1.5 rounded-full bg-[color:var(--mfa-sage)]" aria-hidden="true" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activity.presentation.length > 0 && (
            <div>
              <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--mfa-clay)] mb-1.5">How to present it</div>
              <ol className="space-y-1.5">
                {activity.presentation.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)]">
                    <span className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-[color:var(--mfa-surface-sage)] text-[color:var(--mfa-forest)] text-[11px] font-bold inline-flex items-center justify-center" aria-hidden="true">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="rounded-2xl bg-[color:var(--mfa-surface-sage)] p-4">
            <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--mfa-forest)] mb-1.5">Why it matters</div>
            <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)]">{activity.whyItMatters}</p>
          </div>

          {activity.diyTip && (
            <p className="text-[13.5px] leading-relaxed text-[color:var(--mfa-ink-muted)] italic">
              DIY tip: {activity.diyTip}
            </p>
          )}

          <Button
            href={`/dashboard/chat?q=${encodeURIComponent(`How do I present "${activity.name}" to ${childName}?`)}`}
            variant="soft" size="md" className="w-full"
          >
            Ask Abigail about this activity
          </Button>
        </div>
      )}
    </BottomSheet>
  )
}
