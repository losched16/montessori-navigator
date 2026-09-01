'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import type { ExploreItem } from '@/lib/explore'

// Watch-row card: real video thumbnail when derivable, warm placeholder
// otherwise. No invented durations.
export default function VideoCard({ item }: { item: ExploreItem }) {
  return (
    <Link
      href={item.href || '#'}
      className="tap-scale shrink-0 snap-start w-[240px] group"
      aria-label={`Watch: ${item.title}`}
    >
      <span className="relative block aspect-video rounded-[14px] overflow-hidden bg-[color:var(--mfa-clay-soft)] border border-[color:var(--mfa-border)]">
        {item.videoThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.videoThumb} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="absolute inset-0" aria-hidden="true" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition" aria-hidden="true">
          <span className="w-10 h-10 rounded-full bg-white/90 inline-flex items-center justify-center text-[color:var(--mfa-ink)]">
            <Play size={16} className="ml-0.5" />
          </span>
        </span>
      </span>
      <span className="block text-[13.5px] font-semibold text-[color:var(--mfa-ink)] leading-snug line-clamp-2 mt-2">
        {item.title}
      </span>
      <span className="block text-[11.5px] text-[color:var(--mfa-ink-muted)] mt-0.5">Video</span>
    </Link>
  )
}
