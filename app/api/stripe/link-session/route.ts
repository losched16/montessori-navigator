import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

function planFromPriceId(priceId: string | undefined): 'individual_monthly' | 'individual_annual' | null {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRICE_ID_INDIVIDUAL_MONTHLY) return 'individual_monthly'
  if (priceId === process.env.STRIPE_PRICE_ID_INDIVIDUAL_ANNUAL) return 'individual_annual'
  return null
}

function normalizeStatus(stripeStatus: string): 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled' {
  switch (stripeStatus) {
    case 'trialing': return 'trialing'
    case 'active': return 'active'
    case 'past_due': return 'past_due'
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled'
    default:
      return 'inactive'
  }
}

// POST /api/stripe/link-session
// Body: { sessionId }
// Attaches the Stripe subscription from the given session to the
// currently-authenticated parent record. Used after signup to link
// a guest checkout session to the new account.
export async function POST(req: NextRequest) {
  const stripe = getStripe()
  try {
    const { sessionId } = await req.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

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

    const { data: parent } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    // Fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    const sub = session.subscription as Stripe.Subscription | null
    if (!sub) {
      return NextResponse.json({ error: 'No subscription on this session' }, { status: 400 })
    }

    const priceId = sub.items.data[0]?.price.id
    const plan = planFromPriceId(priceId)
    const status = normalizeStatus(sub.status)
    const trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null
    const currentPeriodEnd = (sub as any).current_period_end
      ? new Date((sub as any).current_period_end * 1000).toISOString()
      : null
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

    await supabase
      .from('parents')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        subscription_status: status,
        subscription_plan: plan,
        trial_ends_at: trialEndsAt,
        current_period_end: currentPeriodEnd,
      })
      .eq('id', parent.id)

    return NextResponse.json({ ok: true, status, plan, trialEndsAt })
  } catch (error: unknown) {
    console.error('link-session error:', error)
    const message = error instanceof Error ? error.message : 'Failed to link session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
