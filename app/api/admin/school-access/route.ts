import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'
import { isSuperAdmin } from '@/lib/super-admin'
import { ACTIVE_SCHOOL_COOKIE } from '@/lib/active-school'

export const dynamic = 'force-dynamic'

// /api/admin/school-access — super admins manage a school's portal on its
// behalf (e.g. Foundation staff inviting families for a school that asked for
// help).
//
// GET    → { schools: [{ schoolId, isSupport }] } the caller's memberships
// POST   → { schoolId } add the caller as a support admin of that school
//          (school_staff row, is_support = true) and make it the active school
// DELETE → ?schoolId=… remove the caller's support row for that school. Never
//          touches a real (non-support) membership.

function service() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function authedSuperAdmin() {
  const { data: { user } } = await createServerSupabase().auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 as const }
  if (!(await isSuperAdmin(user.id))) return { error: 'Forbidden', status: 403 as const }
  return { user }
}

export async function GET() {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { data, error } = await service()
    .from('school_staff')
    .select('school_id, is_support')
    .eq('user_id', auth.user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    schools: (data || []).map(r => ({ schoolId: r.school_id, isSupport: !!r.is_support })),
  })
}

export async function POST(req: NextRequest) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => ({}))
  const schoolId = String(body?.schoolId || '')
  if (!schoolId) return NextResponse.json({ error: 'Missing schoolId.' }, { status: 400 })

  const db = service()
  const { data: school } = await db.from('schools').select('id').eq('id', schoolId).maybeSingle()
  if (!school) return NextResponse.json({ error: 'School not found.' }, { status: 404 })

  // Already a member (support or the school's own admin) → just switch to it.
  const { data: existing } = await db
    .from('school_staff')
    .select('id')
    .eq('school_id', schoolId)
    .eq('user_id', auth.user.id)
    .maybeSingle()
  if (!existing) {
    const { error } = await db.from('school_staff').insert({
      school_id: schoolId,
      user_id: auth.user.id,
      role: 'admin',
      is_support: true,
    })
    if (error) return NextResponse.json({ error: 'Could not grant access: ' + error.message }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ACTIVE_SCHOOL_COOKIE, schoolId, { path: '/', maxAge: 31536000, sameSite: 'lax' })
  return res
}

export async function DELETE(req: NextRequest) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const schoolId = req.nextUrl.searchParams.get('schoolId')
  if (!schoolId) return NextResponse.json({ error: 'Missing schoolId.' }, { status: 400 })

  const { error } = await service()
    .from('school_staff')
    .delete()
    .eq('school_id', schoolId)
    .eq('user_id', auth.user.id)
    .eq('is_support', true)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
