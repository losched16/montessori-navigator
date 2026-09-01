'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check, Plus } from 'lucide-react'
import { useChild } from '@/lib/child-context'
import { formatAge, getAgePlane } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import BottomSheet from '@/components/ui/BottomSheet'
import { trackEvent } from '@/lib/analytics'

// Screen names for analytics — never the path with any IDs in it.
function screenFromPath(pathname: string): string {
  if (pathname === '/dashboard') return 'home'
  const seg = pathname.split('/')[2] || 'unknown'
  return seg === 'children' ? 'my_child' : seg
}

// The child-selection sheet, shared by the Home ChildSwitcher pill and the
// My Child profile header. Backed entirely by ChildProvider state.
export default function ChildSwitcherSheet({ open, onClose }: {
  open: boolean
  onClose: () => void
}) {
  const { children, selectedChildId, setSelectedChildId } = useChild()
  const pathname = usePathname()

  const pick = (childId: string) => {
    if (childId !== selectedChildId) {
      const prev = children.find(c => c.id === selectedChildId)
      const next = children.find(c => c.id === childId)
      trackEvent('child_switched', {
        source_screen: screenFromPath(pathname),
        previous_age_plane: prev ? getAgePlane(prev.date_of_birth) : undefined,
        new_age_plane: next ? getAgePlane(next.date_of_birth) : undefined,
      })
    }
    setSelectedChildId(childId)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Who are we focusing on?">
      <div className="py-2 space-y-1">
        {children.map(child => {
          const selected = child.id === selectedChildId
          return (
            <button
              key={child.id}
              onClick={() => pick(child.id)}
              className={`tap-scale w-full flex items-center gap-3 p-3 min-h-[56px] rounded-2xl text-left ${
                selected ? 'bg-[color:var(--mfa-purple-soft)]' : 'hover:bg-[color:var(--mfa-surface-warm)]'
              }`}
            >
              <Avatar name={child.name} src={child.profile_photo_url} size={40} />
              <span className="flex-1 min-w-0">
                <span className="block text-[15px] font-semibold text-[color:var(--mfa-ink)]">{child.name}</span>
                <span className="block text-[13px] text-[color:var(--mfa-ink-secondary)]">{formatAge(child.date_of_birth)}</span>
              </span>
              {selected && <Check size={20} className="text-[color:var(--mfa-purple)]" aria-hidden="true" />}
            </button>
          )
        })}
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className="tap-scale w-full flex items-center gap-3 p-3 min-h-[56px] rounded-2xl text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]"
        >
          <span className="w-10 h-10 rounded-full border border-dashed border-[color:var(--mfa-ink-muted)] inline-flex items-center justify-center">
            <Plus size={18} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-medium">Add a child</span>
        </Link>
      </div>
    </BottomSheet>
  )
}
