'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  CONTENT_INTAKE_BUCKET, FILE_ACCEPT, MAX_UPLOAD_BYTES, formatBytes, isAllowedFile, isHttpUrl,
  type SubmissionType,
} from '@/lib/content-studio/shared'

const TYPES: { value: SubmissionType; icon: string; label: string }[] = [
  { value: 'article', icon: '✍️', label: 'Article' },
  { value: 'video', icon: '🎥', label: 'Video' },
  { value: 'idea', icon: '💡', label: 'Idea' },
]

const inputCls = 'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-navy-800 outline-none placeholder:text-gray-400 focus:border-navy-600 focus:ring-2 focus:ring-navy-100'
const labelCls = 'mb-2 block text-sm font-semibold text-navy-800'

export function ContentIntakeForm({ initialType }: { initialType: SubmissionType }) {
  const router = useRouter()
  const [type, setType] = useState<SubmissionType>(initialType)
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'saving'>('idle')
  const [error, setError] = useState<string | null>(null)
  const busy = phase !== 'idle'

  function pickFile(f: File | null) {
    setError(null)
    if (!f) return setFile(null)
    if (!isAllowedFile(f.name)) return setError('That file type isn’t supported. Use a document, video, or audio file.')
    if (f.size > MAX_UPLOAD_BYTES) return setError(`That file is ${formatBytes(f.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)} — for long videos, paste a YouTube or Vimeo link instead.`)
    setFile(f)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const fd = new FormData(event.currentTarget)
    const title = String(fd.get('title') || '').trim()
    const sourceText = String(fd.get('source_text') || '').trim()
    const sourceUrl = String(fd.get('source_url') || '').trim()
    const notes = String(fd.get('notes') || '').trim()

    if (!title) return setError('Add a title or topic.')
    if (sourceUrl && !isHttpUrl(sourceUrl)) return setError('The link should start with https://')
    if (!sourceText && !sourceUrl && !file) return setError('Add some text, a link, or a file before submitting.')

    try {
      // 1. File goes straight to private storage via a server-issued signed URL.
      let filePath: string | null = null
      if (file) {
        setPhase('uploading')
        const signRes = await fetch('/api/content-studio/uploads', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileSize: file.size }),
        })
        const sign = await signRes.json().catch(() => null)
        if (!signRes.ok) throw new Error(sign?.error || 'Couldn’t start the upload.')
        const { error: upErr } = await createClient().storage
          .from(CONTENT_INTAKE_BUCKET)
          .uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type || 'application/octet-stream' })
        if (upErr) throw new Error('The file upload failed. Check your connection and try again.')
        filePath = sign.path
      }

      // 2. Save the submission (triggers the pipeline when configured).
      setPhase('saving')
      const res = await fetch('/api/content-studio/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          submission_type: type,
          title,
          notes,
          source_text: sourceText,
          source_url: type === 'video' ? sourceUrl : '',
          file_path: filePath,
          file_name: file?.name,
          file_size: file?.size,
        }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) throw new Error(payload?.error || 'Unable to submit content.')

      router.push('/content-studio?submitted=1')
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.')
      setPhase('idle')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-warm-600">Content Studio</p>
        <h1 className="text-3xl font-bold tracking-tight text-navy-800">Submit content</h1>
        <p className="mt-2 text-gray-600">Give us the source material. The content pipeline handles everything downstream.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7 rounded-2xl border border-gray-200 bg-white p-6 sm:p-7 shadow-sm">
        <fieldset>
          <legend className={labelCls}>What are you submitting?</legend>
          <div className="grid gap-3 grid-cols-3">
            {TYPES.map(t => {
              const active = type === t.value
              return (
                <button key={t.value} type="button" onClick={() => setType(t.value)} aria-pressed={active} disabled={busy}
                  className={`rounded-xl border p-4 text-left transition ${active ? 'border-navy-700 bg-navy-700 text-white' : 'border-gray-200 bg-white text-navy-800 hover:border-navy-300'}`}>
                  <div className="text-2xl">{t.icon}</div>
                  <div className="mt-2 font-semibold">{t.label}</div>
                </button>
              )
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="title" className={labelCls}>Title or topic</label>
          <input id="title" name="title" required maxLength={240} disabled={busy}
            placeholder="Why children need real responsibility at home" className={inputCls} />
        </div>

        {type === 'video' && (
          <div>
            <label htmlFor="source_url" className={labelCls}>Video link</label>
            <input id="source_url" name="source_url" type="url" disabled={busy} placeholder="https://youtube.com/…" className={inputCls} />
            <p className="mt-2 text-xs text-gray-500">Paste a YouTube or Vimeo link, upload the video below, or both.</p>
          </div>
        )}

        <div>
          <label htmlFor="source_text" className={labelCls}>
            {type === 'article' ? 'Article, draft, or notes' : type === 'idea' ? 'Tell us the idea' : 'Transcript or supporting notes'}
          </label>
          <textarea id="source_text" name="source_text" rows={type === 'video' ? 5 : 12} disabled={busy}
            placeholder={type === 'idea'
              ? 'Parents often do too much for their children. I want to explain how real responsibility builds independence…'
              : 'Paste your content here…'}
            className={inputCls} />
        </div>

        <div>
          <label htmlFor="file" className={labelCls}>
            Upload a file <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input id="file" name="file" type="file" accept={FILE_ACCEPT} disabled={busy}
            onChange={e => pickFile(e.target.files?.[0] || null)}
            className="block w-full rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-50 file:px-3 file:py-2 file:font-semibold file:text-navy-700" />
          <p className="mt-2 text-xs text-gray-500">
            {file ? `${file.name} · ${formatBytes(file.size)}` : `Documents, video, or audio · up to ${formatBytes(MAX_UPLOAD_BYTES)}`}
          </p>
        </div>

        <div>
          <label htmlFor="notes" className={labelCls}>
            Instructions <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea id="notes" name="notes" rows={4} disabled={busy}
            placeholder="Example: For parents of children ages 3–6. Emphasize practical ways to use this at home."
            className={inputCls} />
        </div>

        {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.push('/content-studio')} disabled={busy}
            className="rounded-xl px-4 py-3 font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={busy}
            className="rounded-xl bg-warm-500 px-6 py-3 font-bold text-white shadow-sm hover:bg-warm-600 disabled:cursor-not-allowed disabled:opacity-60">
            {phase === 'uploading' ? 'Uploading file…' : phase === 'saving' ? 'Submitting…' : 'Submit to Content Engine'}
          </button>
        </div>
      </form>
    </div>
  )
}
