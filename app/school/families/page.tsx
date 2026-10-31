'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { getActiveMembership } from '@/lib/active-school'

interface EnrolledFamily {
  id: string
  displayName: string  // best available human-readable label
  childrenCount: number
  parents: string[]    // names of the parents linked to this family
  joinedAt: string
  status: string
}

interface PendingInvite {
  id: string
  email: string
  createdAt: string
  expiresAt: string
}

export default function SchoolFamiliesPage() {
  const [families, setFamilies] = useState<EnrolledFamily[]>([])
  const [pending, setPending] = useState<PendingInvite[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const staff = await getActiveMembership(supabase, user.id)

      if (!staff) return

      // Families come from a server route: school staff can't read the
      // families / children / family_members tables directly (RLS), so the old
      // browser-side lookup returned nothing — every family showed up as
      // "Unnamed Family" with 0 children.
      const res = await fetch('/api/school/families', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setFamilies(data.families || [])
      }

      // --- Pending family invitations
      const { data: pendingInvites } = await supabase
        .from('invitations')
        .select('id, email, created_at, expires_at')
        .eq('school_id', staff.school_id)
        .eq('type', 'school_family')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      setPending(
        (pendingInvites || []).map(p => ({
          id: p.id,
          email: p.email,
          createdAt: p.created_at,
          expiresAt: p.expires_at,
        })),
      )

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="text-navy-600 py-8 text-center">Loading families...</div>
  }

  const activeCount = families.filter(f => f.status === 'active').length

  return (
    <div className="max-w-4xl pb-20 sm:pb-0">
      <h1 className="text-xl font-bold text-navy-600 mb-2">Families</h1>
      <p className="text-sm text-navy-600/70 mb-6">
        Everyone connected to your school — active families and pending invitations.
      </p>

      {/* Pending invitations section */}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-navy-700 mb-3">
            Pending invitations <span className="text-navy-600/60 font-normal">({pending.length})</span>
          </h2>
          <div className="space-y-2">
            {pending.map(p => (
              <div
                key={p.id}
                className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-navy-700 truncate">{p.email}</div>
                  <div className="text-xs text-navy-600/70 mt-0.5">
                    Invited {new Date(p.createdAt).toLocaleDateString()}
                    {' · expires '}
                    {new Date(p.expiresAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full whitespace-nowrap font-medium">
                  Pending
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-navy-600/60">
            Pending invites don&apos;t count toward your trial member cap — they only count once they accept.
          </p>
        </section>
      )}

      {/* Active families section */}
      <section>
        <h2 className="text-sm font-semibold text-navy-700 mb-3">
          Active families <span className="text-navy-600/60 font-normal">({activeCount})</span>
        </h2>

        {families.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">👨‍👩‍👧</div>
            <h3 className="font-semibold text-navy-600 mb-2">
              {pending.length > 0 ? 'No families have joined yet' : 'No families yet'}
            </h3>
            <p className="text-sm text-navy-600">
              {pending.length > 0
                ? "They'll appear here once they accept their invitation and sign up."
                : 'Share your invite link or upload a CSV to invite families.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-4 gap-4 px-4 py-2 text-xs text-navy-600 font-medium uppercase tracking-wide">
              <div>Family</div>
              <div>Children</div>
              <div>Joined</div>
              <div>Status</div>
            </div>

            {families.map(family => (
              <div
                key={family.id}
                className="bg-white border border-gray-100 rounded-xl p-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:items-center"
              >
                <div>
                  <div className="font-medium text-navy-700">{family.displayName}</div>
                  {family.parents.length > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {family.parents.length === 1 ? '1 parent' : `${family.parents.length} parents`} linked: {family.parents.join(', ')}
                    </div>
                  )}
                </div>
                <div className="text-sm text-navy-600">
                  <span className="sm:hidden text-navy-600">Children: </span>
                  {family.childrenCount} {family.childrenCount === 1 ? 'child' : 'children'}
                </div>
                <div className="text-sm text-navy-600">
                  <span className="sm:hidden text-navy-600">Joined: </span>
                  {new Date(family.joinedAt).toLocaleDateString()}
                </div>
                <div>
                  <span
                    className={`inline-flex text-xs px-2 py-0.5 rounded-full ${
                      family.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {family.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
