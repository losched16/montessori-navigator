import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string | null
  size?: number
  className?: string
}

// Deterministic warm background per name so each child keeps their color.
const BG = ['#E9EEE5', '#F5E8E0', '#EEE8F6', '#F1ECE3']
const FG = ['#344A3A', '#B96943', '#4A2C82', '#68665F']

export default function Avatar({ name, src, size = 36, className }: AvatarProps) {
  const initial = (name || '?').trim().charAt(0).toUpperCase()
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  const idx = Math.abs(hash) % BG.length

  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn('rounded-full object-cover shrink-0', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn('rounded-full inline-flex items-center justify-center font-semibold shrink-0', className)}
      style={{
        width: size, height: size,
        background: BG[idx], color: FG[idx],
        fontSize: Math.round(size * 0.42),
      }}
    >
      {initial}
    </span>
  )
}
