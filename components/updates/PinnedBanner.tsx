import { X, Megaphone, ChevronRight } from 'lucide-react'
import { formatEventWhen, isExternalLink, type Announcement } from '@/lib/announcements'

// Pinned message at the top of Home. Stays until the person dismisses it,
// which marks it read.
export default function PinnedBanner({ item, onDismiss }: { item: Announcement; onDismiss: () => void }) {
  const link = item.linkUrl
  return (
    <div role="status" className="relative rounded-[20px] bg-[color:var(--mfa-purple-soft)] border border-[color:var(--mfa-border)] p-5 pr-12 mb-6">
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="tap-scale absolute top-3 right-3 w-9 h-9 inline-flex items-center justify-center rounded-full text-[color:var(--mfa-ink-secondary)] hover:bg-white/60"
      >
        <X size={18} aria-hidden="true" />
      </button>
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--mfa-purple)] mb-1.5">
        <Megaphone size={14} aria-hidden="true" />
        {item.kind === 'event' ? formatEventWhen(item) : 'From the Foundation'}
      </div>
      <h2 className="font-[family-name:var(--mfa-serif)] text-[20px] leading-snug font-semibold text-[color:var(--mfa-ink)] tracking-tight">
        {item.title}
      </h2>
      {item.body && (
        <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mt-1.5 whitespace-pre-line line-clamp-4">{item.body}</p>
      )}
      {link && (
        <a
          href={link}
          {...(isExternalLink(link) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="tap-scale inline-flex items-center gap-0.5 mt-3 text-[14px] font-semibold text-[color:var(--mfa-navy)] min-h-[36px]"
        >
          {item.linkLabel || (item.kind === 'event' ? 'Event details' : 'Learn more')}
          <ChevronRight size={15} aria-hidden="true" />
        </a>
      )}
    </div>
  )
}
