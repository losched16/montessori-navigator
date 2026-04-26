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

      if (!familyCount || familyCount < 1) {
        return NextResponse.json({ error: 'Family count must be at least 1' }, { status: 400 })
      }
      if (!schoolName?.trim()) {
        return NextResponse.json({ error: 'School name is required' }, { status: 400 })
      }
      if (!email?.trim()) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer_email: email,
        line_items: [{ price: priceId, quantity: familyCount }],
        metadata: {
          plan: 'school',
          familyCount: String(familyCount),
          schoolName,
        },
        success_url: `${appUrl}/for-schools/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/for-schools/pricing`,
      })

      return NextResponse.json({ url: session.url })
    }

    // -----------------------------------------
    // INDIVIDUAL PARENT FLOW (new)
    // -----------------------------------------
    // Auth required — link the subscription to the parent record
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
      return NextResponse.json({ error: 'You must be signed in to subscribe.' }, { status: 401 })
    }

    const { data: parent } = await supabase
      .from('parents')
      .select('id, email, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found. Please complete signup first.' }, { status: 404 })
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: parent.id,
      metadata: {
        plan,
        parent_id: parent.id,
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan,
          parent_id: parent.id,
        },
      },
      success_url: `${appUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
    }

    if (parent.stripe_customer_id) {
      sessionParams.customer = parent.stripe_customer_id
    } else if (parent.email || user.email) {
      sessionParams.customer_email = parent.email || user.email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
