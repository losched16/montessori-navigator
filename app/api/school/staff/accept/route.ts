import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/school/staff/accept
// Body: { token }
// Authenticated user accepts a school_staff invitation by token.
// Creates a school_staff entry and marks the invitation accepted.
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const cookieStore = cookies()
    const userClient = createServerClient(
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

    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const service = getServiceClient()

    // Look up the invitation
    const { data: invite } = await service
      .from('invitations')
      .select('id, school_id, email, status, expires_at, type')
      .eq('token', token)
      .eq('type', 'school_staff')
      .maybeSingle()

    if (!invite) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }
    if (invite.status !== 'pending') {
      return NextResponse.json({ error: `Invitation is ${invite.status}` }, { status: 400 })
    }
    if (new Date(invite.expires_at) < new Date()) {
      await service.from('invitations').update({ status: 'expired' }).eq('id', invite.id)
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }

    // Check if already a staff member
    const { data: existingStaff } = await service
      .from('school_staff')
      .select('id, role')
      .eq('school_id', invite.school_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existingStaff) {
      const { error: insertError } = await service
        .from('school_staff')
        .insert({
          school_id: invite.school_id,
          user_id: user.id,
          role: 'admin',
        })
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    } else if (existingStaff.role !== 'admin') {
      await service
        .from('school_staff')
        .update({ role: 'admin' })
        .eq('id', existingStaff.id)
    }

    // Mark invitation accepted
    await service
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: user.id,
      })
      .eq('id', invite.id)

    return NextResponse.json({ ok: true, schoolId: invite.school_id })
  } catch (error: unknown) {
    console.error('staff accept error:', error)
    const message = error instanceof Error ? error.message : 'Failed to accept invitation'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
