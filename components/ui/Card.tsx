import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  tone?: 'surface' | 'warm' | 'sage' | 'purple'
}

const TONES = {
  surface: 'bg-[color:var(--mfa-surface)]',
  warm: 'bg-[color:var(--mfa-surface-warm)]',
  sage: 'bg-[color:var(--mfa-surface-sage)]',
  purple: 'bg-[color:var(--mfa-purple-soft)]',
}

export default function Card({ children, className, tone = 'surface' }: CardProps) {
  return (
    <div className={cn('rounded-[20px] border border-[color:var(--mfa-border)]', TONES[tone], className)}>
      {children}
    </div>
  )
}
