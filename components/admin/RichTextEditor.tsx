'use client'

import { useEffect, useRef, useState } from 'react'

// Lightweight WYSIWYG editor for article bodies. contentEditable preserves
// pasted formatting from Word / Google Docs / web pages natively; a toolbar
// (execCommand) covers manual formatting. Emits HTML via onChange — the server
// sanitizes it (lib/sanitize.ts) before storing, so pasted cruft is cleaned.
//
// execCommand is deprecated but universally supported and remains the simplest
// reliable path for a contentEditable toolbar without a heavy editor library.

interface Props {
  initialHtml?: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ initialHtml, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Seed the editable region once.
  useEffect(() => {
    if (ref.current && initialHtml != null) {
      ref.current.innerHTML = initialHtml
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  // exec keeps the selection: buttons use onMouseDown + preventDefault so focus
  // stays in the editor when clicked.
  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    ref.current?.focus()
    emit()
  }

  const addLink = () => {
    const url = window.prompt('Link URL (https://…)')
    if (url) exec('createLink', url)
  }

  const onPickImage = () => fileRef.current?.click()

  const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = e.target.files?.[0]
    e.target.value = ''
    if (!img) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', img)
      const res = await fetch('/api/admin/resources/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        ref.current?.focus()
        document.execCommand('insertImage', false, data.url)
        emit()
      } else {
        alert(data.error || 'Image upload failed')
      }
    } catch {
      alert('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const Btn = ({ label, title, onClick }: { label: string; title: string; onClick: () => void }) => (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className="px-2.5 py-1.5 text-sm text-navy-700 hover:bg-warm-50 rounded transition min-w-[32px]"
    >
      {label}
    </button>
  )

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
        <Btn label="B" title="Bold" onClick={() => exec('bold')} />
        <Btn label="I" title="Italic" onClick={() => exec('italic')} />
        <Btn label="U" title="Underline" onClick={() => exec('underline')} />
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <Btn label="H2" title="Heading" onClick={() => exec('formatBlock', 'h2')} />
        <Btn label="H3" title="Subheading" onClick={() => exec('formatBlock', 'h3')} />
        <Btn label="¶" title="Normal text" onClick={() => exec('formatBlock', 'p')} />
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <Btn label="• List" title="Bullet list" onClick={() => exec('insertUnorderedList')} />
        <Btn label="1. List" title="Numbered list" onClick={() => exec('insertOrderedList')} />
        <Btn label="❝" title="Quote" onClick={() => exec('formatBlock', 'blockquote')} />
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <Btn label="🔗" title="Link" onClick={addLink} />
        <Btn label={uploading ? '⏳' : '🖼'} title="Insert image" onClick={onPickImage} />
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <Btn label="Clear" title="Clear formatting" onClick={() => exec('removeFormat')} />
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onImageSelected} className="hidden" />
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder="Write or paste your article here — formatting from Word, Google Docs, or a web page is preserved."
        className="mfa-rte min-h-[280px] max-h-[70vh] overflow-y-auto px-4 py-3 text-[15px] leading-relaxed text-navy-800 outline-none"
      />

      <style jsx global>{`
        .mfa-rte:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .mfa-rte h2 { font-size: 1.4rem; font-weight: 700; margin: 0.8em 0 0.3em; }
        .mfa-rte h3 { font-size: 1.15rem; font-weight: 700; margin: 0.8em 0 0.3em; }
        .mfa-rte p { margin: 0 0 0.75em; }
        .mfa-rte ul { list-style: disc; padding-left: 1.4em; margin: 0 0 0.75em; }
        .mfa-rte ol { list-style: decimal; padding-left: 1.4em; margin: 0 0 0.75em; }
        .mfa-rte blockquote { border-left: 3px solid #c97b3b; padding-left: 1em; margin: 1em 0; color: #4b5563; font-style: italic; }
        .mfa-rte a { color: #4a6cf7; text-decoration: underline; }
        .mfa-rte img { max-width: 100%; height: auto; border-radius: 10px; margin: 1em 0; }
      `}</style>
    </div>
  )
}
