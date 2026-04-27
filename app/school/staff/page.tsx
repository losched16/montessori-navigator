'use client'

import { useState, useEffect } from 'react'

interface StaffMember {
  id: string
  userId: string
  email: string | null
  role: string
  createdAt: string
  isYou: boolean
}

interface StaffInvite {
  id: string
  email: string
  token: string
  status: string
  created_at: string
  expires_at: string
}

export default function SchoolStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [invites, setInvites] = useState<StaffInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/school/staff')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load staff')
        return
      }
      setStaff(data.staff || [])
      setInvites(data.invites || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const inviteLink = (token: string) =>
    typeof window !== 'undefined' ? `${window.location.origin}/join-staff/${token}` : `/join-staff/${token}`

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/school/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create invitation')
        setSubmitting(false)
        return
      }

      setInviteEmail('')
      await load()
      // Auto-copy the new link for convenience
      copy(inviteLink(data.token), 'new')
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation')
    } finally {
      setSubmitting(false)
    }
  }

  const removeStaff = async (staffId: string) => {
    if (!confirm('Remove this admin from your school?')) return
    const res = await fetch('/api/school/staff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to remove')
      return
    }
    await load()
  }

  const revokeInvite = async (inviteId: string) => {
    const res = await fetch('/api/school/staff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to revoke')
      return
    }
    await load()
  }

  if (loading) {
    return <div className="text-navy-600 py-8 text-center">Loading staff…</div>
  }

  return (
    <div className="max-w-3xl pb-20 sm:pb-0">
      <h1 className="text-xl font-bold text-navy-600 mb-2">Admins &amp; Staff</h1>
      <p className="text-sm text-navy-600/70 mb-6">
        Invite other people to help manage your school account.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
      )}

      {/* Invite form */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-navy-600 mb-3">Invite a new admin</h2>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="colleague@yourschool.edu"
            required
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !inviteEmail.trim()}
            className="px-5 py-2.5 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition disabled:opacity-50 text-sm"
          >
            {submitting ? 'Creating…' : 'Create Invite'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          We&apos;ll generate a unique link you can share with them. They&apos;ll get full admin access — same as you.
        </p>
      </div>

      {/* Current staff */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-navy-600 mb-3">Current admins ({staff.length})</h2>
        <div className="space-y-2">
          {staff.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-navy-600">
                  {s.email || '(unknown)'}
                  {s.isYou && <span className="text-xs text-warm-600 ml-2">(you)</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {s.role} · added {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
              {!s.isYou && (
                <button
                  onClick={() => removeStaff(s.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending invites */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="font-semibold text-navy-600 mb-3">
          Pending invitations ({invites.filter(i => i.status === 'pending').length})
        </h2>
        {invites.length === 0 ? (
          <p className="text-sm text-gray-500">No invitations sent yet.</p>
        ) : (
          <div className="space-y-2">
            {invites.map(invite => (
              <div key={invite.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-600">{invite.email}</div>
                    <div className="text-xs text-gray-500">
                      Created {new Date(invite.created_at).toLocaleDateString()}
                      {' · expires '}
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                    invite.status === 'pending' ? 'bg-amber-50 text-amber-700'
                    : invite.status === 'accepted' ? 'bg-emerald-50 text-emerald-700'
                    : invite.status === 'revoked' ? 'bg-red-50 text-red-500'
                    : 'bg-gray-100 text-gray-500'
                  }`}>
                    {invite.status}
                  </span>
                </div>
                {invite.status === 'pending' && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={inviteLink(invite.token)}
                      readOnly
                      className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-600 font-mono min-w-0"
                    />
                    <button
                      onClick={() => copy(inviteLink(invite.token), invite.id)}
                      className="px-3 py-1.5 bg-warm-500 hover:bg-warm-600 text-white text-xs font-medium rounded transition whitespace-nowrap"
                    >
                      {copied === invite.id || (copied === 'new' && invite === invites[0]) ? 'Copied!' : 'Copy link'}
                    </button>
                    <button
                      onClick={() => revokeInvite(invite.id)}
                      className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                    >
                      Revoke
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
