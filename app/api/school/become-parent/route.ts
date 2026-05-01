import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/school/become-parent
//
// One-click "set up parent view" for a logged-in school admin.
//
// Why this exists: when an admin clicks "Try parent experience" we used to
// link to /auth/signup, but middleware bounces logged-in users away from
// /auth/* → /dashboard, and /dashboard bounces school-staff-without-a-parent
// back to /school. Net result: an infinite bounce loop and they never see
// the parent side.
//
// This endpoint sidesteps all of that. We reuse the same data shape as the
// regular signup flow (parents + families + family_members) so the parent
// dashboard renders the same way it does for any other user. The only
// difference is the user keeps both their school admin role AND their new
// parent role on the same account.
//
// Idempotent — safe to call multiple times. If the user already has a parent
// record, we no-op and return success.

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  // 1) Authenticate via the user's session (anon client + cookies)
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
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // 2) Confirm they're actually a school admin — this endpoint is not for
  // anyone else. Regular users sign up via /auth/signup.
  const { data: staff } = await ssr
    .from('school_staff')
    .select('school_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!staff) {
    return NextResponse.json(
      { error: 'This endpoint is only for school admins' },
      { status: 403 },
    )
  }

  const service = getServiceClient()

  // 3) Idempotency check — if a parent record already exists, we're done
  const { data: existingParent } = await service
    .from('parents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingParent) {
    return NextResponse.json({ ok: true, alreadyExisted: true })
  }

  // 4) Pull display info from auth metadata
  const meta = (user.user_metadata as any) || {}
  const fullName: string =
    meta.full_name ||
    [meta.first_name, meta.last_name].filter(Boolean).join(' ') ||
    (user.email ? user.email.split('@')[0] : 'Parent')
  const displayName = fullName.trim() || 'Parent'
  const email = user.email || null

  // 5) Create parent → family → membership in that order. We use the service
  // client throughout so RLS doesn't block the chain (the user has a session
  // but RLS on families.SELECT requires they're already in family_members,
  // which is the chicken-and-egg problem we hit during regular signup too).
  const { data: parent, error: parentErr } = await service
    .from('parents')
    .insert({
      user_id: user.id,
      display_name: displayName,
      email,
    })
    .select()
    .single()

  if (parentErr || !parent) {
    console.error('become-parent: failed to create parent', parentErr)
    return NextResponse.json(
      { error: parentErr?.message || 'Could not create parent record' },
      { status: 500 },
    )
  }

  const familyId = randomUUID()
  const { error: familyErr } = await service
    .from('families')
    .insert({ id: familyId, name: `${displayName}'s Family` })

  if (familyErr) {
    console.error('become-parent: failed to create family', familyErr)
    return NextResponse.json(
      { error: familyErr.message || 'Could not create family record' },
      { status: 500 },
    )
  }

  const { error: memberErr } = await service
    .from('family_members')
    .insert({
      family_id: familyId,
      parent_id: parent.id,
      role: 'primary',
      permissions: 'full',
    })

  if (memberErr) {
    console.error('become-parent: failed to link parent to family', memberErr)
    // Non-fatal — they still have a parent record, the dashboard will route
    // them through onboarding which can repair the link.
  }

  return NextResponse.json({ ok: true, parentId: parent.id })
}
