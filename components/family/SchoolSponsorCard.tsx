'use client'

import { useState } from 'react'
import { useSchoolSponsor, type SchoolSponsor } from '@/lib/school-sponsor'

// "Your membership is made possible by <School>" — shown to parents whose
// access is covered by their school. Renders nothing for everyone else.

function SchoolMark({ sponsor, size }: { sponsor: SchoolSponsor; size: number }) {
  const [broken, setBroken] = useState(false)
  if (sponsor.logoUrl && !broken) {
    return (
      <span className="shrink-0 flex items-center justify-center rounded-[12px] bg-white border border-[color:var(--mfa-border)] overflow-hidden"
        style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sponsor.logoUrl} alt={`${sponsor.name} logo`} className="max-w-full max-h-full object-contain p-1" onError={() => setBroken(true)} />
      </span>
    )
  }
  const initials = sponsor.name
    .replace(/\b(the|school|montessori|of|and|inc)\b/gi, ' ')
    .split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('')
    || sponsor.name.slice(0, 2).toUpperCase()
  return (
    <span aria-hidden="true"
      className="shrink-0 flex items-center justify-center rounded-[12px] bg-[color:var(--mfa-navy)] text-white font-[family-name:var(--mfa-serif)] font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </span>
  )
}

export default function SchoolSponsorCard({ variant = 'banner', className = '' }: { variant?: 'banner' | 'compact' | 'billing'; className?: string }) {
  const { sponsor } = useSchoolSponsor()
  if (!sponsor) return null

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 rounded-[16px] bg-[color:var(--mfa-surface-warm)] px-4 py-3 ${className}`}>
        <SchoolMark sponsor={sponsor} size={40} />
        <p className="text-[14px] leading-snug text-[color:var(--mfa-ink)]">
          Your membership is made possible by <span className="font-semibold">{sponsor.name}</span>
        </p>
      </div>
    )
  }

  if (variant === 'billing') {
    return (
      <div className={`flex items-start gap-4 rounded-xl bg-[#F7F2E7] p-5 ${className}`}>
        <SchoolMark sponsor={sponsor} size={56} />
        <div>
          <div className="font-semibold text-navy-600">Provided by {sponsor.name}</div>
          <p className="text-sm text-gray-600 mt-1">
            Your Family Alliance membership is made possible by {sponsor.name}. There&apos;s nothing for you to pay while your family is part of the school.
          </p>
        </div>
      </div>
    )
  }

  return (
    <section aria-label={`Membership provided by ${sponsor.name}`}
      className={`flex items-center gap-4 rounded-[20px] bg-[color:var(--mfa-surface-warm)] border border-[color:var(--mfa-border)] px-5 py-4 ${className}`}>
      <SchoolMark sponsor={sponsor} size={52} />
      <div className="min-w-0">
        <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[color:var(--mfa-clay)]">Your school</div>
        <p className="text-[15px] leading-snug text-[color:var(--mfa-ink)] mt-0.5">
          Your membership is made possible by <span className="font-semibold">{sponsor.name}</span>.
        </p>
      </div>
    </section>
  )
}
