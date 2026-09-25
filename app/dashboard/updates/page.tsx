'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  loadAnnouncementFeed, markAnnouncementsRead, upcomingEvents, newsItems,
  type Announcement,
} from '@/lib/announcements'
import SectionHeader from '@/components/ui/SectionHeader'
import Skeleton from '@/components/ui/Skeleton'
import EventCard from '@/components/updates/EventCard'
import NewsCard from '@/components/updates/NewsCard'

// News & Events — everything pushed from /admin/announcements for families.
// Opening the page marks every item read (clears the bell badge), but the
// "new" dots stay visible for this visit so people can see what changed.
export default function UpdatesPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      try {
        const { items, readIds } = await loadAnnouncementFeed(supabase, 'parent')
        const unread = items.filter(a => !readIds.has(a.id)).map(a => a.id)
        setItems(items)
        setUnreadIds(new Set(unread))
        markAnnouncementsRead(supabase, unread)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const events = upcomingEvents(items)
  const news = newsItems(items)

  return (
    <div className="max-w-[760px] mx-auto pb-24 sm:pb-10">
      <div className="pt-2 pb-6">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--mfa-clay)] mb-2">
          From the Foundation
        </div>
        <h1 className="font-[family-name:var(--mfa-serif)] text-[32px] sm:text-[40px] leading-[1.05] font-semibold text-[color:var(--mfa-navy)] tracking-tight">
          News &amp; Events
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4" aria-hidden="true">
          <Skeleton className="h-[120px] rounded-[20px]" />
          <Skeleton className="h-[120px] rounded-[20px]" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-6 text-[15px] text-[color:var(--mfa-ink-secondary)]">
          No news or upcoming events right now — check back soon.
        </div>
      ) : (
        <div className="space-y-9">
          {events.length > 0 && (
            <section aria-label="Upcoming events">
              <SectionHeader title="Upcoming Events" />
              <div className="space-y-3">
                {events.map(e => <EventCard key={e.id} event={e} unread={unreadIds.has(e.id)} />)}
              </div>
            </section>
          )}
          {news.length > 0 && (
            <section aria-label="News and updates">
              <SectionHeader title="News & Updates" />
              <div className="space-y-3">
                {news.map(n => <NewsCard key={n.id} item={n} unread={unreadIds.has(n.id)} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
