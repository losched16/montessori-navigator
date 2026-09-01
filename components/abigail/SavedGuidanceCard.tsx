'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, MessageCircle, ChevronRight } from 'lucide-react'
import type { SavedMemory } from '@/lib/supabase'

// One piece of saved Abigail guidance. Label editing is inline (display by
// default, field on demand); deletion is a visible two-step action so mobile
// users can both discover and not fat-finger it.
export default function SavedGuidanceCard({ memory, threadId, onSaveLabel, onDelete }: {
  memory: SavedMemory
  threadId?: string
  onSaveLabel: (id: string, label: string) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(memory.label || '')
  const [confirming, setConfirming] = useState(false)

  const saveLabel = () => {
    onSaveLabel(memory.id, editValue.trim())
    setEditing(false)
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <article className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        {editing ? (
          <input
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={saveLabel}
            onKeyDown={e => { if (e.key === 'Enter') saveLabel() }}
            autoFocus
            placeholder="Add a label..."
            aria-label="Guidance label"
            className="flex-1 px-3 py-1.5 border border-[color:var(--mfa-border)] rounded-xl text-[16px] font-semibold text-[color:var(--mfa-ink)] focus:ring-2 focus:ring-[color:var(--mfa-purple)] focus:border-transparent outline-none"
          />
        ) : (
          <h3 className="font-[family-name:var(--mfa-serif)] text-[19px] font-semibold text-[color:var(--mfa-ink)] leading-snug">
            {memory.label || 'Saved from Abigail'}
          </h3>
        )}
        <span className="text-[12px] text-[color:var(--mfa-ink-muted)] whitespace-nowrap mt-1 shrink-0">
          {formatDate(memory.created_at)}
        </span>
      </div>

      <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] line-clamp-4 mb-3">
        {memory.content}
      </p>

      {confirming ? (
        <div className="flex items-center gap-2.5">
          <span className="text-[14px] text-[color:var(--mfa-ink)]">Delete this guidance?</span>
          <button
            onClick={() => { onDelete(memory.id); setConfirming(false) }}
            className="tap-scale min-h-[44px] px-4 rounded-full bg-[color:var(--mfa-clay)] text-white text-[13.5px] font-semibold"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="tap-scale min-h-[44px] px-3 text-[13.5px] font-medium text-[color:var(--mfa-ink-secondary)]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          {threadId && (
            <Link
              href={`/dashboard/chat?thread=${threadId}`}
              className="tap-scale inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-full text-[13.5px] font-semibold text-[color:var(--mfa-purple)] hover:bg-[color:var(--mfa-purple-soft)] transition"
            >
              <MessageCircle size={15} aria-hidden="true" />
              Open Conversation
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          )}
          <button
            onClick={() => { setEditValue(memory.label || ''); setEditing(true) }}
            className="tap-scale inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-full text-[13.5px] font-medium text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)] transition"
          >
            <Pencil size={14} aria-hidden="true" />
            {memory.label ? 'Edit label' : 'Add label'}
          </button>
          <button
            onClick={() => setConfirming(true)}
            className="tap-scale inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-full text-[13.5px] font-medium text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-clay-soft)] hover:text-[color:var(--mfa-clay)] transition"
          >
            <Trash2 size={14} aria-hidden="true" />
            Delete
          </button>
        </div>
      )}
    </article>
  )
}
