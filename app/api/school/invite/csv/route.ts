import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

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

      sent.push(...newEmails)
    }

    // Report already-invited emails
    alreadyInvited.forEach(email => {
      errors.push(`${email}: already invited or accepted`)
    })

    // TODO: Send actual invitation emails via Resend or similar
    // For now, invitations are created in the database and the invite link is the school's /join/[slug] page

    return NextResponse.json({
      sent: sent.length,
      errors,
      total: emails.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
