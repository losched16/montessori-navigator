import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Map Stripe subscription status -> our enum
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

function planFromPriceId(priceId: string | undefined): 'individual_monthly' | 'individual_annual' | null {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRICE_ID_INDIVIDUAL_MONTHLY) return 'individual_monthly'
  if (priceId === process.env.STRIPE_PRICE_ID_INDIVIDUAL_ANNUAL) return 'individual_annual'
  return null
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const supabase = getSupabase()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    console.error('Webhook signature error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const parentId = session.client_reference_id || session.metadata?.parent_id
        const planMeta = session.metadata?.plan
        const sessionEmail = session.customer_details?.email || session.customer_email || null

        // Detect individual parent flow: either parent_id is set, or plan metadata says individual
        const isIndividualFlow = !!parentId || planMeta === 'individual_monthly' || planMeta === 'individual_annual'

        if (isIndividualFlow) {
          // ----- PARENT SUBSCRIPTION -----
          // Fetch the subscription to get accurate status, trial_end, current_period_end, plan
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = sub.items.data[0]?.price.id
          const plan = planFromPriceId(priceId)
          const status = normalizeStatus(sub.status)
          const trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null
          const currentPeriodEnd = (sub as any).current_period_end
            ? new Date((sub as any).current_period_end * 1000).toISOString()
            : null

          const updateData = {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: status,
            subscription_plan: plan,
            trial_ends_at: trialEndsAt,
            current_period_end: currentPeriodEnd,
          }

          if (parentId) {
            // Direct match by parent ID
            await supabase.from('parents').update(updateData).eq('id', parentId)
          } else if (sessionEmail) {
            // Guest checkout — try matching by email. The parent record may not
            // exist yet (signup happens after Stripe). If so, the link-session
            // call from the signup page will fill in the data; this is a fallback.
            const { data: existingParent } = await supabase
              .from('parents')
              .select('id')
              .eq('email', sessionEmail)
              .maybeSingle()
            if (existingParent) {
              await supabase.from('parents').update(updateData).eq('id', existingParent.id)
            } else {
              console.log(`[webhook] No parent yet for ${sessionEmail} — link-session will handle it post-signup`)
            }
          }
          break
        }

        // ----- SCHOOL SUBSCRIPTION (existing flow) -----
        // family_count = billed quantity (the seats they're paying for, which
        // is at least the 10-family minimum). We also record the actual count
        // they entered in metadata for reference.
        const billedQuantity = parseInt(session.metadata?.billedQuantity || session.metadata?.familyCount || '0', 10)
        const familyCount = billedQuantity
        const schoolName = session.metadata?.schoolName || 'Unknown School'
        const billingEmail = session.customer_email || ''

        // Pull true status from the subscription so trial state is captured
        const schoolSub = await stripe.subscriptions.retrieve(subscriptionId)
        const schoolStatus = normalizeStatus(schoolSub.status) // 'trialing' | 'active' | etc
        const schoolTrialEndsAt = schoolSub.trial_end ? new Date(schoolSub.trial_end * 1000).toISOString() : null
        const schoolCurrentPeriodEnd = (schoolSub as any).current_period_end
          ? new Date((schoolSub as any).current_period_end * 1000).toISOString()
          : null

        const { data: existingSchool } = await supabase
          .from('schools')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (existingSchool) {
          await supabase
            .from('schools')
            .update({
              stripe_subscription_id: subscriptionId,
              subscription_status: schoolStatus,
              family_count: familyCount,
              billing_email: billingEmail,
              trial_ends_at: schoolTrialEndsAt,
              current_period_end: schoolCurrentPeriodEnd,
            })
            .eq('id', existingSchool.id)
        } else {
          const slug = schoolName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '-' + Date.now().toString(36)

          await supabase.from('schools').insert({
            name: schoolName,
            slug,
            admin_user_id: '00000000-0000-0000-0000-000000000000',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: schoolStatus,
            family_count: familyCount,
            billing_email: billingEmail,
            trial_ends_at: schoolTrialEndsAt,
            current_period_end: schoolCurrentPeriodEnd,
          })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const status = normalizeStatus(subscription.status)
        const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
        const currentPeriodEnd = (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString()
          : null

        // Try to update parent first; if no row matches, fall back to school
        const { data: parentMatch } = await supabase
          .from('parents')
          .update({
            subscription_status: status,
            trial_ends_at: trialEndsAt,
            current_period_end: currentPeriodEnd,
          })
          .eq('stripe_customer_id', customerId)
          .select('id')

        if (!parentMatch || parentMatch.length === 0) {
          await supabase
            .from('schools')
            .update({
              subscription_status: status,
              trial_ends_at: trialEndsAt,
              current_period_end: currentPeriodEnd,
            })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: parentMatch } = await supabase
          .from('parents')
          .update({ subscription_status: 'canceled' })
          .eq('stripe_customer_id', customerId)
          .select('id')

        if (!parentMatch || parentMatch.length === 0) {
          await supabase
            .from('schools')
            .update({ subscription_status: 'canceled' })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: parentMatch } = await supabase
          .from('parents')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', customerId)
          .select('id')

        if (!parentMatch || parentMatch.length === 0) {
          await supabase
            .from('schools')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_customer_id', customerId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
