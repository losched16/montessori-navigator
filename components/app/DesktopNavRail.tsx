'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PRIMARY_NAV, isNavItemActive } from './nav'
import DesktopMenuFlyout from './DesktopMenuFlyout'

// Compact 80px desktop nav rail. The four primary destinations navigate;
// Menu opens an obvious secondary-navigation flyout (real-user testing showed
// secondary destinations were too hidden behind a routed More page).
export default function DesktopNavRail() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const primary = PRIMARY_NAV.filter(i => i.key !== 'more')
  const more = PRIMARY_NAV.find(i => i.key === 'more')!

  // Close the flyout on navigation
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const itemClasses = (active: boolean) =>
    `tap-scale flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition ${
      active
        ? 'bg-white/10 text-[color:var(--mfa-gold)]'
        : 'text-white/65 hover:bg-white/10 hover:text-white'
    }`

  const renderItem = (item: typeof PRIMARY_NAV[number]) => {
    const active = isNavItemActive(item, pathname)
    const Icon = item.icon
    return (
      <Link
        key={item.key}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={itemClasses(active)}
      >
        <Icon size={23} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
        <span className={`text-[11.5px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
          {item.label}
        </span>
      </Link>
    )
  }

  const MenuIcon = more.icon
  const menuActive = menuOpen || isNavItemActive(more, pathname)

  return (
    <>
      <nav
        aria-label="Primary"
        className="hidden sm:flex fixed left-0 top-14 bottom-0 z-30 w-20 flex-col items-center justify-between py-4 bg-[color:var(--mfa-navy-deep)]"
      >
        <div className="flex flex-col items-center gap-1.5">
          {primary.map(renderItem)}
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            aria-label="Open menu"
            className={itemClasses(menuActive)}
          >
            <MenuIcon size={23} strokeWidth={menuActive ? 2.2 : 1.8} aria-hidden="true" />
            <span className={`text-[11.5px] leading-none ${menuActive ? 'font-semibold' : 'font-medium'}`}>
              {more.label}
            </span>
          </button>
        </div>
      </nav>

      <DesktopMenuFlyout open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
