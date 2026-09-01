'use client'

import { useState } from 'react'
import { ChevronDown, Clock3, SquarePen, Check } from 'lucide-react'
import type { Child } from '@/lib/supabase'
import { useChild } from '@/lib/child-context'
import { formatAge } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'
import AbigailMark from './AbigailMark'
import { trackEvent } from '@/lib/analytics'
import { getAgePlane } from '@/lib/utils'

// Abigail context header: mark + name + quiet child context, with history and
// new-conversation controls. Child switching mid-thread asks first — context
// should never change silently under an ongoing conversation.
export default function AbigailHeader({ hasMessages, onHistory, onNewConversation }: {
  hasMessages: boolean
  onHistory: () => void
  onNewConversation: () => void
}) {
  const { children, selectedChild, setSelectedChildId } = useChild()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pendingChild, setPendingChild] = useState<Child | null>(null)

  const multi = children.length > 1

  const trackSwitch = (next: Child) => trackEvent('child_switched', {
    source_screen: 'abigail',
    previous_age_plane: selectedChild ? getAgePlane(selectedChild.date_of_birth) : undefined,
    new_age_plane: getAgePlane(next.date_of_birth),
  })

  const pickChild = (child: Child) => {
    if (child.id === selectedChild?.id) { setSheetOpen(false); return }
    if (hasMessages) {
      setPendingChild(child)
    } else {
      trackSwitch(child)
      setSelectedChildId(child.id)
      setSheetOpen(false)
    }
  }

  const confirmSwitch = () => {
    if (pendingChild) { trackSwitch(pendingChild); setSelectedChildId(pendingChild.id) }
    setPendingChild(null)
    setSheetOpen(false)
  }

  const switchAndStartNew = () => {
    if (pendingChild) { trackSwitch(pendingChild); setSelectedChildId(pendingChild.id) }
    setPendingChild(null)
    setSheetOpen(false)
    onNewConversation()
  }

  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 h-16 border-b border-[color:var(--mfa-border)] bg-white/90 backdrop-blur shrink-0">
      <AbigailMark size={36} />
      <div className="min-w-0 flex-1">
        <div className="text-[16px] font-semibold text-[color:var(--mfa-ink)] leading-tight">Abigail</div>
        {selectedChild ? (
          <button
            onClick={() => multi && setSheetOpen(true)}
            aria-label={multi ? `Talking about ${selectedChild.name}. Change child` : `Talking about ${selectedChild.name}`}
            aria-haspopup={multi ? 'dialog' : undefined}
            className={`inline-flex items-center gap-1 text-[12.5px] text-[color:var(--mfa-ink-secondary)] leading-tight max-w-full ${multi ? 'tap-scale' : 'cursor-default'}`}
          >
            <span className="truncate">Talking about {selectedChild.name} · {formatAge(selectedChild.date_of_birth)}</span>
            {multi && <ChevronDown size={13} className="shrink-0 text-[color:var(--mfa-ink-muted)]" aria-hidden="true" />}
          </button>
        ) : (
          <div className="text-[12.5px] text-[color:var(--mfa-ink-secondary)] leading-tight">Your Montessori guide</div>
        )}
      </div>

      {/* Mobile: history sheet trigger. Desktop has the rail instead. */}
      <button
        onClick={onHistory}
        aria-label="Conversation history"
        className="tap-scale sm:hidden w-11 h-11 inline-flex items-center justify-center rounded-full text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]"
      >
        <Clock3 size={21} aria-hidden="true" />
      </button>
      <button
        onClick={onNewConversation}
        aria-label="New conversation"
        className="tap-scale sm:hidden w-11 h-11 -ml-1 inline-flex items-center justify-center rounded-full text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]"
      >
        <SquarePen size={20} aria-hidden="true" />
      </button>

      {/* Child picker with mid-thread confirmation */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setPendingChild(null) }}
        title={pendingChild ? `Switch to ${pendingChild.name.split(' ')[0]}?` : 'Who are we talking about?'}
      >
        {pendingChild ? (
          <div className="pb-4 space-y-3">
            <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)]">
              Abigail will use {pendingChild.name.split(' ')[0]}&apos;s context for new messages in this conversation.
            </p>
            <Button size="md" className="w-full" onClick={switchAndStartNew}>
              Start New Conversation Instead
            </Button>
            <Button size="md" variant="secondary" className="w-full" onClick={confirmSwitch}>
              Switch Child in This Conversation
            </Button>
          </div>
        ) : (
          <div className="py-2 space-y-1 pb-4">
            {children.map(child => {
              const selected = child.id === selectedChild?.id
              return (
                <button
                  key={child.id}
                  onClick={() => pickChild(child)}
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
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
