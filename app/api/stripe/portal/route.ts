import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

// POST /api/stripe/portal
// Body: { returnUrl?: string }
// Creates a Stripe Customer Portal session for the authenticated user.
// Looks up their stripe_customer_id from either parents or school_staff -> schools
// (whichever the user is associated with) and returns a URL to redirect to.
//
// The portal handles cancellation, payment method updates, invoice history,
// and (if configured in Stripe) plan changes.
export async function POST(req: NextRequest) {
  const stripe = getStripe()

  try {
    const { returnUrl } = await req.json().catch(() => ({}))

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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Try parent first (most common case)
    const { data: parent } = await supabase
      .from('parents')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId: string | null = parent?.stripe_customer_id || null
    let defaultReturn = `${appUrl}/dashboard/settings`

    // If no parent customer, check school staff
    if (!customerId) {
      const { data: staff } = await supabase
        .from('school_staff')
        .select('school_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (staff) {
        const { data: school } = await supabase
          .from('schools')
          .select('stripe_customer_id')
          .eq('id', staff.school_id)
          .maybeSingle()
        customerId = school?.stripe_customer_id || null
        defaultReturn = `${appUrl}/school/settings`
      }
    }

    if (!customerId) {
      return NextResponse.json({
        error: 'No active subscription found for this account.',
      }, { status: 404 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || defaultReturn,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe portal error:', error)
    const message = error instanceof Error ? error.message : 'Failed to open billing portal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
