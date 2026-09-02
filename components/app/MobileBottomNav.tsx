'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PRIMARY_NAV, isNavItemActive } from './nav'

// Persistent five-item bottom navigation (mobile only).
// Total height ≈ 4rem + safe area — the chat page subtracts 4rem for it.
export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-[color:var(--mfa-border)]"
    >
      <div className="flex justify-around px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {PRIMARY_NAV.map(item => {
          const active = isNavItemActive(item, pathname)
          const Icon = item.icon
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`tap-scale flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] px-2 rounded-xl ${
                active
                  ? 'bg-[color:var(--mfa-navy)] text-[color:var(--mfa-gold)]'
                  : 'text-[color:var(--mfa-ink-muted)]'
              }`}
            >
              <Icon size={23} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
              <span className={`text-[12px] leading-none ${active ? 'font-semibold text-white' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
