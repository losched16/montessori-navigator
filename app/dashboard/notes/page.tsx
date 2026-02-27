'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Child, FamilyNote } from '@/lib/supabase'

export default function NotesPage() {
  const [notes, setNotes] = useState<(FamilyNote & { child_name?: string })[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [parentId, setParentId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteChildId, setNoteChildId] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
      if (!parent) return
      setParentId(parent.id)

      const { data: kids } = await supabase.from('children').select('*').eq('parent_id', parent.id).order('created_at')
      setChildren(kids || [])

      await loadNotes(parent.id, kids || [])
    }
    load()
  }, [])

  const loadNotes = async (pid: string, kids: Child[]) => {
    const { data } = await supabase
      .from('family_notes')
      .select('*')
      .eq('parent_id', pid)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })

    const enriched = (data || []).map(n => ({
      ...n,
      child_name: n.child_id ? kids.find(k => k.id === n.child_id)?.name : undefined
    }))
    setNotes(enriched)
  }

  const saveNote = async () => {
    if (!parentId || !noteContent.trim()) return
    setSaving(true)

    await supabase.from('family_notes').insert({
      parent_id: parentId,
      child_id: noteChildId || null,
      title: noteTitle.trim() || null,
      note: noteContent.trim(),
    })

    await loadNotes(parentId, children)
    setShowForm(false)
    setNoteTitle('')
    setNoteContent('')
    setNoteChildId('')
    setSaving(false)
  }

  const togglePin = async (noteId: string, currentPinned: boolean) => {
    await supabase.from('family_notes').update({ pinned: !currentPinned }).eq('id', noteId)
    if (parentId) await loadNotes(parentId, children)
  }

  const deleteNote = async (noteId: string) => {
    await supabase.from('family_notes').delete().eq('id', noteId)
    if (parentId) await loadNotes(parentId, children)
  }

  return (
    <div className="max-w-3xl pb-20 sm:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-navy-600">Notes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition"
        >
          + Add Note
        </button>
      </div>

      {/* Note form */}
      {showForm && (
        <div className="bg-white border border-teal-200 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title (optional)</label>
              <input
                type="text"
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                placeholder="Note title"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Related child (optional)</label>
              <select
                value={noteChildId}
                onChange={e => setNoteChildId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              >
                <option value="">Family-level note</option>
                {children.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <textarea
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              rows={4}
              placeholder="Write your note..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
            <button
              onClick={saveNote}
              disabled={!noteContent.trim() || saving}
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg transition disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-2">
        {notes.map(note => (
          <div key={note.id} className={`bg-white border rounded-xl p-4 ${note.pinned ? 'border-warm-300' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {note.pinned && <span className="text-xs text-warm-500">📌 Pinned</span>}
                  {note.title && <span className="font-medium text-sm text-navy-600">{note.title}</span>}
                  {note.child_name && (
                    <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{note.child_name}</span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{note.note}</p>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePin(note.id, note.pinned)}
                  className="text-xs text-gray-400 hover:text-warm-500 p-1"
                  title={note.pinned ? 'Unpin' : 'Pin'}
                >
                  📌
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-xs text-gray-400 hover:text-red-500 p-1"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
        {notes.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No notes yet. Add one to keep track of ideas, reminders, or goals.
          </div>
        )}
      </div>
    </div>
  )
}
