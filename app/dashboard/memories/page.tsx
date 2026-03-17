'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { SavedMemory } from '@/lib/supabase'
import PageBanner from '@/components/ui/PageBanner'

export default function MemoriesPage() {
  const [memories, setMemories] = useState<SavedMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [parentId, setParentId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
    if (!parent) return
    setParentId(parent.id)

    const { data } = await supabase
      .from('saved_memories')
      .select('*')
      .eq('parent_id', parent.id)
      .order('created_at', { ascending: false })

    setMemories(data || [])
    setLoading(false)
  }

  const deleteMemory = async (id: string) => {
    await supabase.from('saved_memories').delete().eq('id', id)
    setMemories(prev => prev.filter(m => m.id !== id))
  }

  const updateLabel = async (id: string, label: string) => {
    await supabase.from('saved_memories').update({ label: label || null }).eq('id', id)
    setMemories(prev => prev.map(m => m.id === id ? { ...m, label: label || null } : m))
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-sm">Loading memories...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 sm:pb-0">
      <PageBanner
        image="/images/environment/reading-nook.jpg"
        title="Saved Memories"
        subtitle="Guidance from Abigail, saved for reference"
      />

      {memories.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[22px] sm:rounded-xl p-12 text-center">
          <div className="text-3xl mb-3">💭</div>
          <h3 className="font-medium text-navy-600 mb-1">No saved memories yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            When Abigail gives you advice you want to keep, tap the star icon on the message to save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {memories.map(memory => (
            <div key={memory.id} className="bg-white border border-gray-100 rounded-[22px] sm:rounded-xl p-5 sm:p-4 group">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-amber-500 shrink-0">★</span>
                  <input
                    type="text"
                    value={memory.label || ''}
                    onChange={e => setMemories(prev => prev.map(m => m.id === memory.id ? { ...m, label: e.target.value } : m))}
                    onBlur={e => updateLabel(memory.id, e.target.value)}
                    placeholder="Add a label..."
                    className="text-sm font-medium text-navy-600 bg-transparent border-none outline-none flex-1 min-w-0 placeholder:text-gray-300"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-gray-400">{formatDate(memory.created_at)}</span>
                  <button
                    onClick={() => deleteMemory(memory.id)}
                    className="text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-sm"
                    title="Delete memory"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-6">
                {memory.content.length > 500 ? memory.content.substring(0, 500) + '...' : memory.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
