'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Parent } from '@/lib/supabase'
import { formatAge, getAgePlane, getAgePlaneLabel } from '@/lib/utils'
import { ChildProvider, useChild } from '@/lib/child-context'
import { isStartHereHidden } from '@/lib/start-here-progress'
import Logo from '@/components/ui/Logo'

function DashboardInner({ children }: { children: React.ReactNode }) {
  const [parent, setParent] = useState<Parent | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showStartHere, setShowStartHere] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { children: childrenList, selectedChildId, setSelectedChildId, selectedChild } = useChild()

  const [hasSchoolRole, setHasSchoolRole] = useState(false)

  useEffect(() => {
    const loadParent = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: parentData } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      // Check whether this user is also a school admin/staff. Used to decide
      // routing when there's no parent record, and to show the context
      // switcher in the top bar.
      const { data: staffEntry } = await supabase
        .from('school_staff')
        .select('school_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
      const isSchoolStaff = !!staffEntry
      setHasSchoolRole(isSchoolStaff)

      if (!parentData) {
        // School-staff-only user landed on /dashboard — send them to /school
        // instead of forcing them through parent onboarding.
        if (isSchoolStaff) {
          router.push('/school')
          return
        }
        router.push('/onboarding')
        return
      }

      // Subscription gate: parents must have an active or trialing subscription
      // (Skip gate for school-affiliated parents — they have access via school)
      const status = parentData.subscription_status || 'inactive'
      const activeStatuses = ['trialing', 'active']
      if (!activeStatuses.includes(status)) {
        // Check if they're part of a school (school admin paid on their behalf)
        const { data: famMembers } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('parent_id', parentData.id)
        const familyIds = (famMembers || []).map(f => f.family_id)

        // Orphan parent (no family at all) — send to onboarding, which can
        // create the family. Don't bounce to /pricing because they may be a
        // school invitee whose enrollment is pending until they have a family.
        if (familyIds.length === 0) {
          router.push('/onboarding')
          return
        }

        let hasActiveSchool = false
        const { data: schoolFams } = await supabase
          .from('school_families')
          .select('school_id, schools!inner(subscription_status)')
          .in('family_id', familyIds)
          .eq('status', 'active')
        hasActiveSchool = (schoolFams || []).some((sf: any) =>
          ['active', 'trialing', 'past_due'].includes(sf.schools?.subscription_status)
        )
        if (!hasActiveSchool) {
          router.push('/pricing')
          return
        }
      }

      setParent(parentData)
    }
    loadParent()
    setShowStartHere(!isStartHereHidden())
  }, [])

  // Re-check start-here visibility on navigation (in case user dismissed/completed it)
  useEffect(() => {
    setShowStartHere(!isStartHereHidden())
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    ...(showStartHere ? [{ href: '/dashboard/start-here', label: 'Start Here', icon: '🚀' }] : []),
    { href: '/dashboard/chat', label: 'Abigail', icon: '💬' },
    { href: '/dashboard/children', label: 'Children', icon: '🌱' },
    { href: '/dashboard/development', label: 'Baby Milestones', icon: '👶' },
    { href: '/dashboard/journey', label: 'Journey', icon: '✨', children: [
      { href: '/dashboard/milestones', label: 'Milestones', icon: '⭐' },
      { href: '/dashboard/curriculum', label: 'Montessori Learning Journey', icon: '🎯' },
    ]},
    { href: '/dashboard/plans', label: 'At-Home Learning', icon: '📋' },
    { href: '/dashboard/reports', label: 'Reports', icon: '📊' },
    { href: '/dashboard/schools', label: 'Schools', icon: '🏫' },
    { href: '/dashboard/memories', label: 'Memories', icon: '💭' },
    { href: '/dashboard/notes', label: 'Notes', icon: '📝' },
    { href: '/dashboard/environment', label: 'Environment', icon: '🏡' },
    { href: '/dashboard/library', label: 'Library', icon: '📚' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const isJourneySection = pathname.startsWith('/dashboard/journey') || pathname.startsWith('/dashboard/milestones') || pathname.startsWith('/dashboard/curriculum')

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo href="/dashboard" imgClassName="h-8 w-auto" />

            {/* Child selector */}
            {childrenList.length > 0 && (
              <select
                value={selectedChildId || ''}
                onChange={e => setSelectedChildId(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-navy-700 focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
              >
                {childrenList.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} · {formatAge(child.date_of_birth)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasSchoolRole && (
              <Link
                href="/school"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-navy-600 hover:text-navy-700 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                title="Switch to your school admin dashboard"
              >
                <span>🏫</span> School Admin →
              </Link>
            )}
            <span className="text-sm text-gray-500 hidden sm:inline">{parent?.display_name}</span>
            <button onClick={handleSignOut} className="hidden sm:inline text-xs text-gray-400 hover:text-gray-600">
              Sign out
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1 text-gray-500"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop sidebar */}
        <nav className="hidden sm:block w-48 shrink-0 py-4 pl-4">
          <div className="sticky top-20 space-y-1">
            {navItems.map(item => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                    isActive(item.href) && !item.children
                      ? 'bg-warm-50 text-warm-700 font-medium'
                      : item.children && isJourneySection
                        ? 'bg-warm-50 text-warm-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
                {/* Sub-items */}
                {item.children && isJourneySection && (
                  <div className="ml-6 mt-0.5 space-y-0.5">
                    {item.children.map(sub => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                          isActive(sub.href)
                            ? 'text-warm-700 font-medium'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm">{sub.icon}</span>
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="border-t border-gray-100 mt-3 pt-3">
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                  isActive('/dashboard/settings')
                    ? 'bg-warm-50 text-warm-700 font-medium'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                <span className="text-base">⚙️</span>
                Settings
              </Link>
            </div>

            {/* Selected child context card */}
            {selectedChild && (
              <div className="mt-4 p-3 bg-white border border-gray-100 rounded-lg">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Active Child</div>
                <div className="font-medium text-navy-600 text-sm">{selectedChild.name}</div>
                <div className="text-xs text-gray-500">
                  {formatAge(selectedChild.date_of_birth)} · {getAgePlaneLabel(getAgePlane(selectedChild.date_of_birth))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/20 z-40 sm:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-white w-64 h-full p-4 space-y-1" onClick={e => e.stopPropagation()}>
              <div className="mb-4 pb-3 border-b border-gray-100">
                <div className="font-medium text-navy-600">{parent?.display_name}</div>
                {selectedChild && (
                  <div className="text-xs text-gray-500 mt-1">
                    Viewing: {selectedChild.name} · {formatAge(selectedChild.date_of_birth)}
                  </div>
                )}
              </div>
              {navItems.map(item => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`tap-scale flex items-center gap-3 px-3 py-3.5 rounded-[16px] text-sm min-h-[52px] ${
                      isActive(item.href)
                        ? 'bg-warm-50 text-warm-700 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-6 space-y-0.5">
                      {item.children.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                            isActive(sub.href)
                              ? 'text-warm-700 font-medium'
                              : 'text-gray-500'
                          }`}
                        >
                          <span className="text-sm">{sub.icon}</span>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="border-t border-gray-100 mt-3 pt-3">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm ${
                    isActive('/dashboard/settings')
                      ? 'bg-warm-50 text-warm-700 font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  <span className="text-base">⚙️</span>
                  Settings
                </Link>
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSignOut() }}
                  className="tap-scale flex items-center gap-3 px-3 py-3.5 rounded-[16px] text-sm min-h-[52px] text-gray-400 w-full text-left"
                >
                  <span className="text-xl">👋</span>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
        <div className="flex justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {[
            { href: '/dashboard', label: 'Home', icon: '🏠' },
            { href: '/dashboard/chat', label: 'Abigail', icon: '💬' },
            { href: '/dashboard/children', label: 'Children', icon: '🌱' },
            { href: '/dashboard/journey', label: 'Journey', icon: '✨' },
            { href: '/dashboard/library', label: 'Library', icon: '📚' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`tap-scale flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[52px] px-3 py-1.5 rounded-xl ${
                isActive(item.href) ? 'text-warm-600 bg-warm-50' : 'text-gray-400'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChildProvider>
      <DashboardInner>{children}</DashboardInner>
    </ChildProvider>
  )
}
