'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { loadAnnouncementFeed } from '@/lib/announcements'

// Header bell linking to /dashboard/updates, with a count of unread news,
// messages and events. Refreshes on navigation and whenever items are marked
// read elsewhere (markAnnouncementsRead fires 'announcements-read').
export default function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    const refresh = async () => {
      try {
        const { items, readIds } = await loadAnnouncementFeed(createClient(), 'parent')
        if (!cancelled) setUnread(items.filter(a => !readIds.has(a.id)).length)
      } catch {
        // Table missing or offline — just show no badge.
      }
    }
    refresh()
    window.addEventListener('announcements-read', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('announcements-read', refresh)
    }
  }, [pathname])

  const active = pathname === '/dashboard/updates'
  return (
    <Link
      href="/dashboard/updates"
      aria-label={unread ? `News and events, ${unread} new` : 'News and events'}
      className={`tap-scale relative w-11 h-11 inline-flex items-center justify-center rounded-full transition ${
        active
          ? 'bg-[color:var(--mfa-purple-soft)] text-[color:var(--mfa-purple)]'
          : 'text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]'
      }`}
    >
      <Bell size={21} aria-hidden="true" />
      {unread > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[color:var(--mfa-clay)] text-white text-[10.5px] font-bold leading-[18px] text-center"
        >
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}
