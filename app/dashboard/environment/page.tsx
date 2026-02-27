'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { HomeEnvironment } from '@/lib/supabase'

const ROOMS = [
  { value: 'childs_room', label: "Child's Room", icon: '🛏️', suggestions: ['Low shelf', 'Floor bed', 'Child-height mirror', 'Accessible clothing', 'Material rotation shelf', 'Art display area'] },
  { value: 'kitchen', label: 'Kitchen', icon: '🍽️', suggestions: ['Step stool', 'Child-size pitcher', 'Snack station', 'Pouring set', 'Child-safe knife', 'Apron hooks', 'Low cupboard access'] },
  { value: 'bathroom', label: 'Bathroom', icon: '🪥', suggestions: ['Step stool', 'Low towel hooks', 'Child-height mirror', 'Accessible soap', 'Toothbrush station', 'Hamper access'] },
  { value: 'living_learning', label: 'Living/Learning Space', icon: '📚', suggestions: ['Work mat area', 'Low bookshelf', 'Art station', 'Nature table', 'Reading nook', 'Puzzle shelf', 'Music corner'] },
  { value: 'outdoor', label: 'Outdoor Space', icon: '🌿', suggestions: ['Garden plot', 'Water play area', 'Sand/dirt area', 'Bug observation tools', 'Watering can', 'Child garden tools', 'Bird feeder'] },
]

export default function EnvironmentPage() {
  const [environments, setEnvironments] = useState<HomeEnvironment[]>([])
  const [parentId, setParentId] = useState<string | null>(null)
  const [editingRoom, setEditingRoom] = useState<string | null>(null)
  const [materials, setMaterials] = useState<string[]>([])
  const [newMaterial, setNewMaterial] = useState('')
  const [roomNotes, setRoomNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
      if (!parent) return
      setParentId(parent.id)

      const { data } = await supabase.from('home_environment').select('*').eq('parent_id', parent.id)
      setEnvironments(data || [])
    }
    load()
  }, [])

  const startEditing = (roomValue: string) => {
    const existing = environments.find(e => e.room === roomValue)
    setEditingRoom(roomValue)
    setMaterials(existing?.materials_on_hand || [])
    setRoomNotes(existing?.notes || '')
  }

  const addMaterial = (material: string) => {
    const trimmed = material.trim()
    if (trimmed && !materials.includes(trimmed)) {
      setMaterials([...materials, trimmed])
    }
    setNewMaterial('')
  }

  const removeMaterial = (material: string) => {
    setMaterials(materials.filter(m => m !== material))
  }

  const saveRoom = async () => {
    if (!parentId || !editingRoom) return
    setSaving(true)

    await supabase.from('home_environment').upsert({
      parent_id: parentId,
      room: editingRoom,
      materials_on_hand: materials,
      notes: roomNotes.trim() || null,
    })

    const { data } = await supabase.from('home_environment').select('*').eq('parent_id', parentId)
    setEnvironments(data || [])
    setEditingRoom(null)
    setSaving(false)
  }

  return (
    <div className="max-w-3xl pb-20 sm:pb-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy-600">Home Environment</h1>
        <p className="text-sm text-gray-500 mt-1">Track your prepared environment setup and materials</p>
      </div>

      <div className="space-y-3">
        {ROOMS.map(room => {
          const env = environments.find(e => e.room === room.value)
          const materialCount = env?.materials_on_hand?.length || 0
          const isEditing = editingRoom === room.value

          return (
            <div key={room.value} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => isEditing ? setEditingRoom(null) : startEditing(room.value)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{room.icon}</span>
                  <div>
                    <div className="font-medium text-navy-600">{room.label}</div>
                    <div className="text-xs text-gray-400">
                      {materialCount > 0
                        ? `${materialCount} materials tracked`
                        : 'Not set up yet'
                      }
                    </div>
                  </div>
                </div>
                <span className="text-gray-300 text-lg">{isEditing ? '▾' : '▸'}</span>
              </button>

              {isEditing && (
                <div className="border-t border-gray-100 p-4">
                  {/* Materials */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Materials on hand</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {materials.map(m => (
                        <span key={m} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
                          {m}
                          <button onClick={() => removeMaterial(m)} className="text-teal-400 hover:text-teal-600">✕</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMaterial}
                        onChange={e => setNewMaterial(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(newMaterial) } }}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        placeholder="Add a material..."
                      />
                      <button
                        onClick={() => addMaterial(newMaterial)}
                        disabled={!newMaterial.trim()}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1.5">Quick add suggestions:</label>
                    <div className="flex flex-wrap gap-1">
                      {room.suggestions.filter(s => !materials.includes(s)).map(s => (
                        <button
                          key={s}
                          onClick={() => addMaterial(s)}
                          className="px-2 py-0.5 text-xs border border-gray-200 rounded-full text-gray-500 hover:border-teal-300 hover:text-teal-600 transition"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={roomNotes}
                      onChange={e => setRoomNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      rows={2}
                      placeholder="Any notes about this space..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingRoom(null)} className="px-3 py-1.5 text-sm text-gray-500">
                      Cancel
                    </button>
                    <button
                      onClick={saveRoom}
                      disabled={saving}
                      className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg transition disabled:opacity-40"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
