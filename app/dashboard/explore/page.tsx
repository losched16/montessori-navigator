'use client'

import Link from 'next/link'
import Image from 'next/image'

// Transitional Explore landing — makes the new primary navigation functional.
// Deep filtering and a full Explore redesign are later phases.
const TOPICS: Array<{ label: string; href: string; image: string }> = [
  { label: 'Activities', href: '/dashboard/plans', image: '/images/environment/play-area.jpg' },
  { label: 'Parenting', href: '/dashboard/library?category=Montessori%20Parenting', image: '/images/environment/girl-painting.jpg' },
  { label: 'Montessori at Home', href: '/dashboard/environment', image: '/images/environment/living-room-setup.jpg' },
  { label: 'Development', href: '/dashboard/journey', image: '/images/environment/baby-playing.jpg' },
  { label: 'Montessori 101', href: '/dashboard/start-here', image: '/images/environment/reading-nook.jpg' },
  { label: 'Videos', href: '/dashboard/library?category=Video%20%26%20Webinars', image: '/images/environment/boy-outdoor.jpg' },
  { label: "Tomorrow's Child", href: "/dashboard/library?category=Tomorrow's%20Child", image: '/images/environment/girl-reading.jpg' },
  { label: 'Library', href: '/dashboard/library', image: '/images/environment/girls-art.jpg' },
]

export default function ExplorePage() {
  return (
    <div className="max-w-[900px] mx-auto pb-24 sm:pb-10">
      <div className="pt-2 pb-6">
        <h1 className="font-[family-name:var(--mfa-serif)] text-[32px] sm:text-[40px] leading-[1.05] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-2">
          Explore Montessori
        </h1>
        <p className="text-[16px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-lg">
          Find ideas, guidance and resources for what your family needs today.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {TOPICS.map(topic => (
          <Link
            key={topic.label}
            href={topic.href}
            className="tap-scale group relative rounded-[20px] overflow-hidden aspect-[4/3] bg-[color:var(--mfa-surface-warm)] border border-[color:var(--mfa-border)]"
          >
            <Image
              src={topic.image}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 300px"
              className="object-cover transition group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden="true" />
            <span className="absolute bottom-0 left-0 right-0 p-3.5 text-white font-semibold text-[15px] sm:text-[16px] leading-tight drop-shadow">
              {topic.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
