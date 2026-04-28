import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { sendCoParentInvite } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, familyId, role, permissions } = await request.json()

    if (!email || !familyId) {
      return NextResponse.json({ error: 'Email and family ID are required' }, { status: 400 })
    }

    // Verify the user is a primary member of this family
    const { data: parent } = await supabase
      .from('parents')
      .select('id, display_name')
      .eq('user_id', user.id)
      .single()

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    const { data: membership } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('parent_id', parent.id)
      .single()

    if (!membership || membership.role !== 'primary') {
      return NextResponse.json({ error: 'Only the primary parent can invite family members' }, { status: 403 })
    }

    // Check if this email is already a member of the family
    const { data: existingParent } = await supabase
      .from('parents')
      .select('id')
      .eq('email', email)
      .single()

    if (existingParent) {
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', familyId)
        .eq('parent_id', existingParent.id)
        .single()

      if (existingMember) {
        return NextResponse.json({ error: 'This person is already a member of your family' }, { status: 400 })
      }
    }

    // Check for existing pending invite to this email
    const { data: existingInvite } = await supabase
      .from('invitations')
      .select('id')
      .eq('family_id', familyId)
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json({ error: 'An invitation has already been sent to this email' }, { status: 400 })
    }

    // Create the invitation
    const token = randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30-day expiry

    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        type: 'co_parent',
        token,
        family_id: familyId,
        invited_by: parent.id,
        email,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (inviteError) {
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Send invitation email (best-effort)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${appUrl}/invite/${token}`
    try {
      await sendCoParentInvite({
        to: email,
        inviterName: parent.display_name,
        inviteUrl,
      })
    } catch (emailErr) {
      console.error('[invite-coparent] email send failed:', emailErr)
      // Don't fail the request — admin can resend the link from the UI
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        token: invitation.token,
        email,
        expires_at: invitation.expires_at,
      },
      inviteUrl: `/invite/${token}`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
