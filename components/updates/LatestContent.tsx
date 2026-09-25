import Link from 'next/link'
import { FileText } from 'lucide-react'
import { resourceTypeLabel, type Resource } from '@/lib/resources'

function coverUrl(coverPath: string | null): string | undefined {
  if (!coverPath) return undefined
  if (coverPath.startsWith('/') || coverPath.startsWith('http')) return coverPath
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return base ? `${base}/storage/v1/object/public/resources/${coverPath}` : undefined
}

const NEW_DAYS = 14

// Most recently published resources (playbooks, workbooks, articles…) as a
// horizontal row of cards. Items published in the last two weeks get a badge.
export default function LatestContent({ resources }: { resources: Resource[] }) {
  return (
    <div className="flex gap-3.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 snap-x">
      {resources.map(r => {
        const img = coverUrl(r.coverPath)
        const published = r.publishedAt || r.createdAt
        const isNew = (Date.now() - new Date(published).getTime()) / 86400000 <= NEW_DAYS
        return (
          <Link
            key={r.id}
            href={`/dashboard/resources/${r.slug}`}
            className="tap-scale snap-start shrink-0 w-[230px] rounded-[20px] bg-white border border-[color:var(--mfa-border)] overflow-hidden hover:shadow-md transition group"
          >
            <div className="relative h-[120px] bg-[color:var(--mfa-clay-soft)] flex items-center justify-center">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              ) : (
                <FileText size={34} className="text-[color:var(--mfa-clay)] opacity-60" aria-hidden="true" />
              )}
              {isNew && (
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/95 text-[11px] font-bold tracking-wide uppercase text-[color:var(--mfa-clay)]">
                  New
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--mfa-clay)] mb-1">
                {resourceTypeLabel(r.type)}
              </div>
              <h3 className="font-[family-name:var(--mfa-serif)] text-[17px] leading-snug font-semibold text-[color:var(--mfa-ink)] tracking-tight line-clamp-2 group-hover:opacity-80 transition">
                {r.title}
              </h3>
              <p className="text-[13px] leading-snug text-[color:var(--mfa-ink-muted)] mt-1 line-clamp-2">{r.description}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
