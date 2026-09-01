'use client'

import { Plus } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'
import { relativeDay } from '@/lib/child-story'

export interface ThreadSummary {
  id: string
  title: string | null
  created_at: string
}

// Mobile conversation history — a sheet, not a pseudo-sidebar.
export default function ConversationHistorySheet({ open, onClose, threads, activeThreadId, onSelect, onNew }: {
  open: boolean
  onClose: () => void
  threads: ThreadSummary[]
  activeThreadId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Conversations">
      <div className="pb-4">
        <Button size="md" className="w-full mb-3" onClick={() => { onNew(); onClose() }}>
          <Plus size={18} aria-hidden="true" />
          New Conversation
        </Button>
        <div className="space-y-1">
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => { onSelect(thread.id); onClose() }}
              aria-current={thread.id === activeThreadId ? 'true' : undefined}
              className={`tap-scale w-full text-left px-3.5 py-3 min-h-[56px] rounded-2xl transition ${
                thread.id === activeThreadId
                  ? 'bg-[color:var(--mfa-purple-soft)]'
                  : 'hover:bg-[color:var(--mfa-surface-warm)]'
              }`}
            >
              <span className="block text-[15px] font-medium text-[color:var(--mfa-ink)] truncate">
                {thread.title || 'Untitled conversation'}
              </span>
              <span className="block text-[12.5px] text-[color:var(--mfa-ink-muted)] mt-0.5">
                {relativeDay(thread.created_at)}
              </span>
            </button>
          ))}
          {threads.length === 0 && (
            <p className="text-[14px] text-[color:var(--mfa-ink-muted)] px-3 py-4 text-center">
              No conversations yet.
            </p>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}
