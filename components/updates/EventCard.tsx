import { MapPin, ChevronRight } from 'lucide-react'
import { formatEventWhen, isExternalLink, type Announcement } from '@/lib/announcements'

// One upcoming event: calendar-style date block, title, time, location and an
// optional register/details link.
export default function EventCard({ event, unread }: { event: Announcement; unread?: boolean }) {
  const start = new Date(event.startsAt!)
  const link = event.linkUrl
  return (
    <article className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5 flex gap-4">
      <div className="shrink-0 w-[58px] h-[64px] rounded-[14px] bg-[color:var(--mfa-purple-soft)] text-[color:var(--mfa-purple)] flex flex-col items-center justify-center">
        <span className="text-[11px] font-bold tracking-[0.12em] uppercase">
          {start.toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className="font-[family-name:var(--mfa-serif)] text-[26px] leading-none font-semibold">{start.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-[family-name:var(--mfa-serif)] text-[19px] leading-snug font-semibold text-[color:var(--mfa-ink)] tracking-tight">
          {unread && <span className="inline-block w-2 h-2 rounded-full bg-[color:var(--mfa-clay)] mr-2 align-middle" aria-label="New" />}
          {event.title}
        </h3>
        <div className="text-[13.5px] text-[color:var(--mfa-ink-secondary)] mt-1">{formatEventWhen(event)}</div>
        {event.location && (
          <div className="flex items-center gap-1 text-[13.5px] text-[color:var(--mfa-ink-muted)] mt-0.5">
            <MapPin size={13} aria-hidden="true" /> {event.location}
          </div>
        )}
        {event.body && (
          <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mt-2 whitespace-pre-line line-clamp-3">{event.body}</p>
        )}
        {link && (
          <a
            href={link}
            {...(isExternalLink(link) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="tap-scale inline-flex items-center gap-0.5 mt-3 text-[14px] font-semibold text-[color:var(--mfa-navy)] min-h-[36px]"
          >
            {event.linkLabel || 'Event details'}
            <ChevronRight size={15} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  )
}
