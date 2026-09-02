'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useChild } from '@/lib/child-context'
import { formatAge } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import ChildSwitcherSheet from '@/components/app/ChildSwitcherSheet'
import Skeleton from '@/components/ui/Skeleton'

// Custom child selector backed by the existing ChildProvider state.
// Renders nothing when the family has no children yet (Home shows its own
// "add a child" hero in that case).
export default function ChildSwitcher() {
  const { children, setSelectedChildId, selectedChild, loading } = useChild()
  const [open, setOpen] = useState(false)

  if (loading) return <Skeleton className="h-[52px] w-56 rounded-2xl" />
  if (children.length === 0 || !selectedChild) return null

  const single = children.length === 1

  return (
    <>
      <button
        onClick={() => !single && setOpen(true)}
        aria-label={`Selected child: ${selectedChild.name}, ${formatAge(selectedChild.date_of_birth)}${single ? '' : '. Change child'}`}
        aria-haspopup={single ? undefined : 'dialog'}
        className={`tap-scale inline-flex items-center gap-3 h-[54px] pl-2 pr-4 rounded-2xl bg-[color:var(--mfa-purple-soft)] border-2 border-[rgba(74,44,130,0.25)] shadow-sm ${
          single ? 'cursor-default' : 'hover:border-[color:var(--mfa-purple)]'
        }`}
      >
        <Avatar name={selectedChild.name} src={selectedChild.profile_photo_url} size={36} />
        <span className="text-[16px] font-semibold text-[color:var(--mfa-ink)]">
          {selectedChild.name}
          <span className="font-normal text-[color:var(--mfa-ink-secondary)]"> · {formatAge(selectedChild.date_of_birth)}</span>
        </span>
        {!single && <ChevronDown size={19} className="text-[color:var(--mfa-purple)]" aria-hidden="true" />}
      </button>

      <ChildSwitcherSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
