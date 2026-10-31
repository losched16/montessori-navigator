'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { School } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'
import { listMemberships, pickMembership, readActiveSchoolCookie, setActiveSchoolCookie } from '@/lib/active-school'

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasParentRole, setHasParentRole] = useState(false)
  // Every school this user can manage (for the switcher), and whether the
  // current one is Foundation support access rather than the school's own.
  const [mySchools, setMySchools] = useState<Array<{ id: string; name: string }>>([])
  const [isSupport, setIsSupport] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // Get school via staff membership (the active one, for multi-school users)
      const memberships = await listMemberships(supabase, user.id)
      const staffEntry = pickMembership(memberships, readActiveSchoolCookie())

      if (!staffEntry) {
        router.push('/auth/signup/school')
        return
      }

      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('id', staffEntry.school_id)
        .single()

      setIsSupport(staffEntry.is_support)
      if (memberships.length > 1) {
        const { data: names } = await supabase
          .from('schools')
          .select('id, name')
          .in('id', memberships.map(m => m.school_id))
        setMySchools(((names || []) as Array<{ id: string; name: string }>).sort((a, b) => a.name.localeCompare(b.name)))
      }

      if (schoolData) {
        setSchool(schoolData)

        // First-login redirect: if this admin hasn't seen the welcome page
        // yet, send them there. The welcome page itself is exempt from the
        // redirect (otherwise it would loop). We also exempt the auth flow
        // and any settings sub-paths just in case.
        const onboarding = (schoolData.onboarding_state as any) || {}
        // Skipped for Foundation support access: the welcome flow is the
        // school's own first-login moment.
        if (
          !staffEntry.is_support &&
          !onboarding.welcomed_at &&
          pathname !== '/school/welcome'
        ) {
          router.push('/school/welcome')
          return
        }
      }

      // Support access stops here: no parent self-account or marketing sync
      // for Foundation staff acting on a school's behalf.
      if (staffEntry.is_support) {
        setLoading(false)
        return
      }

      // Check whether this user also has a parent role (for the context switcher)
      let { data: parentRow } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      // Auto-provision a parent self-account for school admins. The dual-role
      // view switcher only appears when this exists, and we want every admin
      // to have it ready by default — same email, same login, no clutter on
      // the school side. The endpoint is idempotent (no-ops if already there)
      // and the row never gets linked to school_families so it doesn't count
      // toward the trial cap. Fire-and-forget: a failure here doesn't block
      // the admin from using their school dashboard.
      if (!parentRow) {
        try {
          const res = await fetch('/api/school/become-parent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          })
          if (res.ok) {
            const refreshed = await supabase
              .from('parents')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle()
            parentRow = refreshed.data
          }
        } catch {
          // Silent — admin can still use the school side without it.
        }
      }
      setHasParentRole(!!parentRow)

      // Sync this admin into GHL for marketing segmentation — once per browser
      // session, fire-and-forget. The endpoint derives tags (school-admin) from
      // the DB.
      if (typeof window !== 'undefined' && !sessionStorage.getItem('ghl_synced')) {
        sessionStorage.setItem('ghl_synced', '1')
        fetch('/api/ghl/sync', { method: 'POST' }).catch(() => {})
      }

      setLoading(false)
    }
    load()
  }, [])

  const switchSchool = (schoolId: string) => {
    setActiveSchoolCookie(schoolId)
    // Full reload so every page re-reads the newly active school.
    window.location.href = '/school'
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const isActive = (href: string) => {
    if (href === '/school') return pathname === '/school'
    return pathname.startsWith(href)
  }

  const navItems = [
    { href: '/school', label: 'Dashboard', icon: '📊' },
    { href: '/school/rollout', label: 'Roll out', icon: '🚀' },
    { href: '/school/families', label: 'Families', icon: '👨‍👩‍👧' },
    { href: '/school/invite', label: 'Invitations', icon: '✉️' },
    { href: '/school/resources', label: 'Resources', icon: '📚' },
    { href: '/school/staff', label: 'Admins', icon: '👤' },
    { href: '/school/settings', label: 'Settings', icon: '⚙️' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-navy-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo href="/school" imgClassName="h-8 w-auto" />
            {school?.name && (
              <>
                <span className="hidden sm:inline text-gray-300">·</span>
                <span className="hidden sm:inline text-sm font-medium text-navy-700">
                  {school.name}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {mySchools.length > 1 && school && (
              <select
                value={school.id}
                onChange={e => switchSchool(e.target.value)}
                aria-label="Switch school"
                className="max-w-[180px] sm:max-w-[240px] text-xs text-navy-700 border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              >
                {mySchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
            {hasParentRole && (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-navy-600 hover:text-navy-700 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                title="Switch to your parent dashboard"
              >
                <span>👨‍👩‍👧</span> Parent View →
              </Link>
            )}
            <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {isSupport && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
            <span>
              You&apos;re managing <strong>{school?.name}</strong> as Montessori Foundation support.
              Invitations and changes you make are made on the school&apos;s behalf.
            </span>
            <Link href="/admin/customers" className="shrink-0 font-medium underline">
              Back to admin
            </Link>
          </div>
        </div>
      )}

      {/* On the welcome page we hide the nav chrome — first-login feels like
          a special moment, not just another tab. The top bar stays so the
          user knows they're signed in and can sign out if they want to. */}
      {pathname === '/school/welcome' ? (
        <main className="max-w-3xl mx-auto p-4 sm:p-8">{children}</main>
      ) : (
        <div className="max-w-7xl mx-auto flex">
          {/* Sidebar */}
          <nav className="hidden sm:block w-48 shrink-0 py-4 pl-4">
            <div className="sticky top-20 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                    isActive(item.href)
                      ? 'bg-warm-50 text-warm-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile nav */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
            <div className="flex justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[52px] px-3 py-1.5 rounded-xl ${
                    isActive(item.href) ? 'text-warm-600 bg-warm-50' : 'text-gray-400'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[11px] font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0 p-4 sm:p-6">
            {children}
          </main>
        </div>
      )}
    </div>
  )
}
