'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserRound, Settings, ArrowLeftRight, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'

// Minimal 56px app header: compact logo left, profile menu right.
// (Chat page's height math assumes 3.5rem — keep h-14 in sync with it.)
// The profile button opens a small account menu — real-user testing showed a
// bare icon routing to a page didn't communicate its role, and authorized
// admins expect to find "Switch to School Admin" here.
export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasSchoolRole, setHasSchoolRole] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const itemClasses = 'tap-scale w-full flex items-center gap-2.5 px-3.5 min-h-[46px] text-[14.5px] font-medium text-[color:var(--mfa-ink)] hover:bg-[color:var(--mfa-surface-warm)] transition text-left'

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur border-b border-[color:var(--mfa-border)]">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        <Logo href="/dashboard" imgClassName="h-7 w-auto" />
        <div ref={wrapRef} className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Account menu"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className={`tap-scale w-11 h-11 -mr-1 inline-flex items-center justify-center rounded-full transition ${
              menuOpen
                ? 'bg-[color:var(--mfa-purple-soft)] text-[color:var(--mfa-purple)]'
                : 'text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]'
            }`}
          >
            <UserRound size={22} aria-hidden="true" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="Account"
              className="absolute right-0 top-12 w-60 bg-white border border-[color:var(--mfa-border)] rounded-2xl shadow-xl overflow-hidden py-1.5"
            >
              <Link href="/dashboard/settings" role="menuitem" onClick={() => setMenuOpen(false)} className={itemClasses}>
                <Settings size={17} className="text-[color:var(--mfa-ink-secondary)]" aria-hidden="true" />
                Family Settings
              </Link>
              {hasSchoolRole && (
                <Link href="/school" role="menuitem" onClick={() => setMenuOpen(false)} className={itemClasses}>
                  <ArrowLeftRight size={17} className="text-[color:var(--mfa-ink-secondary)]" aria-hidden="true" />
                  Switch to School Admin
                </Link>
              )}
              <button role="menuitem" onClick={handleSignOut} className={itemClasses}>
                <LogOut size={17} className="text-[color:var(--mfa-ink-secondary)]" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
