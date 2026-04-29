'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { School } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasParentRole, setHasParentRole] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // Get school via staff membership
      const { data: staffEntry } = await supabase
        .from('school_staff')
        .select('school_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (!staffEntry) {
        router.push('/auth/signup/school')
        return
      }

      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('id', staffEntry.school_id)
        .single()

      if (schoolData) {
        setSchool(schoolData)
      }

      // Check whether this user also has a parent role (for the context switcher)
      const { data: parentRow } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      setHasParentRole(!!parentRow)

      setLoading(false)
    }
    load()
  }, [])

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
    { href: '/school/families', label: 'Families', icon: '👨‍👩‍👧' },
    { href: '/school/invite', label: 'Invitations', icon: '✉️' },
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
    </div>
  )
}
