'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { isSuperAdmin } from '@/lib/super-admin'
import Logo from '@/components/ui/Logo'

// Super-admin portal layout. Anyone not in the super_admins table is
// redirected to / (we don't want to leak the URL's existence).

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?next=' + encodeURIComponent(pathname))
        return
      }
      const allowed = await isSuperAdmin(supabase, user.id)
      if (!allowed) {
        // Not a super admin — silently redirect home rather than show a
        // "forbidden" page that telegraphs the existence of /admin.
        router.push('/')
        return
      }
      setAuthed(true)
      setLoading(false)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading || !authed) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-navy-600">Loading…</div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/resources', label: 'Resources', icon: '📚' },
    { href: '/admin/team', label: 'Team', icon: '👥' },
  ]

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo href="/admin" imgClassName="h-8 w-auto" />
            <span className="hidden sm:inline text-gray-300">·</span>
            <span className="hidden sm:inline text-xs font-bold tracking-widest uppercase text-warm-600">
              Content Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-navy-600 hover:text-navy-700 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              ← Back to app
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
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

        <main className="flex-1 min-w-0 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
