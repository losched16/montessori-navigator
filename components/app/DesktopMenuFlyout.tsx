'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  School, FileText, Star, Route, Baby, Bookmark, ClipboardList, BarChart3,
  Home as HomeIcon, BookOpen, Newspaper, Settings, ArrowLeftRight, LogOut,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Row { label: string; href: string; icon: LucideIcon }

// Every secondary destination, grouped. Real-user testing showed these were
// too hidden behind the old More page on desktop.
const GROUPS: Array<{ title: string; rows: Row[] }> = [
  {
    title: 'Family',
    rows: [
      { label: 'School', href: '/dashboard/schools', icon: School },
      { label: 'Notes', href: '/dashboard/notes', icon: FileText },
    ],
  },
  {
    title: 'Child & Learning',
    rows: [
      { label: 'Milestones', href: '/dashboard/milestones', icon: Star },
      { label: 'Montessori Learning', href: '/dashboard/curriculum', icon: Route },
      { label: 'Development Guide', href: '/dashboard/development', icon: Baby },
    ],
  },
  {
    title: 'Saved',
    rows: [
      { label: 'Saved Guidance', href: '/dashboard/memories', icon: Bookmark },
    ],
  },
  {
    title: 'Tools',
    rows: [
      { label: 'At-Home Plans', href: '/dashboard/plans', icon: ClipboardList },
      { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
      { label: 'Montessori at Home', href: '/dashboard/environment', icon: HomeIcon },
    ],
  },
  {
    title: 'Learn',
    rows: [
      { label: 'Full Library', href: '/dashboard/library', icon: BookOpen },
      { label: "Tomorrow's Child", href: '/dashboard/explore?collection=tomorrows-child', icon: Newspaper },
    ],
  },
]

// Desktop secondary navigation: an obvious flyout panel next to the rail,
// opened by the Menu button. Mobile keeps the /dashboard/more page.
export default function DesktopMenuFlyout({ open, onClose }: {
  open: boolean
  onClose: () => void
}) {
  const [hasSchoolRole, setHasSchoolRole] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: staffEntry } = await supabase
        .from('school_staff')
        .select('school_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
      setHasSchoolRole(!!staffEntry)
    }
    check()
  }, [])

  useEffect(() => {
    if (!open) return
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const rowClasses = (active: boolean) =>
    `flex items-center gap-3 px-3.5 min-h-[46px] rounded-xl text-[15px] font-medium transition ${
      active
        ? 'bg-[color:var(--mfa-purple-soft)] text-[color:var(--mfa-purple)]'
        : 'text-[color:var(--mfa-ink)] hover:bg-[color:var(--mfa-surface-warm)]'
    }`

  return (
    <>
      {/* Click-away layer (transparent — the rail stays visible) */}
      <div className="hidden sm:block fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label="Menu"
        className="hidden sm:block fixed left-20 top-14 bottom-0 z-40 w-[300px] bg-white border-r border-[color:var(--mfa-border)] shadow-[8px_0_24px_rgba(45,40,30,0.08)] overflow-y-auto outline-none"
      >
        <div className="p-4 space-y-5">
          {GROUPS.map(group => (
            <div key={group.title}>
              <div className="px-3.5 mb-1.5 text-[11.5px] font-bold tracking-[0.14em] uppercase text-[color:var(--mfa-ink-muted)]">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.rows.map(row => {
                  const Icon = row.icon
                  const active = pathname.startsWith(row.href.split('?')[0]) && row.href.startsWith('/dashboard/') && row.href.split('?')[0] !== '/dashboard/explore'
                  return (
                    <Link key={row.label} href={row.href} onClick={onClose} className={rowClasses(active)}>
                      <Icon size={18} className={active ? '' : 'text-[color:var(--mfa-ink-secondary)]'} aria-hidden="true" />
                      {row.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          <div>
            <div className="px-3.5 mb-1.5 text-[11.5px] font-bold tracking-[0.14em] uppercase text-[color:var(--mfa-ink-muted)]">
              Account
            </div>
            <div className="space-y-0.5">
              <Link href="/dashboard/settings" onClick={onClose} className={rowClasses(pathname.startsWith('/dashboard/settings'))}>
                <Settings size={18} className="text-[color:var(--mfa-ink-secondary)]" aria-hidden="true" />
                Family Settings
              </Link>
              {hasSchoolRole && (
                <Link href="/school" onClick={onClose} className={rowClasses(false)}>
                  <ArrowLeftRight size={18} className="text-[color:var(--mfa-ink-secondary)]" aria-hidden="true" />
                  Switch to School Admin
                </Link>
              )}
              <button onClick={handleSignOut} className={`${rowClasses(false)} w-full text-left`}>
                <LogOut size={18} className="text-[color:var(--mfa-ink-secondary)]" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
