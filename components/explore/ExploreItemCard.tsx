'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, FileText, Play, Newspaper, Hand, type LucideIcon } from 'lucide-react'
import type { ExploreItem } from '@/lib/explore'

// One consistent discovery/search result card across every content kind.
// Activities call onOpenActivity (detail sheet); everything else navigates.

const KIND_ICONS: Record<string, LucideIcon> = {
  article: BookOpen, resource: FileText, newsletter: Newspaper, activity: Hand,
}

// Deterministic warm fallback art for items without imagery — never gray.
const FALLBACK_TONES = [
  { bg: 'var(--mfa-surface-sage)', fg: 'var(--mfa-forest)' },
  { bg: 'var(--mfa-clay-soft)', fg: 'var(--mfa-clay)' },
  { bg: 'var(--mfa-purple-soft)', fg: 'var(--mfa-purple)' },
  { bg: 'var(--mfa-surface-warm)', fg: 'var(--mfa-ochre)' },
]

function toneFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return FALLBACK_TONES[Math.abs(h) % FALLBACK_TONES.length]
}

export default function ExploreItemCard({ item, onOpenActivity }: {
  item: ExploreItem
  onOpenActivity?: (item: ExploreItem) => void
}) {
  const Icon = item.isVideo ? Play : (KIND_ICONS[item.kind] || BookOpen)
  const tone = toneFor(item.id)
  const image = item.image || item.videoThumb

  const inner = (
    <>
      <div className="relative w-[84px] h-[63px] rounded-xl overflow-hidden shrink-0" style={{ background: tone.bg }}>
        {image ? (
          image.startsWith('/') ? (
            <Image src={image} alt="" fill sizes="84px" className="object-cover" loading="lazy" />
          ) : (
            // External imagery (YouTube thumbs, storage covers) — plain img
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          )
        ) : (
          <span className="absolute inset-0 flex items-center justify-center" style={{ color: tone.fg }} aria-hidden="true">
            <Icon size={22} />
          </span>
        )}
        {item.isVideo && image && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/25" aria-hidden="true">
            <span className="w-8 h-8 rounded-full bg-white/90 inline-flex items-center justify-center text-[color:var(--mfa-ink)]">
              <Play size={14} className="ml-0.5" />
            </span>
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {item.category && (
          <div className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-[color:var(--mfa-clay)] mb-0.5 truncate">
            {item.category}
          </div>
        )}
        <div className="text-[15px] font-semibold text-[color:var(--mfa-ink)] leading-snug line-clamp-2">
          {item.title}
        </div>
        {item.metadata && (
          <div className="text-[12px] text-[color:var(--mfa-ink-muted)] mt-0.5">
            {item.metadata}{item.agePlane ? ` · Ages ${item.agePlane}` : ''}
          </div>
        )}
      </div>
    </>
  )

  const classes = 'tap-scale w-full flex items-center gap-3.5 text-left rounded-[16px] bg-white border border-[color:var(--mfa-border)] p-3 hover:shadow-md transition'

  if (item.kind === 'activity') {
    return (
      <button onClick={() => onOpenActivity?.(item)} className={classes}>
        {inner}
      </button>
    )
  }
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    )
  }
  return (
    <Link href={item.href || '#'} className={classes}>
      {inner}
    </Link>
  )
}
