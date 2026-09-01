import { cn } from '@/lib/utils'

interface ChipProps {
  children: React.ReactNode
  tone?: 'purple' | 'clay' | 'sage' | 'neutral'
  className?: string
}

const TONES = {
  purple: 'bg-[color:var(--mfa-purple-soft)] text-[color:var(--mfa-purple)]',
  clay: 'bg-[color:var(--mfa-clay-soft)] text-[color:var(--mfa-clay)]',
  sage: 'bg-[color:var(--mfa-sage-soft)] text-[color:var(--mfa-forest)]',
  neutral: 'bg-[color:var(--mfa-surface-warm)] text-[color:var(--mfa-ink-secondary)]',
}

export default function Chip({ children, tone = 'neutral', className }: ChipProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide',
      TONES[tone], className,
    )}>
      {children}
    </span>
  )
}
