import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

// Explore section header: serif title, optional subtitle, quiet action.
export default function ExploreSection({ title, subtitle, actionLabel, actionHref, onAction, children }: {
  title: string
  subtitle?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  children: React.ReactNode
}) {
  const action = actionLabel && (
    actionHref ? (
      <Link href={actionHref} className="tap-scale inline-flex items-center gap-0.5 shrink-0 text-[14px] font-medium text-[color:var(--mfa-purple)] min-h-[44px]">
        {actionLabel}
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
    ) : (
      <button onClick={onAction} className="tap-scale inline-flex items-center gap-0.5 shrink-0 text-[14px] font-medium text-[color:var(--mfa-purple)] min-h-[44px]">
        {actionLabel}
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    )
  )

  return (
    <section aria-label={title}>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h2 className="font-[family-name:var(--mfa-serif)] text-[22px] font-semibold text-[color:var(--mfa-ink)] tracking-tight">
          {title}
        </h2>
        {action}
      </div>
      {subtitle && (
        <p className="text-[13.5px] text-[color:var(--mfa-ink-secondary)] mb-3 -mt-0.5">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-3" />}
      {children}
    </section>
  )
}
