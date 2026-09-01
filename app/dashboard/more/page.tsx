'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  School, FileText, Bookmark, ClipboardList, BarChart3, Home as HomeIcon,
  BookOpen, Newspaper, Route, Settings, LogOut, ChevronRight, ArrowLeftRight,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Row {
  label: string
  href: string
  icon: LucideIcon
}

const GROUPS: Array<{ title: string; rows: Row[] }> = [
  {
    title: 'Family',
    rows: [
      { label: 'School', href: '/dashboard/schools', icon: School },
      { label: 'Notes', href: '/dashboard/notes', icon: FileText },
      { label: 'Saved Guidance', href: '/dashboard/memories', icon: Bookmark },
    ],
  },
  {
    title: 'Tools',
    rows: [
      { label: 'At-Home Plans', href: '/dashboard/plans', icon: ClipboardList },
      { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
      { label: 'Home Environment', href: '/dashboard/environment', icon: HomeIcon },
    ],
  },
  {
    title: 'Learn',
    rows: [
      { label: 'Library', href: '/dashboard/library', icon: BookOpen },
      { label: "Tomorrow's Child", href: "/dashboard/library?category=Tomorrow's%20Child", icon: Newspaper },
      { label: 'Montessori Learning Journey', href: '/dashboard/curriculum', icon: Route },
    ],
  },
]

export default function MorePage() {
  const [hasSchoolRole, setHasSchoolRole] = useState(false)
  const router = useRouter()
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const rowClasses = 'tap-scale flex items-center gap-3.5 px-4 min-h-[56px] text-[15px] font-medium text-[color:var(--mfa-ink)] hover:bg-[color:var(--mfa-surface-warm)] transition'

  return (
    <div className="max-w-[640px] mx-auto pb-24 sm:pb-10">
      <div className="pt-2 pb-6">
        <h1 className="font-[family-name:var(--mfa-serif)] text-[32px] sm:text-[36px] leading-[1.05] font-semibold text-[color:var(--mfa-ink)] tracking-tight">
          More
        </h1>
      </div>

      <div className="space-y-6">
        {GROUPS.map(group => (
          <section key={group.title} aria-label={group.title}>
            <h2 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[color:var(--mfa-ink-muted)] mb-2 px-1">
              {group.title}
            </h2>
            <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] overflow-hidden divide-y divide-[color:var(--mfa-border)]">
              {group.rows.map(row => {
                const Icon = row.icon
                return (
                  <Link key={row.label} href={row.href} className={rowClasses}>
                    <Icon size={20} className="text-[color:var(--mfa-ink-secondary)]" aria-hidden="true" />
                    <span className="flex-1">{row.label}</span>
                    <ChevronRight size={18} className="text-[color:var(--mfa-ink-muted)]" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </section>
        ))}

        <section aria-label="Account">
          <h2 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[color:var(--mfa-ink-muted)] mb-2 px-1">
            Account
          </h2>
          <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] overflow-hidden divide-y divide-[color:var(--mfa-border)]">
            <Link href="/dashboard/settings" className={rowClasses}>
              <Settings size={20} className="text-[color:var(--mfa-ink-secondary)]" aria-hidden="true" />
              <span className="flex-1">Family Settings</span>
              <ChevronRight size={18} className="text-[color:var(--mfa-ink-muted)]" aria-hidden="true" />
            </Link>
            {hasSchoolRole && (
              <Link href="/school" className={rowClasses}>
                <ArrowLeftRight size={20} className="text-[color:var(--mfa-ink-secondary)]" aria-hidden="true" />
                <span className="flex-1">
                  Switch Experience
                  <span className="block text-[13px] font-normal text-[color:var(--mfa-ink-secondary)]">School Admin</span>
                </span>
                <ChevronRight size={18} className="text-[color:var(--mfa-ink-muted)]" aria-hidden="true" />
              </Link>
            )}
            <button onClick={handleSignOut} className={`${rowClasses} w-full text-left`}>
              <LogOut size={20} className="text-[color:var(--mfa-ink-secondary)]" aria-hidden="true" />
              <span className="flex-1">Sign Out</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
