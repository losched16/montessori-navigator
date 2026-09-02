import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  actionLabel?: string
  actionHref?: string
}

// Section title row for the Home feed: serif title left, quiet action right.
export default function SectionHeader({ title, actionLabel, actionHref }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="font-[family-name:var(--mfa-serif)] text-[23px] sm:text-[27px] font-semibold text-[color:var(--mfa-navy)] tracking-tight">
        {title}
      </h2>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="tap-scale inline-flex items-center gap-0.5 text-[14px] font-medium text-[color:var(--mfa-navy)] min-h-[44px]"
        >
          {actionLabel}
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
