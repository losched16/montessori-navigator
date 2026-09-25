// Announcements — news, updates, messages and events pushed by super admins
// from /admin/announcements. Backed by the `announcements` table (see
// supabase-migration-announcements.sql). Readers query with the browser
// client under RLS; per-user read state lives in `announcement_reads`.

export type AnnouncementKind = 'news' | 'update' | 'message' | 'event'
export type AnnouncementAudience = 'parent' | 'school' | 'both'

export interface Announcement {
  id: string
  kind: AnnouncementKind
  title: string
  body: string
  audience: AnnouncementAudience
  linkUrl: string | null
  linkLabel: string | null
  startsAt: string | null
  endsAt: string | null
  location: string | null
  isPinned: boolean
  isPublished: boolean
  publishedAt: string | null
  expiresAt: string | null
  emailedAt: string | null
  emailedCount: number | null
  createdAt: string
}

export function mapAnnouncement(r: any): Announcement {
  return {
    id: r.id,
    kind: r.kind,
    title: r.title,
    body: r.body || '',
    audience: r.audience,
    linkUrl: r.link_url,
    linkLabel: r.link_label,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    location: r.location,
    isPinned: !!r.is_pinned,
    isPublished: !!r.is_published,
    publishedAt: r.published_at,
    expiresAt: r.expires_at,
    emailedAt: r.emailed_at,
    emailedCount: r.emailed_count,
    createdAt: r.created_at,
  }
}

export const KIND_LABEL: Record<AnnouncementKind, string> = {
  news: 'News',
  update: 'Update',
  message: 'Message',
  event: 'Event',
}

export interface AnnouncementFeed {
  items: Announcement[]
  readIds: Set<string>
}

/**
 * Published, unexpired announcements for an audience plus the signed-in
 * user's read state. Past events drop out once they've ended (or started, if
 * they have no end time) so the feed never shows stale events.
 */
export async function loadAnnouncementFeed(
  supabase: any,
  audience: 'parent' | 'school',
): Promise<AnnouncementFeed> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { items: [], readIds: new Set() }

  const [{ data: rows }, { data: reads }] = await Promise.all([
    supabase
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .in('audience', [audience, 'both'])
      .order('published_at', { ascending: false })
      .limit(100),
    supabase.from('announcement_reads').select('announcement_id').eq('user_id', user.id),
  ])

  const now = Date.now()
  const items = (rows || []).map(mapAnnouncement).filter((a: Announcement) => {
    if (a.expiresAt && new Date(a.expiresAt).getTime() <= now) return false
    if (a.kind === 'event') {
      const end = a.endsAt || a.startsAt
      if (end && new Date(end).getTime() < now) return false
    }
    return true
  })

  return {
    items,
    readIds: new Set((reads || []).map((r: any) => r.announcement_id as string)),
  }
}

/** Upcoming events, soonest first. */
export function upcomingEvents(items: Announcement[]): Announcement[] {
  return items
    .filter(a => a.kind === 'event')
    .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime())
}

/** News, updates and messages, newest first. */
export function newsItems(items: Announcement[]): Announcement[] {
  return items.filter(a => a.kind !== 'event')
}

export async function markAnnouncementsRead(supabase: any, ids: string[]) {
  if (!ids.length) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('announcement_reads')
    .upsert(
      ids.map(id => ({ user_id: user.id, announcement_id: id })),
      { onConflict: 'user_id,announcement_id', ignoreDuplicates: true },
    )
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('announcements-read'))
}

export function formatEventWhen(a: Pick<Announcement, 'startsAt' | 'endsAt'>): string {
  if (!a.startsAt) return ''
  const start = new Date(a.startsAt)
  const date = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const time = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (!a.endsAt) return `${date} · ${time(start)}`
  const end = new Date(a.endsAt)
  const sameDay = start.toDateString() === end.toDateString()
  return sameDay
    ? `${date} · ${time(start)} – ${time(end)}`
    : `${date} ${time(start)} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${time(end)}`
}

export function isExternalLink(url: string): boolean {
  return /^https?:\/\//i.test(url)
}
