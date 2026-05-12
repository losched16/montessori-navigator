'use client'

import { useEffect, useState, FormEvent } from 'react'

interface TeamMember {
  userId: string
  email: string | null
  role: string
  grantedBy: string | null
  grantedByEmail: string | null
  createdAt: string
  isYou: boolean
}

// Team management page for super admins. Lists current team, lets you add
// partners by email, and remove members (with lockout protection — you can't
// remove the only remaining super admin).
//
// Partners must already have an account (any kind — parent or admin). If they
// don't, the form returns a clear "ask them to sign up first" error.

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    try {
      const res = await fetch('/api/admin/team')
      if (res.ok) {
        const data = await res.json()
        setTeam(data.team || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not add team member')
        setSubmitting(false)
        return
      }
      setSuccess(
        data.alreadyExisted
          ? `${email} is already on the team.`
          : `${email} added.`,
      )
      setEmail('')
      await load()
    } catch (err: any) {
      setError(err.message || 'Could not add team member')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (member: TeamMember) => {
    const confirmMsg = member.isYou
      ? 'Remove your own super-admin access? You will lose access to /admin immediately.'
      : `Remove ${member.email || 'this user'} from the team?`
    if (!confirm(confirmMsg)) return

    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/admin/team', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: member.userId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not remove team member')
        return
      }
      setSuccess(`${member.email || 'User'} removed.`)
      if (member.isYou) {
        // We just lost super-admin status — bounce away from /admin
        window.location.href = '/'
        return
      }
      await load()
    } catch (err: any) {
      setError(err.message || 'Could not remove team member')
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-navy-700 mb-2">Team</h1>
      <p className="text-sm text-navy-600/70 mb-6">
        Anyone here can upload content, edit resources, and manage the team. Add a partner by email to give them super-admin access.
      </p>

      {/* Add member form */}
      <section className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-navy-700 mb-1">Add a team member</h2>
        <p className="text-xs text-navy-600/70 mb-3">
          They need an account first — ask them to sign up at <code className="text-warm-700">/auth/signup</code>{' '}
          with their email, then enter it here.
        </p>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="partner@example.com"
            required
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="px-5 py-2.5 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition disabled:opacity-50 text-sm"
          >
            {submitting ? 'Adding…' : 'Add to team'}
          </button>
        </form>
        {error && (
          <div className="mt-3 bg-red-50 text-red-600 text-sm p-2.5 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mt-3 bg-emerald-50 text-emerald-700 text-sm p-2.5 rounded-lg">{success}</div>
        )}
      </section>

      {/* Current team */}
      <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-navy-700">
            Current team {!loading && <span className="text-navy-600/60 font-normal">({team.length})</span>}
          </h2>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-navy-600/70 text-center">Loading…</div>
        ) : team.length === 0 ? (
          <div className="p-6 text-sm text-navy-600/70 text-center">No team members yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {team.map(m => (
              <li key={m.userId} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-navy-700 truncate">
                    {m.email || '(unknown email)'}
                    {m.isYou && <span className="text-xs text-warm-600 ml-2">(you)</span>}
                  </div>
                  <div className="text-xs text-navy-600/60 mt-0.5">
                    {m.role === 'super_admin' ? 'Super admin' : 'Editor'}
                    {' · added '}
                    {new Date(m.createdAt).toLocaleDateString()}
                    {m.grantedByEmail && !m.isYou && (
                      <> · by {m.grantedByEmail}</>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(m)}
                  className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs text-navy-600/60">
        Tip: there&apos;s no separate &quot;partner sign-up&quot; flow yet. Partners use the regular{' '}
        <code className="text-warm-700">/auth/signup</code> page (which creates a parent account); once you add
        them here, they&apos;ll see <code className="text-warm-700">/admin</code> on their next page load.
      </p>
    </div>
  )
}
