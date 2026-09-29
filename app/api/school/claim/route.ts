import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { sendSchoolAdminWelcome } from '@/lib/email'
import { linkSchoolAdmin } from '@/lib/school-admin-link'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/school/claim
// Body: { sessionId, schoolName? }
//
// Called by /auth/signup/school after auth user is created.
// Looks up the school created by the Stripe webhook (matched by customer ID
// from the checkout session) and links the current authenticated user as
// the school admin. Uses service role to bypass RLS for the bootstrap.
export async function POST(req: NextRequest) {
  const stripe = getStripe()

  try {
    const { sessionId, schoolName } = await req.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    // Verify the calling user is authenticated
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

    // Fetch the Stripe session to find the customer ID
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
    if (!customerId) {
      return NextResponse.json({ error: 'Stripe session has no customer attached' }, { status: 400 })
    }

    // Use service role to bypass RLS for the bootstrap
    const service = getServiceClient()

    // Find the school created by the webhook for this Stripe customer
    const { data: school } = await service
      .from('schools')
      .select('id, name, admin_user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (!school) {
      return NextResponse.json({
        error: 'No school found for this checkout session. The webhook may not have fired yet — please wait a moment and refresh.',
      }, { status: 404 })
    }

    // If a real admin is already linked AND it isn't this user, refuse
    const PLACEHOLDER = '00000000-0000-0000-0000-000000000000'
    if (school.admin_user_id && school.admin_user_id !== PLACEHOLDER && school.admin_user_id !== user.id) {
      return NextResponse.json({
        error: 'This school already has an admin. Contact support if you believe this is an error.',
      }, { status: 409 })
    }

    if (schoolName && schoolName.trim()) {
      const { error: nameError } = await service.from('schools').update({ name: schoolName.trim() }).eq('id', school.id)
      if (nameError) {
        return NextResponse.json({ error: 'Failed to update school: ' + nameError.message }, { status: 500 })
      }
    }

    const linkResult = await linkSchoolAdmin(service, school.id, user.id)
    if (linkResult === 'has_other_admin') {
      return NextResponse.json({
        error: 'This school already has an admin. Contact support if you believe this is an error.',
      }, { status: 409 })
    }

    // Already linked (e.g. the webhook auto-linked this account at checkout
    // and sent the welcome then) — nothing more to do.
    if (linkResult === 'already_linked') {
      return NextResponse.json({ ok: true, schoolId: school.id, schoolName: school.name, alreadyLinked: true })
    }

    // Send welcome email (best-effort)
    try {
      const finalSchoolName = (schoolName && schoolName.trim()) || school.name || 'Your school'
      const { data: schoolAfter } = await service
        .from('schools')
        .select('trial_ends_at, billing_email')
        .eq('id', school.id)
        .maybeSingle()
      const emailTo = schoolAfter?.billing_email || user.email
      if (emailTo) {
        const trialEndDate = schoolAfter?.trial_ends_at
          ? new Date(schoolAfter.trial_ends_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
          : undefined
        await sendSchoolAdminWelcome({
          to: emailTo,
          schoolName: finalSchoolName,
          trialEndDate,
          appUrl: process.env.NEXT_PUBLIC_APP_URL,
        })
      }
    } catch (emailErr) {
      console.error('[school/claim] welcome email failed:', emailErr)
    }

    return NextResponse.json({ ok: true, schoolId: school.id, schoolName: school.name })
  } catch (error: unknown) {
    console.error('school claim error:', error)
    const message = error instanceof Error ? error.message : 'Failed to claim school'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
