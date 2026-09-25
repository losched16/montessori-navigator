'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  loadAnnouncementFeed, markAnnouncementsRead, upcomingEvents, newsItems,
  formatEventWhen, isExternalLink, KIND_LABEL, type Announcement,
} from '@/lib/announcements'

// News, messages and events pushed from /admin/announcements to schools.
// Renders nothing when there's nothing to show. Items are marked read once
// shown so the "New" tags clear on the next visit.
export default function SchoolAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([])
  const [unread, setUnread] = useState<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()
    loadAnnouncementFeed(supabase, 'school')
      .then(({ items, readIds }) => {
        const fresh = items.filter(a => !readIds.has(a.id)).map(a => a.id)
        setItems(items)
        setUnread(new Set(fresh))
        markAnnouncementsRead(supabase, fresh)
      })
      .catch(() => {})
  }, [])

  if (!items.length) return null
  const shown = [...upcomingEvents(items), ...newsItems(items)].slice(0, 5)

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 mb-8">
      <h3 className="font-semibold text-navy-600 mb-3">News &amp; Events from the Foundation</h3>
      <ul className="divide-y divide-gray-100">
        {shown.map(a => (
          <li key={a.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 text-xs mb-0.5">
              <span className="font-bold uppercase tracking-wide text-warm-600">{KIND_LABEL[a.kind]}</span>
              {unread.has(a.id) && <span className="px-1.5 py-0.5 rounded bg-warm-50 text-warm-700 font-medium">New</span>}
              {a.kind === 'event' && (
                <span className="text-navy-600">{formatEventWhen(a)}{a.location ? ` · ${a.location}` : ''}</span>
              )}
            </div>
            <div className="font-medium text-navy-600">{a.title}</div>
            {a.body && <p className="text-sm text-navy-600 mt-0.5 whitespace-pre-line line-clamp-3">{a.body}</p>}
            {a.linkUrl && (
              <a
                href={a.linkUrl}
                {...(isExternalLink(a.linkUrl) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="inline-block mt-1 text-sm font-medium text-warm-600 hover:text-warm-700"
              >
                {a.linkLabel || (a.kind === 'event' ? 'Event details' : 'Learn more')} →
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
