'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Customer/stats dashboard for super admins. Single page that shows:
//   - Top-level metrics across the platform
//   - School list, each expandable to show its families + pending invites
//   - Standalone parents list (paying individuals not linked to any school)
//
// All data comes from /api/admin/customers (single endpoint, service-role
// queries). For 1k–10k customers this loads in well under a second; if/when
// we cross 50k+ we'll paginate the school + parent lists.

interface FamilyRow {
  enrollmentId: string
  familyId: string
  label: string
  childrenCount: number
  joinedAt: string
  status: string
}

interface PendingInviteRow {
  inviteId: string
  email: string
  createdAt: string
  expiresAt: string
}

interface SchoolRow {
  id: string
  name: string
  slug: string
  subscriptionStatus: string
  isActive: boolean
  createdAt: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  seatsBilled: number | null
  activeFamilyCount: number
  pendingInviteCount: number
  adminCount: number
  families: FamilyRow[]
  pendingInvites: PendingInviteRow[]
}

interface ParentRow {
  id: string
  displayName: string | null
  email: string | null
  subscriptionStatus: string
  isActive: boolean
  hasPaidSubscription: boolean
  createdAt: string
  familiesCount: number
  childrenCount: number
}

interface Stats {
  totalSchools: number
  activeSchools: number
  totalParents: number
  parentsWithChildren: number
  activationRate: number
  activeFamilies: number
  pendingInvites: number
  totalChildren: number
  newSchoolsLast30: number
  newParentsLast30: number
}

interface PageData {
  stats: Stats
  schools: SchoolRow[]
  standaloneParents: ParentRow[]
}

function statusBadge(status: string) {
  const color =
    status === 'active' ? 'bg-emerald-50 text-emerald-700'
    : status === 'trialing' ? 'bg-warm-50 text-warm-700'
    : status === 'past_due' ? 'bg-amber-50 text-amber-700'
    : status === 'canceled' ? 'bg-red-50 text-red-500'
    : 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${color}`}>
      {status || 'inactive'}
    </span>
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString()
}

export default function AdminCustomersPage() {
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'schools' | 'parents'>('schools')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/customers')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          setError(body.error || 'Failed to load customers')
          setLoading(false)
          return
        }
        const body = await res.json()
        setData(body)
      } catch (err: any) {
        setError(err.message || 'Failed to load customers')
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="text-navy-600 py-8 text-center">Loading customers…</div>
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg max-w-2xl">
        {error || 'Could not load customers.'}
      </div>
    )
  }

  const { stats, schools, standaloneParents } = data

  const filteredSchools = schools.filter(s => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return s.name?.toLowerCase().includes(q) || s.slug?.toLowerCase().includes(q)
  })

  const filteredParents = standaloneParents.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (p.email || '').toLowerCase().includes(q) || (p.displayName || '').toLowerCase().includes(q)
  })

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl font-bold text-navy-700 mb-2">Customers</h1>
      <p className="text-sm text-navy-600/70 mb-6">
        Schools, families, and standalone parent subscribers. Click any school to see who they&apos;ve invited.
      </p>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Schools" value={stats.totalSchools} sub={`${stats.activeSchools} active`} />
        <StatCard label="Parents" value={stats.totalParents} sub={`${stats.activationRate}% with children`} />
        <StatCard label="Enrolled families" value={stats.activeFamilies} sub={`${stats.pendingInvites} pending invites`} />
        <StatCard label="Children" value={stats.totalChildren} sub={`${stats.newParentsLast30} new parents · 30d`} />
      </div>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab('schools')}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition ${
              tab === 'schools' ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-600/70 hover:text-navy-700'
            }`}
          >
            Schools ({schools.length})
          </button>
          <button
            onClick={() => setTab('parents')}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition ${
              tab === 'parents' ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-600/70 hover:text-navy-700'
            }`}
          >
            Standalone parents ({standaloneParents.length})
          </button>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tab === 'schools' ? 'Search schools…' : 'Search parents…'}
          className="flex-1 min-w-[180px] max-w-xs px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
        />
      </div>

      {tab === 'schools' && (
        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {filteredSchools.length === 0 ? (
            <div className="p-6 text-sm text-navy-600/70 text-center">
              {search ? 'No schools match that search.' : 'No schools yet.'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredSchools.map(school => (
                <li key={school.id}>
                  <button
                    onClick={() => setExpandedSchoolId(prev => prev === school.id ? null : school.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition text-left"
                  >
                    <span className="text-warm-600 text-xs w-3 flex-shrink-0">
                      {expandedSchoolId === school.id ? '▾' : '▸'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className="text-sm font-semibold text-navy-700 truncate">{school.name}</h3>
                        {statusBadge(school.subscriptionStatus)}
                      </div>
                      <div className="text-xs text-navy-600/60 mt-0.5">
                        {school.activeFamilyCount} {school.activeFamilyCount === 1 ? 'family' : 'families'}
                        {school.pendingInviteCount > 0 && ` · ${school.pendingInviteCount} pending`}
                        {' · '}{school.adminCount} {school.adminCount === 1 ? 'admin' : 'admins'}
                        {' · joined '}{formatDate(school.createdAt)}
                      </div>
                    </div>
                    {school.seatsBilled != null && (
                      <div className="hidden sm:block text-xs text-navy-600/60 whitespace-nowrap">
                        {school.seatsBilled} {school.seatsBilled === 1 ? 'seat' : 'seats'}
                      </div>
                    )}
                  </button>

                  {expandedSchoolId === school.id && (
                    <div className="px-5 pb-5 pt-1 bg-gray-50/50 border-t border-gray-100">
                      {/* Subscription mini-summary */}
                      <div className="grid sm:grid-cols-3 gap-3 mt-3 mb-4">
                        <MiniStat label="Status" value={school.subscriptionStatus || 'inactive'} />
                        <MiniStat label="Trial ends" value={formatDate(school.trialEndsAt)} />
                        <MiniStat label="Renews" value={formatDate(school.currentPeriodEnd)} />
                      </div>

                      {/* Pending invites */}
                      {school.pendingInvites.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-navy-700 uppercase tracking-wide mb-2">
                            Pending invitations ({school.pendingInvites.length})
                          </h4>
                          <ul className="space-y-1.5">
                            {school.pendingInvites.map(inv => (
                              <li
                                key={inv.inviteId}
                                className="bg-amber-50/60 border border-amber-100 rounded-lg px-3 py-2 flex items-center justify-between gap-3"
                              >
                                <span className="text-sm text-navy-700 truncate">{inv.email}</span>
                                <span className="text-xs text-navy-600/60 whitespace-nowrap">
                                  invited {formatDate(inv.createdAt)} · expires {formatDate(inv.expiresAt)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Active families */}
                      <div>
                        <h4 className="text-xs font-semibold text-navy-700 uppercase tracking-wide mb-2">
                          Active families ({school.activeFamilyCount})
                        </h4>
                        {school.families.length === 0 ? (
                          <p className="text-sm text-navy-600/70">
                            {school.pendingInviteCount > 0
                              ? "No families have signed up yet — only pending invitations above."
                              : "This school has no families and no invitations."}
                          </p>
                        ) : (
                          <ul className="space-y-1.5">
                            {school.families.map(fam => (
                              <li
                                key={fam.enrollmentId}
                                className="bg-white border border-gray-100 rounded-lg px-3 py-2 flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <div className="text-sm text-navy-700 truncate">{fam.label}</div>
                                  <div className="text-xs text-navy-600/60">
                                    {fam.childrenCount} {fam.childrenCount === 1 ? 'child' : 'children'} · joined {formatDate(fam.joinedAt)}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'parents' && (
        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {filteredParents.length === 0 ? (
            <div className="p-6 text-sm text-navy-600/70 text-center">
              {search ? 'No parents match that search.' : 'No standalone parent subscribers yet.'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredParents.map(p => (
                <li key={p.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-medium text-navy-700 truncate">
                        {p.displayName || p.email || '(no name)'}
                      </span>
                      {statusBadge(p.subscriptionStatus || 'inactive')}
                    </div>
                    <div className="text-xs text-navy-600/60 mt-0.5">
                      {p.email && <>{p.email} · </>}
                      {p.childrenCount} {p.childrenCount === 1 ? 'child' : 'children'}
                      {' · joined '}{formatDate(p.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="text-2xl font-bold text-navy-700">{value.toLocaleString()}</div>
      <div className="text-xs text-navy-600/70 mt-1">{label}</div>
      {sub && <div className="text-[11px] text-navy-600/50 mt-0.5">{sub}</div>}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-navy-600/60">{label}</div>
      <div className="text-sm font-medium text-navy-700 capitalize">{value}</div>
    </div>
  )
}
