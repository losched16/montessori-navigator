import { ChevronRight } from 'lucide-react'
import { KIND_LABEL, isExternalLink, type Announcement } from '@/lib/announcements'

// A news item, update or message. `compact` clamps the body for the Home feed;
// the full Updates page shows everything.
export default function NewsCard({ item, unread, compact }: { item: Announcement; unread?: boolean; compact?: boolean }) {
  const link = item.linkUrl
  const date = item.publishedAt || item.createdAt
  return (
    <article className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5">
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--mfa-clay)] mb-1.5">
        {unread && <span className="w-2 h-2 rounded-full bg-[color:var(--mfa-clay)]" aria-label="New" />}
        {KIND_LABEL[item.kind]}
        <span className="font-medium tracking-normal normal-case text-[12px] text-[color:var(--mfa-ink-muted)]">
          · {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <h3 className="font-[family-name:var(--mfa-serif)] text-[19px] leading-snug font-semibold text-[color:var(--mfa-ink)] tracking-tight">
        {item.title}
      </h3>
      {item.body && (
        <p className={`text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mt-1.5 whitespace-pre-line ${compact ? 'line-clamp-3' : ''}`}>
          {item.body}
        </p>
      )}
      {link && (
        <a
          href={link}
          {...(isExternalLink(link) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="tap-scale inline-flex items-center gap-0.5 mt-3 text-[14px] font-semibold text-[color:var(--mfa-navy)] min-h-[36px]"
        >
          {item.linkLabel || 'Learn more'}
          <ChevronRight size={15} aria-hidden="true" />
        </a>
      )}
    </article>
  )
}
