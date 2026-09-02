'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Play, ChevronRight } from 'lucide-react'
import type { ArticleMeta } from '@/lib/articles-metadata'
import { useChild } from '@/lib/child-context'
import { trackEvent, getSafeChildAnalyticsContext } from '@/lib/analytics'

// Real photography per broad category — warm and honest (lifestyle imagery,
// never pretending to depict the specific article).
const CATEGORY_IMAGES: Array<{ match: RegExp; image: string }> = [
  { match: /parenting|family|grandparent|grace/i, image: '/images/environment/girl-painting.jpg' },
  { match: /education|curriculum|primary|elementary|toddler|infant/i, image: '/images/environment/girl-reading.jpg' },
  { match: /book/i, image: '/images/environment/reading-nook.jpg' },
  { match: /video|webinar/i, image: '/images/environment/girls-art.jpg' },
]

// One learning recommendation — a single Foundation article, not a grid.
export default function EditorialCard({ article }: { article: ArticleMeta }) {
  const { selectedChild } = useChild()
  const category = article.categories.filter(c => c !== 'MFA' && !c.startsWith('TC '))[0] || 'Montessori'
  const minutes = article.readMinutes
  const isVideo = !!article.videoIds?.length
  const videoThumb = isVideo ? `https://i.ytimg.com/vi/${article.videoIds![0]}/hqdefault.jpg` : undefined
  const image = videoThumb
    || CATEGORY_IMAGES.find(c => c.match.test(category))?.image
    || '/images/environment/reading-nook.jpg'

  const track = () => trackEvent('article_opened', {
    source: 'home',
    category,
    age_plane: getSafeChildAnalyticsContext(selectedChild).age_plane,
  })

  return (
    <Link
      href={`/dashboard/library/${article.slug}`}
      onClick={track}
      className="tap-scale block rounded-[20px] bg-[color:var(--mfa-surface-warm)] border border-[color:var(--mfa-border)] overflow-hidden hover:shadow-md transition group sm:flex sm:items-stretch"
    >
      <div className="relative h-[150px] sm:h-auto sm:w-[220px] shrink-0 bg-[color:var(--mfa-clay-soft)]">
        {videoThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={videoThumb} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        ) : (
          <Image src={image} alt="" fill sizes="(max-width: 640px) 100vw, 220px" className="object-cover" loading="lazy" />
        )}
        {isVideo && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/20" aria-hidden="true">
            <span className="w-10 h-10 rounded-full bg-white/90 inline-flex items-center justify-center text-[color:var(--mfa-ink)]">
              <Play size={16} className="ml-0.5" />
            </span>
          </span>
        )}
      </div>
      <div className="p-5 sm:p-6 flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--mfa-clay)] mb-2">
          <BookOpen size={14} aria-hidden="true" />
          {category}
        </div>
        <h3 className="font-[family-name:var(--mfa-serif)] text-[21px] sm:text-[24px] leading-snug font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-2 group-hover:opacity-80 transition line-clamp-3">
          {article.title}
        </h3>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-[color:var(--mfa-ink-muted)] truncate">
            {article.author} · {isVideo ? 'Video' : `${minutes} min read`}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[14px] font-semibold text-[color:var(--mfa-purple)] shrink-0">
            {isVideo ? 'Watch' : 'Read'}
            <ChevronRight size={15} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}
