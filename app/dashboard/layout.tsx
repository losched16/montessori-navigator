'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Parent } from '@/lib/supabase'
import { formatAge, getAgePlane, getAgePlaneLabel } from '@/lib/utils'
import { ChildProvider, useChild } from '@/lib/child-context'

function DashboardInner({ children }: { children: React.ReactNode }) {
  const [parent, setParent] = useState<Parent | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { children: childrenList, selectedChildId, setSelectedChildId, selectedChild } = useChild()

  useEffect(() => {
    const loadParent = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: parentData } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (!parentData) { router.push('/onboarding'); return }
      setParent(parentData)
    }
    loadParent()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    { href: '/dashboard/chat', label: 'Guide', icon: '💬' },
    { href: '/dashboard/children', label: 'Children', icon: '🌱' },
    { href: '/dashboard/journey', label: 'Journey', icon: '✨', children: [
      { href: '/dashboard/milestones', label: 'Milestones', icon: '⭐' },
      { href: '/dashboard/curriculum', label: 'Montessori Learning Journey', icon: '🎯' },
    ]},
    { href: '/dashboard/plans', label: 'Plans', icon: '📋' },
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
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-lg font-bold text-navy-600">
              Navigator
            </Link>

            {/* Child selector */}
            {childrenList.length > 0 && (
              <select
                value={selectedChildId || ''}
                onChange={e => setSelectedChildId(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-navy-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
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
            <span className="text-sm text-gray-500 hidden sm:inline">{parent?.display_name}</span>
            <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600">
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
                      ? 'bg-teal-50 text-teal-600 font-medium'
                      : item.children && isJourneySection
                        ? 'bg-teal-50 text-teal-600 font-medium'
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
                            ? 'text-teal-600 font-medium'
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
                    ? 'bg-teal-50 text-teal-600 font-medium'
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
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm ${
                      isActive(item.href)
                        ? 'bg-teal-50 text-teal-600 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
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
                              ? 'text-teal-600 font-medium'
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
                      ? 'bg-teal-50 text-teal-600 font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  <span className="text-base">⚙️</span>
                  Settings
                </Link>
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
        <div className="flex justify-around py-2">
          {[
            { href: '/dashboard', label: 'Home', icon: '🏠' },
            { href: '/dashboard/chat', label: 'Guide', icon: '💬' },
            { href: '/dashboard/children', label: 'Children', icon: '🌱' },
            { href: '/dashboard/journey', label: 'Journey', icon: '✨' },
            { href: '/dashboard/library', label: 'Library', icon: '📚' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 ${
                isActive(item.href) ? 'text-teal-500' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
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
