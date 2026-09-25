'use client'

import { useEffect, useState, FormEvent } from 'react'
import {
  KIND_LABEL, formatEventWhen,
  type Announcement, type AnnouncementKind, type AnnouncementAudience,
} from '@/lib/announcements'

// News & Events — super-admin tool to push news, updates, messages and events
// to families (Home + notification bell) and/or schools (school dashboard),
// with an optional email to active members.

const inputClass =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none'

const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
  parent: 'Families',
  school: 'Schools',
  both: 'Families + Schools',
}

const KIND_HELP: Record<AnnouncementKind, string> = {
  news: 'Foundation news and stories.',
  update: 'Product or program updates.',
  message: 'A direct note to members — great with "Pin to Home".',
  event: 'Webinars, workshops, gatherings. Shows under Upcoming Events until it ends.',
}

// <input type="datetime-local"> works in local time without a zone.
function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function fromLocalInput(v: string): string | null {
  return v ? new Date(v).toISOString() : null
}

interface FormState {
  kind: AnnouncementKind
  audience: AnnouncementAudience
  title: string
  body: string
  linkUrl: string
  linkLabel: string
  startsAt: string
  endsAt: string
  location: string
  isPinned: boolean
  expiresAt: string
}

const EMPTY: FormState = {
  kind: 'news', audience: 'parent', title: '', body: '', linkUrl: '', linkLabel: '',
  startsAt: '', endsAt: '', location: '', isPinned: false, expiresAt: '',
}

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sendEmail, setSendEmail] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }))

  const load = async () => {
    try {
      const res = await fetch('/api/admin/announcements')
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Could not load announcements')
      else setItems(data.announcements || [])
    } catch (err: any) {
      setError(err.message || 'Could not load announcements')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const payload = () => ({
    ...form,
    startsAt: fromLocalInput(form.startsAt),
    endsAt: fromLocalInput(form.endsAt),
    expiresAt: fromLocalInput(form.expiresAt),
  })

  const emailSummary = (email?: { sent: number; errors: string[] }) => {
    if (!email) return ''
    if (email.sent > 0) return ` Emailed ${email.sent} member${email.sent === 1 ? '' : 's'}.`
    return ` Email not sent: ${email.errors.join('; ') || 'unknown error'}.`
  }

  const confirmEmail = (audience: AnnouncementAudience) =>
    confirm(`Email this to all active ${AUDIENCE_LABEL[audience].toLowerCase()}? This can only be sent once.`)

  const submit = async (publish: boolean) => {
    setError('')
    setSuccess('')
    const emailing = publish && sendEmail && !editingId
    if (emailing && !confirmEmail(form.audience)) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId
          ? { id: editingId, ...payload() }
          : { ...payload(), isPublished: publish, sendEmail: emailing }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not save.')
        return
      }
      const a: Announcement = data.announcement
      setItems(prev => editingId ? prev.map(x => (x.id === a.id ? a : x)) : [a, ...prev])
      setSuccess(
        (editingId ? 'Saved.' : publish ? `Published "${a.title}".` : `Saved "${a.title}" as a draft.`)
        + emailSummary(data.email),
      )
      setForm(EMPTY)
      setEditingId(null)
      setSendEmail(false)
    } catch (err: any) {
      setError(err.message || 'Could not save.')
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmit = (e: FormEvent) => { e.preventDefault(); submit(true) }

  const patch = async (a: Announcement, body: Record<string, any>) => {
    setBusyId(a.id)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id, ...body }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Could not update.'); return }
      setItems(prev => prev.map(x => (x.id === a.id ? data.announcement : x)))
      if (data.email) setSuccess(`"${a.title}":${emailSummary(data.email)}`)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (a: Announcement) => {
    if (!confirm(`Delete "${a.title}"? This can't be undone.`)) return
    setBusyId(a.id)
    try {
      const res = await fetch(`/api/admin/announcements?id=${a.id}`, { method: 'DELETE' })
      if (res.ok) setItems(prev => prev.filter(x => x.id !== a.id))
      else setError((await res.json()).error || 'Could not delete.')
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (a: Announcement) => {
    setEditingId(a.id)
    setSendEmail(false)
    setError('')
    setSuccess('')
    setForm({
      kind: a.kind, audience: a.audience, title: a.title, body: a.body,
      linkUrl: a.linkUrl || '', linkLabel: a.linkLabel || '',
      startsAt: toLocalInput(a.startsAt), endsAt: toLocalInput(a.endsAt),
      location: a.location || '', isPinned: a.isPinned, expiresAt: toLocalInput(a.expiresAt),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isEvent = form.kind === 'event'

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold text-navy-700 mb-2">News &amp; Events</h1>
      <p className="text-sm text-navy-600/70 mb-6">
        Push news, updates, messages and events. Families see them on their Home screen and under the
        notification bell; schools see them on their school dashboard. Optionally email them to active members.
      </p>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-4 mb-6">✅ {success}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-5 bg-white border border-gray-100 rounded-2xl p-6 mb-8">
        {editingId && (
          <div className="flex items-center justify-between bg-warm-50 text-warm-700 text-sm rounded-lg px-3 py-2">
            <span>Editing an existing item</span>
            <button type="button" className="text-xs underline" onClick={() => { setEditingId(null); setForm(EMPTY) }}>
              Cancel edit
            </button>
          </div>
        )}
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Type</label>
            <select value={form.kind} onChange={e => set('kind', e.target.value as AnnouncementKind)} className={inputClass}>
              {(Object.keys(KIND_LABEL) as AnnouncementKind[]).map(k => (
                <option key={k} value={k}>{KIND_LABEL[k]}</option>
              ))}
            </select>
            <p className="text-xs text-navy-600/60 mt-1">{KIND_HELP[form.kind]}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Send to</label>
            <select value={form.audience} onChange={e => set('audience', e.target.value as AnnouncementAudience)} className={inputClass}>
              <option value="parent">Families</option>
              <option value="school">Schools</option>
              <option value="both">Families + Schools</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            type="text" value={form.title} onChange={e => set('title', e.target.value)} required maxLength={200}
            placeholder={isEvent ? 'Live Q&A: Montessori at Home for Toddlers' : 'New: Practical Life workbook is here'}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Message</label>
          <textarea
            value={form.body} onChange={e => set('body', e.target.value)} rows={5}
            placeholder="Write the details. Leave a blank line between paragraphs."
            className={inputClass}
          />
        </div>

        {isEvent && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Starts <span className="text-red-500">*</span></label>
              <input type="datetime-local" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Ends</label>
              <input type="datetime-local" value={form.endsAt} onChange={e => set('endsAt', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Zoom / Sarasota, FL" className={inputClass} />
            </div>
            <p className="sm:col-span-3 text-xs text-navy-600/60 -mt-2">Times are in your local time zone and shown to members in theirs.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Link (optional)</label>
            <input
              type="text" value={form.linkUrl} onChange={e => set('linkUrl', e.target.value)}
              placeholder={isEvent ? 'https://… (registration page)' : 'https://… or /dashboard/resources/…'}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Button text</label>
            <input
              type="text" value={form.linkLabel} onChange={e => set('linkLabel', e.target.value)} maxLength={40}
              placeholder={isEvent ? 'Register' : 'Learn more'}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Hide after (optional)</label>
            <input type="datetime-local" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm text-navy-700 pb-2">
            <input
              type="checkbox" checked={form.isPinned} onChange={e => set('isPinned', e.target.checked)}
              className="rounded border-gray-300 text-warm-500 focus:ring-warm-500"
            />
            Pin to Home as a banner (until each person dismisses it)
          </label>
        </div>

        {!editingId && (
          <label className="flex items-start gap-2 text-sm text-navy-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
            <input
              type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-warm-500 focus:ring-warm-500"
            />
            <span>
              Also email this to all active {AUDIENCE_LABEL[form.audience].toLowerCase()} when published
              <span className="block text-xs text-navy-600/60">
                Families: active or trialing subscribers and families of active schools. Schools: each active school&apos;s billing contact.
              </span>
            </span>
          </label>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit" disabled={submitting}
            className="px-5 py-2.5 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition disabled:opacity-50 text-sm"
          >
            {submitting ? 'Saving…' : editingId ? 'Save changes' : sendEmail ? 'Publish & email' : 'Publish now'}
          </button>
          {!editingId && (
            <button
              type="button" disabled={submitting} onClick={() => submit(false)}
              className="px-5 py-2.5 border border-gray-200 text-navy-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50 text-sm"
            >
              Save as draft
            </button>
          )}
        </div>
      </form>

      <h2 className="text-sm font-bold uppercase tracking-wide text-navy-600 mb-3">All items</h2>
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-sm text-navy-600/60">Loading…</div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-sm text-navy-600/60">Nothing yet — create your first above.</div>
        ) : items.map(a => (
          <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs">
              <span className="font-bold uppercase tracking-wide text-warm-600">{KIND_LABEL[a.kind]}</span>
              <span className="text-navy-600/50">· {AUDIENCE_LABEL[a.audience]}</span>
              {a.isPublished
                ? <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Published</span>
                : <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Draft</span>}
              {a.isPinned && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Pinned</span>}
              {a.emailedAt && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Emailed {a.emailedCount ?? ''} · {new Date(a.emailedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="font-semibold text-navy-700">{a.title}</div>
            {a.kind === 'event' && (
              <div className="text-sm text-navy-600 mt-0.5">{formatEventWhen(a)}{a.location ? ` · ${a.location}` : ''}</div>
            )}
            {a.body && <p className="text-sm text-navy-600/80 mt-1 line-clamp-2 whitespace-pre-line">{a.body}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-xs font-medium">
              <button onClick={() => startEdit(a)} className="text-navy-600 hover:text-navy-700">Edit</button>
              <button
                disabled={busyId === a.id}
                onClick={() => patch(a, { isPublished: !a.isPublished })}
                className="text-warm-600 hover:text-warm-700 disabled:opacity-40"
              >
                {a.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button
                disabled={busyId === a.id}
                onClick={() => patch(a, { isPinned: !a.isPinned })}
                className="text-warm-600 hover:text-warm-700 disabled:opacity-40"
              >
                {a.isPinned ? 'Unpin' : 'Pin to Home'}
              </button>
              {a.isPublished && !a.emailedAt && (
                <button
                  disabled={busyId === a.id}
                  onClick={() => { if (confirmEmail(a.audience)) patch(a, { sendEmail: true }) }}
                  className="text-warm-600 hover:text-warm-700 disabled:opacity-40"
                >
                  {busyId === a.id ? 'Sending…' : 'Send email'}
                </button>
              )}
              <button
                disabled={busyId === a.id}
                onClick={() => remove(a)}
                className="text-red-500 hover:text-red-600 disabled:opacity-40 ml-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
