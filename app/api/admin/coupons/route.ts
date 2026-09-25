import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isSuperAdmin } from '@/lib/super-admin'

export const dynamic = 'force-dynamic'

// /api/admin/coupons — super-admin-only coupon management.
//
// Stripe is the source of truth: each code is a Stripe Coupon (the discount)
// plus a Promotion Code (the customer-facing string). Checkout already sets
// allow_promotion_codes, so a code created here works immediately in the
// "Add promotion code" field — no DB table needed.
//
// GET   → list promotion codes (with their coupons)
// POST  → create coupon + promotion code
//         Body: { code, name?, discountType: 'percent'|'amount', percentOff?,
//                 amountOff? (dollars), duration: 'once'|'repeating'|'forever',
//                 durationInMonths?, maxRedemptions?, expiresAt? (YYYY-MM-DD),
//                 appliesTo: 'all'|'school'|'individual', firstTimeOnly? }
// PATCH → { id, active } activate / deactivate a promotion code

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

async function authedSuperAdmin() {
  const cookieStore = cookies()
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) { try { cookieStore.set({ name, value, ...options }) } catch (e) {} },
        remove(name: string, options: any) { try { cookieStore.set({ name, value: '', ...options }) } catch (e) {} },
      },
    },
  )
  const { data: { user } } = await ssr.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 as const }
  const allowed = await isSuperAdmin(user.id)
  if (!allowed) return { error: 'Forbidden', status: 403 as const }
  return { user }
}

// Price IDs per audience, mirroring PRICE_MAP in /api/stripe/checkout.
const AUDIENCE_PRICES: Record<'school' | 'individual', (string | undefined)[]> = {
  school: [
    process.env.STRIPE_PRICE_ID_SCHOOL || process.env.STRIPE_PRICE_ID,
    process.env.STRIPE_PRICE_ID_SCHOOL_PRINT,
  ],
  individual: [
    process.env.STRIPE_PRICE_ID_INDIVIDUAL_MONTHLY,
    process.env.STRIPE_PRICE_ID_INDIVIDUAL_ANNUAL,
  ],
}

async function productIdsFor(stripe: Stripe, audience: 'school' | 'individual'): Promise<string[]> {
  const priceIds = AUDIENCE_PRICES[audience].filter((p): p is string => !!p)
  const prices = await Promise.all(priceIds.map(id => stripe.prices.retrieve(id)))
  const products = prices.map(p => (typeof p.product === 'string' ? p.product : p.product.id))
  return Array.from(new Set(products))
}

function serialize(pc: Stripe.PromotionCode) {
  const coupon = pc.promotion.coupon && typeof pc.promotion.coupon !== 'string' ? pc.promotion.coupon : null
  return {
    id: pc.id,
    code: pc.code,
    active: pc.active,
    created: pc.created,
    expiresAt: pc.expires_at,
    maxRedemptions: pc.max_redemptions,
    timesRedeemed: pc.times_redeemed,
    firstTimeOnly: pc.restrictions?.first_time_transaction ?? false,
    appliesTo: (pc.metadata?.applies_to as string) || 'all',
    coupon: coupon && {
      id: coupon.id,
      name: coupon.name,
      percentOff: coupon.percent_off,
      amountOff: coupon.amount_off,
      currency: coupon.currency,
      duration: coupon.duration,
      durationInMonths: coupon.duration_in_months,
      valid: coupon.valid,
    },
  }
}

export async function GET() {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const stripe = getStripe()
    const list = await stripe.promotionCodes.list({
      limit: 100,
      expand: ['data.promotion.coupon'],
    })
    return NextResponse.json({ codes: list.data.map(serialize), hasMore: list.has_more })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to load coupons' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => ({}))
  const code = String(body?.code || '').trim().toUpperCase()
  const name = String(body?.name || '').trim() || code
  const discountType = body?.discountType === 'amount' ? 'amount' : 'percent'
  const duration: 'once' | 'repeating' | 'forever' =
    ['once', 'repeating', 'forever'].includes(body?.duration) ? body.duration : 'once'
  const appliesTo: 'all' | 'school' | 'individual' =
    ['school', 'individual'].includes(body?.appliesTo) ? body.appliesTo : 'all'
  const firstTimeOnly = !!body?.firstTimeOnly

  if (!/^[A-Z0-9-]{3,40}$/.test(code)) {
    return NextResponse.json({ error: 'Code must be 3–40 characters: letters, numbers, and dashes only.' }, { status: 400 })
  }

  const couponParams: Stripe.CouponCreateParams = { name: name.slice(0, 40), duration }

  if (discountType === 'percent') {
    const pct = Number(body?.percentOff)
    if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
      return NextResponse.json({ error: 'Percent off must be between 1 and 100.' }, { status: 400 })
    }
    couponParams.percent_off = pct
  } else {
    const dollars = Number(body?.amountOff)
    if (!Number.isFinite(dollars) || dollars <= 0) {
      return NextResponse.json({ error: 'Amount off must be greater than $0.' }, { status: 400 })
    }
    couponParams.amount_off = Math.round(dollars * 100)
    couponParams.currency = 'usd'
  }

  if (duration === 'repeating') {
    const months = parseInt(String(body?.durationInMonths || ''), 10)
    if (!Number.isFinite(months) || months < 1) {
      return NextResponse.json({ error: 'Enter how many months the discount repeats.' }, { status: 400 })
    }
    couponParams.duration_in_months = months
  }

  const promoParams: Omit<Stripe.PromotionCodeCreateParams, 'promotion'> = {
    code,
    metadata: { applies_to: appliesTo, created_by: auth.user.email || auth.user.id },
  }

  if (body?.maxRedemptions !== undefined && body?.maxRedemptions !== '') {
    const max = parseInt(String(body.maxRedemptions), 10)
    if (!Number.isFinite(max) || max < 1) {
      return NextResponse.json({ error: 'Max redemptions must be 1 or more.' }, { status: 400 })
    }
    promoParams.max_redemptions = max
  }

  if (body?.expiresAt) {
    // End of the chosen day, UTC.
    const ts = Math.floor(new Date(`${body.expiresAt}T23:59:59Z`).getTime() / 1000)
    if (!Number.isFinite(ts) || ts <= Math.floor(Date.now() / 1000)) {
      return NextResponse.json({ error: 'Expiration date must be in the future.' }, { status: 400 })
    }
    promoParams.expires_at = ts
  }

  if (firstTimeOnly) promoParams.restrictions = { first_time_transaction: true }

  try {
    const stripe = getStripe()

    // Refuse duplicates up front for a clearer error than Stripe's.
    const existing = await stripe.promotionCodes.list({ code, active: true, limit: 1 })
    if (existing.data.length) {
      return NextResponse.json({ error: `An active code "${code}" already exists.` }, { status: 409 })
    }

    if (appliesTo !== 'all') {
      const products = await productIdsFor(stripe, appliesTo)
      if (!products.length) {
        return NextResponse.json({ error: `No Stripe prices are configured for ${appliesTo} plans.` }, { status: 500 })
      }
      couponParams.applies_to = { products }
    }

    const coupon = await stripe.coupons.create(couponParams)

    let promo: Stripe.PromotionCode
    try {
      promo = await stripe.promotionCodes.create({
        ...promoParams,
        promotion: { type: 'coupon', coupon: coupon.id },
        expand: ['promotion.coupon'],
      })
    } catch (err) {
      // Don't leave an orphaned coupon behind if the code couldn't be created.
      await stripe.coupons.del(coupon.id).catch(() => {})
      throw err
    }

    return NextResponse.json({ ok: true, code: serialize(promo) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create coupon' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => ({}))
  const id = String(body?.id || '')
  if (!id.startsWith('promo_')) {
    return NextResponse.json({ error: 'Invalid promotion code id.' }, { status: 400 })
  }

  try {
    const stripe = getStripe()
    const promo = await stripe.promotionCodes.update(id, {
      active: !!body?.active,
      expand: ['promotion.coupon'],
    })
    return NextResponse.json({ ok: true, code: serialize(promo) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update coupon' }, { status: 500 })
  }
}
