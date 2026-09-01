'use client'

import { Plus } from 'lucide-react'
import type { ThreadSummary } from './ConversationHistorySheet'
import { relativeDay } from '@/lib/child-story'

// Desktop conversation rail, restyled onto MFA tokens.
export default function ConversationRail({ threads, activeThreadId, onSelect, onNew }: {
  threads: ThreadSummary[]
  activeThreadId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}) {
  return (
    <nav aria-label="Conversations" className="hidden sm:flex flex-col w-[250px] shrink-0 border-r border-[color:var(--mfa-border)] bg-[color:var(--mfa-canvas)]">
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h2 className="text-[13px] font-bold tracking-[0.1em] uppercase text-[color:var(--mfa-ink-muted)]">
          Conversations
        </h2>
        <button
          onClick={onNew}
          aria-label="New conversation"
          className="tap-scale inline-flex items-center gap-1 min-h-[36px] px-2.5 rounded-lg border border-[color:var(--mfa-border)] bg-white text-[13px] font-semibold text-[color:var(--mfa-purple)] hover:bg-[color:var(--mfa-purple-soft)] transition"
        >
          <Plus size={14} aria-hidden="true" />
          New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-0.5">
        {threads.map(thread => (
          <button
            key={thread.id}
            onClick={() => onSelect(thread.id)}
            aria-current={thread.id === activeThreadId ? 'true' : undefined}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition ${
              thread.id === activeThreadId
                ? 'bg-[color:var(--mfa-purple-soft)]'
                : 'hover:bg-[color:var(--mfa-surface-warm)]'
            }`}
          >
            <span className={`block text-[13.5px] truncate ${
              thread.id === activeThreadId
                ? 'font-semibold text-[color:var(--mfa-purple)]'
                : 'font-medium text-[color:var(--mfa-ink)]'
            }`}>
              {thread.title || 'Untitled conversation'}
            </span>
            <span className="block text-[11.5px] text-[color:var(--mfa-ink-muted)] mt-0.5">
              {relativeDay(thread.created_at)}
            </span>
          </button>
        ))}
        {threads.length === 0 && (
          <p className="text-[13px] text-[color:var(--mfa-ink-muted)] px-3 py-3">No conversations yet</p>
        )}
      </div>
    </nav>
  )
}
