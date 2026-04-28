import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { sendSchoolStaffInvite } from '@/lib/email'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthedAdmin(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) { try { cookieStore.set({ name, value, ...options }) } catch (e) {} },
        remove(name: string, options: any) { try { cookieStore.set({ name, value: '', ...options }) } catch (e) {} },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 as const }

  const { data: staff } = await supabase
    .from('school_staff')
    .select('school_id, role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle()

  if (!staff) return { error: 'You must be a school admin to manage staff', status: 403 as const }

  return { user, schoolId: staff.school_id }
}

// GET — list staff and pending invites for the admin's school
export async function GET(req: NextRequest) {
  const auth = await getAuthedAdmin(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const service = getServiceClient()

  // Current staff (with auth user emails)
  const { data: staff } = await service
    .from('school_staff')
    .select('id, user_id, role, created_at')
    .eq('school_id', auth.schoolId)
    .order('created_at', { ascending: true })

  // Get emails for staff users
  const userIds = (staff || []).map(s => s.user_id)
  const emails: Record<string, string | null> = {}
  if (userIds.length > 0) {
    // Use admin API to look up users
    const { data: { users } } = await service.auth.admin.listUsers()
    for (const u of users) {
      if (userIds.includes(u.id)) emails[u.id] = u.email || null
    }
  }

  // Pending staff invitations
  const { data: invites } = await service
    .from('invitations')
    .select('id, email, token, status, created_at, expires_at')
    .eq('school_id', auth.schoolId)
    .eq('type', 'school_staff')
    .order('created_at', { ascending: false })

  return NextResponse.json({
    staff: (staff || []).map(s => ({
      id: s.id,
      userId: s.user_id,
      email: emails[s.user_id] || null,
      role: s.role,
      createdAt: s.created_at,
      isYou: s.user_id === auth.user.id,
    })),
    invites: invites || [],
  })
}

// POST — invite a new admin by email. Returns the invite link.
export async function POST(req: NextRequest) {
  const auth = await getAuthedAdmin(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { email } = await req.json()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const service = getServiceClient()
  const normalizedEmail = email.trim().toLowerCase()

  // Check if there's already a pending invite for this email
  const { data: existing } = await service
    .from('invitations')
    .select('id, token, status')
    .eq('school_id', auth.schoolId)
    .eq('type', 'school_staff')
    .eq('email', normalizedEmail)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({
      ok: true,
      token: existing.token,
      reused: true,
    })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)
  const token = randomUUID()

  const { error } = await service
    .from('invitations')
    .insert({
      type: 'school_staff',
      token,
      school_id: auth.schoolId,
      invited_by: null,
      email: normalizedEmail,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })

  if (error) {
    return NextResponse.json({ error: 'Failed to create invitation: ' + error.message }, { status: 500 })
  }

  // Send invitation email (best-effort)
  try {
    const { data: school } = await service
      .from('schools')
      .select('name')
      .eq('id', auth.schoolId)
      .maybeSingle()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    await sendSchoolStaffInvite({
      to: normalizedEmail,
      schoolName: school?.name || 'Your school',
      inviteUrl: `${appUrl}/join-staff/${token}`,
    })
  } catch (emailErr) {
    console.error('[school/staff] invite email failed:', emailErr)
  }

  return NextResponse.json({ ok: true, token })
}

// DELETE — remove a staff member (or revoke a pending invite)
export async function DELETE(req: NextRequest) {
  const auth = await getAuthedAdmin(req)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { staffId, inviteId } = await req.json()
  const service = getServiceClient()

  if (staffId) {
    // Don't let an admin remove themselves
    const { data: staff } = await service
      .from('school_staff')
      .select('id, user_id, school_id')
      .eq('id', staffId)
      .single()

    if (!staff || staff.school_id !== auth.schoolId) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }
    if (staff.user_id === auth.user.id) {
      return NextResponse.json({ error: 'You can\'t remove yourself' }, { status: 400 })
    }

    await service.from('school_staff').delete().eq('id', staffId)
    return NextResponse.json({ ok: true })
  }

  if (inviteId) {
    const { data: invite } = await service
      .from('invitations')
      .select('id, school_id, type')
      .eq('id', inviteId)
      .single()

    if (!invite || invite.school_id !== auth.schoolId || invite.type !== 'school_staff') {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    await service.from('invitations').update({ status: 'revoked' }).eq('id', inviteId)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Missing staffId or inviteId' }, { status: 400 })
}
