import { cn } from '@/lib/utils'

// Simple shimmer block for loading states.
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-2xl bg-[color:var(--mfa-surface-warm)]', className)}
    />
  )
}
