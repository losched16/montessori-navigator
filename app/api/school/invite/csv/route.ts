import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { sendSchoolFamilyInvite } from '@/lib/email'
import { getInviteUsage, TRIAL_INVITE_CAP } from '@/lib/school-invite-limits'

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

    const { schoolId, emails: rawEmails } = await request.json()

    if (!schoolId || !rawEmails) {
      return NextResponse.json({ error: 'School ID and emails are required' }, { status: 400 })
    }

    // Verify user is admin of this school
    const { data: staff } = await supabase
      .from('school_staff')
      .select('role')
      .eq('school_id', schoolId)
      .eq('user_id', user.id)
      .single()

    if (!staff || staff.role !== 'admin') {
      return NextResponse.json({ error: 'Only school admins can send invitations' }, { status: 403 })
    }

    // Parse emails (support comma-separated, newline-separated, or mixed)
    const emails = rawEmails
      .split(/[,\n\r]+/)
      .map((e: string) => e.trim().toLowerCase())
      .filter((e: string) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses found' }, { status: 400 })
    }

    if (emails.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 emails per batch' }, { status: 400 })
    }

    // Check for existing pending invites to these emails for this school
    const { data: existingInvites } = await supabase
      .from('invitations')
      .select('email')
      .eq('school_id', schoolId)
      .in('status', ['pending', 'accepted'])
      .in('email', emails)

    const alreadyInvited = new Set((existingInvites || []).map(i => i.email))

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const sent: string[] = []
    const errors: string[] = []

    // Create invitations for new emails
    const newEmails = emails.filter((e: string) => !alreadyInvited.has(e))

    // Enforce the trial invite cap. Free-trial schools can invite at most
    // TRIAL_INVITE_CAP people total across staff + family.
    const { data: schoolForCap } = await supabase
      .from('schools')
      .select('subscription_status')
      .eq('id', schoolId)
      .maybeSingle()
    const usage = await getInviteUsage(supabase, schoolId, schoolForCap?.subscription_status || null)
    if (usage.limit !== null) {
      const remaining = Math.max(0, usage.limit - usage.used)
      if (remaining <= 0) {
        return NextResponse.json({
          error: `You've used all ${usage.limit} of your trial invitations. Upgrade your subscription to invite more families.`,
          trialLimit: usage.limit,
          used: usage.used,
        }, { status: 403 })
      }
      if (newEmails.length > remaining) {
        return NextResponse.json({
          error: `You can only invite ${remaining} more ${remaining === 1 ? 'person' : 'people'} during your free trial (${usage.used}/${usage.limit} used). Upgrade to invite more.`,
          trialLimit: usage.limit,
          used: usage.used,
          remaining,
        }, { status: 403 })
      }
    }

    if (newEmails.length > 0) {
      const invitations = newEmails.map((email: string) => ({
        type: 'school_family' as const,
        token: randomUUID(),
        school_id: schoolId,
        email,
        status: 'pending' as const,
        expires_at: expiresAt.toISOString(),
      }))

      const { error: insertError } = await supabase
        .from('invitations')
        .insert(invitations)

      if (insertError) {
        return NextResponse.json({ error: 'Failed to create invitations: ' + insertError.message }, { status: 500 })
      }

      // Look up school slug + name for the invite email
      const { data: school } = await supabase
        .from('schools')
        .select('name, slug')
        .eq('id', schoolId)
        .single()

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      // Send invitation emails (best-effort: failures are reported in `errors`
      // but do not roll back the database row, since the admin can re-send)
      for (const invite of invitations) {
        try {
          const inviteUrl = `${appUrl}/join/${school?.slug || ''}?invite=${invite.token}`
          const result = await sendSchoolFamilyInvite({
            to: invite.email,
            schoolName: school?.name || 'Your school',
            inviteUrl,
          })
          if (result.error) {
            errors.push(`${invite.email}: ${result.error.message || 'email failed'}`)
          } else {
            sent.push(invite.email)
          }
        } catch (err: any) {
          errors.push(`${invite.email}: ${err?.message || 'email failed'}`)
        }
      }
    }

    // Report already-invited emails
    alreadyInvited.forEach(email => {
      errors.push(`${email}: already invited or accepted`)
    })

    return NextResponse.json({
      sent: sent.length,
      errors,
      total: emails.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
