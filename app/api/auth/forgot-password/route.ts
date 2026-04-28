import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sendPasswordReset } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/auth/forgot-password
// Body: { email }
// Generates a Supabase recovery link and emails it via Resend.
// Always returns 200 (we don't reveal whether the email exists, to prevent
// account enumeration).
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: true }) // don't reveal validation
    }

    const trimmedEmail = email.trim().toLowerCase()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate recovery link via Supabase admin API. This works even if the
    // email isn't a real user — Supabase returns an error in that case which
    // we silently swallow so we don't reveal account existence.
    const { data, error } = await service.auth.admin.generateLink({
      type: 'recovery',
      email: trimmedEmail,
      options: {
        redirectTo: `${appUrl}/auth/reset-password`,
      },
    })

    if (error || !data?.properties?.action_link) {
      // Log internally, but tell the client everything is fine
      console.warn('[forgot-password] generateLink error:', error?.message || 'no action_link')
      return NextResponse.json({ ok: true })
    }

    try {
      await sendPasswordReset({
        to: trimmedEmail,
        resetUrl: data.properties.action_link,
      })
    } catch (sendErr: any) {
      console.error('[forgot-password] email send failed:', sendErr?.message)
      // Still return ok so the user UX doesn't change based on send failures
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('forgot-password error:', error)
    // Never leak details
    return NextResponse.json({ ok: true })
  }
}
