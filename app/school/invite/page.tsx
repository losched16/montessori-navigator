'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface InviteUsage {
  used: number
  limit: number | null
  isTrial: boolean
  reachedLimit: boolean
}

export default function SchoolInvitePage() {
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [schoolSlug, setSchoolSlug] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState<InviteUsage | null>(null)

  // CSV state
  const [csvEmails, setCsvEmails] = useState('')
  const [csvUploading, setCsvUploading] = useState(false)
  const [csvMessage, setCsvMessage] = useState('')
  const [csvResults, setCsvResults] = useState<{ sent: number; errors: string[] } | null>(null)

  const supabase = createClient()

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
      setSchoolId(staff.school_id)

      const { data: school } = await supabase
        .from('schools')
        .select('slug')
        .eq('id', staff.school_id)
        .single()

      if (school) {
        setSchoolSlug(school.slug)
        setInviteLink(`${window.location.origin}/join/${school.slug}`)
      }

      // Load pending invites
      const { data: invites } = await supabase
        .from('invitations')
        .select('*')
        .eq('school_id', staff.school_id)
        .order('created_at', { ascending: false })
        .limit(50)

      setPendingInvites(invites || [])

      // Load invite usage (lives on the staff endpoint since it covers
      // the combined staff + family count for trial limits)
      try {
        const res = await fetch('/api/school/staff')
        if (res.ok) {
          const data = await res.json()
          if (data.inviteUsage) setUsage(data.inviteUsage)
        }
      } catch {}

      setLoading(false)
    }
    load()
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCsvUpload = async () => {
    if (!schoolId || !csvEmails.trim()) return
    setCsvUploading(true)
    setCsvMessage('')
    setCsvResults(null)

    try {
      const res = await fetch('/api/school/invite/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId,
          emails: csvEmails,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setCsvMessage(data.error || 'Failed to process invitations')
      } else {
        setCsvResults(data)
        setCsvEmails('')
        // Reload invites
        const { data: invites } = await supabase
          .from('invitations')
          .select('*')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(50)
        setPendingInvites(invites || [])
      }
    } catch {
      setCsvMessage('Failed to process invitations')
    }
    setCsvUploading(false)
  }

  const revokeInvite = async (inviteId: string) => {
    await supabase
      .from('invitations')
      .update({ status: 'revoked' })
      .eq('id', inviteId)
    setPendingInvites(prev => prev.map(i => i.id === inviteId ? { ...i, status: 'revoked' } : i))
  }

  if (loading) {
    return <div className="text-navy-600 py-8 text-center">Loading...</div>
  }

  return (
    <div className="max-w-4xl pb-20 sm:pb-0">
      <h1 className="text-xl font-bold text-navy-600 mb-6">Invite Families</h1>

      {/* Trial limit banner */}
      {usage?.isTrial && usage.limit !== null && (
        <div className={`rounded-xl p-4 mb-6 border ${
          usage.reachedLimit
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-warm-50 border-warm-200 text-warm-700'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-xl">{usage.reachedLimit ? '⚠️' : '✨'}</span>
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">
                {usage.reachedLimit
                  ? `Trial member limit reached (${usage.used}/${usage.limit})`
                  : `Free trial: ${usage.used}/${usage.limit} active members`}
              </div>
              <p className="text-xs leading-relaxed">
                {usage.reachedLimit
                  ? `You have ${usage.used} active members (admins + families combined). Pending invites don't count — but ${usage.limit} people have actually joined, which is your trial cap. Upgrade to invite more.`
                  : `During your trial you can have up to ${usage.limit} active members (admins + families combined). Pending invites don't count — only people who actually sign up. The cap lifts entirely the moment you upgrade.`}
              </p>
              {usage.reachedLimit && (
                <Link href="/school/settings" className="inline-block mt-2 text-xs font-semibold underline">
                  Manage subscription →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Link */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-navy-600 mb-2">Share Your Invite Link</h2>
        <p className="text-sm text-navy-600 mb-4">
          Send this link to families so they can sign up and automatically join your school community.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-navy-600 font-mono"
          />
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition text-sm"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* CSV / Bulk Invite */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-navy-600 mb-2">Bulk Invite via Email</h2>
        <p className="text-sm text-navy-600 mb-4">
          Paste a list of email addresses (one per line, or comma-separated) to send invitation emails to multiple families at once.
        </p>
        <textarea
          value={csvEmails}
          onChange={e => setCsvEmails(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          rows={5}
          placeholder={"parent1@email.com\nparent2@email.com\nparent3@email.com"}
        />
        {csvMessage && (
          <p className="text-sm text-red-500 mt-2">{csvMessage}</p>
        )}
        {csvResults && (
          <div className="mt-2 text-sm">
            <p className="text-warm-700">{csvResults.sent} invitation(s) created successfully.</p>
            {csvResults.errors.length > 0 && (
              <div className="text-red-500 mt-1">
                {csvResults.errors.map((err, i) => <p key={i}>{err}</p>)}
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleCsvUpload}
          disabled={csvUploading || !csvEmails.trim()}
          className="mt-3 w-full py-2.5 bg-navy-600 hover:bg-navy-700 text-white font-medium rounded-lg transition disabled:opacity-40 text-sm"
        >
          {csvUploading ? 'Sending invitations...' : 'Send Invitations'}
        </button>
      </div>

      {/* Invitation History */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-semibold text-navy-600 mb-4">Invitation History</h2>
        {pendingInvites.length === 0 ? (
          <p className="text-sm text-navy-600">No invitations sent yet.</p>
        ) : (
          <div className="space-y-2">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-navy-600">{invite.email || 'Link invite'}</div>
                  <div className="text-xs text-navy-600">
                    {new Date(invite.created_at).toLocaleDateString()}
                    {invite.expires_at && ` · Expires ${new Date(invite.expires_at).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    invite.status === 'pending' ? 'bg-amber-50 text-amber-700'
                    : invite.status === 'accepted' ? 'bg-emerald-50 text-emerald-700'
                    : invite.status === 'revoked' ? 'bg-red-50 text-red-500'
                    : 'bg-gray-100 text-gray-500'
                  }`}>
                    {invite.status}
                  </span>
                  {invite.status === 'pending' && (
                    <button
                      onClick={() => revokeInvite(invite.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
