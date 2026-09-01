import { Home as House, Sparkles, Sprout, Compass, LayoutGrid, type LucideIcon } from 'lucide-react'

export interface NavItem {
  key: string
  label: string
  href: string
  icon: LucideIcon
  /** Route prefixes that light this item up (migration mapping — routes unmoved) */
  activePrefixes: string[]
  /** Exact-match only (Home) */
  exact?: boolean
}

export const PRIMARY_NAV: NavItem[] = [
  { key: 'home', label: 'Home', href: '/dashboard', icon: House, activePrefixes: ['/dashboard'], exact: true },
  { key: 'abigail', label: 'Abigail', href: '/dashboard/chat', icon: Sparkles, activePrefixes: ['/dashboard/chat'] },
  {
    key: 'child', label: 'My Child', href: '/dashboard/children', icon: Sprout,
    activePrefixes: ['/dashboard/children', '/dashboard/journey', '/dashboard/milestones', '/dashboard/curriculum', '/dashboard/development', '/dashboard/memories'],
  },
  {
    key: 'explore', label: 'Explore', href: '/dashboard/explore', icon: Compass,
    activePrefixes: ['/dashboard/explore', '/dashboard/resources', '/dashboard/library', '/dashboard/environment'],
  },
  {
    key: 'more', label: 'More', href: '/dashboard/more', icon: LayoutGrid,
    activePrefixes: ['/dashboard/more', '/dashboard/settings', '/dashboard/reports', '/dashboard/notes', '/dashboard/plans', '/dashboard/schools'],
  },
]

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href
  return item.activePrefixes.some(p => pathname === p || pathname.startsWith(p + '/'))
}
