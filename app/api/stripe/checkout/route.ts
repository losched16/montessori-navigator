import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  try {
    const { familyCount, schoolName, email } = await req.json()

    if (!familyCount || familyCount < 1) {
      return NextResponse.json({ error: 'Family count must be at least 1' }, { status: 400 })
    }
    if (!schoolName?.trim()) {
      return NextResponse.json({ error: 'School name is required' }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: familyCount,
        },
      ],
      metadata: {
        familyCount: String(familyCount),
        schoolName,
      },
      success_url: `${appUrl}/for-schools/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/for-schools/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
