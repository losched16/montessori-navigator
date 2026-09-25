'use client'

import { useEffect, useState, FormEvent } from 'react'

// Coupons — super-admin tool to create and manage Stripe promotion codes.
// Codes are created directly in Stripe and work immediately in the
// "Add promotion code" field on both school and parent checkout.

interface CouponCode {
  id: string
  code: string
  active: boolean
  created: number
  expiresAt: number | null
  maxRedemptions: number | null
  timesRedeemed: number
  firstTimeOnly: boolean
  appliesTo: string
  coupon: {
    id: string
    name: string | null
    percentOff: number | null
    amountOff: number | null
    currency: string | null
    duration: 'once' | 'repeating' | 'forever'
    durationInMonths: number | null
    valid: boolean
  } | null
}

const inputClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none'

const APPLIES_LABEL: Record<string, string> = {
  all: 'All plans',
  school: 'School plans',
  individual: 'Parent plans',
}

function describeDiscount(c: CouponCode['coupon']) {
  if (!c) return '—'
  const amount = c.percentOff != null
    ? `${c.percentOff}% off`
    : `$${((c.amountOff || 0) / 100).toFixed(2)} off`
  const duration = c.duration === 'forever'
    ? 'forever'
    : c.duration === 'once'
      ? 'first payment'
      : `for ${c.durationInMonths} mo`
  return `${amount} ${duration}`
}

function formatDate(ts: number | null) {
  return ts ? new Date(ts * 1000).toLocaleDateString() : '—'
}

export default function AdminCouponsPage() {
  const [codes, setCodes] = useState<CouponCode[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent')
  const [percentOff, setPercentOff] = useState('')
  const [amountOff, setAmountOff] = useState('')
  const [duration, setDuration] = useState<'once' | 'repeating' | 'forever'>('once')
  const [durationInMonths, setDurationInMonths] = useState('')
  const [appliesTo, setAppliesTo] = useState<'all' | 'school' | 'individual'>('all')
  const [maxRedemptions, setMaxRedemptions] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [firstTimeOnly, setFirstTimeOnly] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const load = async () => {
    setLoadError('')
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      if (!res.ok) setLoadError(data.error || 'Could not load coupons')
      else setCodes(data.codes || [])
    } catch (err: any) {
      setLoadError(err.message || 'Could not load coupons')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setCode(''); setName(''); setDiscountType('percent'); setPercentOff(''); setAmountOff('')
    setDuration('once'); setDurationInMonths(''); setAppliesTo('all'); setMaxRedemptions('')
    setExpiresAt(''); setFirstTimeOnly(false)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code, name, discountType, percentOff, amountOff, duration, durationInMonths,
          appliesTo, maxRedemptions, expiresAt, firstTimeOnly,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not create the coupon.')
        return
      }
      setSuccess(`Code ${data.code.code} created — ${describeDiscount(data.code.coupon)}.`)
      resetForm()
      setCodes(prev => [data.code, ...prev])
    } catch (err: any) {
      setError(err.message || 'Could not create the coupon.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (c: CouponCode) => {
    if (c.active && !confirm(`Deactivate ${c.code}? Customers will no longer be able to redeem it.`)) return
    setTogglingId(c.id)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, active: !c.active }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Could not update the code.')
        return
      }
      setCodes(prev => prev.map(x => (x.id === c.id ? data.code : x)))
    } finally {
      setTogglingId(null)
    }
  }

  const visible = showInactive ? codes : codes.filter(c => c.active)

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold text-navy-700 mb-2">Coupons</h1>
      <p className="text-sm text-navy-600/70 mb-6">
        Create promotion codes customers can enter in the <strong>Add promotion code</strong> field
        at checkout. Codes are created in Stripe and work immediately. A 100%-off-forever code lets
        the customer skip card entry.
      </p>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-4 mb-6">
          ✅ {success}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5 bg-white border border-gray-100 rounded-2xl p-6 mb-8">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Code <span className="text-red-500">*</span></label>
            <input
              type="text" value={code} required
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
              placeholder="SPRING25" maxLength={40}
              className={`${inputClass} font-mono`}
            />
            <p className="text-xs text-navy-600/60 mt-1">Letters, numbers, and dashes.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Internal name (optional)</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} maxLength={40}
              placeholder="Spring conference promo"
              className={inputClass}
            />
            <p className="text-xs text-navy-600/60 mt-1">Shown on invoices. Defaults to the code.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Discount <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <select
                value={discountType} onChange={e => setDiscountType(e.target.value as 'percent' | 'amount')}
                className={`${inputClass} w-32 shrink-0`}
              >
                <option value="percent">% off</option>
                <option value="amount">$ off</option>
              </select>
              {discountType === 'percent' ? (
                <input
                  type="number" min={1} max={100} step="0.01" value={percentOff} required
                  onChange={e => setPercentOff(e.target.value)} placeholder="25"
                  className={inputClass}
                />
              ) : (
                <input
                  type="number" min={0.01} step="0.01" value={amountOff} required
                  onChange={e => setAmountOff(e.target.value)} placeholder="10.00"
                  className={inputClass}
                />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Applies to</label>
            <select
              value={appliesTo} onChange={e => setAppliesTo(e.target.value as 'all' | 'school' | 'individual')}
              className={inputClass}
            >
              <option value="all">All plans</option>
              <option value="school">School plans only</option>
              <option value="individual">Parent plans only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Duration</label>
            <select
              value={duration} onChange={e => setDuration(e.target.value as 'once' | 'repeating' | 'forever')}
              className={inputClass}
            >
              <option value="once">First payment only</option>
              <option value="repeating">Multiple months</option>
              <option value="forever">Forever</option>
            </select>
          </div>
          {duration === 'repeating' && (
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Number of months <span className="text-red-500">*</span></label>
              <input
                type="number" min={1} value={durationInMonths} required
                onChange={e => setDurationInMonths(e.target.value)} placeholder="3"
                className={inputClass}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Max redemptions (optional)</label>
            <input
              type="number" min={1} value={maxRedemptions}
              onChange={e => setMaxRedemptions(e.target.value)} placeholder="Unlimited"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Expires (optional)</label>
            <input
              type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-navy-700">
          <input
            type="checkbox" checked={firstTimeOnly} onChange={e => setFirstTimeOnly(e.target.checked)}
            className="rounded border-gray-300 text-warm-500 focus:ring-warm-500"
          />
          New customers only (no prior payments)
        </label>

        <button
          type="submit" disabled={submitting}
          className="px-5 py-2.5 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition disabled:opacity-50 text-sm"
        >
          {submitting ? 'Creating…' : 'Create coupon'}
        </button>
      </form>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-navy-600">Promotion codes</h2>
        <label className="flex items-center gap-2 text-xs text-navy-600">
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
          Show inactive
        </label>
      </div>

      {loadError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{loadError}</div>}

      <div className="bg-white border border-gray-100 rounded-2xl overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm text-navy-600/60">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-6 text-sm text-navy-600/60">No {showInactive ? '' : 'active '}codes yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-navy-600/60 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Applies to</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(c => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-mono font-medium text-navy-700">{c.code}</div>
                    {c.coupon?.name && c.coupon.name !== c.code && (
                      <div className="text-xs text-navy-600/60">{c.coupon.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-navy-700">
                    {describeDiscount(c.coupon)}
                    {c.firstTimeOnly && <div className="text-xs text-navy-600/60">New customers only</div>}
                  </td>
                  <td className="px-4 py-3 text-navy-700">{APPLIES_LABEL[c.appliesTo] || 'All plans'}</td>
                  <td className="px-4 py-3 text-navy-700">
                    {c.timesRedeemed}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''}
                  </td>
                  <td className="px-4 py-3 text-navy-700">{formatDate(c.expiresAt)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {!c.active && (
                      <span className="text-xs text-gray-400 mr-3">Inactive</span>
                    )}
                    <button
                      onClick={() => toggleActive(c)}
                      disabled={togglingId === c.id || (!c.active && c.coupon?.valid === false)}
                      className="text-xs font-medium text-warm-600 hover:text-warm-700 disabled:opacity-40"
                    >
                      {c.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
