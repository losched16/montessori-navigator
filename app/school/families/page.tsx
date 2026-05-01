'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

interface EnrolledFamily {
  id: string
  displayName: string  // best available human-readable label
  childrenCount: number
  joinedAt: string
  status: string
}

interface PendingInvite {
  id: string
  email: string
  createdAt: string
  expiresAt: string
}

// Generic / placeholder family.name values that we should treat as "no real
// name set" and fall back to the parent's name instead. These come from older
// signup paths that didn't capture a proper name.
const GENERIC_FAMILY_NAMES = new Set(['my family', 'unnamed family', "'s family", ''])

function isGenericName(name: string | null | undefined): boolean {
  if (!name) return true
  return GENERIC_FAMILY_NAMES.has(name.trim().toLowerCase())
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

      const { data: staff } = await supabase
        .from('school_staff')
        .select('school_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!staff) return

      // --- Active enrollments
      const { data: enrollments } = await supabase
        .from('school_families')
        .select('id, family_id, status, joined_at')
        .eq('school_id', staff.school_id)
        .order('joined_at', { ascending: false })

      const familyIds = (enrollments || []).map(e => e.family_id)

      const [familyRes, childRes, memberRes] = await Promise.all([
        familyIds.length === 0
          ? Promise.resolve({ data: [] })
          : supabase
              .from('families')
              .select('id, name')
              .in('id', familyIds),
        familyIds.length === 0
          ? Promise.resolve({ data: [] })
          : supabase
              .from('children')
              .select('id, family_id')
              .in('family_id', familyIds),
        familyIds.length === 0
          ? Promise.resolve({ data: [] })
          : supabase
              .from('family_members')
              // Pull the primary member's parent record so we can show their
              // name when the family.name is generic ("My Family" etc).
              .select('family_id, role, parents!inner(display_name, email)')
              .in('family_id', familyIds)
              .eq('role', 'primary'),
      ])

      const familyMap = new Map((familyRes.data || []).map((f: any) => [f.id, f]))
      const childCountMap = new Map<string, number>()
      ;(childRes.data || []).forEach((c: any) => {
        childCountMap.set(c.family_id, (childCountMap.get(c.family_id) || 0) + 1)
      })
      const primaryParentMap = new Map<string, { display_name: string | null; email: string | null }>()
      ;(memberRes.data || []).forEach((m: any) => {
        const parent = Array.isArray(m.parents) ? m.parents[0] : m.parents
        if (parent) {
          primaryParentMap.set(m.family_id, {
            display_name: parent.display_name,
            email: parent.email,
          })
        }
      })

      const enriched: EnrolledFamily[] = (enrollments || []).map(e => {
        const family = familyMap.get(e.family_id) as any
        const familyName = family?.name as string | null | undefined
        const primary = primaryParentMap.get(e.family_id)

        // Display-name resolution order:
        //   1. family.name if it's a real name (not "My Family" etc)
        //   2. "{parent display_name}'s Family" if we have a parent name
        //   3. "{parent email}'s Family"
        //   4. "Unnamed Family" as a last resort
        let displayName: string
        if (!isGenericName(familyName)) {
          displayName = familyName as string
        } else if (primary?.display_name && primary.display_name.trim()) {
          displayName = `${primary.display_name.trim()}'s Family`
        } else if (primary?.email) {
          displayName = `${primary.email.split('@')[0]}'s Family`
        } else {
          displayName = 'Unnamed Family'
        }

        return {
          id: e.id,
          displayName,
          childrenCount: childCountMap.get(e.family_id) || 0,
          joinedAt: e.joined_at,
          status: e.status,
        }
      })

      setFamilies(enriched)

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
                <div className="font-medium text-navy-700">{family.displayName}</div>
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
