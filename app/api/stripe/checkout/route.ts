import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

type Plan = 'school' | 'individual_monthly' | 'individual_annual'

const PRICE_MAP: Record<Plan, string | undefined> = {
  school: process.env.STRIPE_PRICE_ID_SCHOOL || process.env.STRIPE_PRICE_ID, // back-compat
  individual_monthly: process.env.STRIPE_PRICE_ID_INDIVIDUAL_MONTHLY,
  individual_annual: process.env.STRIPE_PRICE_ID_INDIVIDUAL_ANNUAL,
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  try {
    const body = await req.json()
    const plan: Plan = body.plan || 'school' // default to school for back-compat with existing UI

    const priceId = PRICE_MAP[plan]
    if (!priceId) {
      return NextResponse.json({ error: `No price configured for plan: ${plan}` }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // -----------------------------------------
    // SCHOOL FLOW (existing behavior, unchanged)
    // -----------------------------------------
    if (plan === 'school') {
      const { familyCount, schoolName, email } = body
      const MIN_FAMILIES = 10

      if (!familyCount || familyCount < 1) {
        return NextResponse.json({ error: 'Family count must be at least 1' }, { status: 400 })
      }
      if (!schoolName?.trim()) {
        return NextResponse.json({ error: 'School name is required' }, { status: 400 })
      }
      if (!email?.trim()) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
      }

      // Enforce 10-family minimum: schools with fewer families pay for the minimum.
      const billedQuantity = Math.max(Number(familyCount), MIN_FAMILIES)

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email,
        line_items: [{ price: priceId, quantity: billedQuantity }],
        metadata: {
          plan: 'school',
          familyCount: String(familyCount),
          billedQuantity: String(billedQuantity),
          schoolName,
        },
        subscription_data: {
          trial_period_days: 14,
          metadata: {
            plan: 'school',
            familyCount: String(familyCount),
            billedQuantity: String(billedQuantity),
            schoolName,
          },
        },
        // Card collection is required up-front so the trial converts seamlessly
        payment_method_collection: 'always',
        success_url: `${appUrl}/for-schools/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/for-schools/pricing`,
      })

      return NextResponse.json({ url: session.url })
    }

    // -----------------------------------------
    // INDIVIDUAL PARENT FLOW
    // Guest checkout — Stripe collects email + payment.
    // After Stripe, the user is sent to /welcome which routes
    // them to /auth/signup (if not logged in) or links the
    // subscription to their existing parent record.
    // -----------------------------------------

    // If the user happens to already be logged in, prefill their email
    // and pass parent_id so the webhook can link immediately.
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

    let existingParent: { id: string; email: string | null; stripe_customer_id: string | null } | null = null
    if (user) {
      const { data: parent } = await supabase
        .from('parents')
        .select('id, email, stripe_customer_id')
        .eq('user_id', user.id)
        .single()
      existingParent = parent as any
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        plan,
        ...(existingParent ? { parent_id: existingParent.id } : {}),
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan,
          ...(existingParent ? { parent_id: existingParent.id } : {}),
        },
      },
      success_url: `${appUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
    }

    if (existingParent) {
      sessionParams.client_reference_id = existingParent.id
      if (existingParent.stripe_customer_id) {
        sessionParams.customer = existingParent.stripe_customer_id
      } else if (existingParent.email || user?.email) {
        sessionParams.customer_email = existingParent.email || user?.email
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
