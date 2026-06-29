import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import {
  getResourceBySlug,
  resourceTypeLabel,
  resolvePdfUrl,
} from '@/lib/resources'
import { renderMarkdown } from '@/lib/simple-markdown'

// Parent-facing resource detail — editorial article layout (Apple News
// reading view). Massive serif headline, tight column width for body,
// crisp ink on white, generous vertical rhythm.

export const dynamic = 'force-dynamic'

const HERO_GRADIENTS: Record<string, string> = {
  playbook: 'linear-gradient(135deg, #4a2c82 0%, #7b5ea7 100%)',
  workbook: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  template: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
  guide:    'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
  article:  'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
  newsletter: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
}

const TYPE_EMOJI: Record<string, string> = {
  playbook: '📘', workbook: '📒', template: '📋',
  guide: '📖', article: '📄', newsletter: '📨',
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default async function ParentResourceDetailPage({ params }: { params: { slug: string } }) {
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const resource = await getResourceBySlug(service, params.slug)

  if (!resource || !resource.isPublished) notFound()
  if (resource.audience === 'school') notFound()

  const pdfUrl = resolvePdfUrl(resource.pdfPath, process.env.NEXT_PUBLIC_SUPABASE_URL!)

  return (
    <div className="mfa-editorial bg-white -m-4 sm:-m-6 pb-24 sm:pb-16">
      {/* Back affordance — minimal, like Apple News */}
      <div className="max-w-[720px] mx-auto px-5 sm:px-6 pt-6 sm:pt-10">
        <Link
          href="/dashboard/resources"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--ink-secondary)] hover:text-[color:var(--ink)] transition"
        >
          <span className="text-[16px] leading-none">‹</span> Resources
        </Link>
      </div>

      {/* ─── Article header ─────────────────────────────────────────── */}
      <header className="max-w-[720px] mx-auto px-5 sm:px-6 mt-8 sm:mt-12">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--accent-warm)] mb-4">
          {resourceTypeLabel(resource.type)}
        </div>
        <h1 className="serif text-[40px] sm:text-[64px] leading-[0.98] font-bold text-[color:var(--ink)] mb-5 tracking-tight">
          {resource.title}
        </h1>
        <p className="text-[20px] sm:text-[22px] leading-[1.4] text-[color:var(--ink-secondary)] font-normal mb-6">
          {resource.description}
        </p>
        <div className="flex items-center gap-3 text-[13px] text-[color:var(--ink-muted)] font-medium border-t border-[color:var(--separator)] pt-5">
          <span>The Montessori Foundation</span>
          {resource.publishedAt && (
            <>
              <span className="text-[color:var(--separator)]">·</span>
              <span>{formatDate(resource.publishedAt)}</span>
            </>
          )}
        </div>
      </header>

      {/* ─── Hero block (placeholder for real imagery) ──────────────── */}
      <div className="max-w-[920px] mx-auto px-5 sm:px-6 mt-8 sm:mt-12">
        <div
          className="aspect-[16/9] sm:aspect-[21/9] rounded-2xl flex items-center justify-center text-white relative overflow-hidden"
          style={{ background: HERO_GRADIENTS[resource.type] || HERO_GRADIENTS.guide }}
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.5), transparent 60%)' }}
          />
          <div className="text-9xl sm:text-[180px] opacity-30 relative">
            {TYPE_EMOJI[resource.type] || '📖'}
          </div>
        </div>
      </div>

      {/* ─── Highlights callout ────────────────────────────────────── */}
      {resource.highlights.length > 0 && (
        <aside className="max-w-[720px] mx-auto px-5 sm:px-6 mt-10 sm:mt-14">
          <div className="border-l-[3px] border-[color:var(--accent-warm)] pl-5 sm:pl-7">
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--accent-warm)] mb-3">
              What&apos;s inside
            </div>
            <ul className="space-y-2.5">
              {resource.highlights.map((h, i) => (
                <li key={i} className="text-[18px] sm:text-[19px] leading-[1.45] text-[color:var(--ink)] font-medium">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      {/* ─── CTA row (when there's a PDF) ──────────────────────────── */}
      {pdfUrl && (
        <div className="max-w-[720px] mx-auto px-5 sm:px-6 mt-10 sm:mt-14">
          <div className="flex flex-wrap gap-3">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--ink)] hover:opacity-85 text-white text-[15px] font-semibold rounded-full transition"
            >
              Read full PDF
            </a>
            <a
              href={pdfUrl}
              download
              className="inline-flex items-center gap-2 px-6 py-3 border border-[color:var(--separator)] hover:bg-gray-50 text-[color:var(--ink)] text-[15px] font-semibold rounded-full transition"
            >
              Download
            </a>
          </div>
        </div>
      )}

      {/* ─── Body content ──────────────────────────────────────────── */}
      {resource.bodyMarkdown && (
        <article
          className="mfa-body max-w-[680px] mx-auto px-5 sm:px-6 mt-12 sm:mt-16"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(resource.bodyMarkdown) }}
        />
      )}

      {/* ─── Inline PDF preview (if no body content) ───────────────── */}
      {pdfUrl && !resource.bodyMarkdown && (
        <div className="max-w-[920px] mx-auto px-5 sm:px-6 mt-12 sm:mt-16">
          <div className="rounded-2xl overflow-hidden border border-[color:var(--separator)]">
            <iframe
              src={pdfUrl}
              title={resource.title}
              className="w-full"
              style={{ height: '85vh', border: 'none', display: 'block' }}
            />
          </div>
        </div>
      )}

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <div className="max-w-[720px] mx-auto px-5 sm:px-6 mt-16 sm:mt-24 text-center border-t border-[color:var(--separator)] pt-10">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--ink-muted)] mb-2">
          The Montessori Foundation
        </div>
        <Link
          href="/dashboard/resources"
          className="text-[14px] font-semibold text-[color:var(--ink)] hover:underline"
        >
          See more resources →
        </Link>
      </div>

    </div>
  )
}
