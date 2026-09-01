'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PRIMARY_NAV, isNavItemActive } from './nav'

// Compact 80px desktop nav rail. Same five destinations and mental model as
// the mobile bottom nav — More sits at the bottom of the rail.
export default function DesktopNavRail() {
  const pathname = usePathname()
  const primary = PRIMARY_NAV.filter(i => i.key !== 'more')
  const more = PRIMARY_NAV.find(i => i.key === 'more')!

  const renderItem = (item: typeof PRIMARY_NAV[number]) => {
    const active = isNavItemActive(item, pathname)
    const Icon = item.icon
    return (
      <Link
        key={item.key}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={`tap-scale flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition ${
          active
            ? 'bg-[color:var(--mfa-purple-soft)] text-[color:var(--mfa-purple)]'
            : 'text-[color:var(--mfa-ink-muted)] hover:bg-[color:var(--mfa-surface-warm)] hover:text-[color:var(--mfa-ink-secondary)]'
        }`}
      >
        <Icon size={23} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
        <span className={`text-[11px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
          {item.label}
        </span>
      </Link>
    )
  }

  return (
    <nav
      aria-label="Primary"
      className="hidden sm:flex fixed left-0 top-14 bottom-0 z-30 w-20 flex-col items-center justify-between py-4 bg-white border-r border-[color:var(--mfa-border)]"
    >
      <div className="flex flex-col items-center gap-1.5">
        {primary.map(renderItem)}
      </div>
      <div className="flex flex-col items-center gap-1.5">
        {renderItem(more)}
      </div>
    </nav>
  )
}
