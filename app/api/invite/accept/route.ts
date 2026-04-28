import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Invitation token is required' }, { status: 400 })
    }

    // Find the invitation
    const { data: invitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: `This invitation has been ${invitation.status}` }, { status: 400 })
    }

    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
    }

    // Get the current user's parent profile
    let { data: parent } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // If no parent profile exists, create one
    if (!parent) {
      const { data: newParent, error: parentError } = await supabase
        .from('parents')
        .insert({
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'New User',
          email: user.email,
        })
        .select()
        .single()

      if (parentError || !newParent) {
        return NextResponse.json({ error: 'Failed to create parent profile' }, { status: 500 })
      }
      parent = newParent
    }

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 500 })
    }

    if (invitation.type === 'co_parent') {
      // Check if already a member of this family
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', invitation.family_id)
        .eq('parent_id', parent.id)
        .single()

      if (existingMember) {
        return NextResponse.json({ error: 'You are already a member of this family' }, { status: 400 })
      }

      // Add to family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: invitation.family_id,
          parent_id: parent.id,
          role: 'parent', // Default role for co-parents
          permissions: 'full', // Default, primary can change later
        })

      if (memberError) {
        return NextResponse.json({ error: 'Failed to join family' }, { status: 500 })
      }
    } else if (invitation.type === 'school_family') {
      // Get or create the user's family
      let { data: membership } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('parent_id', parent.id)
        .limit(1)
        .maybeSingle()

      let familyId = membership?.family_id

      if (!familyId) {
        // Create a family for this user. Generate UUID client-side because
        // RLS SELECT on families requires membership which doesn't exist
        // yet — .select() read-back would return null.
        const { randomUUID } = await import('crypto')
        const newFamilyId = randomUUID()
        const { error: familyErr } = await supabase
          .from('families')
          .insert({ id: newFamilyId, name: `${user.email?.split('@')[0]}'s Family` })

        if (familyErr) {
          return NextResponse.json({ error: 'Failed to create family: ' + familyErr.message }, { status: 500 })
        }

        familyId = newFamilyId
        const { error: memberErr } = await supabase
          .from('family_members')
          .insert({
            family_id: familyId,
            parent_id: parent.id,
            role: 'primary',
            permissions: 'full',
          })
        if (memberErr) console.error('Failed to link parent to family:', memberErr)
      }

      if (familyId && invitation.school_id) {
        // Associate family with school
        const { data: existingEnrollment } = await supabase
          .from('school_families')
          .select('id')
          .eq('school_id', invitation.school_id)
          .eq('family_id', familyId)
          .single()

        if (!existingEnrollment) {
          await supabase
            .from('school_families')
            .insert({
              school_id: invitation.school_id,
              family_id: familyId,
            })
        }
      }
    }

    // Mark invitation as accepted
    await supabase
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: user.id,
      })
      .eq('id', invitation.id)

    return NextResponse.json({
      success: true,
      type: invitation.type,
      familyId: invitation.family_id,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
