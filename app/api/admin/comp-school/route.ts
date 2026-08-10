import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { isSuperAdmin } from '@/lib/super-admin'

export const dynamic = 'force-dynamic'

// POST /api/admin/comp-school
// Super-admin-only. Creates a free ("comped") school and links the head of
// school (who must already have an account) as its admin. The school is stored
// as subscription_status 'active' with is_comped = true, so it's treated as
// paid everywhere and gets the family_count + 20-staff seat model.
//
// Body: { name, state, seats, adminEmail, note?, compType? }

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
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

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => ({}))
  const name = String(body?.name || '').trim()
  const state = String(body?.state || '').trim().toUpperCase()
  const seats = parseInt(String(body?.seats || ''), 10)
  const adminEmail = String(body?.adminEmail || '').trim().toLowerCase()
  const note = String(body?.note || '').trim() || null

  if (!name || !state || !adminEmail) {
    return NextResponse.json({ error: 'School name, state, and admin email are required.' }, { status: 400 })
  }
  if (!Number.isFinite(seats) || seats < 1) {
    return NextResponse.json({ error: 'Enter the number of family subscriptions (1 or more).' }, { status: 400 })
  }

  const service = getServiceClient()

  // Find the head-of-school account (must exist first, like super-admin grants).
  let targetUserId: string | null = null
  let page = 1
  while (page <= 5 && !targetUserId) {
    const { data } = await service.auth.admin.listUsers({ page, perPage: 200 })
    const users = data?.users || []
    const match = users.find((u: any) => (u.email || '').toLowerCase() === adminEmail)
    if (match) { targetUserId = match.id; break }
    if (users.length < 200) break
    page++
  }
  if (!targetUserId) {
    return NextResponse.json({
      error: `No account found for ${adminEmail}. Ask the head of school to sign up at /auth/signup first, then comp them here.`,
    }, { status: 404 })
  }

  // Unique slug from name + state.
  let base = slugify(`${name}-${state}`)
  let slug = base
  for (let i = 2; i <= 20; i++) {
    const { data: existing } = await service.from('schools').select('id').eq('slug', slug).maybeSingle()
    if (!existing) break
    slug = `${base}-${i}`
  }

  // Create the comped school (active + is_comped, seat count = family_count).
  const schoolId = randomUUID()
  const { error: schoolErr } = await service.from('schools').insert({
    id: schoolId,
    name,
    slug,
    state,
    admin_user_id: targetUserId,
    subscription_status: 'active',
    is_comped: true,
    family_count: seats,
    comp_note: note,
    billing_email: adminEmail,
  })
  if (schoolErr) {
    return NextResponse.json({ error: 'Failed to create school: ' + schoolErr.message }, { status: 500 })
  }

  // Link the head of school as admin.
  const { error: staffErr } = await service.from('school_staff').insert({
    school_id: schoolId,
    user_id: targetUserId,
    role: 'admin',
  })
  if (staffErr) {
    // Non-fatal — the school exists; report so the admin link can be retried.
    return NextResponse.json({
      ok: true,
      schoolId,
      slug,
      warning: 'School created, but linking the admin failed: ' + staffErr.message,
    })
  }

  return NextResponse.json({ ok: true, schoolId, slug, seats, staffBuffer: 20 })
}
