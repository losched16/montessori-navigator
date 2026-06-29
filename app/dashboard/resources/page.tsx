import Link from 'next/link'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { listPublishedResources, resourceTypeLabel } from '@/lib/resources'

// Parent-facing resource library — Apple News-style editorial feed.
//
// Design notes (act-as-Apple-designer brief from the founder):
//   - True white background, near-black ink (#1d1d1f), generous whitespace
//   - Newsreader serif for headlines, Inter for body
//   - Big featured story at top with a colored hero block (image goes here later)
//   - Vertical feed below with thumbnail-left, headline-right cards
//   - Mobile-first: single column always, generous tap targets
//   - Category labels in uppercase tracking-widest (like Apple News sections)
//
// Typography tokens live in app/dashboard/layout.tsx under the `mfa-parent`
// scope. We add `.mfa-editorial` here to opt this page into them.

export const dynamic = 'force-dynamic'

// Hero block colors — used as "cover art" when no image is uploaded yet.
// These map to ResourceType. Saturated, on-brand gradients.
const HERO_GRADIENTS: Record<string, string> = {
  playbook: 'linear-gradient(135deg, #4a2c82 0%, #7b5ea7 100%)',
  workbook: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  template: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
  guide:    'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
  article:  'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
  newsletter: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
}

const TYPE_EMOJI: Record<string, string> = {
  playbook: '📘',
  workbook: '📒',
  template: '📋',
  guide: '📖',
  article: '📄',
  newsletter: '📨',
}

function heroStyle(type: string): React.CSSProperties {
  return { background: HERO_GRADIENTS[type] || HERO_GRADIENTS.guide }
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default async function ParentResourcesPage() {
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const resources = await listPublishedResources(service, 'parent')

  const featured = resources[0]
  const rest = resources.slice(1)

  return (
    <div className="mfa-editorial bg-white -m-4 sm:-m-6 pb-24 sm:pb-12">
      {/* ─── Section header / kicker ─────────────────────────────────── */}
      <div className="max-w-[680px] mx-auto px-5 sm:px-6 pt-8 sm:pt-14">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--accent-warm)] mb-3">
          From The Montessori Foundation
        </div>
        <h1 className="serif text-[44px] sm:text-[60px] leading-[0.95] font-bold text-[color:var(--ink)] mb-4">
          Resources
        </h1>
        <p className="text-[19px] sm:text-[21px] leading-[1.45] text-[color:var(--ink-secondary)] font-normal max-w-[560px]">
          Guides, articles, and tools to help you understand what your child is doing — and become the partner your school is hoping for.
        </p>
      </div>

      {/* ─── Empty state ─────────────────────────────────────────────── */}
      {resources.length === 0 && (
        <div className="max-w-[680px] mx-auto px-5 sm:px-6 mt-16 text-center">
          <div className="text-5xl mb-4 opacity-30">📚</div>
          <h2 className="serif text-[28px] font-semibold text-[color:var(--ink)] mb-2">
            No resources yet
          </h2>
          <p className="text-[17px] text-[color:var(--ink-secondary)]">
            New resources are added regularly. Check back soon.
          </p>
        </div>
      )}

      {/* ─── Featured story ──────────────────────────────────────────── */}
      {featured && (
        <section className="max-w-[680px] mx-auto px-5 sm:px-6 mt-10 sm:mt-14">
          <SectionLabel>Featured</SectionLabel>
          <Link
            href={`/dashboard/resources/${featured.slug}`}
            className="group block mt-4"
          >
            {/* Big hero block (placeholder for real imagery later) */}
            <div
              className="aspect-[16/10] rounded-2xl mb-6 flex items-end p-7 sm:p-9 text-white relative overflow-hidden"
              style={heroStyle(featured.type)}
            >
              <div className="absolute inset-0 opacity-20"
                style={{ background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.4), transparent 60%)' }} />
              <div className="text-7xl sm:text-9xl absolute top-6 right-6 opacity-30">
                {TYPE_EMOJI[featured.type] || '📖'}
              </div>
              <div className="relative">
                <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-white/90 mb-2">
                  {resourceTypeLabel(featured.type)}
                </div>
              </div>
            </div>

            {/* Featured headline */}
            <h2 className="serif text-[32px] sm:text-[44px] leading-[1.05] font-bold text-[color:var(--ink)] mb-3 group-hover:opacity-80 transition">
              {featured.title}
            </h2>
            <p className="text-[18px] sm:text-[19px] leading-[1.5] text-[color:var(--ink-secondary)] mb-3">
              {featured.description}
            </p>
            <div className="text-[13px] text-[color:var(--ink-muted)] font-medium tracking-wide">
              {formatDate(featured.publishedAt)}
            </div>
          </Link>
        </section>
      )}

      {/* ─── Feed of remaining resources ─────────────────────────────── */}
      {rest.length > 0 && (
        <section className="max-w-[680px] mx-auto px-5 sm:px-6 mt-14 sm:mt-20">
          <SectionLabel>All Resources</SectionLabel>
          <div className="mt-2 divide-y divide-[color:var(--separator)]">
            {rest.map(r => (
              <Link
                key={r.slug}
                href={`/dashboard/resources/${r.slug}`}
                className="group flex gap-4 sm:gap-6 py-6 sm:py-7 first:pt-7"
              >
                {/* Thumbnail tile */}
                <div
                  className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl flex items-center justify-center text-3xl sm:text-5xl text-white/80 relative overflow-hidden"
                  style={heroStyle(r.type)}
                >
                  <span className="opacity-80">{TYPE_EMOJI[r.type] || '📖'}</span>
                </div>

                {/* Story copy */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[color:var(--accent-warm)] mb-1.5">
                    {resourceTypeLabel(r.type)}
                  </div>
                  <h3 className="serif text-[20px] sm:text-[24px] leading-[1.15] font-bold text-[color:var(--ink)] mb-1.5 group-hover:opacity-70 transition">
                    {r.title}
                  </h3>
                  <p className="text-[15px] sm:text-[16px] leading-[1.45] text-[color:var(--ink-secondary)] line-clamp-2 mb-2">
                    {r.description}
                  </p>
                  <div className="text-[12px] text-[color:var(--ink-muted)] font-medium">
                    {formatDate(r.publishedAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Foot ─────────────────────────────────────────────────────── */}
      <div className="max-w-[680px] mx-auto px-5 sm:px-6 mt-16 sm:mt-24 text-center">
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--ink-muted)]">
          The Montessori Foundation
        </div>
        <p className="text-[13px] text-[color:var(--ink-muted)] mt-1">
          New resources added regularly.
        </p>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--ink)] border-t border-[color:var(--separator)] pt-4">
      {children}
    </div>
  )
}
