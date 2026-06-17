'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { Resource, ResourceType, Audience } from '@/lib/resources'

// Shared form for creating + editing resources. The "new" page passes
// no `existing` prop and submits to POST /api/admin/resources. The "edit"
// page passes the existing resource and submits PATCH to that resource's
// id, optionally with a new file to replace the PDF.

interface Props {
  existing?: Resource
}

// Keep the slug URL-friendly. We auto-generate it from the title on the
// "new" form, but admins can override.
function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export default function ResourceForm({ existing }: Props) {
  const router = useRouter()
  const isEditing = !!existing

  const [title, setTitle] = useState(existing?.title || '')
  const [slug, setSlug] = useState(existing?.slug || '')
  const [slugTouched, setSlugTouched] = useState(isEditing) // existing slug shouldn't auto-update
  const [description, setDescription] = useState(existing?.description || '')
  const [type, setType] = useState<ResourceType>(existing?.type || 'playbook')
  const [audience, setAudience] = useState<Audience>(existing?.audience || 'school')
  const [highlightsText, setHighlightsText] = useState(
    (existing?.highlights || []).join('\n'),
  )
  const [bodyMarkdown, setBodyMarkdown] = useState(existing?.bodyMarkdown || '')
  const [isPublished, setIsPublished] = useState(existing?.isPublished ?? false)
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onTitleChange = (v: string) => {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !slug.trim() || !description.trim()) {
      setError('Title, slug, and description are required.')
      return
    }
    // Each resource needs SOMETHING readable — either a PDF file or markdown
    // body content. The detail page renders whichever is present.
    const hasExistingFile = !!existing?.pdfPath
    const hasExistingBody = !!(existing?.bodyMarkdown || '').trim()
    const hasBody = bodyMarkdown.trim().length > 0
    if (!isEditing && !file && !hasBody) {
      setError('Please upload a PDF file or paste markdown body content.')
      return
    }
    if (isEditing && !file && !hasExistingFile && !hasBody && !hasExistingBody) {
      setError('Please upload a PDF file or paste markdown body content.')
      return
    }

    setSubmitting(true)

    try {
      const fd = new FormData()
      fd.append('title', title.trim())
      fd.append('slug', slug.trim())
      fd.append('description', description.trim())
      fd.append('type', type)
      fd.append('audience', audience)
      fd.append('highlights', JSON.stringify(
        highlightsText.split('\n').map(l => l.trim()).filter(Boolean),
      ))
      fd.append('is_published', String(isPublished))
      fd.append('body_markdown', bodyMarkdown)
      if (file) fd.append('file', file)

      const url = isEditing
        ? `/api/admin/resources/${existing!.id}`
        : '/api/admin/resources'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, { method, body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Save failed')
        setSubmitting(false)
        return
      }

      router.push('/admin/resources')
    } catch (err: any) {
      setError(err.message || 'Save failed')
      setSubmitting(false)
    }
  }

  const onDelete = async () => {
    if (!existing) return
    if (!confirm(`Delete "${existing.title}"? This cannot be undone.`)) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/resources/${existing.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Delete failed')
        setSubmitting(false)
        return
      }
      router.push('/admin/resources')
    } catch (err: any) {
      setError(err.message || 'Delete failed')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
      )}

      <Field label="Title" required>
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          placeholder="New Family Onboarding Playbook"
          required
        />
      </Field>

      <Field
        label="URL slug"
        hint="Used in the URL: /school/resources/[slug] or /dashboard/resources/[slug]. Auto-generated from the title — edit if you want."
        required
      >
        <input
          type="text"
          value={slug}
          onChange={e => { setSlug(slugify(e.target.value)); setSlugTouched(true) }}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          placeholder="new-family-onboarding-playbook"
          required
        />
      </Field>

      <Field
        label="Description"
        hint="One paragraph shown on the resource card and detail page."
        required
      >
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none resize-y"
          required
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Type">
          <select
            value={type}
            onChange={e => setType(e.target.value as ResourceType)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          >
            <option value="playbook">Playbook</option>
            <option value="workbook">Workbook</option>
            <option value="template">Template</option>
            <option value="guide">Guide</option>
            <option value="article">Article</option>
            <option value="newsletter">Newsletter</option>
          </select>
        </Field>

        <Field label="Audience" hint="Who sees this in their resource library">
          <select
            value={audience}
            onChange={e => setAudience(e.target.value as Audience)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          >
            <option value="school">Schools only</option>
            <option value="parent">Parents only</option>
            <option value="both">Both schools and parents</option>
          </select>
        </Field>
      </div>

      <Field
        label="Highlights"
        hint="One per line. Shown as a 'What's inside' bullet list on the detail page. Leave blank to hide that section."
      >
        <textarea
          value={highlightsText}
          onChange={e => setHighlightsText(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none resize-y"
          placeholder={"Acceptance-to-first-day timeline\nWelcome packet templates\nFirst-month family touchpoints"}
        />
      </Field>

      <Field
        label="PDF file (optional)"
        hint={isEditing
          ? `Current file: ${existing!.pdfPath || '(none)'}. Choose a new PDF to replace it, or leave blank to keep.`
          : 'Upload a PDF for playbooks, workbooks, templates. Max 25 MB. Leave blank if you only want a markdown article below.'}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          className="text-sm w-full file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-warm-50 file:text-warm-700 file:text-xs file:font-medium hover:file:bg-warm-100"
        />
      </Field>

      <Field
        label="Body content (markdown, optional)"
        hint="For articles and guides without a PDF. Supports basic markdown (headings, **bold**, *italic*, links, lists). Leave blank if you uploaded a PDF instead."
      >
        <textarea
          value={bodyMarkdown}
          onChange={e => setBodyMarkdown(e.target.value)}
          rows={12}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none resize-y"
          placeholder={"# Heading\n\nParagraph text with **bold** and *italic* and [links](https://example.com).\n\n- Bullet 1\n- Bullet 2"}
        />
      </Field>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_published"
          checked={isPublished}
          onChange={e => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-warm-500 focus:ring-warm-500"
        />
        <label htmlFor="is_published" className="text-sm text-navy-700">
          Published
          <span className="text-navy-600/60 ml-2 text-xs">
            (unchecked = draft, only visible to super admins)
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition disabled:opacity-50 text-sm"
        >
          {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create resource'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium rounded-lg transition disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-navy-600/60 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}
