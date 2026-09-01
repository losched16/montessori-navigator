import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// Abigail's visual mark — a quiet purple roundel, used in the header,
// empty state, and beside every assistant response.
export default function AbigailMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex items-center justify-center rounded-full bg-[color:var(--mfa-purple)] text-white shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <Sparkles size={Math.round(size * 0.55)} />
    </span>
  )
}
