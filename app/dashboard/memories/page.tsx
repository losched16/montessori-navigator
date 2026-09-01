'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { SavedMemory } from '@/lib/supabase'
import SavedGuidanceCard from '@/components/abigail/SavedGuidanceCard'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'

// Saved Guidance — advice from Abigail the parent chose to keep.
// Backed by the existing saved_memories table (route and schema unchanged).

export default function SavedGuidancePage() {
  const [memories, setMemories] = useState<SavedMemory[]>([])
  const [threadByMessage, setThreadByMessage] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
    if (!parent) return

    const { data } = await supabase
      .from('saved_memories')
      .select('*')
      .eq('parent_id', parent.id)
      .order('created_at', { ascending: false })

    const rows = data || []
    setMemories(rows)
    setLoading(false)

    // Resolve message_id → thread_id so "Open Conversation" can deep-link.
    // RLS limits this to the parent's own messages; the chat page re-verifies
    // thread ownership before loading.
    const messageIds = rows.map(m => m.message_id).filter(Boolean) as string[]
    if (messageIds.length > 0) {
      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('id, thread_id')
        .in('id', messageIds)
      const map: Record<string, string> = {}
      ;(msgs || []).forEach((m: any) => { map[m.id] = m.thread_id })
      setThreadByMessage(map)
    }
  }

  const handleSaveLabel = async (id: string, label: string) => {
    await supabase.from('saved_memories').update({ label: label || null }).eq('id', id)
    setMemories(prev => prev.map(m => m.id === id ? { ...m, label: label || null } : m))
  }

  const handleDelete = async (id: string) => {
    await supabase.from('saved_memories').delete().eq('id', id)
    setMemories(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 sm:pb-10">
      <div className="pt-2 mb-6">
        <h1 className="font-[family-name:var(--mfa-serif)] text-[32px] sm:text-[38px] leading-[1.05] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-1.5">
          Saved Guidance
        </h1>
        <p className="text-[15px] text-[color:var(--mfa-ink-secondary)]">
          Advice from Abigail you&apos;ve chosen to keep.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-[140px] rounded-[20px]" />
          <Skeleton className="h-[140px] rounded-[20px]" />
        </div>
      ) : memories.length === 0 ? (
        <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-8 text-center">
          <span className="w-11 h-11 rounded-full bg-[color:var(--mfa-purple-soft)] text-[color:var(--mfa-purple)] inline-flex items-center justify-center mb-3" aria-hidden="true">
            <Bookmark size={20} />
          </span>
          <h3 className="font-[family-name:var(--mfa-serif)] text-[21px] font-semibold text-[color:var(--mfa-ink)] mb-2">
            No saved guidance yet
          </h3>
          <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-sm mx-auto mb-5">
            When Abigail gives you advice worth returning to, tap Save Guidance under the response and it will live here.
          </p>
          <Button size="md" variant="soft" href="/dashboard/chat">Ask Abigail</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {memories.map(memory => (
            <SavedGuidanceCard
              key={memory.id}
              memory={memory}
              threadId={memory.message_id ? threadByMessage[memory.message_id] : undefined}
              onSaveLabel={handleSaveLabel}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
