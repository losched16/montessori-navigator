import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

// GET /api/stripe/session?id=cs_xxx
// Returns minimal info needed to prefill signup form and verify payment
export async function GET(req: NextRequest) {
  const stripe = getStripe()
  const id = req.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing session id' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ['subscription'],
    })

    const sub = session.subscription as Stripe.Subscription | null
    const priceId = sub?.items.data[0]?.price.id

    let plan: 'individual_monthly' | 'individual_annual' | 'school' | null = null
    if (priceId === process.env.STRIPE_PRICE_ID_INDIVIDUAL_MONTHLY) plan = 'individual_monthly'
    else if (priceId === process.env.STRIPE_PRICE_ID_INDIVIDUAL_ANNUAL) plan = 'individual_annual'
    else if (priceId === process.env.STRIPE_PRICE_ID_SCHOOL) plan = 'school'

    return NextResponse.json({
      email: session.customer_details?.email || session.customer_email || null,
      customerId: session.customer,
      subscriptionId: session.subscription ? (typeof session.subscription === 'string' ? session.subscription : session.subscription.id) : null,
      paymentStatus: session.payment_status,
      status: session.status,
      plan,
      trialEnd: sub?.trial_end ? sub.trial_end * 1000 : null,
      currentPeriodEnd: (sub as any)?.current_period_end ? (sub as any).current_period_end * 1000 : null,
      subscriptionStatus: sub?.status || null,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
