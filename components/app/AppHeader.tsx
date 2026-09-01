'use client'

import Link from 'next/link'
import { UserRound } from 'lucide-react'
import Logo from '@/components/ui/Logo'

// Minimal 56px app header: compact logo left, profile button right.
// (Chat page's height math assumes 3.5rem — keep h-14 in sync with it.)
export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur border-b border-[color:var(--mfa-border)]">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        <Logo href="/dashboard" imgClassName="h-7 w-auto" />
        <Link
          href="/dashboard/more"
          aria-label="Account and settings"
          className="tap-scale w-11 h-11 -mr-1 inline-flex items-center justify-center rounded-full text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]"
        >
          <UserRound size={22} aria-hidden="true" />
        </Link>
      </div>
    </header>
  )
}
