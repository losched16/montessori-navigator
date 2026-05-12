import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isSuperAdmin } from '@/lib/super-admin'

export const dynamic = 'force-dynamic'

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
  const allowed = await isSuperAdmin(ssr, user.id)
  if (!allowed) return { error: 'Forbidden', status: 403 as const }
  return { user }
}

// GET /api/admin/team — list current super admins (email + granted_by + when)
export async function GET() {
  const auth = await authedSuperAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const service = getServiceClient()

  // Pull super_admins rows, then enrich with email via auth.users (RLS-free via service)
  const { data: rows } = await service
    .from('super_admins')
    .select('user_id, role, granted_by, created_at')
    .order('created_at', { ascending: true })

  const list = rows || []
  if (list.length === 0) return NextResponse.json({ team: [], me: auth.user.id })

  // Fetch emails via service role auth admin API in batch
  const userIds = Array.from(new Set([
    ...list.map((r: any) => r.user_id),
    ...list.map((r: any) => r.granted_by).filter(Boolean),
  ]))

  const emailById: Record<string, string | null> = {}
  for (const uid of userIds) {
    try {
      const { data } = await service.auth.admin.getUserById(uid)
      emailById[uid] = data?.user?.email || null
    } catch {
      emailById[uid] = null
    }
  }

  const team = list.map((r: any) => ({
    userId: r.user_id,
    email: emailById[r.user_id] || null,
    role: r.role,
    grantedBy: r.granted_by,
    grantedByEmail: r.granted_by ? emailById[r.granted_by] || null : null,
    createdAt: r.created_at,
    isYou: r.user_id === auth.user.id,
  }))

  return NextResponse.json({ team, me: auth.user.id })
}

// POST /api/admin/team — add a user as super admin by email
//   body: { email: string, role?: 'super_admin' | 'editor' }
export async function POST(req: NextRequest) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await req.json().catch(() => ({}))
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const role = body?.role === 'editor' ? 'editor' : 'super_admin'

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const service = getServiceClient()

  // Find the user by email. We use listUsers because auth.admin.getUserByEmail
  // doesn't exist in all SDK versions; listing with a filter is reliable.
  // Note: at small scale (under a few hundred auth users) this is fine.
  // If we cross that threshold, switch to a paginated lookup or a direct
  // query against auth.users via the service role.
  let targetUserId: string | null = null
  let page = 1
  while (page <= 5 && !targetUserId) {
    const { data } = await service.auth.admin.listUsers({ page, perPage: 200 })
    const users = data?.users || []
    const match = users.find((u: any) => (u.email || '').toLowerCase() === email)
    if (match) {
      targetUserId = match.id
      break
    }
    if (users.length < 200) break
    page++
  }

  if (!targetUserId) {
    return NextResponse.json({
      error: `No account found for ${email}. Ask them to sign up at /auth/signup first, then add them here.`,
    }, { status: 404 })
  }

  // Idempotent: if they're already in super_admins, we no-op and return ok
  const { data: existing } = await service
    .from('super_admins')
    .select('user_id')
    .eq('user_id', targetUserId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ ok: true, alreadyExisted: true })
  }

  const { error } = await service
    .from('super_admins')
    .insert({
      user_id: targetUserId,
      role,
      granted_by: auth.user.id,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/team — remove a super admin
//   body: { userId: string }
// Self-removal is allowed only if you're not the last super admin (otherwise
// you'd lock everyone out of /admin).
export async function DELETE(req: NextRequest) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await req.json().catch(() => ({}))
  const userId = typeof body?.userId === 'string' ? body.userId : ''
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const service = getServiceClient()

  // Block lockout: if this would remove the only super admin, reject.
  const { count } = await service
    .from('super_admins')
    .select('user_id', { count: 'exact', head: true })
  if ((count || 0) <= 1) {
    return NextResponse.json({
      error: 'Cannot remove the only super admin. Add another team member first.',
    }, { status: 400 })
  }

  const { error } = await service
    .from('super_admins')
    .delete()
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
