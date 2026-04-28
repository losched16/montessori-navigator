'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SchoolSettingsPage() {
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [credentials, setCredentials] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  // Billing state
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('inactive')
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null)
  const [familyCount, setFamilyCount] = useState<number>(0)
  const [hasStripeCustomer, setHasStripeCustomer] = useState(false)
  const [openingPortal, setOpeningPortal] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: staff } = await supabase
        .from('school_staff')
        .select('school_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!staff) return

      const { data: school } = await supabase
        .from('schools')
        .select('*')
        .eq('id', staff.school_id)
        .single()

      if (school) {
        setSchoolId(school.id)
        setName(school.name || '')
        setAddress(school.address || '')
        setWebsite(school.website || '')
        setPhone(school.phone || '')
        setCredentials(school.credentials || '')
        setSubscriptionStatus(school.subscription_status || 'inactive')
        setTrialEndsAt(school.trial_ends_at || null)
        setCurrentPeriodEnd(school.current_period_end || null)
        setFamilyCount(school.family_count || 0)
        setHasStripeCustomer(!!school.stripe_customer_id)
      }
      setLoading(false)
    }
    load()
  }, [])

  const openBillingPortal = async () => {
    setOpeningPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Could not open billing portal.')
        setOpeningPortal(false)
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      alert('Could not open billing portal. Please try again.')
      setOpeningPortal(false)
    }
  }

  const formatStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      trialing: 'Trial Active',
      active: 'Active',
      past_due: 'Past Due',
      canceled: 'Canceled',
      inactive: 'Inactive',
    }
    return labels[status] || status
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  const save = async () => {
    if (!schoolId) return
    setSaving(true)
    setSaved(false)

    await supabase
      .from('schools')
      .update({
        name: name.trim(),
        address: address.trim() || null,
        website: website.trim() || null,
        phone: phone.trim() || null,
        credentials: credentials || null,
      })
      .eq('id', schoolId)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return <div className="text-navy-600 py-8 text-center">Loading...</div>
  }

  return (
    <div className="max-w-2xl pb-20 sm:pb-0">
      <h1 className="text-xl font-bold text-navy-600 mb-6">School Settings</h1>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-semibold text-navy-600 mb-4">School Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">School name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
              placeholder="123 Main St, City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
              placeholder="https://yourschool.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Accreditation / Credentials</label>
            <select
              value={credentials}
              onChange={e => setCredentials(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
            >
              <option value="">Select...</option>
              <option value="AMI">AMI (Association Montessori Internationale)</option>
              <option value="AMS">AMS (American Montessori Society)</option>
              <option value="MACTE">MACTE (Montessori Accreditation Council)</option>
              <option value="IMC">IMC (International Montessori Council)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full py-2.5 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Billing & Subscription */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mt-6">
        <h2 className="font-semibold text-navy-600 mb-4">Subscription</h2>

        {!hasStripeCustomer ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              No subscription is attached to this school account yet.
            </p>
            <button
              onClick={() => router.push('/for-schools/pricing')}
              className="bg-warm-500 hover:bg-warm-600 text-white font-medium px-5 py-2.5 rounded-lg transition"
            >
              View School Pricing →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</div>
                <div className="font-medium text-navy-600 flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    subscriptionStatus === 'active' || subscriptionStatus === 'trialing' ? 'bg-emerald-500'
                    : subscriptionStatus === 'past_due' ? 'bg-amber-500'
                    : 'bg-gray-400'
                  }`} />
                  {formatStatusLabel(subscriptionStatus)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Family Seats</div>
                <div className="font-medium text-navy-600">
                  {familyCount} families
                </div>
              </div>

              {subscriptionStatus === 'trialing' && trialEndsAt && (
                <div className="bg-warm-50 rounded-lg p-4 sm:col-span-2">
                  <div className="text-xs text-warm-700 uppercase tracking-wide mb-1">Trial Ends</div>
                  <div className="font-medium text-navy-600">{formatDate(trialEndsAt)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    You won&apos;t be charged until this date. Cancel anytime through &ldquo;Manage Subscription&rdquo; below.
                  </div>
                </div>
              )}

              {subscriptionStatus === 'active' && currentPeriodEnd && (
                <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Next Billing Date</div>
                  <div className="font-medium text-navy-600">{formatDate(currentPeriodEnd)}</div>
                </div>
              )}

              {subscriptionStatus === 'canceled' && (
                <div className="bg-amber-50 rounded-lg p-4 sm:col-span-2">
                  <div className="text-xs text-amber-700 uppercase tracking-wide mb-1">Canceled</div>
                  <div className="text-sm text-navy-600">
                    Your subscription has been canceled.
                    {currentPeriodEnd && (
                      <> Access continues until <strong>{formatDate(currentPeriodEnd)}</strong>.</>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={openBillingPortal}
              disabled={openingPortal}
              className="w-full sm:w-auto bg-navy-600 hover:bg-navy-700 text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {openingPortal ? 'Opening…' : 'Manage Subscription'}
            </button>

            <p className="text-xs text-gray-500">
              Manage your payment method, view invoices, change family seats, or cancel — all securely through Stripe.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
