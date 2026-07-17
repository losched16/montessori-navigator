// Rewardful affiliate tracking helper.
//
// The Rewardful script (loaded in app/layout.tsx) sets window.Rewardful.referral
// to the current visitor's referral ID when they arrived via an affiliate link.
// We read it on the client and send it to /api/stripe/checkout, which sets it as
// the Stripe Checkout Session's client_reference_id so Rewardful can attribute
// the conversion to the affiliate.
//
// Returns null when there's no referral (direct traffic) or the script hasn't
// loaded yet — both are fine; the checkout just proceeds without attribution.

export function getRewardfulReferral(): string | null {
  if (typeof window === 'undefined') return null
  const rw = (window as any).Rewardful
  return rw && typeof rw.referral === 'string' && rw.referral ? rw.referral : null
}
