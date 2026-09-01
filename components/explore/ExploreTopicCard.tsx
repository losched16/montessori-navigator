'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ExploreTopic } from '@/lib/explore'

// Large visual need-based topic card (2-col mobile, 4-col desktop).
export default function ExploreTopicCard({ topic }: { topic: ExploreTopic }) {
  return (
    <Link
      href={`/dashboard/explore?topic=${topic.key}`}
      aria-label={`Explore ${topic.title}`}
      className="tap-scale group relative rounded-[20px] overflow-hidden h-[150px] bg-[color:var(--mfa-surface-warm)] border border-[color:var(--mfa-border)] block"
    >
      <Image
        src={topic.image}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, 250px"
        className="object-cover transition group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" aria-hidden="true" />
      <span className="absolute bottom-0 left-0 right-0 p-3.5 text-white font-semibold text-[15px] leading-snug drop-shadow">
        {topic.title}
      </span>
    </Link>
  )
}
