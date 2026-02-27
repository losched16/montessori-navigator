'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Child } from '@/lib/supabase'
import { formatAge, getAgePlane, getAgePlaneLabel } from '@/lib/utils'

const EXPERIENCE_OPTIONS = [
  { value: 'new', label: 'New to Montessori' },
  { value: 'familiar', label: 'Familiar with basics' },
  { value: 'experienced', label: 'Experienced practitioner' },
  { value: 'trained', label: 'Formally trained / certified' },
]

const CONTEXT_OPTIONS = [
  { value: 'montessori_school', label: 'Child attends Montessori school' },
  { value: 'homeschool', label: 'Homeschooling with Montessori' },
  { value: 'hybrid', label: 'Hybrid (school + home)' },
  { value: 'public_supplementing', label: 'Public/traditional school, supplementing at home' },
  { value: 'exploring', label: 'Still exploring options' },
]

const STYLE_OPTIONS = [
  { value: 'gentle', label: 'Gentle — soft, encouraging, invitational' },
  { value: 'direct', label: 'Direct — clear, actionable, efficient' },
  { value: 'detailed', label: 'Detailed — comprehensive, with reasoning' },
  { value: 'brief', label: 'Brief — concise, just the essentials' },
]

const ENV_OPTIONS = [
  { value: 'montessori_school', label: 'Montessori school' },
  { value: 'homeschool', label: 'Homeschool' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'public_school', label: 'Public school' },
  { value: 'preschool', label: 'Preschool' },
  { value: 'not_yet_enrolled', label: 'Not yet enrolled' },
]

type SettingsTab = 'profile' | 'children' | 'password' | 'data' | 'danger'

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile')
  const [parentId, setParentId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Profile state
  const [displayName, setDisplayName] = useState('')
  const [experience, setExperience] = useState('')
  const [educationContext, setEducationContext] = useState('')
  const [commStyle, setCommStyle] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // Children state
  const [children, setChildren] = useState<Child[]>([])
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [childName, setChildName] = useState('')
  const [childDob, setChildDob] = useState('')
  const [childEnv, setChildEnv] = useState('')
  const [childSchool, setChildSchool] = useState('')
  const [childNotes, setChildNotes] = useState('')
  const [childSaving, setChildSaving] = useState(false)
  const [showAddChild, setShowAddChild] = useState(false)

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  // Data/danger state
  const [exporting, setExporting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: parent } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (parent) {
        setParentId(parent.id)
        setDisplayName(parent.display_name || '')
        setExperience(parent.montessori_experience || '')
        setEducationContext(parent.education_context || '')
        setCommStyle(parent.communication_style || '')

        const { data: kids } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', parent.id)
          .order('created_at')
        setChildren(kids || [])
      }
    }
    load()
  }, [])

  // ── Profile ──

  const saveProfile = async () => {
    if (!parentId) return
    setProfileSaving(true)
    setProfileSaved(false)

    await supabase
      .from('parents')
      .update({
        display_name: displayName.trim(),
        montessori_experience: experience,
        education_context: educationContext,
        communication_style: commStyle,
      })
      .eq('id', parentId)

    setProfileSaving(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  // ── Children ──

  const startEditChild = (child: Child) => {
    setEditingChild(child)
    setChildName(child.name)
    setChildDob(child.date_of_birth || '')
    setChildEnv(child.current_environment || '')
    setChildSchool(child.school_name || '')
    setChildNotes(child.notes || '')
    setShowAddChild(false)
  }

  const startAddChild = () => {
    setEditingChild(null)
    setChildName('')
    setChildDob('')
    setChildEnv('')
    setChildSchool('')
    setChildNotes('')
    setShowAddChild(true)
  }

  const saveChild = async () => {
    if (!parentId || !childName.trim() || !childDob) return
    setChildSaving(true)

    const childData = {
      name: childName.trim(),
      date_of_birth: childDob,
      current_environment: childEnv || null,
      school_name: childSchool.trim() || null,
      notes: childNotes.trim() || null,
    }

    if (editingChild) {
      await supabase
        .from('children')
        .update(childData)
        .eq('id', editingChild.id)
    } else {
      const { data: newChild } = await supabase
        .from('children')
        .insert({ ...childData, parent_id: parentId })
        .select()
        .single()

      // Initialize development levels for new child
      if (newChild) {
        const areas = ['practical_life', 'sensorial', 'language', 'mathematics', 'cultural_studies',
          'social_emotional', 'executive_function', 'gross_motor', 'fine_motor', 'art_music']
        await supabase.from('child_development_levels').insert(
          areas.map(area => ({ child_id: newChild.id, area, level: null }))
        )

        // Initialize milestones
        await fetch('/api/milestones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'initialize', childId: newChild.id }),
        })
      }
    }

    // Reload children
    const { data: kids } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at')
    setChildren(kids || [])

    setEditingChild(null)
    setShowAddChild(false)
    setChildSaving(false)
  }

  const removeChild = async (childId: string, name: string) => {
    if (!confirm(`Remove ${name}? This will delete all their observations, milestones, and development data. This cannot be undone.`)) return

    await supabase.from('observations').delete().eq('child_id', childId)
    await supabase.from('milestones').delete().eq('child_id', childId)
    await supabase.from('child_development_levels').delete().eq('child_id', childId)
    await supabase.from('child_traits').delete().eq('child_id', childId)
    await supabase.from('learning_plans').delete().eq('child_id', childId)
    await supabase.from('children').delete().eq('id', childId)

    setChildren(prev => prev.filter(c => c.id !== childId))
    if (editingChild?.id === childId) {
      setEditingChild(null)
    }
  }

  // ── Password ──

  const changePassword = async () => {
    if (newPassword.length < 8) {
      setPasswordMessage('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match')
      return
    }
    setPasswordSaving(true)
    setPasswordMessage('')

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordMessage(error.message)
    } else {
      setPasswordMessage('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordSaving(false)
  }

  // ── Data Export ──

  const exportData = async () => {
    if (!parentId) return
    setExporting(true)

    try {
      const { data: parent } = await supabase.from('parents').select('*').eq('id', parentId).single()
      const { data: kids } = await supabase.from('children').select('*').eq('parent_id', parentId)
      const childIds = (kids || []).map(k => k.id)

      const { data: observations } = childIds.length > 0
        ? await supabase.from('observations').select('*').in('child_id', childIds)
        : { data: [] }
      const { data: milestones } = childIds.length > 0
        ? await supabase.from('milestones').select('*').in('child_id', childIds).eq('achieved', true)
        : { data: [] }
      const { data: devLevels } = childIds.length > 0
        ? await supabase.from('child_development_levels').select('*').in('child_id', childIds)
        : { data: [] }
      const { data: plans } = childIds.length > 0
        ? await supabase.from('learning_plans').select('*').in('child_id', childIds)
        : { data: [] }
      const { data: notes } = await supabase.from('family_notes').select('*').eq('parent_id', parentId)
      const { data: homeEnv } = await supabase.from('home_environment').select('*').eq('parent_id', parentId)
      const { data: evaluations } = await supabase.from('school_evaluations').select('*').eq('parent_id', parentId)

      const exportObj = {
        exported_at: new Date().toISOString(),
        parent: parent,
        children: kids,
        observations: observations,
        milestones_achieved: milestones,
        development_levels: devLevels,
        learning_plans: plans,
        family_notes: notes,
        home_environment: homeEnv,
        school_evaluations: evaluations,
      }

      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `montessori-navigator-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
  }

  // ── Delete Account ──

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)

    try {
      // Delete all data in order
      if (parentId) {
        const { data: kids } = await supabase.from('children').select('id').eq('parent_id', parentId)
        const childIds = (kids || []).map(k => k.id)

        if (childIds.length > 0) {
          await supabase.from('observations').delete().in('child_id', childIds)
          await supabase.from('milestones').delete().in('child_id', childIds)
          await supabase.from('child_development_levels').delete().in('child_id', childIds)
          await supabase.from('child_traits').delete().in('child_id', childIds)
          await supabase.from('learning_plans').delete().in('child_id', childIds)
        }

        await supabase.from('children').delete().eq('parent_id', parentId)
        await supabase.from('family_notes').delete().eq('parent_id', parentId)
        await supabase.from('home_environment').delete().eq('parent_id', parentId)
        await supabase.from('school_evaluations').delete().eq('parent_id', parentId)
        await supabase.from('parent_preferences').delete().eq('parent_id', parentId)
        await supabase.from('chat_messages').delete().eq('parent_id', parentId)
        await supabase.from('chat_threads').delete().eq('parent_id', parentId)
        await supabase.from('parents').delete().eq('id', parentId)
      }

      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Delete error:', error)
      setDeleting(false)
    }
  }

  const tabs: Array<{ key: SettingsTab; label: string; icon: string }> = [
    { key: 'profile', label: 'Profile', icon: '👤' },
    { key: 'children', label: 'Children', icon: '🌱' },
    { key: 'password', label: 'Password', icon: '🔒' },
    { key: 'data', label: 'Your Data', icon: '📦' },
    { key: 'danger', label: 'Account', icon: '⚠️' },
  ]

  return (
    <div className="max-w-2xl pb-20 sm:pb-0">
      <h1 className="text-xl font-bold text-navy-600 mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition ${
              tab === t.key ? 'bg-navy-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ Profile ═══ */}
      {tab === 'profile' && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-semibold text-navy-600 mb-4">Your Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montessori experience</label>
              <div className="space-y-1.5">
                {EXPERIENCE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${
                      experience === opt.value ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education context</label>
              <select
                value={educationContext}
                onChange={e => setEducationContext(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              >
                <option value="">Select...</option>
                {CONTEXT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">How should the AI guide talk to you?</label>
              <div className="space-y-1.5">
                {STYLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCommStyle(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${
                      commStyle === opt.value ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={profileSaving}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {profileSaving ? 'Saving...' : profileSaved ? '✓ Saved' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Children ═══ */}
      {tab === 'children' && (
        <div>
          {/* Child list */}
          <div className="space-y-2 mb-4">
            {children.map(child => (
              <div key={child.id} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-navy-600">{child.name}</div>
                    <div className="text-xs text-gray-400">
                      {formatAge(child.date_of_birth)} · {getAgePlaneLabel(getAgePlane(child.date_of_birth))}
                      {child.current_environment && ` · ${child.current_environment.replace(/_/g, ' ')}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditChild(child)}
                      className="px-3 py-1 text-xs text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeChild(child.id, child.name)}
                      className="px-3 py-1 text-xs text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!showAddChild && !editingChild && (
            <button
              onClick={startAddChild}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-lg transition"
            >
              + Add Child
            </button>
          )}

          {/* Edit / Add form */}
          {(editingChild || showAddChild) && (
            <div className="bg-white border border-gray-100 rounded-xl p-6 mt-4">
              <h3 className="font-semibold text-navy-600 mb-4">
                {editingChild ? `Edit ${editingChild.name}` : 'Add Child'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
                  <input
                    type="date"
                    value={childDob}
                    onChange={e => setChildDob(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <select
                    value={childEnv}
                    onChange={e => setChildEnv(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select...</option>
                    {ENV_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School name (optional)</label>
                  <input
                    type="text"
                    value={childSchool}
                    onChange={e => setChildSchool(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    placeholder="If attending a school"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                  <textarea
                    value={childNotes}
                    onChange={e => setChildNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    rows={2}
                    placeholder="Anything helpful for the AI to know"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveChild}
                    disabled={childSaving || !childName.trim() || !childDob}
                    className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition disabled:opacity-40"
                  >
                    {childSaving ? 'Saving...' : editingChild ? 'Update' : 'Add Child'}
                  </button>
                  <button
                    onClick={() => { setEditingChild(null); setShowAddChild(false) }}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Password ═══ */}
      {tab === 'password' && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-semibold text-navy-600 mb-4">Change Password</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.includes('success') ? 'text-teal-600' : 'text-red-500'}`}>
                {passwordMessage}
              </p>
            )}
            <button
              onClick={changePassword}
              disabled={passwordSaving || !newPassword || !confirmPassword}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition disabled:opacity-40"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Data ═══ */}
      {tab === 'data' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-semibold text-navy-600 mb-2">Export Your Data</h2>
            <p className="text-sm text-gray-500 mb-4">
              Download all your data as a JSON file — your profile, children, observations, milestones, learning plans, notes, and school evaluations.
            </p>
            <button
              onClick={exportData}
              disabled={exporting}
              className="px-5 py-2.5 bg-navy-600 hover:bg-navy-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {exporting ? 'Preparing export...' : 'Download All Data'}
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-semibold text-navy-600 mb-2">Your Privacy</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your data is stored securely with Supabase (PostgreSQL with row-level security). No other family can see your data. Your conversations with the AI guide are private. If your school uses Navigator, they see engagement metrics only — never your conversations, observations, or family details.
            </p>
          </div>
        </div>
      )}

      {/* ═══ Danger Zone ═══ */}
      {tab === 'danger' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-semibold text-navy-600 mb-2">Sign Out</h2>
            <p className="text-sm text-gray-500 mb-3">Sign out of your account on this device.</p>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
            >
              Sign Out
            </button>
          </div>

          <div className="bg-white border border-red-100 rounded-xl p-6">
            <h2 className="font-semibold text-red-600 mb-2">Delete Account</h2>
            <p className="text-sm text-gray-500 mb-3">
              Permanently delete your account and all associated data. This includes all children, observations, milestones, learning plans, conversations, and notes. This action cannot be undone.
            </p>
            <p className="text-sm text-gray-500 mb-3">
              We recommend exporting your data first.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                className="flex-1 px-3 py-2 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none"
                placeholder='Type "DELETE" to confirm'
              />
              <button
                onClick={deleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleting}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition disabled:opacity-30"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
