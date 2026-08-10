'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'

// Comp a School — super-admin tool to set up a free/sponsored school.
// Identifies the school by name + state (many US schools share a name), sets
// its number of family subscriptions (seats), and links the head of school as
// admin. The school gets seats + 20 staff invites automatically.

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

export default function CompSchoolPage() {
  const [name, setName] = useState('')
  const [state, setState] = useState('')
  const [seats, setSeats] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ slug: string; seats: number } | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/comp-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, state, seats, adminEmail, note }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not create the school.')
        setSubmitting(false)
        return
      }
      setResult({ slug: data.slug, seats: data.seats })
      setName(''); setState(''); setSeats(''); setAdminEmail(''); setNote('')
    } catch (err: any) {
      setError(err.message || 'Could not create the school.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/customers" className="inline-flex items-center gap-1 text-xs text-navy-600/60 hover:text-navy-700 mb-4">
        ← Customers
      </Link>
      <h1 className="text-xl font-bold text-navy-700 mb-2">Comp a School</h1>
      <p className="text-sm text-navy-600/70 mb-6">
        Set up a free (sponsored) school — no Stripe, no coupon. The head of school must have
        an account already (have them sign up at <code className="text-warm-700">/auth/signup</code> first).
        The school gets its family seats <strong>plus 20 staff invites</strong> automatically.
      </p>

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-4 mb-6">
          ✅ School created and comped. It has <strong>{result.seats}</strong> family seats + 20 staff.
          The head of school can log in now and will see their admin dashboard. Invite link:{' '}
          <code className="text-emerald-900">/join/{result.slug}</code>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5 bg-white border border-gray-100 rounded-2xl p-6">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">School name <span className="text-red-500">*</span></label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)} required
            placeholder="Sunrise Montessori Academy"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">State <span className="text-red-500">*</span></label>
            <select
              value={state} onChange={e => setState(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
            >
              <option value="">Select…</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <p className="text-xs text-navy-600/60 mt-1">Distinguishes same-named schools.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1"># Family subscriptions <span className="text-red-500">*</span></label>
            <input
              type="number" min={1} value={seats} onChange={e => setSeats(e.target.value)} required
              placeholder="50"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-navy-600/60 mt-1">+20 staff seats added automatically.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Head of school email <span className="text-red-500">*</span></label>
          <input
            type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required
            placeholder="head@sunrisemontessori.org"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          />
          <p className="text-xs text-navy-600/60 mt-1">Must already have an account — they&apos;ll be linked as the school admin.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Note (optional)</label>
          <input
            type="text" value={note} onChange={e => setNote(e.target.value)}
            placeholder="MFC founding member — prepaid through 2027"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          />
        </div>

        <button
          type="submit" disabled={submitting}
          className="px-5 py-2.5 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition disabled:opacity-50 text-sm"
        >
          {submitting ? 'Creating…' : 'Create comped school'}
        </button>
      </form>
    </div>
  )
}
