import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isSuperAdmin } from '@/lib/super-admin'
import { sendAnnouncementEmails } from '@/lib/email'
import { mapAnnouncement, formatEventWhen, KIND_LABEL, type Announcement } from '@/lib/announcements'

export const dynamic = 'force-dynamic'

// /api/admin/announcements — super-admin-only management of news, updates,
// messages and events shown in the family app and on the school dashboard.
//
// GET    → all announcements (drafts included), newest first
// POST   → create. Body: announcement fields (see parseFields) + sendEmail?
// PATCH  → { id, ...fields } update, and/or { id, sendEmail: true } to email
//          it (only once, only when published)
// DELETE → ?id=…

const KINDS = ['news', 'update', 'message', 'event'] as const
const AUDIENCES = ['parent', 'school', 'both'] as const

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function authedSuperAdmin() {
  const cookieStore = cookies()
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) { try { cookieStore.set({ name, value, ...options }) } catch (e) {} },
        remove(name: string, options: any) { try { cookieStore.set({ name, value: '', ...options }) } catch (e) {} },
      },
    },
  )
  const { data: { user } } = await ssr.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 as const }
  const allowed = await isSuperAdmin(user.id)
  if (!allowed) return { error: 'Forbidden', status: 403 as const }
  return { user }
}

function toIso(v: unknown): string | null {
  if (!v) return null
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

// Validates the editable fields. Returns the DB row or an error message.
function parseFields(body: any): { row: Record<string, any> } | { error: string } {
  const kind = String(body?.kind || '')
  if (!(KINDS as readonly string[]).includes(kind)) return { error: 'Choose a type.' }
  const audience = String(body?.audience || 'parent')
  if (!(AUDIENCES as readonly string[]).includes(audience)) return { error: 'Choose an audience.' }

  const title = String(body?.title || '').trim()
  if (!title) return { error: 'Title is required.' }
  if (title.length > 200) return { error: 'Title must be 200 characters or fewer.' }

  const linkUrl = String(body?.linkUrl || '').trim() || null
  if (linkUrl && !/^(https?:\/\/|\/)/i.test(linkUrl)) {
    return { error: 'Link must start with https:// or / (for a page in the app).' }
  }

  const startsAt = kind === 'event' ? toIso(body?.startsAt) : null
  const endsAt = kind === 'event' ? toIso(body?.endsAt) : null
  if (kind === 'event' && !startsAt) return { error: 'Events need a start date and time.' }
  if (startsAt && endsAt && endsAt < startsAt) return { error: 'End time must be after the start time.' }

  return {
    row: {
      kind,
      audience,
      title,
      body: String(body?.body || '').trim(),
      link_url: linkUrl,
      link_label: linkUrl ? (String(body?.linkLabel || '').trim() || null) : null,
      starts_at: startsAt,
      ends_at: endsAt,
      location: kind === 'event' ? (String(body?.location || '').trim() || null) : null,
      is_pinned: !!body?.isPinned,
      expires_at: toIso(body?.expiresAt),
    },
  }
}

// Supabase caps a single query at 1,000 rows, so page through everything.
async function fetchAll(page: (from: number, to: number) => PromiseLike<{ data: any[] | null; error: any }>) {
  const rows: any[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await page(from, from + 999)
    if (error) throw new Error(error.message)
    rows.push(...(data || []))
    if (!data || data.length < 1000) return rows
  }
}

// Emails of active members in the announcement's audience.
//   parent → parents with an active/trialing subscription, plus parents whose
//            family belongs to an active school
//   school → billing contacts of active/trialing (incl. comped) schools
async function recipientsFor(
  service: ReturnType<typeof getServiceClient>,
  audience: Announcement['audience'],
): Promise<string[]> {
  const emails: string[] = []

  if (audience === 'parent' || audience === 'both') {
    const paying = await fetchAll((from, to) => service
      .from('parents')
      .select('email')
      .in('subscription_status', ['active', 'trialing'])
      .not('email', 'is', null)
      .order('id')
      .range(from, to))
    emails.push(...paying.map((p: any) => p.email))

    const schoolFams = await fetchAll((from, to) => service
      .from('school_families')
      .select('family_id, schools!inner(subscription_status)')
      .eq('status', 'active')
      .in('schools.subscription_status', ['active', 'trialing', 'past_due'])
      .order('id')
      .range(from, to))
    const familyIds = Array.from(new Set(schoolFams.map((f: any) => f.family_id)))
    for (let i = 0; i < familyIds.length; i += 200) {
      const { data: members } = await service
        .from('family_members')
        .select('parents!inner(email)')
        .in('family_id', familyIds.slice(i, i + 200))
      emails.push(...(members || []).map((m: any) => m.parents?.email).filter(Boolean))
    }
  }

  if (audience === 'school' || audience === 'both') {
    const { data: schools } = await service
      .from('schools')
      .select('billing_email')
      .in('subscription_status', ['active', 'trialing'])
      .not('billing_email', 'is', null)
    emails.push(...(schools || []).map((s: any) => s.billing_email))
  }

  return Array.from(new Set(emails.map(e => String(e).trim().toLowerCase()).filter(e => e.includes('@'))))
}

async function emailAnnouncement(
  service: ReturnType<typeof getServiceClient>,
  a: Announcement,
): Promise<{ sent: number; errors: string[] }> {
  const recipients = await recipientsFor(service, a.audience)
  if (!recipients.length) return { sent: 0, errors: ['No active members found for this audience.'] }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://familyalliance.montessori.org'
  const inApp = a.audience === 'school' ? `${appUrl}/school` : `${appUrl}/dashboard/updates`
  const ctaUrl = a.linkUrl ? (a.linkUrl.startsWith('/') ? `${appUrl}${a.linkUrl}` : a.linkUrl) : inApp
  const ctaLabel = a.linkUrl ? (a.linkLabel || (a.kind === 'event' ? 'Event details' : 'Learn more')) : 'Open Family Alliance'

  const result = await sendAnnouncementEmails({
    recipients,
    kindLabel: KIND_LABEL[a.kind],
    title: a.title,
    body: a.body,
    eventWhen: a.kind === 'event' ? formatEventWhen(a) : undefined,
    location: a.location,
    ctaLabel,
    ctaUrl,
  })

  if (result.sent > 0) {
    await service
      .from('announcements')
      .update({ emailed_at: new Date().toISOString(), emailed_count: result.sent })
      .eq('id', a.id)
  }
  return result
}

export async function GET() {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { data, error } = await getServiceClient()
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ announcements: (data || []).map(mapAnnouncement) })
}

export async function POST(req: NextRequest) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => ({}))
  const parsed = parseFields(body)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const publish = !!body?.isPublished
  const service = getServiceClient()
  const { data, error } = await service
    .from('announcements')
    .insert({
      ...parsed.row,
      is_published: publish,
      published_at: publish ? new Date().toISOString() : null,
      created_by: auth.user.id,
    })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let announcement = mapAnnouncement(data)
  let email: { sent: number; errors: string[] } | undefined
  if (publish && body?.sendEmail) {
    email = await emailAnnouncement(service, announcement).catch((e: any) => ({ sent: 0, errors: [e.message] }))
    if (email.sent > 0) announcement = { ...announcement, emailedAt: new Date().toISOString(), emailedCount: email.sent }
  }

  return NextResponse.json({ ok: true, announcement, email })
}

export async function PATCH(req: NextRequest) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => ({}))
  const id = String(body?.id || '')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })

  const service = getServiceClient()
  const { data: existing } = await service.from('announcements').select('*').eq('id', id).maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

  const update: Record<string, any> = {}

  // Full edit when the form fields are present.
  if (body?.kind !== undefined) {
    const parsed = parseFields(body)
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
    Object.assign(update, parsed.row)
  }
  if (typeof body?.isPinned === 'boolean') update.is_pinned = body.isPinned
  if (typeof body?.isPublished === 'boolean') {
    update.is_published = body.isPublished
    // First publish stamps published_at; re-publishing keeps the original date.
    if (body.isPublished && !existing.published_at) update.published_at = new Date().toISOString()
  }

  let row = existing
  if (Object.keys(update).length) {
    const { data, error } = await service.from('announcements').update(update).eq('id', id).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    row = data
  }

  let announcement = mapAnnouncement(row)
  let email: { sent: number; errors: string[] } | undefined
  if (body?.sendEmail) {
    if (!announcement.isPublished) {
      return NextResponse.json({ error: 'Publish it before emailing.' }, { status: 400 })
    }
    if (announcement.emailedAt) {
      return NextResponse.json({ error: 'This has already been emailed.' }, { status: 409 })
    }
    email = await emailAnnouncement(service, announcement).catch((e: any) => ({ sent: 0, errors: [e.message] }))
    if (email.sent > 0) announcement = { ...announcement, emailedAt: new Date().toISOString(), emailedCount: email.sent }
  }

  return NextResponse.json({ ok: true, announcement, email })
}

export async function DELETE(req: NextRequest) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
  const { error } = await getServiceClient().from('announcements').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
